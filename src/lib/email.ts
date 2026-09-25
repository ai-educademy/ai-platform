import {
  welcomeEmailHtml,
  subscriptionEmailHtml,
  verificationCodeEmailHtml,
  passwordResetEmailHtml,
  leadMagnetEmailHtml,
  abandonedCartEmailHtml,
} from "./emailTemplates";
import { getEmailTranslator } from "./email-i18n";
import {
  getOrCreateUnsubscribeToken,
  isMarketingSuppressed,
  unsubscribeLinkFor,
} from "./unsubscribe";
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

const trialEndingSubjectByLocale: Record<string, string> = {
  en: "Your AI Educademy Pro trial ends soon",
  fr: "Votre essai AI Educademy Pro se termine bientôt",
  nl: "Je AI Educademy Pro-proefperiode eindigt binnenkort",
  hi: "आपका AI Educademy Pro ट्रायल जल्द समाप्त होगा",
  te: "మీ AI Educademy Pro ట్రయల్ త్వరలో ముగుస్తుంది",
  de: "Ihre AI Educademy Pro-Testphase endet bald",
  es: "Tu prueba de AI Educademy Pro termina pronto",
  ja: "AI Educademy Proのトライアルがまもなく終了します",
  zh: "您的 AI Educademy Pro 试用即将结束",
  pt: "Seu teste do AI Educademy Pro termina em breve",
  ar: "ستنتهي تجربتك في AI Educademy Pro قريبًا",
};

function trialEndingHtml(plan: string, locale: string): string {
  const basePath = localeBasePath(locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org";
  const portalUrl = `${appUrl}${basePath}/dashboard`;
  const copy: Record<
    string,
    { title: string; body: string; cta: string; note: string }
  > = {
    en: {
      title: "Your 7-day Pro trial ends soon",
      body: `Your AI Educademy Pro ${plan} trial is ending soon. Your saved card will be charged when the trial ends unless you cancel first.`,
      cta: "Manage billing",
      note: "You can cancel anytime from your dashboard before the trial ends.",
    },
    fr: {
      title: "Votre essai Pro de 7 jours se termine bientôt",
      body: `Votre essai AI Educademy Pro ${plan} se termine bientôt. Votre carte enregistrée sera débitée à la fin de l'essai sauf annulation avant cette date.`,
      cta: "Gérer la facturation",
      note: "Vous pouvez annuler à tout moment depuis votre tableau de bord avant la fin de l'essai.",
    },
  };
  const t = copy[locale] ?? copy.en;
  return `<div style="font-family:system-ui,sans-serif;padding:24px;color:#111827;line-height:1.6;">
    <h1 style="margin:0 0 12px;color:#4f46e5;font-size:24px;">${t.title}</h1>
    <p>${t.body}</p>
    <p>${t.note}</p>
    <p><a href="${portalUrl}" style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">${t.cta}</a></p>
    <p style="color:#6b7280;font-size:12px;">This is a transactional notice about your trial, not a marketing email.</p>
  </div>`;
}

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

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[Email] No RESEND_API_KEY set. Skipping email for ${to}`);
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "AI Educademy <onboarding@resend.dev>";

    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error(`[Email] Resend API error for ${to}:`, result.error);
      return false;
    } else {
      console.info(`[Email] Email sent to ${to} (id: ${result.data?.id})`);
      return true;
    }
  } catch (error) {
    console.error(`[Email] Failed to send email to ${to}:`, error);
    return false;
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
    console.info(
      `[Email] No RESEND_API_KEY set. Skipping marketing email for ${to}`,
    );
    return { status: "rejected", reason: "RESEND_API_KEY is not set" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "AI Educademy <onboarding@resend.dev>";

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
      return {
        status: "rejected",
        reason: result.error.message ?? String(result.error),
      };
    }
    return { status: "sent" };
  } catch (error) {
    // The request may have reached Resend before this threw, so the caller must
    // not assume the message can be safely resent.
    console.error(`[Email] Failed to send marketing email to ${to}:`, error);
    return { status: "unknown", reason: String(error) };
  }
}

export async function sendWelcomeEmail(
  email: string,
  locale: string = "en",
  name?: string,
): Promise<void> {
  const subject = subjectByLocale[locale] || subjectByLocale.en;
  const token = await getOrCreateUnsubscribeToken(email);
  const html = welcomeEmailHtml(
    email,
    locale,
    name,
    unsubscribeLinkFor(token, locale),
  );
  await sendEmail(email, subject, html);
}

export async function sendSubscriptionEmail(
  email: string,
  type: "activated" | "cancelled",
  plan: string = "monthly",
  locale: string = "en",
): Promise<void> {
  const subjects =
    type === "activated" ? proSubjectByLocale : cancelSubjectByLocale;
  const subject = subjects[locale] || subjects.en;
  const html = subscriptionEmailHtml(email, type, plan, locale);
  await sendEmail(email, subject, html);
}

export async function sendTrialWillEndEmail(
  email: string,
  plan: string = "monthly",
  locale: string = "en",
): Promise<void> {
  const subject =
    trialEndingSubjectByLocale[locale] || trialEndingSubjectByLocale.en;
  await sendEmail(email, subject, trialEndingHtml(plan, locale));
}

export async function sendAdminNotification(
  subject: string,
  body: string,
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.info("[Email] No ADMIN_EMAIL set. Skipping admin notification.");
    return;
  }
  const html = `<div style="font-family:system-ui,sans-serif;padding:20px;"><h2 style="color:#6366f1;">${subject}</h2><div style="color:#333;line-height:1.6;">${body}</div><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"><p style="color:#999;font-size:12px;">AI Educademy Admin Notification</p></div>`;
  await sendEmail(adminEmail, `[AI Educademy] ${subject}`, html);
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<boolean> {
  const subject = "Your AI Educademy verification code";
  const html = verificationCodeEmailHtml(code);
  return sendEmail(email, subject, html);
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  const subject = "Reset your AI Educademy password";
  const html = passwordResetEmailHtml(resetUrl);
  await sendEmail(email, subject, html);
}

export async function sendAbandonedCartEmail(
  email: string,
  name?: string,
  locale: string = "en",
): Promise<void> {
  if (await isMarketingSuppressed(email)) return;
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

export async function sendLeadMagnetEmail(
  email: string,
  name: string,
  downloadUrl: string,
): Promise<void> {
  const subject = "Your AI Starter Kit is Ready! 🚀";
  const token = await getOrCreateUnsubscribeToken(email);
  const html = leadMagnetEmailHtml(
    name,
    downloadUrl,
    unsubscribeLinkFor(token, "en"),
  );
  await sendEmail(email, subject, html);
}
