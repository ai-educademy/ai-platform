import { execFileSync } from "child_process";
import { describe, expect, it } from "vitest";
import { buildSitemapEntries, MOVED_LESSON_PATHS } from "@/lib/sitemap";
import { getAllBlogSlugs } from "@/lib/blog";
import { getLessons } from "@/lib/lessons";
import { getPrograms } from "@/lib/programs";
import { localeUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const entries = routing.locales.flatMap((locale) =>
  buildSitemapEntries(locale),
);
const urls = entries.map((entry) => entry.url);
const indexableProgrammes = getPrograms();
const staticPageCount = 13;
const expectedPerLocale =
  staticPageCount +
  indexableProgrammes.length +
  indexableProgrammes.length +
  indexableProgrammes.reduce(
    (count, program) =>
      count +
      getLessons(program.slug, "en").filter(
        (lesson) => !MOVED_LESSON_PATHS.has(`${program.slug}/${lesson.slug}`),
      ).length,
    0,
  ) +
  getAllBlogSlugs().length;

describe("sitemap", () => {
  it("emits no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("leaves out lessons that moved and now redirect", () => {
    for (const moved of MOVED_LESSON_PATHS) {
      const [program, slug] = moved.split("/");
      expect(
        urls.filter((url) =>
          url.endsWith(`/programs/${program}/lessons/${slug}`),
        ),
      ).toEqual([]);
    }
  });

  it("keeps the ai-polish programme and its lessons that did not move", () => {
    // Pro lesson files are absent where content-pro is not checked out, so
    // assert against whatever lessons this checkout actually has.
    const stayed = getLessons("ai-polish", "en").filter(
      (lesson) => !MOVED_LESSON_PATHS.has(`ai-polish/${lesson.slug}`),
    );
    expect(urls).toContain("https://aieducademy.org/programs/ai-polish");
    for (const lesson of stayed) {
      expect(urls).toContain(
        `https://aieducademy.org/programs/ai-polish/lessons/${lesson.slug}`,
      );
    }
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
      const locale = (routing.locales as readonly string[]).includes(
        segments[0],
      )
        ? segments[0]
        : "en";
      const unprefixedPath =
        locale === "en" ? pathname : `/${segments.slice(1).join("/")}`;
      const normalisedPath = unprefixedPath === "/" ? "" : unprefixedPath;

      expect(alternates["x-default"]).toBe(localeUrl("en", normalisedPath));
      for (const alternateLocale of routing.locales) {
        expect(alternates[alternateLocale]).toBe(
          localeUrl(alternateLocale, normalisedPath),
        );
      }
      expect(Object.keys(alternates).sort()).toEqual(
        ["x-default", ...routing.locales].sort(),
      );
    }
  });

  it("matches the expected source of truth count", () => {
    expect(entries).toHaveLength(expectedPerLocale * routing.locales.length);
    expect(expectedPerLocale).toBeGreaterThan(100);
  });

  it("uses real lastmod values rather than build or clone time", () => {
    const shallow =
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
        encoding: "utf8",
      }).trim() !== "false";
    const dated = entries.filter((entry) => entry.lastModified !== undefined);
    const uniqueLastmods = new Set(
      dated.map((entry) =>
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified,
      ),
    );

    // A shallow clone knows one commit, so trusting it would put the same
    // date on every URL. Omitting lastmod is fine; a uniform one is not.
    if (shallow) {
      expect(dated.length === 0 || uniqueLastmods.size > 1).toBe(true);
    } else {
      expect(uniqueLastmods.size).toBeGreaterThan(5);
    }
  });
});
