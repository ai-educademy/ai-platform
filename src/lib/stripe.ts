import Stripe from "stripe";
import { PLAN_PRICES_PENCE } from "@/lib/pricing";

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

const PRICE_ENV_VAR: Record<PaidPlan, string> = {
  monthly: "STRIPE_PRICE_MONTHLY",
  annual: "STRIPE_PRICE_ANNUAL",
  lifetime: "STRIPE_PRICE_LIFETIME",
};

/**
 * The Stripe price for a plan, or "" when it has not been configured.
 *
 * Read at call time rather than at module load so that a deployment which
 * gains the variable does not need a rebuild, and so tests can exercise the
 * unconfigured path.
 *
 * Trimmed deliberately. Environment values pasted into a dashboard pick up
 * trailing whitespace and newlines alarmingly often, and this project has
 * already been bitten by exactly that on another variable. An untrimmed price
 * ID passes a truthiness check and then fails at Stripe, which is the most
 * expensive place to discover the problem.
 */
export function getPlanPriceId(plan: PaidPlan): string {
  return (process.env[PRICE_ENV_VAR[plan]] ?? "").trim();
}

/** Whether a plan can actually be sold in this environment. */
export function isPlanPurchasable(plan: PaidPlan): boolean {
  return getPlanPriceId(plan) !== "";
}

/**
 * The plans this deployment can actually take money for.
 *
 * Used to decide what to advertise. Offering a plan whose price ID is missing
 * sends the customer to a dead end: they pick it, click through, and get a
 * flat "Invalid plan" with no way forward, having already decided to pay.
 * Not showing it is worse than selling it and far better than that.
 */
export function getPurchasablePlans(): PaidPlan[] {
  return PAID_PLANS.filter(isPlanPurchasable);
}

export const PLANS = {
  monthly: {
    name: "Pro Monthly",
    price: PLAN_PRICES_PENCE.monthly,
    interval: "month" as const,
    get priceId() {
      return getPlanPriceId("monthly");
    },
  },
  annual: {
    name: "Pro Annual",
    price: PLAN_PRICES_PENCE.annual,
    interval: "year" as const,
    get priceId() {
      return getPlanPriceId("annual");
    },
  },
  lifetime: {
    name: "Lifetime Access",
    price: PLAN_PRICES_PENCE.lifetime,
    interval: null,
    get priceId() {
      return getPlanPriceId("lifetime");
    },
  },
} as const;
