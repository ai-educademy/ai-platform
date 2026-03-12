import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";

export async function GET() {
  try {
    const [userCount] = await db
      .select({ total: count() })
      .from(users);

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

    // MRR: monthly=£9, annual=£79/12≈£6.58, lifetime=£0 recurring
    const mrrMap: Record<string, number> = { monthly: 9, annual: 79 / 12, lifetime: 0 };
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

    return NextResponse.json({
      totalUsers: userCount.total,
      activeSubscriptions: activeSubs.total,
      cancelledSubscriptions: cancelledSubs.total,
      mrr: Math.round(mrr * 100) / 100,
      roleBreakdown: Object.fromEntries(roleBreakdown.map((r) => [r.role, r.total])),
      planBreakdown: Object.fromEntries(planBreakdown.map((p) => [p.plan, p.total])),
      recentUsers,
    });
  } catch (error) {
    console.error("Admin users summary error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
