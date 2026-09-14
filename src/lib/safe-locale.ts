import { locales } from "@/i18n/locales";

type KnownLocale = (typeof locales)[number];

/**
 * Narrows an untrusted value to a supported locale, falling back to English.
 *
 * Both Stripe routes interpolate the caller-supplied locale into a URL that
 * ends up in Stripe metadata and, for abandoned checkouts, in an outbound
 * email. Passing the raw request body through would let a caller shape those
 * URLs, so every entry point must launder the value through here.
 */
export function safeLocale(value: unknown): KnownLocale {
  return locales.includes(value as KnownLocale) ? (value as KnownLocale) : "en";
}

/** Locale-aware URL prefix. English is served unprefixed at the site root. */
export function localeBasePath(locale: string): string {
  return locale === "en" ? "" : `/${locale}`;
}
