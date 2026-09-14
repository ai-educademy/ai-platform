import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lessonComments, users } from "@/lib/db/schema";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

/* ────────────── GET — fetch comments for a lesson ────────────── */

const getSchema = z.object({
  lesson: z.string().min(1),
  program: z.string().min(1),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(req: NextRequest) {
  const parsed = getSchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const { lesson, program, offset } = parsed.data;
  const limit = 20;

  const comments = await db
    .select({
      id: lessonComments.id,
      content: lessonComments.content,
      createdAt: lessonComments.createdAt,
      updatedAt: lessonComments.updatedAt,
      userId: lessonComments.userId,
      userName: users.name,
      userImage: users.image,
      userRole: users.role,
    })
    .from(lessonComments)
    .innerJoin(users, eq(lessonComments.userId, users.id))
    .where(
      and(
        eq(lessonComments.lessonSlug, lesson),
        eq(lessonComments.programSlug, program)
      )
    )
    .orderBy(desc(lessonComments.createdAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessonComments)
    .where(
      and(
        eq(lessonComments.lessonSlug, lesson),
        eq(lessonComments.programSlug, program)
      )
    );

  return NextResponse.json({
    comments,
    total: countResult?.count ?? 0,
    hasMore: offset + limit < (countResult?.count ?? 0),
  });
}

/* ────────────── POST — create a comment ────────────── */

const postSchema = z.object({
  lessonSlug: z.string().min(1),
  programSlug: z.string().min(1),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be 2000 characters or fewer"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`comment:${session.user.id}`, RATE_LIMITS.comment);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many comments. Please wait a moment." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400, headers: rateLimitHeaders(rl) }
    );
  }

  const sanitized = stripHtml(parsed.data.content);
  if (!sanitized) {
    return NextResponse.json(
      { error: "Comment cannot be empty" },
      { status: 400, headers: rateLimitHeaders(rl) }
    );
  }

  const [comment] = await db
    .insert(lessonComments)
    .values({
      userId: session.user.id,
      lessonSlug: parsed.data.lessonSlug,
      programSlug: parsed.data.programSlug,
      content: sanitized,
    })
    .returning();

  return NextResponse.json(
    { comment },
    { status: 201, headers: rateLimitHeaders(rl) }
  );
}

/* ────────────── DELETE — delete own comment ────────────── */

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
  }

  const [existing] = await db
    .select({ userId: lessonComments.userId })
    .from(lessonComments)
    .where(eq(lessonComments.id, parsed.data.id));

  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const isOwner = existing.userId === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .delete(lessonComments)
    .where(eq(lessonComments.id, parsed.data.id));

  return NextResponse.json({ success: true });
}
