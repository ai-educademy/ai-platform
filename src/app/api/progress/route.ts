import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
  const { lessonSlug, programSlug, locale = "en" } = body as {
    lessonSlug: string;
    programSlug: string;
    locale?: string;
  };

  if (!lessonSlug || !programSlug) {
    return NextResponse.json(
      { error: "lessonSlug and programSlug are required" },
      { status: 400 }
    );
  }

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
  const { lessonSlug, programSlug } = body as {
    lessonSlug: string;
    programSlug: string;
  };

  if (!lessonSlug || !programSlug) {
    return NextResponse.json(
      { error: "lessonSlug and programSlug are required" },
      { status: 400 }
    );
  }

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
