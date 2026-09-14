import { NextRequest, NextResponse } from "next/server";
import { sendLeadMagnetEmail, sendAdminNotification } from "@/lib/email";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { z } from "zod";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

const LeadMagnetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
});

const DOWNLOAD_URL = "https://aieducademy.org/api/lead-magnet/download";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`lead-magnet:${ip}`, RATE_LIMITS.leadMagnet);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please try again later." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const parsed = LeadMagnetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email: rawEmail } = parsed.data;
    const email = rawEmail.toLowerCase();

    // Upsert subscriber — add to newsletter list if not already subscribed
    await db
      .insert(newsletterSubscribers)
      .values({ email, locale: "en" })
      .onConflictDoNothing({ target: newsletterSubscribers.email });

    // Send lead magnet email with download link
    await sendLeadMagnetEmail(email, name, DOWNLOAD_URL);

    // Notify admin (fire-and-forget)
    sendAdminNotification(
      "📥 New lead magnet download!",
      `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Asset:</strong> 2026 AI Starter Kit</p>`
    ).catch(() => {});

    return NextResponse.json(
      { success: true, message: "Check your email for the download link!", downloadUrl: DOWNLOAD_URL },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("Lead magnet API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
