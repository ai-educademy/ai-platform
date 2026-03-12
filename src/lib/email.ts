import { welcomeEmailHtml, subscriptionEmailHtml } from "./emailTemplates";

const subjectByLocale: Record<string, string> = {
  en: "Welcome to AI Educademy! 🎓",
  fr: "Bienvenue sur AI Educademy ! 🎓",
  nl: "Welkom bij AI Educademy! 🎓",
  hi: "AI Educademy में आपका स्वागत है! 🎓",
  te: "AI Educademy కి స్వాగతం! 🎓",
};

const proSubjectByLocale: Record<string, string> = {
  en: "Welcome to Pro! 🚀",
  fr: "Bienvenue chez Pro ! 🚀",
  nl: "Welkom bij Pro! 🚀",
  hi: "Pro में आपका स्वागत है! 🚀",
  te: "Pro కి స్వాగతం! 🚀",
};

const cancelSubjectByLocale: Record<string, string> = {
  en: "Your subscription has ended",
  fr: "Votre abonnement a pris fin",
  nl: "Je abonnement is beëindigd",
  hi: "आपकी सदस्यता समाप्त हो गई है",
  te: "మీ సబ్‌స్క్రిప్షన్ ముగిసింది",
};

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[Email] No RESEND_API_KEY set. Skipping email for ${to}`);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || "AI Educademy <onboarding@resend.dev>";

    const result = await resend.emails.send({ from: fromAddress, to, subject, html });

    if (result.error) {
      console.error(`[Email] Resend API error for ${to}:`, result.error);
    } else {
      console.info(`[Email] Email sent to ${to} (id: ${result.data?.id})`);
    }
  } catch (error) {
    console.error(`[Email] Failed to send email to ${to}:`, error);
  }
}

export async function sendWelcomeEmail(email: string, locale: string = "en", name?: string): Promise<void> {
  const subject = subjectByLocale[locale] || subjectByLocale.en;
  const html = welcomeEmailHtml(email, locale, name);
  await sendEmail(email, subject, html);
}

export async function sendSubscriptionEmail(
  email: string,
  type: "activated" | "cancelled",
  plan: string = "monthly",
  locale: string = "en"
): Promise<void> {
  const subjects = type === "activated" ? proSubjectByLocale : cancelSubjectByLocale;
  const subject = subjects[locale] || subjects.en;
  const html = subscriptionEmailHtml(email, type, plan, locale);
  await sendEmail(email, subject, html);
}

export async function sendAdminNotification(subject: string, body: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.info("[Email] No ADMIN_EMAIL set. Skipping admin notification.");
    return;
  }
  const html = `<div style="font-family:system-ui,sans-serif;padding:20px;"><h2 style="color:#6366f1;">${subject}</h2><div style="color:#333;line-height:1.6;">${body}</div><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"><p style="color:#999;font-size:12px;">AI Educademy Admin Notification</p></div>`;
  await sendEmail(adminEmail, `[AI Educademy] ${subject}`, html);
}
