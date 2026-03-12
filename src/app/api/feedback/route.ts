import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/fileStore";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const FILE = "lesson-feedback.json";

const FeedbackSchema = z.object({
  lessonSlug: z.string().min(1).max(100),
  programSlug: z.string().min(1).max(100),
  rating: z.enum(["up", "down"]),
  comment: z.string().max(1000).optional(),
  locale: z.string().max(10).default("en"),
});

interface FeedbackEntry {
  lessonSlug: string;
  programSlug: string;
  rating: "up" | "down";
  comment?: string;
  locale: string;
  timestamp: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function notifyFeedback(entry: FeedbackEntry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "ramesh.reddy01@gmail.com";
  if (!apiKey) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const emoji = entry.rating === "up" ? "👍" : "👎";
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      "AI Educademy <onboarding@resend.dev>";

    await resend.emails.send({
      from: fromAddress,
      to: adminEmail,
      subject: `${emoji} Feedback: ${escapeHtml(entry.programSlug)}/${escapeHtml(entry.lessonSlug)}`,
      html: `
        <h2>${emoji} Lesson Feedback</h2>
        <p><strong>Program:</strong> ${escapeHtml(entry.programSlug)}</p>
        <p><strong>Lesson:</strong> ${escapeHtml(entry.lessonSlug)}</p>
        <p><strong>Rating:</strong> ${escapeHtml(entry.rating)}</p>
        ${entry.comment ? `<p><strong>Comment:</strong> ${escapeHtml(entry.comment)}</p>` : ""}
        <p><strong>Locale:</strong> ${escapeHtml(entry.locale)}</p>
        <p><strong>Time:</strong> ${escapeHtml(entry.timestamp)}</p>
      `,
    });
  } catch (err) {
    console.error("[Email] Feedback notification failed:", err);
  }
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

    const entry: FeedbackEntry = {
      lessonSlug,
      programSlug,
      rating,
      comment: comment?.slice(0, 1000),
      locale,
      timestamp: new Date().toISOString(),
    };

    const feedback = await readJsonFile<FeedbackEntry[]>(FILE, []);
    feedback.push(entry);
    await writeJsonFile(FILE, feedback);

    notifyFeedback(entry).catch(() => {});

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
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

    const feedback = await readJsonFile<FeedbackEntry[]>(FILE, []);

    let filtered = feedback;
    if (programSlug) {
      filtered = filtered.filter((f) => f.programSlug === programSlug);
    }
    if (lessonSlug) {
      filtered = filtered.filter((f) => f.lessonSlug === lessonSlug);
    }

    const up = filtered.filter((f) => f.rating === "up").length;
    const down = filtered.filter((f) => f.rating === "down").length;
    const comments = filtered
      .filter((f) => f.comment)
      .map((f) => ({ comment: f.comment, rating: f.rating, timestamp: f.timestamp }));

    return NextResponse.json({
      total: filtered.length,
      up,
      down,
      comments,
    });
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
