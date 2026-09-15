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

export const PLANS = {
  monthly: {
    name: "Pro Monthly",
    price: PLAN_PRICES_PENCE.monthly,
    interval: "month" as const,
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? "",
  },
  annual: {
    name: "Pro Annual",
    price: PLAN_PRICES_PENCE.annual,
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_ANNUAL ?? "",
  },
  lifetime: {
    name: "Lifetime Access",
    price: PLAN_PRICES_PENCE.lifetime,
    interval: null,
    priceId: process.env.STRIPE_PRICE_LIFETIME ?? "",
  },
} as const;
