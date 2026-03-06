import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/fileStore";

interface AnalyticsEvent {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface FeedbackEntry {
  lessonSlug: string;
  programSlug: string;
  rating: "up" | "down";
  timestamp: string;
}

interface Subscriber {
  email: string;
  subscribedAt: string;
}

export async function GET() {
  try {
    const [events, feedback, subscribers] = await Promise.all([
      readJsonFile<AnalyticsEvent[]>("analytics-events.json", []),
      readJsonFile<FeedbackEntry[]>("lesson-feedback.json", []),
      readJsonFile<Subscriber[]>("newsletter-subscribers.json", []),
    ]);

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

    // Feedback summary per program
    const feedbackByProgram: Record<string, { up: number; down: number }> = {};
    for (const f of feedback) {
      if (!feedbackByProgram[f.programSlug]) {
        feedbackByProgram[f.programSlug] = { up: 0, down: 0 };
      }
      feedbackByProgram[f.programSlug][f.rating]++;
    }

    return NextResponse.json({
      totalEvents: events.length,
      totalSubscribers: subscribers.length,
      totalFeedback: feedback.length,
      eventCounts,
      popularLessons,
      feedbackByProgram,
      recentSubscribers: subscribers.slice(-5).reverse(),
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
