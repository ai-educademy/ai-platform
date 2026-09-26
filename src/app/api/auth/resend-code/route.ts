import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

export function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`auth-resend:${ip}`, RATE_LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const body = await req.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    // Check user exists and is not yet verified
    const [user] = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || user.emailVerified) {
      // Do not reveal whether the user exists. Return success either way.
      return NextResponse.json({
        message: "If the account needs verification, a new code has been sent.",
      });
    }

    // Delete existing tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    // Generate new code
    const code = generateCode();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
      identifier: email,
      token: code,
      expires,
    });

    const sent = await sendVerificationEmail(email, code);
    if (!sent) {
      return NextResponse.json(
        {
          error:
            "We could not send the verification code. Please try again shortly.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[ResendCode] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
