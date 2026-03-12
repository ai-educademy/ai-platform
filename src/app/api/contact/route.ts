import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { sendAdminNotification } from "@/lib/email";
import { z } from "zod";

const SUBJECTS = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Partnership",
  "Other",
] as const;

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.enum(SUBJECTS),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be under 2000 characters"),
});

function buildContactEmailHtml(data: z.infer<typeof ContactSchema>): string {
  const timestamp = new Date().toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
      <div style="border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:22px;color:#6366f1;">📬 New Contact Form Submission</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#666;width:100px;vertical-align:top;">Name</td>
          <td style="padding:10px 12px;">${escapeHtml(data.name)}</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:10px 12px;font-weight:600;color:#666;vertical-align:top;">Email</td>
          <td style="padding:10px 12px;"><a href="mailto:${escapeHtml(data.email)}" style="color:#6366f1;">${escapeHtml(data.email)}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#666;vertical-align:top;">Subject</td>
          <td style="padding:10px 12px;">${escapeHtml(data.subject)}</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:10px 12px;font-weight:600;color:#666;vertical-align:top;">Message</td>
          <td style="padding:10px 12px;white-space:pre-wrap;line-height:1.6;">${escapeHtml(data.message)}</td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#999;font-size:12px;margin:0;">Received at ${timestamp} UTC · AI Educademy Contact Form</p>
    </div>
  `;
}

function buildConfirmationEmailHtml(name: string): string {
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
      <div style="border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:22px;color:#6366f1;">🎓 AI Educademy</h1>
      </div>
      <p style="font-size:15px;color:#333;line-height:1.6;">
        Hi ${escapeHtml(name)},
      </p>
      <p style="font-size:15px;color:#333;line-height:1.6;">
        Thank you for reaching out! We&rsquo;ve received your message and will get back to you within 24 hours.
      </p>
      <p style="font-size:15px;color:#333;line-height:1.6;">
        In the meantime, feel free to explore our
        <a href="https://aieducademy.org/programs" style="color:#6366f1;text-decoration:underline;">learning programs</a>.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#999;font-size:12px;margin:0;">
        This is an automated reply from AI Educademy. Please do not reply to this email.
      </p>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`contact:${ip}`, RATE_LIMITS.form);

    if (!rl.success) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimitHeaders(rl) },
      );
    }

    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400, headers: rateLimitHeaders(rl) },
      );
    }

    // Send admin notification with rich HTML
    const adminHtml = buildContactEmailHtml(parsed.data);
    await sendAdminNotification(
      `Contact: ${parsed.data.subject} from ${parsed.data.name}`,
      adminHtml,
    );

    // Send confirmation email to sender
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);
        const fromAddress = process.env.RESEND_FROM_EMAIL || "AI Educademy <onboarding@resend.dev>";

        await resend.emails.send({
          from: fromAddress,
          to: parsed.data.email,
          subject: "We received your message | AI Educademy",
          html: buildConfirmationEmailHtml(parsed.data.name),
        });
      }
    } catch (err) {
      console.error("[Contact] Failed to send confirmation email:", err);
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200, headers: rateLimitHeaders(rl) },
    );
  } catch (error) {
    console.error("[Contact] API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
