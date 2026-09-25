import type { MetadataRoute } from "next";
import { execFileSync } from "child_process";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { getAllBlogSlugs, getBlogPost } from "@/lib/blog";
import { getLessons } from "@/lib/lessons";
import { getPrograms } from "@/lib/programs";
import { routing } from "@/i18n/routing";
import { localeUrl } from "@/lib/seo";

const BASE_URL = "https://aieducademy.org";
const ROOT = process.cwd();
const EXCLUDED_PROGRAM_SLUGS = new Set(["ai-polish"]);
const gitLastModifiedCache = new Map<string, Date | null>();
const contentLastModifiedCache = new Map<string, Date | null>();
const lessonLastModifiedCache = new Map<string, Date | null>();
const blogLastModifiedCache = new Map<string, Date | null>();

const STATIC_PATHS = [
  { path: "", file: ["src", "app", "[locale]", "page.tsx"] },
  {
    path: "/programs",
    file: ["src", "app", "[locale]", "programs", "page.tsx"],
  },
  { path: "/lab", file: ["src", "app", "[locale]", "lab", "page.tsx"] },
  { path: "/about", file: ["src", "app", "[locale]", "about", "page.tsx"] },
  { path: "/blog", file: ["src", "app", "[locale]", "blog", "page.tsx"] },
  { path: "/faq", file: ["src", "app", "[locale]", "faq", "page.tsx"] },
  {
    path: "/mock-interview",
    file: ["src", "app", "[locale]", "mock-interview", "page.tsx"],
  },
  { path: "/journey", file: ["src", "app", "[locale]", "journey", "page.tsx"] },
  { path: "/contact", file: ["src", "app", "[locale]", "contact", "page.tsx"] },
  {
    path: "/resources/ai-starter-kit",
    file: ["src", "app", "[locale]", "resources", "ai-starter-kit", "page.tsx"],
  },
  { path: "/privacy", file: ["src", "app", "[locale]", "privacy", "page.tsx"] },
  { path: "/terms", file: ["src", "app", "[locale]", "terms", "page.tsx"] },
  { path: "/pricing", file: ["src", "app", "[locale]", "pricing", "page.tsx"] },
];

function existingFile(...segments: string[]): string | null {
  const file = path.join(ROOT, ...segments);
  return fs.existsSync(file) ? file : null;
}

const shallowCache = new Map<string, boolean>();

// A shallow clone (CI and Vercel both use one) reports the single fetched
// commit for every file. That would stamp one identical lastmod on every URL,
// which Google treats as noise, so history is only trusted when it is complete.
function hasFullHistory(cwd: string): boolean {
  const cached = shallowCache.get(cwd);
  if (cached !== undefined) return cached;
  let full: boolean;
  try {
    full =
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === "false";
  } catch {
    full = false;
  }
  shallowCache.set(cwd, full);
  return full;
}

function gitLastModified(...segments: string[]): Date | null {
  const file = path.join(...segments);
  if (gitLastModifiedCache.has(file))
    return gitLastModifiedCache.get(file) ?? null;
  if (!hasFullHistory(ROOT)) {
    gitLastModifiedCache.set(file, null);
    return null;
  }

  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (iso) {
      const date = new Date(iso);
      gitLastModifiedCache.set(file, date);
      return date;
    }
  } catch {
    // Git metadata is unavailable in some build environments.
  }

  // File mtime on a fresh checkout is the clone time, not an edit time.
  gitLastModifiedCache.set(file, null);
  return null;
}

function newest(...dates: (Date | null)[]): Date | null {
  const known = dates.filter((date): date is Date => date !== null);
  if (known.length === 0) return null;
  return new Date(Math.max(...known.map((date) => date.getTime())));
}

function frontmatterDate(file: string, keys: string[]): Date | null {
  try {
    const { data } = matter(fs.readFileSync(file, "utf8"));
    for (const key of keys) {
      const value = data[key];
      if (typeof value === "string" || value instanceof Date) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date;
      }
    }
  } catch {
    // Content submodules may be exported without their own Git history.
  }
  return null;
}

function contentGitLastModified(relativeFile: string): Date | null {
  if (contentLastModifiedCache.has(relativeFile)) {
    return contentLastModifiedCache.get(relativeFile) ?? null;
  }

  const [submodule, ...rest] = relativeFile.split(path.sep);
  if (!hasFullHistory(path.join(ROOT, submodule))) {
    contentLastModifiedCache.set(relativeFile, null);
    return null;
  }
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", rest.join(path.sep)],
      {
        cwd: path.join(ROOT, submodule),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    if (iso) {
      const date = new Date(iso);
      contentLastModifiedCache.set(relativeFile, date);
      return date;
    }
  } catch {
    // The submodule may be missing or have no history here.
  }

  const date = gitLastModified(relativeFile);
  contentLastModifiedCache.set(relativeFile, date);
  return date;
}

function localizedAlternates(pathname: string, locales = routing.locales) {
  return {
    languages: {
      "x-default": `${BASE_URL}${pathname}`,
      ...Object.fromEntries(
        locales.map((locale) => [locale, localeUrl(locale, pathname)]),
      ),
    },
  };
}

function entry(
  locale: string,
  pathname: string,
  lastModified: Date | null,
): MetadataRoute.Sitemap[number] {
  return {
    url: localeUrl(locale, pathname),
    ...(lastModified ? { lastModified } : {}),
    alternates: localizedAlternates(pathname),
  };
}

function lessonLastModified(
  programSlug: string,
  lessonSlug: string,
): Date | null {
  const cacheKey = `${programSlug}/${lessonSlug}`;
  if (lessonLastModifiedCache.has(cacheKey)) {
    return lessonLastModifiedCache.get(cacheKey) ?? null;
  }

  const page = gitLastModified(
    "src",
    "app",
    "[locale]",
    "programs",
    "[programSlug]",
    "lessons",
    "[slug]",
    "page.tsx",
  );
  const contentDate = contentGitLastModified(
    path.join("content", "programs", programSlug, "lessons"),
  );

  const date = newest(page, contentDate);
  lessonLastModifiedCache.set(cacheKey, date);
  return date;
}

function blogLastModified(slug: string): Date | null {
  if (blogLastModifiedCache.has(slug))
    return blogLastModifiedCache.get(slug) ?? null;

  const page = gitLastModified(
    "src",
    "app",
    "[locale]",
    "blog",
    "[slug]",
    "page.tsx",
  );
  const files = routing.locales
    .map((locale) => path.join("content", "blog", locale, `${slug}.mdx`))
    .filter((file) => existingFile(file));
  const frontmatterDates = files
    .map((file) =>
      frontmatterDate(path.join(ROOT, file), ["updatedAt", "updated", "date"]),
    )
    .filter((date): date is Date => date !== null);
  const contentDate = contentGitLastModified(path.join("content", "blog"));

  const date = newest(page, contentDate, ...frontmatterDates);
  blogLastModifiedCache.set(slug, date);
  return date;
}

function filteredPrograms() {
  return getPrograms().filter(
    (program) => !EXCLUDED_PROGRAM_SLUGS.has(program.slug),
  );
}

export function buildSitemapEntries(locale: string): MetadataRoute.Sitemap {
  const programs = filteredPrograms();
  const programmesLastModified = newest(
    gitLastModified("data", "programs.json"),
    gitLastModified("src", "app", "[locale]", "programs", "page.tsx"),
  );

  const staticPages = STATIC_PATHS.map((item) =>
    entry(locale, item.path, gitLastModified(...item.file)),
  );

  const programPages = programs.map((program) =>
    entry(locale, `/programs/${program.slug}`, programmesLastModified),
  );

  const programLessonPages = programs.map((program) =>
    entry(
      locale,
      `/programs/${program.slug}/lessons`,
      newest(
        programmesLastModified,
        gitLastModified(
          "src",
          "app",
          "[locale]",
          "programs",
          "[programSlug]",
          "lessons",
          "page.tsx",
        ),
      ),
    ),
  );

  const lessonPages = programs.flatMap((program) =>
    getLessons(program.slug, "en").map((lesson) =>
      entry(
        locale,
        `/programs/${program.slug}/lessons/${lesson.slug}`,
        lessonLastModified(program.slug, lesson.slug),
      ),
    ),
  );

  const blogPages = getAllBlogSlugs()
    .filter((slug) => getBlogPost(slug, locale)?.published)
    .map((slug) => entry(locale, `/blog/${slug}`, blogLastModified(slug)));

  return [
    ...staticPages,
    ...programPages,
    ...programLessonPages,
    ...lessonPages,
    ...blogPages,
  ];
}

export async function generateSitemaps() {
  return routing.locales.map((locale) => ({ id: locale }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  if (!(routing.locales as readonly string[]).includes(id)) {
    return [];
  }

  return buildSitemapEntries(id);
}
