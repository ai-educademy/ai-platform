import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const ProgressSchema = z.object({
  lessonSlug: z.string().min(1).max(100),
  programSlug: z.string().min(1).max(100),
  locale: z.string().max(10).default("en"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const programSlug = searchParams.get("program");

  const where = programSlug
    ? and(
        eq(lessonProgress.userId, session.user.id),
        eq(lessonProgress.programSlug, programSlug)
      )
    : eq(lessonProgress.userId, session.user.id);

  const progress = await db
    .select({
      lessonSlug: lessonProgress.lessonSlug,
      programSlug: lessonProgress.programSlug,
      locale: lessonProgress.locale,
      completedAt: lessonProgress.completedAt,
    })
    .from(lessonProgress)
    .where(where);

  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { lessonSlug, programSlug, locale } = parsed.data;

  await db
    .insert(lessonProgress)
    .values({
      userId: session.user.id,
      lessonSlug,
      programSlug,
      locale,
    })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ProgressSchema.pick({ lessonSlug: true, programSlug: true }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { lessonSlug, programSlug } = parsed.data;

  await db
    .delete(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, session.user.id),
        eq(lessonProgress.lessonSlug, lessonSlug),
        eq(lessonProgress.programSlug, programSlug)
      )
    );

  return NextResponse.json({ success: true });
}
