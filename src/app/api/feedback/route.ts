import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/fileStore";

const FILE = "lesson-feedback.json";

interface FeedbackEntry {
  lessonSlug: string;
  programSlug: string;
  rating: "up" | "down";
  comment?: string;
  locale: string;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonSlug, programSlug, rating, comment, locale } = body;

    if (!lessonSlug || typeof lessonSlug !== "string") {
      return NextResponse.json(
        { success: false, message: "lessonSlug is required" },
        { status: 400 }
      );
    }
    if (!programSlug || typeof programSlug !== "string") {
      return NextResponse.json(
        { success: false, message: "programSlug is required" },
        { status: 400 }
      );
    }
    if (rating !== "up" && rating !== "down") {
      return NextResponse.json(
        { success: false, message: "rating must be 'up' or 'down'" },
        { status: 400 }
      );
    }

    const entry: FeedbackEntry = {
      lessonSlug,
      programSlug,
      rating,
      comment: comment && typeof comment === "string" ? comment.slice(0, 1000) : undefined,
      locale: typeof locale === "string" ? locale : "en",
      timestamp: new Date().toISOString(),
    };

    const feedback = await readJsonFile<FeedbackEntry[]>(FILE, []);
    feedback.push(entry);
    await writeJsonFile(FILE, feedback);

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
