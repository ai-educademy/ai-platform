import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`auth-forgot:${ip}`, RATE_LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Always return 200 to prevent email enumeration
    const genericMessage = "If an account exists with that email, we've sent a password reset link.";

    const [user] = await db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Only send reset if user exists AND has a password (not OAuth-only)
    if (user?.password) {
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(verificationTokens).values({
        identifier: email,
        token,
        expires,
      });

      const baseUrl = process.env.NEXTAUTH_URL || "https://aieducademy.org";
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

      sendPasswordResetEmail(email, resetUrl).catch((err) =>
        console.error("[ForgotPassword] Reset email failed:", err)
      );
    }

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[ForgotPassword] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
