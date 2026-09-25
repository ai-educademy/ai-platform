/**
 * Plan prices, in one place.
 *
 * Amounts are minor units: pence for GBP, paise for INR. Keeping the display
 * prices and Stripe price selection together avoids advertising one amount and
 * charging another.
 */

export const PRICING_TRIAL_DAYS = 7;

export const PLAN_PRICES = {
  gbp: {
    monthly: 399,
    annual: 2999,
    lifetime: 4999,
  },
  inr: {
    monthly: 14900,
    annual: 149900,
    lifetime: 249900,
  },
} as const;

export type PricingCurrency = keyof typeof PLAN_PRICES;
export type PaidPlan = keyof typeof PLAN_PRICES.gbp;

export const PLAN_PRICES_PENCE = PLAN_PRICES.gbp;

const LOCALE_CURRENCY: Partial<Record<string, PricingCurrency>> = {
  hi: "inr",
  te: "inr",
};

export function resolvePricingCurrency(
  locale: string,
  country?: string | null,
): PricingCurrency {
  if (country?.toUpperCase() === "IN") return "inr";
  return LOCALE_CURRENCY[locale] ?? "gbp";
}

export function formatMinorCurrency(
  amount: number,
  currency: PricingCurrency,
): string {
  if (currency === "inr") {
    const rupees = amount / 100;
    return Number.isInteger(rupees) ? `₹${rupees}` : `₹${rupees.toFixed(2)}`;
  }

  const pounds = amount / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}

/** Formats pence as sterling, dropping the decimals on whole amounts. */
export function formatPence(pence: number): string {
  return formatMinorCurrency(pence, "gbp");
}

export function getPlanPriceLabels(
  currency: PricingCurrency,
): Record<PaidPlan | "free", string> {
  const prices = PLAN_PRICES[currency];
  return {
    free: currency === "inr" ? "₹0" : "£0",
    monthly: formatMinorCurrency(prices.monthly, currency),
    annual: formatMinorCurrency(prices.annual, currency),
    lifetime: formatMinorCurrency(prices.lifetime, currency),
  };
}

export const PLAN_PRICE_LABELS: Record<PaidPlan | "free", string> =
  getPlanPriceLabels("gbp");

export function getAnnualSavingPercent(currency: PricingCurrency): number {
  const prices = PLAN_PRICES[currency];
  return Math.round(
    (100 * (prices.monthly * 12 - prices.annual)) / (prices.monthly * 12),
  );
}

export const ANNUAL_SAVING_PERCENT = getAnnualSavingPercent("gbp");
