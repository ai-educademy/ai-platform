import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, referrals } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

function generateReferralCode(name: string | null | undefined): string {
  const prefix = (name ?? "USR")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}_${suffix}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get user's referral code, generate if missing
    const [user] = await db
      .select({ referralCode: users.referralCode, name: users.name })
      .from(users)
      .where(eq(users.id, userId));

    let referralCode = user?.referralCode;

    if (!referralCode) {
      referralCode = generateReferralCode(user?.name);
      await db
        .update(users)
        .set({ referralCode })
        .where(eq(users.id, userId));
    }

    // Count total referrals
    const [totalResult] = await db
      .select({ total: count() })
      .from(referrals)
      .where(eq(referrals.referrerUserId, userId));

    // Count successful referrals (signed up or beyond)
    const successfulStatuses = ["signed_up", "completed_lesson", "rewarded"];
    const allReferrals = await db
      .select({ status: referrals.status })
      .from(referrals)
      .where(eq(referrals.referrerUserId, userId));

    const successfulCount = allReferrals.filter((r) =>
      successfulStatuses.includes(r.status)
    ).length;

    return NextResponse.json({
      referralCode,
      referralLink: `https://aieducademy.org?ref=${referralCode}`,
      totalReferrals: totalResult.total,
      successfulReferrals: successfulCount,
    });
  } catch (error) {
    console.error("Referral GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { referralCode } = body as { referralCode: string };

    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json(
        { error: "referralCode is required" },
        { status: 400 }
      );
    }

    // Find the referrer by their referral code
    const [referrer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, referralCode));

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // Prevent self-referral
    if (referrer.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot refer yourself" },
        { status: 400 }
      );
    }

    // Check if this referee already has a referral from this referrer
    const existing = await db
      .select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.refereeUserId, session.user.id));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Referral already recorded" },
        { status: 409 }
      );
    }

    // Record the referral
    await db.insert(referrals).values({
      referrerUserId: referrer.id,
      refereeUserId: session.user.id,
      referralCode,
      refereeEmail: session.user.email ?? null,
      status: "signed_up",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Referral POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
