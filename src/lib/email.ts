import { welcomeEmailHtml, subscriptionEmailHtml, verificationCodeEmailHtml, passwordResetEmailHtml, leadMagnetEmailHtml, abandonedCartEmailHtml } from "./emailTemplates";
import { getEmailTranslator } from "./email-i18n";
import { getOrCreateUnsubscribeToken, unsubscribeLinkFor } from "./unsubscribe";
import { localeBasePath } from "./safe-locale";

const subjectByLocale: Record<string, string> = {
  en: "Welcome to AI Educademy! 🎓",
  fr: "Bienvenue sur AI Educademy ! 🎓",
  nl: "Welkom bij AI Educademy! 🎓",
  hi: "AI Educademy में आपका स्वागत है! 🎓",
  te: "AI Educademy కి స్వాగతం! 🎓",
  de: "Willkommen bei AI Educademy! 🎓",
  es: "¡Bienvenido a AI Educademy! 🎓",
  ja: "AI Educademyへようこそ！ 🎓",
  zh: "欢迎来到AI Educademy！ 🎓",
  pt: "Bem-vindo ao AI Educademy! 🎓",
  ar: "مرحبًا بك في AI Educademy! 🎓",
};

const proSubjectByLocale: Record<string, string> = {
  en: "Welcome to Pro! 🚀",
  fr: "Bienvenue chez Pro ! 🚀",
  nl: "Welkom bij Pro! 🚀",
  hi: "Pro में आपका स्वागत है! 🚀",
  te: "Pro కి స్వాగతం! 🚀",
  de: "Willkommen bei Pro! 🚀",
  es: "¡Bienvenido a Pro! 🚀",
  ja: "Proへようこそ! 🚀",
  zh: "欢迎来到Pro！ 🚀",
  pt: "Bem-vindo ao Pro! 🚀",
  ar: "مرحبًا بك في Pro! 🚀",
};

const cancelSubjectByLocale: Record<string, string> = {
  en: "Your subscription has ended",
  fr: "Votre abonnement a pris fin",
  nl: "Je abonnement is beëindigd",
  hi: "आपकी सदस्यता समाप्त हो गई है",
  te: "మీ సబ్‌స్క్రిప్షన్ ముగిసింది",
  de: "Ihr Abonnement ist beendet",
  es: "Tu suscripción ha finalizado",
  ja: "サブスクリプションは終了しました",
  zh: "您的订阅已结束",
  pt: "Sua assinatura terminou",
  ar: "لقد انتهى اشتراكك",
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

/**
 * Sends a bulk marketing email.
 *
 * Separate from `sendEmail` for two reasons. It reports the outcome of the
 * send, because a campaign that silently swallows failures cannot report what
 * happened, and it distinguishes a definite rejection from an unknown outcome
 * so the caller can decide whether retrying risks a duplicate; and it attaches
 * the List-Unsubscribe headers, which Gmail and Yahoo require from bulk senders
 * and which give the reader a one-click opt-out in the mail client itself
 * rather than buried in the footer.
 */
export type MarketingSendResult =
  /** The provider accepted the message. */
  | { status: "sent" }
  /**
   * The message was definitely not transmitted: we never called the provider,
   * or the provider rejected it outright. Safe to retry.
   */
  | { status: "rejected"; reason: string }
  /**
   * The outcome is unknown. The provider may have accepted the message before
   * the failure surfaced, so a retry risks a duplicate.
   */
  | { status: "unknown"; reason: string };

export async function sendMarketingEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeLink: string,
): Promise<MarketingSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[Email] No RESEND_API_KEY set. Skipping marketing email for ${to}`);
    return { status: "rejected", reason: "RESEND_API_KEY is not set" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || "AI Educademy <onboarding@resend.dev>";

    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeLink}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (result.error) {
      console.error(`[Email] Resend API error for ${to}:`, result.error);
      return { status: "rejected", reason: result.error.message ?? String(result.error) };
    }
    return { status: "sent" };
  } catch (error) {
    // The request may have reached Resend before this threw, so the caller must
    // not assume the message can be safely resent.
    console.error(`[Email] Failed to send marketing email to ${to}:`, error);
    return { status: "unknown", reason: String(error) };
  }
}

export async function sendWelcomeEmail(email: string, locale: string = "en", name?: string): Promise<void> {
  const subject = subjectByLocale[locale] || subjectByLocale.en;
  const token = await getOrCreateUnsubscribeToken(email);
  const html = welcomeEmailHtml(email, locale, name, unsubscribeLinkFor(token, locale));
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

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const subject = "Your AI Educademy verification code";
  const html = verificationCodeEmailHtml(code);
  await sendEmail(email, subject, html);
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const subject = "Reset your AI Educademy password";
  const html = passwordResetEmailHtml(resetUrl);
  await sendEmail(email, subject, html);
}

export async function sendAbandonedCartEmail(email: string, name?: string, locale: string = "en"): Promise<void> {
  const tr = await getEmailTranslator(locale);
  const basePath = localeBasePath(tr.locale);
  const pricingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org"}${basePath}/pricing`;
  const promoCode = process.env.ABANDONED_CART_PROMO_CODE?.trim() || undefined;
  const subject = `${tr.t("abandonedCartSubject")} 🛒`;
  const token = await getOrCreateUnsubscribeToken(email);
  const html = abandonedCartEmailHtml(
    name,
    pricingUrl,
    tr,
    promoCode,
    unsubscribeLinkFor(token, tr.locale),
  );
  await sendEmail(email, subject, html);
}

export async function sendLeadMagnetEmail(email: string, name: string, downloadUrl: string): Promise<void> {
  const subject = "Your AI Starter Kit is Ready! 🚀";
  const token = await getOrCreateUnsubscribeToken(email);
  const html = leadMagnetEmailHtml(name, downloadUrl, unsubscribeLinkFor(token, "en"));
  await sendEmail(email, subject, html);
}
