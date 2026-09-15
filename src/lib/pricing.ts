/**
 * Plan prices, in one place.
 *
 * These were previously written twice: in pence in the Stripe config, and again
 * as formatted strings in the pricing page. The two drifted, and the annual
 * saving ended up advertised as 27% when the real figure was 37%, understating
 * the discount on every locale of the pricing page.
 *
 * This module deliberately has no dependencies, so both a server-only Stripe
 * helper and a client component can read from it.
 */

export const PLAN_PRICES_PENCE = {
  monthly: 399,
  annual: 2999,
  lifetime: 4999,
} as const;

export type PaidPlan = keyof typeof PLAN_PRICES_PENCE;

/** Formats pence as sterling, dropping the decimals on whole amounts. */
export function formatPence(pence: number): string {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}

export const PLAN_PRICE_LABELS: Record<PaidPlan | "free", string> = {
  free: "£0",
  monthly: formatPence(PLAN_PRICES_PENCE.monthly),
  annual: formatPence(PLAN_PRICES_PENCE.annual),
  lifetime: formatPence(PLAN_PRICES_PENCE.lifetime),
};

/**
 * What an annual subscriber saves against paying monthly for a year, rounded
 * to a whole percent. Computed rather than written down so it cannot go stale
 * the next time a price changes.
 */
export const ANNUAL_SAVING_PERCENT = Math.round(
  (100 * (PLAN_PRICES_PENCE.monthly * 12 - PLAN_PRICES_PENCE.annual)) /
    (PLAN_PRICES_PENCE.monthly * 12),
);
