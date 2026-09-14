import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { sendAdminNotification } from "@/lib/email";
import { db } from "@/lib/db";
import { lessonFeedback } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

const FeedbackSchema = z.object({
  lessonSlug: z.string().min(1).max(100),
  programSlug: z.string().min(1).max(100),
  rating: z.enum(["up", "down"]),
  comment: z.string().max(1000).optional(),
  locale: z.string().max(10).default("en"),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`feedback:${ip}`, RATE_LIMITS.form);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { lessonSlug, programSlug, rating, comment, locale } = parsed.data;

    await db.insert(lessonFeedback).values({
      lessonSlug,
      programSlug,
      rating,
      comment: comment?.slice(0, 1000),
      locale,
    });

    // Admin notification (fire-and-forget)
    const now = new Date().toISOString();
    const emoji = rating === "up" ? "👍" : "👎";
    sendAdminNotification(
      `${emoji} Feedback: ${escapeHtml(programSlug)}/${escapeHtml(lessonSlug)}`,
      `<p><strong>Program:</strong> ${escapeHtml(programSlug)}</p>
       <p><strong>Lesson:</strong> ${escapeHtml(lessonSlug)}</p>
       <p><strong>Rating:</strong> ${escapeHtml(rating)}</p>
       ${comment ? `<p><strong>Comment:</strong> ${escapeHtml(comment)}</p>` : ""}
       <p><strong>Locale:</strong> ${escapeHtml(locale)}</p>
       <p><strong>Time:</strong> ${escapeHtml(now)}</p>`
    ).catch(() => {});

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const programSlug = searchParams.get("programSlug");
    const lessonSlug = searchParams.get("lessonSlug");

    // Build WHERE conditions
    const conditions = [];
    if (programSlug) conditions.push(eq(lessonFeedback.programSlug, programSlug));
    if (lessonSlug) conditions.push(eq(lessonFeedback.lessonSlug, lessonSlug));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        rating: lessonFeedback.rating,
        comment: lessonFeedback.comment,
        createdAt: lessonFeedback.createdAt,
      })
      .from(lessonFeedback)
      .where(where)
      .orderBy(sql`${lessonFeedback.createdAt} DESC`);

    const up = rows.filter((r) => r.rating === "up").length;
    const down = rows.filter((r) => r.rating === "down").length;
    const comments = rows
      .filter((r) => r.comment)
      .map((r) => ({
        comment: r.comment,
        rating: r.rating,
        timestamp: r.createdAt?.toISOString() ?? null,
      }));

    return NextResponse.json({
      total: rows.length,
      up,
      down,
      comments,
    });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Feedback GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
