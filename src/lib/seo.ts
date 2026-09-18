import { routing } from "@/i18n/routing";

const BASE_URL = "https://aieducademy.org";

/**
 * The canonical URL for a path in a given locale.
 *
 * English is served without a prefix ("as-needed" routing), so "/en/pricing"
 * is a 307 to "/pricing". Anything that emits "/en/..." as a real URL is
 * advertising a redirect.
 */
export function localeUrl(locale: string, path: string): string {
  return locale === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
}

/**
 * Builds the full hreflang alternates map for a given path.
 * Pass the locale-agnostic path (no locale prefix), e.g. "/programs/ai-seeds/lessons/what-is-ai"
 * or "" for the homepage.
 */
export function buildAlternates(path: string) {
  const languages: Record<string, string> = {
    "x-default": `${BASE_URL}${path}`,
    ...Object.fromEntries(routing.locales.map((l) => [l, localeUrl(l, path)])),
  };

  return { languages };
}
