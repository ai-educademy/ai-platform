import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { buildAlternates, localeUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

/**
 * The sitemap previously carried its own copy of the locale list and the URL
 * builder, and both had drifted from the versions used in the page metadata.
 * It advertised "/en/..." for every English page, which is a 307 redirect to
 * the unprefixed URL, and it emitted no x-default at all.
 *
 * That is roughly a tenth of the sitemap pointing at redirects, in the primary
 * market, while the HTML head of those same pages advertised the correct URL.
 * Search engines were being given two different answers for the same page.
 */
describe("sitemap", () => {
  const entries = sitemap();

  it("never advertises an /en-prefixed URL, which redirects", () => {
    const prefixed = entries.filter((e) => new URL(e.url).pathname.startsWith("/en"));
    expect(prefixed.map((e) => e.url)).toEqual([]);
  });

  it("uses the same URL builder as the page metadata", () => {
    for (const entry of entries) {
      const url = new URL(entry.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const locale = (routing.locales as readonly string[]).includes(segments[0])
        ? segments[0]
        : "en";
      const path = locale === "en" ? url.pathname : "/" + segments.slice(1).join("/");
      const normalised = path === "/" ? "" : path;

      expect(entry.url).toBe(localeUrl(locale, normalised));
    }
  });

  it("gives every entry an x-default, so search engines know the fallback", () => {
    for (const entry of entries) {
      expect(entry.alternates?.languages).toHaveProperty("x-default");
    }
  });

  it("covers every configured locale and no others", () => {
    const seen = new Set(
      entries.map((e) => {
        const first = new URL(e.url).pathname.split("/").filter(Boolean)[0];
        return (routing.locales as readonly string[]).includes(first) ? first : "en";
      }),
    );
    expect([...seen].sort()).toEqual([...routing.locales].sort());
  });

  it("matches the hreflang cluster advertised in the page head", () => {
    const [home] = entries;
    expect(home.alternates?.languages).toEqual(buildAlternates("").languages);
  });

  it("emits absolute https URLs on the canonical host", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith("https://aieducademy.org")).toBe(true);
    }
  });
});
