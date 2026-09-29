/**
 * Coarse geographic regions used to target offers and, later, ads.
 *
 * Deliberately small: the affiliate and ad inventory only ever differs by a
 * handful of markets, so mapping every ISO country to one of these buckets keeps
 * the offer data readable and the selection logic trivial.
 */
export type Region = "IN" | "UK" | "US" | "EU" | "GLOBAL";

/** Client-readable cookie stamped by the proxy from the Vercel geo header. */
export const COUNTRY_COOKIE = "country";

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "CH",
]);

/**
 * Buckets an ISO 3166-1 alpha-2 country code into a {@link Region}.
 *
 * Unknown or missing codes fall back to GLOBAL so a visitor always sees a valid,
 * if generic, set of offers rather than nothing.
 */
export function countryToRegion(country?: string | null): Region {
  if (!country) return "GLOBAL";
  const code = country.toUpperCase();
  if (code === "IN") return "IN";
  if (code === "GB" || code === "UK") return "UK";
  if (code === "US") return "US";
  if (EU_COUNTRIES.has(code)) return "EU";
  return "GLOBAL";
}

/**
 * Best-effort country guess from the active locale, used only when the geo
 * cookie is absent (local development, or before the first proxied request).
 * Language is a weak signal for country, so this is a fallback, not a source of
 * truth: only the unambiguous language-to-market cases are mapped.
 */
export function countryFromLocale(locale: string): string | null {
  switch (locale) {
    case "hi":
    case "te":
      return "IN";
    default:
      return null;
  }
}
