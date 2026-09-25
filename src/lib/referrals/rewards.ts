import type Stripe from "stripe";
import { and, count, eq, gte, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { referrals, users } from "@/lib/db/schema";
import { getStripe, PLANS } from "@/lib/stripe";

export const REFERRAL_MONTHLY_REWARD_CAP = 10;

export type ReferralRewardResult =
  | { status: "ignored"; reason: string }
  | { status: "blocked"; reason: string }
  | { status: "rewarded"; referralId: string; balanceTransactionId: string };

export function monthlyRewardAmountPence(): number {
  return PLANS.monthly.price;
}

function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

type StripeObjectRef = string | { id: string } | null | undefined;

function stripeId(value: StripeObjectRef): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: StripeObjectRef;
  };
  return stripeId(invoiceWithSubscription.subscription ?? null);
}

function invoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  const invoiceWithPaymentIntent = invoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  };
  return stripeId(invoiceWithPaymentIntent.payment_intent ?? null);
}

function isCardPaymentMethod(
  paymentMethod: Stripe.PaymentMethod | null,
): paymentMethod is Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card } {
  return paymentMethod?.type === "card" && !!paymentMethod.card;
}

async function paymentFingerprint(
  invoice: Stripe.Invoice,
): Promise<string | null> {
  const paymentIntentId = invoicePaymentIntentId(invoice);
  if (!paymentIntentId) return null;

  const paymentIntent = await getStripe().paymentIntents.retrieve(
    paymentIntentId,
    {
      expand: ["payment_method"],
    },
  );
  const paymentMethod = paymentIntent.payment_method;
  if (typeof paymentMethod === "string") return null;
  return isCardPaymentMethod(paymentMethod)
    ? (paymentMethod.card.fingerprint ?? null)
    : null;
}

async function referrerHasSameCard(
  stripeCustomerId: string,
  fingerprint: string | null,
): Promise<boolean> {
  if (!fingerprint) return false;
  const paymentMethods = await getStripe().paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
    limit: 10,
  });
  return paymentMethods.data.some(
    (pm) => isCardPaymentMethod(pm) && pm.card.fingerprint === fingerprint,
  );
}

async function blockReferral(
  referralId: string,
  reason: string,
  invoice: Stripe.Invoice,
  fingerprint: string | null,
): Promise<ReferralRewardResult> {
  await db
    .update(referrals)
    .set({
      status: "blocked",
      abuseReason: reason,
      stripeCustomerId: stripeId(invoice.customer),
      stripeSubscriptionId: invoiceSubscriptionId(invoice),
      stripeInvoiceId: invoice.id,
      refereePaymentFingerprint: fingerprint,
      completedAt: new Date(),
    })
    .where(eq(referrals.id, referralId));

  return { status: "blocked", reason };
}

export async function rewardReferralForPaidInvoice(
  invoice: Stripe.Invoice,
): Promise<ReferralRewardResult> {
  const refereeCustomerId = stripeId(invoice.customer);
  const invoiceId = invoice.id;
  if (!refereeCustomerId || !invoiceId) {
    return { status: "ignored", reason: "missing_customer_or_invoice" };
  }
  // Trial invoices are paid at zero, and the reward is a GBP credit sized to
  // the GBP monthly price, so only a real GBP payment earns it.
  if ((invoice.amount_paid ?? 0) <= 0) {
    return { status: "ignored", reason: "zero_amount_invoice" };
  }
  if ((invoice.currency ?? "gbp").toLowerCase() !== "gbp") {
    return { status: "ignored", reason: "non_gbp_invoice" };
  }

  const [referee] = await db
    .select({
      id: users.id,
      role: users.role,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.stripeCustomerId, refereeCustomerId))
    .limit(1);

  if (!referee)
    return { status: "ignored", reason: "unknown_referee_customer" };

  const [referral] = await db
    .select({
      id: referrals.id,
      referrerUserId: referrals.referrerUserId,
      refereeUserId: referrals.refereeUserId,
      status: referrals.status,
      rewardStripeBalanceTransactionId:
        referrals.rewardStripeBalanceTransactionId,
    })
    .from(referrals)
    .where(
      and(
        eq(referrals.refereeUserId, referee.id),
        isNull(referrals.rewardStripeBalanceTransactionId),
        ne(referrals.status, "blocked"),
      ),
    )
    .limit(1);

  if (!referral) return { status: "ignored", reason: "no_open_referral" };
  if (referral.referrerUserId === referee.id) {
    return blockReferral(referral.id, "self_referral", invoice, null);
  }

  const [referrer] = await db
    .select({
      id: users.id,
      role: users.role,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.id, referral.referrerUserId))
    .limit(1);

  if (!referrer?.stripeCustomerId) {
    return { status: "ignored", reason: "referrer_has_no_stripe_customer" };
  }

  if (referrer.stripeCustomerId === refereeCustomerId) {
    return blockReferral(referral.id, "same_stripe_customer", invoice, null);
  }

  const fingerprint = await paymentFingerprint(invoice);
  if (await referrerHasSameCard(referrer.stripeCustomerId, fingerprint)) {
    return blockReferral(
      referral.id,
      "same_payment_card",
      invoice,
      fingerprint,
    );
  }

  const [monthlyRewards] = await db
    .select({ total: count() })
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerUserId, referrer.id),
        eq(referrals.status, "rewarded"),
        gte(referrals.rewardedAt, monthStart()),
      ),
    );

  if ((monthlyRewards?.total ?? 0) >= REFERRAL_MONTHLY_REWARD_CAP) {
    return blockReferral(
      referral.id,
      "monthly_reward_cap",
      invoice,
      fingerprint,
    );
  }

  const creditAmount = -monthlyRewardAmountPence();
  const balanceTransaction =
    await getStripe().customers.createBalanceTransaction(
      referrer.stripeCustomerId,
      {
        amount: creditAmount,
        currency: "gbp",
        description: "AI Educademy referral reward: one free month",
        metadata: {
          referralId: referral.id,
          refereeUserId: referee.id,
          invoiceId,
        },
      },
      { idempotencyKey: `referral_reward_${referral.id}_${invoiceId}` },
    );

  await db
    .update(referrals)
    .set({
      status: "rewarded",
      stripeCustomerId: refereeCustomerId,
      stripeSubscriptionId: invoiceSubscriptionId(invoice),
      stripeInvoiceId: invoiceId,
      refereePaymentFingerprint: fingerprint,
      rewardStripeBalanceTransactionId: balanceTransaction.id,
      rewardedAt: new Date(),
      completedAt: new Date(),
    })
    .where(
      and(
        eq(referrals.id, referral.id),
        isNull(referrals.rewardStripeBalanceTransactionId),
      ),
    );

  return {
    status: "rewarded",
    referralId: referral.id,
    balanceTransactionId: balanceTransaction.id,
  };
}
