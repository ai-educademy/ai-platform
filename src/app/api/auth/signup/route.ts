import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";
import { safeLocale } from "@/lib/safe-locale";
import { isMissingColumn } from "@/lib/db/missing-column";
import { trackEvent } from "@/lib/funnel";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`auth-signup:${ip}`, RATE_LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    // Remembering the sign-up language lets every later email reach the user in
    // the language they actually chose to browse in.
    const locale = safeLocale(body.locale);

    // Validate name
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 2 and 50 characters." },
        { status: 400 },
      );
    }

    // Validate email
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // Validate password
    if (!PASSWORD_RE.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters with at least 1 letter and 1 number.",
        },
        { status: 400 },
      );
    }

    // Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered. Please sign in instead." },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user.
    //
    // `locale` arrives with migration 0004, and migrations are applied by hand
    // on this project rather than during the build, so code can reach
    // production ahead of the schema. Sign-up is too important to fail over a
    // column that only personalises later email, so a missing column falls back
    // to creating the account without it. Remove this once 0004 is applied
    // everywhere.
    const userId = crypto.randomUUID();
    try {
      await db.insert(users).values({
        id: userId,
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
        locale,
      });
    } catch (error) {
      if (!isMissingColumn(error, "locale")) throw error;
      console.warn("[Signup] users.locale missing; apply migration 0004.");
      await db.insert(users).values({
        id: userId,
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
      });
    }

    // Generate verification code and store it
    const code = generateCode();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
      identifier: email,
      token: code,
      expires,
    });

    const verificationEmailSent = await sendVerificationEmail(email, code);
    trackEvent("signup_completed", { userId, locale, path: "/signup" });

    return NextResponse.json(
      {
        message: verificationEmailSent
          ? "Account created. You can start learning now. We have sent a verification code for later."
          : "Account created. You can start learning now, but we could not send the verification code yet.",
        verificationEmailSent,
      },
      { status: 201 },
    );
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[Signup] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
