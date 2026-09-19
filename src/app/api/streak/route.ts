import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userStreaks } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

function serverError(route: string, error: unknown): NextResponse {
  if (isDatabaseNotConfigured(error)) return databaseUnavailable();
  console.error(`[api/streak] ${route} failed`, error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

const MigrateSchema = z.object({
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  lastActivityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [row] = await db
      .select({
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
        lastActivityDate: userStreaks.lastActivityDate,
      })
      .from(userStreaks)
      .where(eq(userStreaks.userId, session.user.id))
      .limit(1);

    if (!row) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: "",
      });
    }

    // Recalculate current streak based on staleness
    const today = getToday();
    const yesterday = getYesterday();
    if (row.lastActivityDate !== today && row.lastActivityDate !== yesterday) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: row.longestStreak,
        lastActivityDate: row.lastActivityDate,
      });
    }

    return NextResponse.json(row);
  } catch (error) {
    return serverError("GET", error);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  try {
    // Migration: client sends full streak data from localStorage
    if (body && typeof body.currentStreak === "number") {
      const parsed = MigrateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
      const { currentStreak, longestStreak, lastActivityDate } = parsed.data;

      await db
        .insert(userStreaks)
        .values({
          userId: session.user.id,
          currentStreak,
          longestStreak,
          lastActivityDate,
        })
        .onConflictDoNothing({ target: userStreaks.userId });
      return NextResponse.json({ success: true });
    }

    // Normal: record today's activity
    const today = getToday();
    const yesterday = getYesterday();

    const nextCurrentStreak = sql<number>`case
      when ${userStreaks.lastActivityDate} = ${today} then ${userStreaks.currentStreak}
      when ${userStreaks.lastActivityDate} = ${yesterday} then ${userStreaks.currentStreak} + 1
      else 1
    end`;

    const [row] = await db
      .insert(userStreaks)
      .values({
        userId: session.user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      })
      .onConflictDoUpdate({
        target: userStreaks.userId,
        set: {
          currentStreak: nextCurrentStreak,
          longestStreak: sql<number>`greatest(${userStreaks.longestStreak}, ${nextCurrentStreak})`,
          lastActivityDate: sql<string>`case
            when ${userStreaks.lastActivityDate} = ${today} then ${userStreaks.lastActivityDate}
            else ${today}
          end`,
          updatedAt: new Date(),
        },
      })
      .returning({
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
        lastActivityDate: userStreaks.lastActivityDate,
      });

    return NextResponse.json({
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      lastActivityDate: row.lastActivityDate,
    });
  } catch (error) {
    return serverError("POST", error);
  }
}
