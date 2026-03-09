import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export const locales = routing.locales;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  nl: "Nederlands",
  hi: "हिन्दी",
  te: "తెలుగు",
};

export const localeFlags: Record<Locale, string> = {
  en: "🌐",
  fr: "🇫🇷",
  nl: "🇳🇱",
  hi: "🇮🇳",
  te: "🇮🇳",
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale — fallback to default if invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
