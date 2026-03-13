import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lessonBookmarks } from "@/lib/db/schema";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { getProgram } from "@/lib/programs";
import { getLesson } from "@/lib/lessons";

/* ────────────── GET — fetch all bookmarks for the signed-in user ────────────── */

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: lessonBookmarks.id,
      programSlug: lessonBookmarks.programSlug,
      lessonSlug: lessonBookmarks.lessonSlug,
      createdAt: lessonBookmarks.createdAt,
    })
    .from(lessonBookmarks)
    .where(eq(lessonBookmarks.userId, session.user.id))
    .orderBy(desc(lessonBookmarks.createdAt));

  // Enrich with program & lesson metadata (server-side only)
  const bookmarks = rows.map((row) => {
    const program = getProgram(row.programSlug);
    const lesson = getLesson(row.programSlug, "en", row.lessonSlug);
    return {
      ...row,
      programColor: program?.color ?? "#6366f1",
      programIcon: program?.icon ?? "📘",
      lessonIcon: lesson?.icon ?? "📄",
      lessonDescription: lesson?.description ?? "",
      lessonDifficulty: lesson?.difficulty ?? "beginner",
      lessonDuration: lesson?.duration ?? 0,
    };
  });

  return NextResponse.json({ bookmarks });
}

/* ────────────── POST — toggle bookmark (add / remove) ────────────── */

const postSchema = z.object({
  programSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`bookmark:${session.user.id}`, RATE_LIMITS.general);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: rateLimitHeaders(rl) }
    );
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400, headers: rateLimitHeaders(rl) }
    );
  }

  const { programSlug, lessonSlug } = parsed.data;

  // Check if already bookmarked
  const [existing] = await db
    .select({ id: lessonBookmarks.id })
    .from(lessonBookmarks)
    .where(
      and(
        eq(lessonBookmarks.userId, session.user.id),
        eq(lessonBookmarks.programSlug, programSlug),
        eq(lessonBookmarks.lessonSlug, lessonSlug)
      )
    );

  if (existing) {
    // Remove bookmark
    await db
      .delete(lessonBookmarks)
      .where(eq(lessonBookmarks.id, existing.id));

    return NextResponse.json(
      { bookmarked: false },
      { headers: rateLimitHeaders(rl) }
    );
  }

  // Add bookmark
  await db.insert(lessonBookmarks).values({
    userId: session.user.id,
    programSlug,
    lessonSlug,
  });

  return NextResponse.json(
    { bookmarked: true },
    { status: 201, headers: rateLimitHeaders(rl) }
  );
}
