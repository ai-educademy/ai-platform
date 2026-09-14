import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { playgroundScores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

function serverError(route: string, error: unknown): NextResponse {
  if (isDatabaseNotConfigured(error)) return databaseUnavailable();
  console.error(`[api/playground-scores] ${route} failed`, error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

const ScoreSchema = z.object({
  gameId: z.string().min(1).max(100),
  score: z.number().int().min(0),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");

  try {
    if (gameId) {
      const [row] = await db
        .select({
          gameId: playgroundScores.gameId,
          bestScore: playgroundScores.bestScore,
        })
        .from(playgroundScores)
        .where(
          and(
            eq(playgroundScores.userId, session.user.id),
            eq(playgroundScores.gameId, gameId)
          )
        )
        .limit(1);

      return NextResponse.json({ score: row ?? null });
    }

    const scores = await db
      .select({
        gameId: playgroundScores.gameId,
        bestScore: playgroundScores.bestScore,
      })
      .from(playgroundScores)
      .where(eq(playgroundScores.userId, session.user.id));

    return NextResponse.json({ scores });
  } catch (error) {
    return serverError("GET", error);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { gameId, score } = parsed.data;

  try {
    const [existing] = await db
      .select({ bestScore: playgroundScores.bestScore })
      .from(playgroundScores)
      .where(
        and(
          eq(playgroundScores.userId, session.user.id),
          eq(playgroundScores.gameId, gameId)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(playgroundScores).values({
        userId: session.user.id,
        gameId,
        bestScore: score,
      });
      return NextResponse.json({ bestScore: score, isNew: true });
    }

    if (score > existing.bestScore) {
      await db
        .update(playgroundScores)
        .set({ bestScore: score, updatedAt: new Date() })
        .where(
          and(
            eq(playgroundScores.userId, session.user.id),
            eq(playgroundScores.gameId, gameId)
          )
        );
      return NextResponse.json({ bestScore: score, isNew: true });
    }

    return NextResponse.json({ bestScore: existing.bestScore, isNew: false });
  } catch (error) {
    return serverError("POST", error);
  }
}
