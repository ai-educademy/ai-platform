import Stripe from "stripe";
import { PLAN_PRICES, type PricingCurrency } from "@/lib/pricing";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export type PaidPlan = "monthly" | "annual" | "lifetime";

export const PAID_PLANS: readonly PaidPlan[] = [
  "monthly",
  "annual",
  "lifetime",
];

const PRICE_ENV_VAR: Record<PricingCurrency, Record<PaidPlan, string>> = {
  gbp: {
    monthly: "STRIPE_PRICE_MONTHLY",
    annual: "STRIPE_PRICE_ANNUAL",
    lifetime: "STRIPE_PRICE_LIFETIME",
  },
  inr: {
    monthly: "STRIPE_PRICE_INR_MONTHLY",
    annual: "STRIPE_PRICE_INR_ANNUAL",
    lifetime: "STRIPE_PRICE_INR_LIFETIME",
  },
};

export function getPlanPriceId(
  plan: PaidPlan,
  currency: PricingCurrency = "gbp",
): string {
  return (process.env[PRICE_ENV_VAR[currency][plan]] ?? "").trim();
}

/** Whether a plan can actually be sold in this environment. */
export function isPlanPurchasable(
  plan: PaidPlan,
  currency: PricingCurrency = "gbp",
): boolean {
  return getPlanPriceId(plan, currency) !== "";
}

export function getPurchasablePlans(
  currency: PricingCurrency = "gbp",
): PaidPlan[] {
  return PAID_PLANS.filter((plan) => isPlanPurchasable(plan, currency));
}

export function getPlanConfig(
  plan: PaidPlan,
  currency: PricingCurrency = "gbp",
) {
  const price = PLAN_PRICES[currency][plan];
  return {
    ...PLANS[plan],
    price,
    priceId: getPlanPriceId(plan, currency),
    currency,
  };
}

export const PLANS = {
  monthly: {
    name: "Pro Monthly",
    price: PLAN_PRICES.gbp.monthly,
    interval: "month" as const,
    get priceId() {
      return getPlanPriceId("monthly");
    },
  },
  annual: {
    name: "Pro Annual",
    price: PLAN_PRICES.gbp.annual,
    interval: "year" as const,
    get priceId() {
      return getPlanPriceId("annual");
    },
  },
  lifetime: {
    name: "Lifetime Access",
    price: PLAN_PRICES.gbp.lifetime,
    interval: null,
    get priceId() {
      return getPlanPriceId("lifetime");
    },
  },
} as const;
