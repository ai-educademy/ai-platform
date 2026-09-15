import { and, eq, isNull, inArray } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { users, subscriptions, campaignSends } from "@/lib/db/schema";
import { getEmailTranslator } from "@/lib/email-i18n";
import { proUpgradeEmailHtml } from "@/lib/emailTemplates";
import { safeLocale, localeBasePath } from "@/lib/safe-locale";
import { generateUnsubscribeToken, unsubscribeUrl } from "@/lib/unsubscribe";
import { isUndeliverableAddress } from "@/lib/email-hygiene";
import { sendMarketingEmail } from "@/lib/email";

export const PRO_UPGRADE_CAMPAIGN = "pro-upgrade-2026-09";

export type CampaignResult = {
  campaign: string;
  dryRun: boolean;
  eligible: number;
  alreadySent: number;
  sent: number;
  failed: number;
  errors: string[];
  sampleRecipients: string[];
};

/** Users who may receive product marketing about upgrading. */
async function findEligibleRecipients() {
  // Anyone with a subscription row that is not fully dead already pays us, or
  // is mid-payment. Emailing them "please subscribe" would be embarrassing.
  const paying = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(inArray(subscriptions.status, ["active", "trialing", "past_due", "incomplete"]));
  const payingIds = new Set(paying.map((p) => p.userId));

  const candidates = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      locale: users.locale,
      unsubscribeToken: users.unsubscribeToken,
    })
    .from(users)
    .where(and(eq(users.role, "free"), isNull(users.marketingOptOutAt)));

  return candidates.filter(
    (u) => u.email && !payingIds.has(u.id) && !isUndeliverableAddress(u.email),
  );
}

/**
 * Sends (or simulates sending) the Pro upgrade campaign.
 *
 * `dryRun` defaults to true at every call site. Sending marketing mail is
 * irreversible and visible to real customers, so the safe path has to be the
 * one you get by accident.
 */
export async function runProUpgradeCampaign(opts: {
  dryRun?: boolean;
  limit?: number;
  testEmail?: string;
}): Promise<CampaignResult> {
  const dryRun = opts.dryRun !== false;
  const result: CampaignResult = {
    campaign: PRO_UPGRADE_CAMPAIGN,
    dryRun,
    eligible: 0,
    alreadySent: 0,
    sent: 0,
    failed: 0,
    errors: [],
    sampleRecipients: [],
  };

  if (!isDbConfigured) {
    result.errors.push("DATABASE_URL is not configured");
    return result;
  }

  // A test send addresses one mailbox and never touches the campaign ledger, so
  // it can be repeated while iterating on copy.
  if (opts.testEmail) {
    const tr = await getEmailTranslator("en");

    // If the test address belongs to a real account, reuse (and persist) that
    // account's token so the unsubscribe link in the rehearsal actually works.
    // A throwaway token would render a dead link and make a working opt-out
    // look broken during the one check that is meant to catch that.
    const [existing] = await db
      .select({ id: users.id, unsubscribeToken: users.unsubscribeToken })
      .from(users)
      .where(eq(users.email, opts.testEmail))
      .limit(1);

    let token = existing?.unsubscribeToken ?? null;
    if (existing && !token) {
      token = generateUnsubscribeToken();
      await db.update(users).set({ unsubscribeToken: token }).where(eq(users.id, existing.id));
    }
    if (!token) {
      token = generateUnsubscribeToken();
      result.errors.push(
        `${opts.testEmail} is not a registered user, so its unsubscribe link is not live.`,
      );
    }

    const link = unsubscribeUrl(token, "en");
    const html = proUpgradeEmailHtml(
      undefined,
      `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org"}/pricing`,
      link,
      tr,
    );
    const ok = await sendMarketingEmail(
      opts.testEmail,
      tr.t("proUpgradeSubject"),
      html,
      link,
    );
    result.eligible = 1;
    result.sent = ok.status === "sent" ? 1 : 0;
    result.failed = ok.status === "sent" ? 0 : 1;
    if (ok.status !== "sent") result.errors.push(`${ok.status}: ${ok.reason}`);
    result.sampleRecipients = [opts.testEmail];
    return result;
  }

  const recipients = await findEligibleRecipients();
  result.eligible = recipients.length;

  // Fail before claiming anyone. The ledger is written ahead of dispatch, so a
  // misconfigured mailer would otherwise mark every recipient as contacted
  // while sending nothing, and the ledger would then suppress the retry. That
  // turns one missing variable into a permanently burnt mailing list.
  if (!dryRun && !process.env.RESEND_API_KEY) {
    result.errors.push(
      "RESEND_API_KEY is not set. Refusing to start so the campaign ledger is not consumed without sending.",
    );
    return result;
  }

  const alreadySent = await db
    .select({ email: campaignSends.email })
    .from(campaignSends)
    .where(eq(campaignSends.campaign, PRO_UPGRADE_CAMPAIGN));
  const sentSet = new Set(alreadySent.map((r) => r.email));

  const pending = recipients.filter((r) => !sentSet.has(r.email as string));
  result.alreadySent = recipients.length - pending.length;

  const batch = opts.limit ? pending.slice(0, opts.limit) : pending;
  result.sampleRecipients = batch.slice(0, 5).map((r) => r.email as string);

  if (dryRun) return result;

  for (const user of batch) {
    const locale = safeLocale(user.locale);
    const email = user.email as string;
    try {
      let token = user.unsubscribeToken;
      if (!token) {
        token = generateUnsubscribeToken();
        await db.update(users).set({ unsubscribeToken: token }).where(eq(users.id, user.id));
      }

      const tr = await getEmailTranslator(locale);
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org";
      const link = unsubscribeUrl(token, locale);
      const html = proUpgradeEmailHtml(
        user.name ?? undefined,
        `${base}${localeBasePath(locale)}/pricing`,
        link,
        tr,
      );

      // Claim the send BEFORE dispatching. If the process dies mid-run the
      // worst outcome is one person not receiving an email, rather than a
      // resumed run mailing everyone a second time.
      const claimed = await db
        .insert(campaignSends)
        .values({ campaign: PRO_UPGRADE_CAMPAIGN, userId: user.id, email, locale })
        .onConflictDoNothing()
        .returning({ id: campaignSends.id });

      if (claimed.length === 0) {
        result.alreadySent += 1;
        continue;
      }

      const send = await sendMarketingEmail(email, tr.t("proUpgradeSubject"), html, link);
      if (send.status === "sent") {
        result.sent += 1;
      } else {
        result.failed += 1;
        result.errors.push(`send failed (${send.status}): ${email}: ${send.reason}`);

        // A rejection means the message was definitely not transmitted, so the
        // claim is released and a later run can retry this recipient. An
        // unknown outcome keeps its claim: a duplicate marketing email is worse
        // than a missed one.
        if (send.status === "rejected") {
          await db.delete(campaignSends).where(eq(campaignSends.id, claimed[0].id));
        }
      }

      // Resend's default ceiling is 2 requests/second. Staying under it is
      // cheaper than handling the 429s.
      await new Promise((r) => setTimeout(r, 600));
    } catch (error) {
      result.failed += 1;
      result.errors.push(`${email}: ${String(error)}`);
    }
  }

  return result;
}
