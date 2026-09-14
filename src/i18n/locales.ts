/**
 * Locale constants, deliberately kept apart from `request.ts`.
 *
 * `request.ts` imports `next/root-params`, which only resolves inside the
 * server request graph. Client components and API routes need the locale list
 * and display names too, so those live here where importing them cannot drag
 * a server-only module into a browser bundle.
 */
import { routing } from "./routing";

export const locales = routing.locales;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  nl: "Nederlands",
  hi: "हिन्दी",
  te: "తెలుగు",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
};

export const localeFlags: Record<Locale, string> = {
  en: "🌐",
  fr: "🇫🇷",
  nl: "🇳🇱",
  hi: "🇮🇳",
  te: "🇮🇳",
  es: "🇪🇸",
  pt: "🇧🇷",
  de: "🇩🇪",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ar: "🇸🇦",
};
