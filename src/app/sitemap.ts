import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { getPrograms } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { getAllBlogSlugs } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { buildAlternates, localeUrl } from "@/lib/seo";

const locales = routing.locales;
const ROOT = process.cwd();

function fileLastModified(...segments: string[]): Date {
  try {
    return fs.statSync(path.join(ROOT, ...segments)).mtime;
  } catch {
    return new Date("2026-01-01T00:00:00.000Z");
  }
}

function newest(...dates: Date[]): Date {
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

function lessonLastModified(programSlug: string, lessonSlug: string): Date {
  const lessonFiles = locales.map((locale) =>
    fileLastModified(
      "content",
      "programs",
      programSlug,
      "lessons",
      locale,
      `${lessonSlug}.mdx`
    )
  );

  return newest(
    fileLastModified("src", "app", "[locale]", "programs", "[programSlug]", "lessons", "[slug]", "page.tsx"),
    ...lessonFiles
  );
}

function blogLastModified(slug: string): Date {
  return newest(
    fileLastModified("src", "app", "[locale]", "blog", "[slug]", "page.tsx"),
    ...locales.map((locale) => fileLastModified("content", "blog", locale, `${slug}.mdx`))
  );
}

function localizedEntries(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified?: Date
): MetadataRoute.Sitemap {
  // localeUrl and buildAlternates are shared with the page metadata. This file
  // previously had its own copy of both, which always prefixed "/en" and
  // omitted x-default, so the sitemap and the HTML head advertised different
  // URLs for the same page.
  return locales.map((locale) => ({
    url: localeUrl(locale, path),
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
    alternates: buildAlternates(path),
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const programs = getPrograms();
  const programsLastModified = newest(
    fileLastModified("data", "programs.json"),
    fileLastModified("src", "app", "[locale]", "programs", "page.tsx")
  );

  const staticPages: MetadataRoute.Sitemap = [
    // Homepage: highest priority.
    ...localizedEntries("", "weekly", 1.0, fileLastModified("src", "app", "[locale]", "layout.tsx")),
    // Programs listing
    ...localizedEntries("/programs", "weekly", 0.9, programsLastModified),
    // Lab
    ...localizedEntries("/lab", "monthly", 0.8, fileLastModified("src", "app", "[locale]", "lab", "layout.tsx")),
    // About
    ...localizedEntries("/about", "monthly", 0.7, fileLastModified("src", "app", "[locale]", "about", "layout.tsx")),
    // Blog listing
    ...localizedEntries("/blog", "weekly", 0.8, fileLastModified("src", "app", "[locale]", "blog", "page.tsx")),
    // FAQ
    ...localizedEntries("/faq", "monthly", 0.7, fileLastModified("src", "app", "[locale]", "faq", "page.tsx")),
    // Mock interview
    ...localizedEntries("/mock-interview", "monthly", 0.8, fileLastModified("src", "app", "[locale]", "mock-interview", "layout.tsx")),
    // Journey
    ...localizedEntries("/journey", "monthly", 0.7, fileLastModified("src", "app", "[locale]", "journey", "layout.tsx")),
    // Contact
    ...localizedEntries("/contact", "monthly", 0.6, fileLastModified("src", "app", "[locale]", "contact", "layout.tsx")),
    // AI starter kit
    ...localizedEntries("/resources/ai-starter-kit", "monthly", 0.7, fileLastModified("src", "app", "[locale]", "resources", "ai-starter-kit", "page.tsx")),
    // Privacy and terms
    ...localizedEntries("/privacy", "yearly", 0.3, fileLastModified("src", "app", "[locale]", "privacy", "page.tsx")),
    ...localizedEntries("/terms", "yearly", 0.3, fileLastModified("src", "app", "[locale]", "terms", "page.tsx")),
    // Pricing
    ...localizedEntries("/pricing", "monthly", 0.8, fileLastModified("src", "app", "[locale]", "pricing", "page.tsx")),
  ];

  // Individual program pages
  const programPages: MetadataRoute.Sitemap = programs.flatMap((program) =>
    localizedEntries(
      `/programs/${program.slug}`,
      "weekly",
      0.8,
      programsLastModified
    )
  );

  // Program lesson listing pages
  const programLessonPages: MetadataRoute.Sitemap = programs
    .flatMap((program) =>
      localizedEntries(
        `/programs/${program.slug}/lessons`,
        "weekly",
        0.7,
        newest(
          programsLastModified,
          fileLastModified("src", "app", "[locale]", "programs", "[programSlug]", "lessons", "page.tsx")
        )
      )
    );

  // Individual lessons, including premium lessons. The first lesson is free to
  // read; later lessons stay indexable but render the paywall without the body.
  const lessonPages: MetadataRoute.Sitemap = programs.flatMap((program) =>
    getLessons(program.slug, "en").flatMap((lesson) =>
      localizedEntries(
        `/programs/${program.slug}/lessons/${lesson.slug}`,
        "weekly",
        lesson.order === 1 ? 0.75 : 0.65,
        lessonLastModified(program.slug, lesson.slug)
      )
    )
  );

  // Individual blog post pages
  const blogSlugs = getAllBlogSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs.flatMap((slug) =>
    localizedEntries(
      `/blog/${slug}`,
      "monthly",
      0.6,
      blogLastModified(slug)
    )
  );

  return [...staticPages, ...programPages, ...programLessonPages, ...lessonPages, ...blogPages];
}
