import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlanConfig, getStripe, type PaidPlan } from "@/lib/stripe";
import { db } from "@/lib/db";
import { referrals, subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";
import { safeLocale, localeBasePath } from "@/lib/safe-locale";
import { trackEvent } from "@/lib/funnel";
import { PRICING_TRIAL_DAYS, resolvePricingCurrency } from "@/lib/pricing";

const TRIAL_PLANS = new Set<PaidPlan>(["monthly", "annual"]);
const REFERRAL_CODE_PATTERN = /^[A-Z]{1,3}_[a-z0-9]{6}$/;

// The cookie wins when present. ReferralTracker clears it once the referral is
// recorded at sign-in, so by checkout the ledger row is usually the evidence.
async function resolveReferrer(
  userId: string,
  ownReferralCode: string | null | undefined,
  cookieCode: string | undefined,
): Promise<string | undefined> {
  if (
    cookieCode &&
    REFERRAL_CODE_PATTERN.test(cookieCode) &&
    cookieCode !== ownReferralCode
  ) {
    const [referrer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, cookieCode))
      .limit(1);
    if (referrer && referrer.id !== userId) return referrer.id;
  }

  const [recorded] = await db
    .select({ referrerUserId: referrals.referrerUserId })
    .from(referrals)
    .where(eq(referrals.refereeUserId, userId))
    .limit(1);
  return recorded?.referrerUserId;
}

async function customerHasUsedTrial(
  userId: string,
  customerId: string,
  customerIsNew: boolean,
): Promise<boolean> {
  const priorRows = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (priorRows.length > 0) return true;
  // A customer created moments ago cannot hold a Stripe subscription, so skip
  // a round trip on the first, slowest checkout.
  if (customerIsNew) return false;

  const priorStripeSubscriptions = await getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });

  return priorStripeSubscriptions.data.length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const {
      plan,
      locale: rawLocale,
      promoCode,
    } = body as {
      plan: PaidPlan;
      locale?: string;
      promoCode?: string;
    };

    if (!["monthly", "annual", "lifetime"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const locale = safeLocale(rawLocale);
    const currency = resolvePricingCurrency(
      locale,
      req.headers.get("x-vercel-ip-country"),
    );
    const planConfig = getPlanConfig(plan, currency);

    if (!planConfig.priceId) {
      console.error(
        `[stripe] No ${currency.toUpperCase()} price ID configured for the "${plan}" plan.`,
      );
      return NextResponse.json({ error: "Plan unavailable" }, { status: 503 });
    }

    const [user] = await db
      .select({
        stripeCustomerId: users.stripeCustomerId,
        referralCode: users.referralCode,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    let customerId = user?.stripeCustomerId;
    const customerIsNew = !customerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: session.user.email,
        name: session.user.name ?? undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, session.user.id));
    }

    // Independent lookups; run them together to keep the redirect snappy.
    const [trialEligible, referredBy] = await Promise.all([
      TRIAL_PLANS.has(plan)
        ? customerHasUsedTrial(session.user.id, customerId, customerIsNew).then(
            (used) => !used,
          )
        : Promise.resolve(false),
      resolveReferrer(
        session.user.id,
        user?.referralCode,
        req.cookies?.get("ref_code")?.value,
      ),
    ]);

    const basePath = localeBasePath(locale);

    let discounts: Stripe.Checkout.SessionCreateParams["discounts"] | undefined;
    let promoApplied = false;
    let referralApplied = false;
    const referralPromoCode =
      process.env.STRIPE_REFERRAL_PROMO_CODE ?? "GIVEAMONTH";
    // The referral coupon is 100% off once, so it must never reach a plan or a
    // learner it was not issued for (a free lifetime purchase, for instance).
    const referralEligible =
      plan === "monthly" && currency === "gbp" && !!referredBy;
    const requestedReferralCode =
      promoCode?.trim().toUpperCase() === referralPromoCode.toUpperCase();
    const promoCodeToApply =
      promoCode && !requestedReferralCode
        ? promoCode
        : referralEligible
          ? referralPromoCode
          : undefined;
    if (promoCodeToApply) {
      try {
        const promoCodes = await getStripe().promotionCodes.list({
          code: promoCodeToApply,
          active: true,
          limit: 1,
        });
        if (promoCodes.data.length > 0) {
          discounts = [{ promotion_code: promoCodes.data[0].id }];
          promoApplied = true;
          referralApplied =
            promoCodeToApply === referralPromoCode && !!referredBy;
        }
      } catch (err) {
        console.warn("[stripe/checkout] promo code lookup failed:", err);
      }
    }

    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
      {
        metadata: {
          userId: session.user.id,
          plan,
          locale,
          currency,
          trialOffered: String(trialEligible),
        },
        ...(trialEligible ? { trial_period_days: PRICING_TRIAL_DAYS } : {}),
      };

    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: plan === "lifetime" ? "payment" : "subscription",
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      ...(discounts ? { discounts } : {}),
      ...(plan === "lifetime"
        ? {}
        : {
            payment_method_collection: "always",
            subscription_data: subscriptionData,
          }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org"}${basePath}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org"}${basePath}/pricing?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        plan,
        locale,
        currency,
        trialOffered: String(trialEligible),
        ...(referredBy ? { referredBy } : {}),
      },
    });
    trackEvent("checkout_started", {
      userId: session.user.id,
      locale,
      path: `${basePath}/pricing`,
      plan,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      promoApplied,
      referralApplied,
      trialOffered: trialEligible,
      currency,
    });
  } catch (err) {
    if (isDatabaseNotConfigured(err)) return databaseUnavailable();
    console.error("[stripe/checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
