import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, newsletterSubscribers } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

export async function GET() {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  try {
    const userGrowth = await db
      .select({
        date: sql<string>`TO_CHAR(DATE(${users.createdAt}), 'YYYY-MM-DD')`.as(
          "date",
        ),
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(users)
      .where(
        sql`${users.createdAt} >= NOW() - INTERVAL '30 days'`,
      )
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    const subGrowth = await db
      .select({
        date: sql<string>`TO_CHAR(DATE(${newsletterSubscribers.subscribedAt}), 'YYYY-MM-DD')`.as(
          "date",
        ),
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(newsletterSubscribers)
      .where(
        sql`${newsletterSubscribers.subscribedAt} >= NOW() - INTERVAL '30 days'`,
      )
      .groupBy(sql`DATE(${newsletterSubscribers.subscribedAt})`)
      .orderBy(sql`DATE(${newsletterSubscribers.subscribedAt})`);

    // Merge into a single array keyed by date
    const dateMap = new Map<string, { date: string; users: number; subscribers: number }>();

    for (const row of userGrowth) {
      dateMap.set(row.date, { date: row.date, users: row.count, subscribers: 0 });
    }
    for (const row of subGrowth) {
      const existing = dateMap.get(row.date);
      if (existing) {
        existing.subscribers = row.count;
      } else {
        dateMap.set(row.date, { date: row.date, users: 0, subscribers: row.count });
      }
    }

    const data = Array.from(dateMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date),
    );

    return NextResponse.json(data);
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Admin analytics growth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
