import { describe, it, expect } from "vitest";
import {
  PLAN_PRICES_PENCE,
  PLAN_PRICE_LABELS,
  ANNUAL_SAVING_PERCENT,
  formatPence,
} from "@/lib/pricing";

/**
 * The advertised annual saving was hard-coded as 27% while the real figure was
 * 37%, because prices lived both in the Stripe config and in the pricing page.
 * These tests keep the claim tied to the prices.
 */
describe("pricing", () => {
  it("formats pence as sterling, dropping decimals on whole pounds", () => {
    expect(formatPence(399)).toBe("£3.99");
    expect(formatPence(2999)).toBe("£29.99");
    expect(formatPence(5000)).toBe("£50");
    expect(formatPence(0)).toBe("£0");
  });

  it("derives the advertised annual saving from the actual prices", () => {
    const yearOfMonthly = PLAN_PRICES_PENCE.monthly * 12;
    const expected = Math.round(
      (100 * (yearOfMonthly - PLAN_PRICES_PENCE.annual)) / yearOfMonthly,
    );

    expect(ANNUAL_SAVING_PERCENT).toBe(expected);
    expect(ANNUAL_SAVING_PERCENT).toBe(37);
  });

  it("keeps the annual plan genuinely cheaper than paying monthly", () => {
    expect(PLAN_PRICES_PENCE.annual).toBeLessThan(PLAN_PRICES_PENCE.monthly * 12);
    expect(ANNUAL_SAVING_PERCENT).toBeGreaterThan(0);
  });

  it("prices lifetime above a single year, so it is not the obvious arbitrage", () => {
    expect(PLAN_PRICES_PENCE.lifetime).toBeGreaterThan(PLAN_PRICES_PENCE.annual);
  });

  it("exposes labels matching the underlying pence values", () => {
    expect(PLAN_PRICE_LABELS.free).toBe("£0");
    expect(PLAN_PRICE_LABELS.monthly).toBe(formatPence(PLAN_PRICES_PENCE.monthly));
    expect(PLAN_PRICE_LABELS.annual).toBe(formatPence(PLAN_PRICES_PENCE.annual));
    expect(PLAN_PRICE_LABELS.lifetime).toBe(formatPence(PLAN_PRICES_PENCE.lifetime));
  });
});
