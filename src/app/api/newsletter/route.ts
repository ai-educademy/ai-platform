import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail, sendAdminNotification } from "@/lib/email";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { z } from "zod";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

const NewsletterSchema = z.object({
  email: z.string().email("Invalid email format"),
  locale: z.string().max(10).default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`newsletter:${ip}`, RATE_LIMITS.newsletter);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please try again later." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const parsed = NewsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    // Upsert subscriber — don't duplicate on email
    await db
      .insert(newsletterSubscribers)
      .values({ email, locale: parsed.data.locale })
      .onConflictDoNothing({ target: newsletterSubscribers.email });

    await sendWelcomeEmail(email, parsed.data.locale);
    sendAdminNotification(
      "📬 New subscriber!",
      `<p><strong>Email:</strong> ${email}</p><p><strong>Locale:</strong> ${parsed.data.locale}</p>`
    ).catch(() => {});

    return NextResponse.json(
      { success: true, message: "Subscribed!" },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
