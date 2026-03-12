import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  monthly: {
    name: "Pro Monthly",
    price: 399, // £3.99 in pence
    interval: "month" as const,
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? "",
  },
  annual: {
    name: "Pro Annual",
    price: 2999, // £29.99 in pence — save 37%
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_ANNUAL ?? "",
  },
  lifetime: {
    name: "Lifetime Access",
    price: 4999, // £49.99 in pence
    interval: null,
    priceId: process.env.STRIPE_PRICE_LIFETIME ?? "",
  },
} as const;
