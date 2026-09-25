import { describe, expect, it } from "vitest";
import { buildSitemapEntries } from "@/lib/sitemap";
import { getAllBlogSlugs } from "@/lib/blog";
import { getLessons } from "@/lib/lessons";
import { getPrograms } from "@/lib/programs";
import { localeUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const entries = routing.locales.flatMap((locale) => buildSitemapEntries(locale));
const urls = entries.map((entry) => entry.url);
const indexableProgrammes = getPrograms().filter((program) => program.slug !== "ai-polish");
const staticPageCount = 13;
const expectedPerLocale =
  staticPageCount +
  indexableProgrammes.length +
  indexableProgrammes.length +
  indexableProgrammes.reduce((count, program) => count + getLessons(program.slug, "en").length, 0) +
  getAllBlogSlugs().length;

describe("sitemap", () => {
  it("emits no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("does not emit the legacy ai-polish URLs", () => {
    expect(urls.filter((url) => url.includes("/ai-polish"))).toEqual([]);
  });

  it("emits absolute URLs with the canonical English root", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith("https://aieducademy.org")).toBe(true);
      expect(new URL(entry.url).pathname.startsWith("/en/")).toBe(false);
    }
  });

  it("has alternates for every routable locale and x-default", () => {
    for (const entry of entries) {
      const alternates = entry.alternates?.languages ?? {};
      const pathname = new URL(entry.url).pathname;
      const segments = pathname.split("/").filter(Boolean);
      const locale = (routing.locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
      const unprefixedPath = locale === "en" ? pathname : `/${segments.slice(1).join("/")}`;
      const normalisedPath = unprefixedPath === "/" ? "" : unprefixedPath;

      expect(alternates["x-default"]).toBe(localeUrl("en", normalisedPath));
      for (const alternateLocale of routing.locales) {
        expect(alternates[alternateLocale]).toBe(localeUrl(alternateLocale, normalisedPath));
      }
      expect(Object.keys(alternates).sort()).toEqual(["x-default", ...routing.locales].sort());
    }
  });

  it("matches the expected source of truth count", () => {
    expect(entries).toHaveLength(expectedPerLocale * routing.locales.length);
    expect(expectedPerLocale).toBeGreaterThan(100);
  });

  it("uses real lastmod values rather than build time", () => {
    const uniqueLastmods = new Set(entries.map((entry) => entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified));
    expect(uniqueLastmods.size).toBeGreaterThan(5);
  });
});
