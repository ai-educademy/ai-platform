import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendWelcomeEmail, sendAdminNotification } from "@/lib/email";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`auth-verify:${ip}`, RATE_LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    // Look up token
    const [token] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, code)
        )
      )
      .limit(1);

    if (!token) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > token.expires) {
      // Clean up expired token
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.token, code)
          )
        );
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify email
    await db
      .update(users)
      .set({ emailVerified: new Date(), updatedAt: new Date() })
      .where(eq(users.email, email));

    // Delete the used token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, code)
        )
      );

    // Get user for welcome email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user) {
      sendWelcomeEmail(email, "en", user.name || undefined).catch((err) =>
        console.error("[VerifyEmail] Welcome email failed:", err)
      );
      sendAdminNotification(
        "New user signed up! 🎉",
        `<p><strong>Name:</strong> ${user.name || "—"}</p>
         <p><strong>Email:</strong> ${user.email}</p>
         <p><strong>Method:</strong> Email/Password</p>
         <p><strong>Time:</strong> ${new Date().toUTCString()}</p>`
      ).catch((err) => console.error("[VerifyEmail] Admin notification failed:", err));
    }

    return NextResponse.json({ message: "Email verified successfully. You can now sign in." });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[VerifyEmail] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
