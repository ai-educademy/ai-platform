import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  users,
  subscriptions,
  newsletterSubscribers,
  lessonFeedback,
  contactSubmissions,
} from "@/lib/db/schema";
import { eq, sql, count, or, ilike, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

// ---------- GET: summary (no params) OR paginated user list (with ?list=true) ----------

export async function GET(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  const { searchParams } = new URL(req.url);
  const listMode = searchParams.get("list") === "true";

  try {
    if (listMode) {
      return await handleUserList(searchParams);
    }
    return await handleSummary();
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Paginated, searchable, filterable user list
async function handleUserList(params: URLSearchParams) {
  const search = params.get("search")?.trim() ?? "";
  const role = params.get("role") as "free" | "pro" | "admin" | null;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") ?? "20", 10)));
  const sortField = params.get("sort") ?? "createdAt";
  const sortOrder = params.get("order") === "asc" ? "asc" : "desc";
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
      ),
    );
  }
  if (role && ["free", "pro", "admin"].includes(role)) {
    conditions.push(eq(users.role, role));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Sorting — use sql template to avoid cross-column type issues
  const sortColumns: Record<string, ReturnType<typeof sql>> = {
    createdAt: sql`${users.createdAt}`,
    name: sql`${users.name}`,
    email: sql`${users.email}`,
  };
  const sortExpr = sortColumns[sortField] ?? sortColumns.createdAt;
  const orderExpr = sortOrder === "asc" ? sql`${sortExpr} ASC` : sql`${sortExpr} DESC`;

  // Count total
  const [totalRow] = await db
    .select({ total: count() })
    .from(users)
    .where(whereClause);

  // Fetch users with left-joined subscription status
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      subStatus: subscriptions.status,
      subPlan: subscriptions.plan,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(whereClause)
    .orderBy(orderExpr)
    .limit(limit)
    .offset(offset);

  const total = totalRow.total;
  return NextResponse.json({
    users: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// Dashboard summary stats (original endpoint)
async function handleSummary() {
  const [userCount] = await db.select({ total: count() }).from(users);

  const roleBreakdown = await db
    .select({ role: users.role, total: count() })
    .from(users)
    .groupBy(users.role);

  const [activeSubs] = await db
    .select({ total: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  const planBreakdown = await db
    .select({ plan: subscriptions.plan, total: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.plan);

  const mrrMap: Record<string, number> = { monthly: 3.99, annual: 29.99 / 12, lifetime: 0 };
  let mrr = 0;
  for (const p of planBreakdown) {
    mrr += (mrrMap[p.plan] ?? 0) * p.total;
  }

  const recentUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`)
    .limit(10);

  const [cancelledSubs] = await db
    .select({ total: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "cancelled"));

  const [subscriberCount] = await db
    .select({ total: count() })
    .from(newsletterSubscribers);

  const [feedbackCount] = await db
    .select({ total: count() })
    .from(lessonFeedback);

  const [contactCount] = await db
    .select({ total: count() })
    .from(contactSubmissions);

  const recentFeedback = await db
    .select({
      id: lessonFeedback.id,
      lessonSlug: lessonFeedback.lessonSlug,
      programSlug: lessonFeedback.programSlug,
      rating: lessonFeedback.rating,
      comment: lessonFeedback.comment,
      createdAt: lessonFeedback.createdAt,
    })
    .from(lessonFeedback)
    .orderBy(sql`${lessonFeedback.createdAt} DESC`)
    .limit(10);

  return NextResponse.json({
    totalUsers: userCount.total,
    activeSubscriptions: activeSubs.total,
    cancelledSubscriptions: cancelledSubs.total,
    totalSubscribers: subscriberCount.total,
    totalFeedback: feedbackCount.total,
    totalContacts: contactCount.total,
    mrr: Math.round(mrr * 100) / 100,
    roleBreakdown: Object.fromEntries(roleBreakdown.map((r) => [r.role, r.total])),
    planBreakdown: Object.fromEntries(planBreakdown.map((p) => [p.plan, p.total])),
    recentUsers,
    recentFeedback,
  });
}

// ---------- PATCH: Update user role ----------

export async function PATCH(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  try {
    const body = await req.json();
    const { userId, role } = body as { userId?: string; role?: string };

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, message: "userId and role are required" },
        { status: 400 },
      );
    }

    const validRoles = ["free", "pro", "admin"] as const;
    if (!validRoles.includes(role as (typeof validRoles)[number])) {
      return NextResponse.json(
        { success: false, message: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 },
      );
    }

    // Prevent admin from demoting themselves
    if (userId === check.session.user?.id && role !== "admin") {
      return NextResponse.json(
        { success: false, message: "You cannot demote your own admin account" },
        { status: 403 },
      );
    }

    const [updated] = await db
      .update(users)
      .set({ role: role as "free" | "pro" | "admin", updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        updatedAt: users.updatedAt,
      });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Admin PATCH user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
