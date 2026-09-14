import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/fileStore";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { newsletterSubscribers, lessonFeedback } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

interface AnalyticsEvent {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export async function GET() {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  try {
    // Analytics events still read from JSON (no DB table yet)
    const events = await readJsonFile<AnalyticsEvent[]>("analytics-events.json", []);

    // Event counts by type
    const eventCounts: Record<string, number> = {};
    for (const e of events) {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    }

    // Popular lessons by page_view events
    const lessonViews: Record<string, number> = {};
    for (const e of events) {
      if (e.event === "page_view" && typeof e.data.lessonSlug === "string") {
        const key = `${e.data.programSlug || "unknown"}/${e.data.lessonSlug}`;
        lessonViews[key] = (lessonViews[key] || 0) + 1;
      }
    }
    const popularLessons = Object.entries(lessonViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lesson, views]) => ({ lesson, views }));

    // Subscriber count + recent subscribers from DB
    const [subscriberCount] = await db
      .select({ total: count() })
      .from(newsletterSubscribers);

    const recentSubs = await db
      .select({
        email: newsletterSubscribers.email,
        subscribedAt: newsletterSubscribers.subscribedAt,
      })
      .from(newsletterSubscribers)
      .orderBy(sql`${newsletterSubscribers.subscribedAt} DESC`)
      .limit(5);

    // Feedback stats from DB
    const [feedbackCount] = await db
      .select({ total: count() })
      .from(lessonFeedback);

    const feedbackByProgramRows = await db
      .select({
        programSlug: lessonFeedback.programSlug,
        rating: lessonFeedback.rating,
        total: count(),
      })
      .from(lessonFeedback)
      .groupBy(lessonFeedback.programSlug, lessonFeedback.rating);

    const feedbackByProgram: Record<string, { up: number; down: number }> = {};
    for (const row of feedbackByProgramRows) {
      if (!feedbackByProgram[row.programSlug]) {
        feedbackByProgram[row.programSlug] = { up: 0, down: 0 };
      }
      feedbackByProgram[row.programSlug][row.rating as "up" | "down"] += row.total;
    }

    return NextResponse.json({
      totalEvents: events.length,
      totalSubscribers: subscriberCount.total,
      totalFeedback: feedbackCount.total,
      eventCounts,
      popularLessons,
      feedbackByProgram,
      recentSubscribers: recentSubs.map((s) => ({
        email: s.email,
        subscribedAt: s.subscribedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Analytics summary error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
