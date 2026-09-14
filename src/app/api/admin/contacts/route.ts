import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { eq, count, desc as descOrder } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

// ---------- GET: Paginated contact submissions ----------

export async function GET(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "new"
      | "read"
      | "replied"
      | "archived"
      | null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const whereClause =
      status && ["new", "read", "replied", "archived"].includes(status)
        ? eq(contactSubmissions.status, status)
        : undefined;

    const [totalRow] = await db
      .select({ total: count() })
      .from(contactSubmissions)
      .where(whereClause);

    const rows = await db
      .select({
        id: contactSubmissions.id,
        name: contactSubmissions.name,
        email: contactSubmissions.email,
        subject: contactSubmissions.subject,
        message: contactSubmissions.message,
        status: contactSubmissions.status,
        createdAt: contactSubmissions.createdAt,
      })
      .from(contactSubmissions)
      .where(whereClause)
      .orderBy(descOrder(contactSubmissions.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalRow.total;
    return NextResponse.json({
      contacts: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Admin contacts GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------- PATCH: Update contact submission status ----------

export async function PATCH(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  try {
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "id and status are required" },
        { status: 400 },
      );
    }

    const validStatuses = ["new", "read", "replied", "archived"] as const;
    if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(contactSubmissions)
      .set({ status: status as "new" | "read" | "replied" | "archived" })
      .where(eq(contactSubmissions.id, id))
      .returning({
        id: contactSubmissions.id,
        name: contactSubmissions.name,
        email: contactSubmissions.email,
        status: contactSubmissions.status,
      });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Contact submission not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Admin contacts PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
