import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`auth-reset:${ip}`, RATE_LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !token) {
      return NextResponse.json(
        { error: "Invalid reset link." },
        { status: 400 }
      );
    }

    if (!PASSWORD_RE.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with at least 1 letter and 1 number." },
        { status: 400 }
      );
    }

    // Validate token
    const [storedToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, token)
        )
      )
      .limit(1);

    if (!storedToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    if (new Date() > storedToken.expires) {
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.token, token)
          )
        );
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 12);
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.email, email));

    // Delete the used token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, token)
        )
      );

    return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[ResetPassword] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
