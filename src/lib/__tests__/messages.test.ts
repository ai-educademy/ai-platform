import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { locales } from "@/i18n/locales";

/**
 * Guards against the two ways the message bundles have actually gone wrong.
 *
 * Stale English: a string is updated in en.json and the other bundles keep the
 * previous English text, so ten locales silently display outdated copy. The
 * page title advertised "Free AI education for all" in every non-English
 * locale long after the product stopped being free.
 *
 * Dropped placeholders: a translation loses a token such as {percent}, which
 * renders a sentence with a hole in it rather than failing loudly.
 */

type Bundle = Record<string, unknown>;

function load(locale: string): Bundle {
  return JSON.parse(
    readFileSync(join(process.cwd(), "messages", `${locale}.json`), "utf8"),
  ) as Bundle;
}

function get(bundle: Bundle, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (node, key) =>
      node && typeof node === "object" ? (node as Bundle)[key] : undefined,
    bundle,
  );
}

const bundles = Object.fromEntries(locales.map((l) => [l, load(l)]));
const nonEnglish = locales.filter((l) => l !== "en");

/** Keys that must be present and genuinely localised in every bundle. */
const MUST_BE_TRANSLATED = [
  "meta.title",
  "nav.pricing",
  "nav.goPro",
  "pricing.pageTitle",
  "pricing.badge",
  "pricing.heading",
  "pricing.annual.save",
  "paywall.upgradeCta",
];

describe("message bundles", () => {
  it.each(MUST_BE_TRANSLATED)("defines %s in every locale", (key) => {
    for (const locale of locales) {
      const value = get(bundles[locale], key);
      expect(typeof value, `${locale} is missing ${key}`).toBe("string");
      expect(String(value).trim().length, `${locale} has an empty ${key}`).toBeGreaterThan(0);
    }
  });

  it.each(MUST_BE_TRANSLATED)("does not leave %s as the English text", (key) => {
    const english = String(get(bundles.en, key));
    for (const locale of nonEnglish) {
      expect(
        String(get(bundles[locale], key)),
        `${locale}.${key} is still the English string`,
      ).not.toBe(english);
    }
  });

  it("keeps the {percent} placeholder in the annual saving line", () => {
    for (const locale of locales) {
      expect(
        String(get(bundles[locale], "pricing.annual.save")),
        `${locale} lost the {percent} placeholder`,
      ).toContain("{percent}");
    }
  });

  it("does not advertise the product as free in any page title", () => {
    // The paid tiers launched, but ten locales carried on promising free
    // education in the SEO title. Search results are the last place to notice.
    const freeClaims = /\b(free|gratuit|gratis|gratuita|kostenlos|无料|免费|مجان|मुफ्त|ఉచిత)/i;
    for (const locale of locales) {
      expect(
        String(get(bundles[locale], "meta.title")),
        `${locale} advertises the product as free`,
      ).not.toMatch(freeClaims);
    }
  });
});
