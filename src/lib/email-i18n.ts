import { safeLocale } from "./safe-locale";

/**
 * Translation lookup for transactional emails.
 *
 * Emails are sent from webhook handlers and background tasks, which run outside
 * next-intl's request scope, so `getTranslations()` is not available. This loads
 * the message bundle directly and falls back to English **per key** rather than
 * per bundle, so a locale that is only partially translated still sends a
 * complete email instead of a half-empty one.
 */
export type EmailTranslator = {
  /** Resolves a key within the `emails` namespace. */
  t: (key: string, values?: Record<string, string>) => string;
  locale: string;
  /** Arabic is the only right-to-left locale we ship. */
  dir: "ltr" | "rtl";
};

const RTL_LOCALES = new Set(["ar"]);

type Bundle = Record<string, unknown>;

async function loadEmailSection(locale: string): Promise<Record<string, string>> {
  try {
    const bundle = (await import(`../../messages/${locale}.json`)) as {
      default: Bundle;
    };
    const section = bundle.default.emails;
    return section && typeof section === "object"
      ? (section as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

function interpolate(template: string, values?: Record<string, string>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(values, name) ? values[name] : match,
  );
}

export async function getEmailTranslator(
  requestedLocale: string,
): Promise<EmailTranslator> {
  const locale = safeLocale(requestedLocale);
  const english = await loadEmailSection("en");
  const localised = locale === "en" ? english : await loadEmailSection(locale);

  return {
    locale,
    dir: RTL_LOCALES.has(locale) ? "rtl" : "ltr",
    t: (key, values) => {
      const value = localised[key] ?? english[key];
      return interpolate(typeof value === "string" ? value : key, values);
    },
  };
}
