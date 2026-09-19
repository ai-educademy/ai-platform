/**
 * Guards the "we advertised a plan we cannot sell" failure.
 *
 * The annual and lifetime plans are the highest value ones on the page, and
 * their Stripe price IDs live in environment variables that are easy to forget
 * when a project gains a new environment. Without these checks the only signal
 * is a customer who decided to pay, clicked, and got a flat error.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getPlanPriceId,
  getPurchasablePlans,
  isPlanPurchasable,
} from "@/lib/stripe";

const VARS = [
  "STRIPE_PRICE_MONTHLY",
  "STRIPE_PRICE_ANNUAL",
  "STRIPE_PRICE_LIFETIME",
] as const;

describe("stripe plan configuration", () => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const v of VARS) {
      original[v] = process.env[v];
      delete process.env[v];
    }
  });

  afterEach(() => {
    for (const v of VARS) {
      if (original[v] === undefined) delete process.env[v];
      else process.env[v] = original[v];
    }
  });

  it("given no price IDs are configured, when plans are resolved, then nothing is purchasable", () => {
    expect(getPurchasablePlans()).toEqual([]);
  });

  it("given only monthly is configured, when plans are resolved, then annual and lifetime are excluded", () => {
    process.env.STRIPE_PRICE_MONTHLY = "price_monthly_123";

    expect(getPurchasablePlans()).toEqual(["monthly"]);
    expect(isPlanPurchasable("annual")).toBe(false);
    expect(isPlanPurchasable("lifetime")).toBe(false);
  });

  it("given all three price IDs are configured, when plans are resolved, then all three are sellable", () => {
    process.env.STRIPE_PRICE_MONTHLY = "price_monthly_123";
    process.env.STRIPE_PRICE_ANNUAL = "price_annual_123";
    process.env.STRIPE_PRICE_LIFETIME = "price_lifetime_123";

    expect(getPurchasablePlans()).toEqual(["monthly", "annual", "lifetime"]);
  });

  // A price ID pasted into a dashboard very often carries a trailing newline.
  // Untrimmed it passes a truthiness check and then fails at Stripe, which is
  // the most expensive possible place to find out.
  it("given a price ID with surrounding whitespace, when it is read, then it is trimmed", () => {
    process.env.STRIPE_PRICE_ANNUAL = "  price_annual_123\n";

    expect(getPlanPriceId("annual")).toBe("price_annual_123");
    expect(isPlanPurchasable("annual")).toBe(true);
  });

  it("given a price ID that is only whitespace, when it is read, then it is not purchasable", () => {
    process.env.STRIPE_PRICE_LIFETIME = "   \n";

    expect(isPlanPurchasable("lifetime")).toBe(false);
  });
});
