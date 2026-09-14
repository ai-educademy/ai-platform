import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";
import { locales, type Locale } from "./locales";

export default getRequestConfig(async () => {
  // `requestLocale` was deprecated in next-intl 4.13. Reading the root param
  // directly is the supported replacement and, unlike the old header-based
  // lookup, it does not opt the request out of static rendering.
  let locale = await rootLocale();

  // Anything outside the `[locale]` tree (sitemap.ts, robots.ts, feed.xml, the
  // API routes) has no root param at all, and the catch-all segment will happily
  // match junk paths like `/unknown.txt`. Both cases land on the default.
  if (!locale || !locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
