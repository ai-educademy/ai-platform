import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface LessonMeta {
  slug: string;
  title: string;
  description: string;
  order: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  icon: string;
  published: boolean;
}

export interface Lesson extends LessonMeta {
  content: string;
  /**
   * The locale the body text is actually written in. This differs from the
   * requested locale whenever we fall back to English, and callers must surface
   * that difference: rendering English prose inside translated page furniture
   * with no explanation reads as broken rather than as a known gap.
   */
  contentLocale: string;
  /** True when the requested locale had no translation and English was served. */
  isFallback: boolean;
  /**
   * True when the body was produced by machine translation rather than written
   * or reviewed by a human. Readers are told, because silently presenting
   * machine output as authored material on a paid product is not honest.
   */
  machineTranslated: boolean;
}

function contentDir(programSlug: string): string {
  return path.join(process.cwd(), "content", "programs", programSlug, "lessons");
}

export function getLessons(programSlug: string, locale: string): LessonMeta[] {
  const baseDir = contentDir(programSlug);
  const dir = path.join(baseDir, locale);
  const enDir = path.join(baseDir, "en");

  const enFiles = fs.existsSync(enDir)
    ? fs.readdirSync(enDir).filter((f) => f.endsWith(".mdx"))
    : [];

  const localeFiles =
    locale !== "en" && fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))
      : [];

  const allFiles = new Set([...enFiles, ...localeFiles]);

  return Array.from(allFiles)
    .map((file) => {
      const localePath = path.join(dir, file);
      const enPath = path.join(enDir, file);
      const filePath =
        locale !== "en" && localeFiles.includes(file) ? localePath : enPath;

      if (!fs.existsSync(filePath)) return null;

      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title || "",
        description: data.description || "",
        order: data.order || 0,
        difficulty: data.difficulty || "beginner",
        duration: data.duration || 10,
        icon: data.icon || "📚",
        published: data.published !== false,
      } as LessonMeta;
    })
    .filter((l): l is LessonMeta => l !== null && l.published)
    .sort((a, b) => a.order - b.order);
}

export function getLesson(programSlug: string, locale: string, slug: string): Lesson | null {
  const baseDir = contentDir(programSlug);
  const localeDir = path.join(baseDir, locale);
  let filePath = path.join(localeDir, `${slug}.mdx`);
  let isFallback = false;

  if (!fs.existsSync(filePath)) {
    filePath = path.join(baseDir, "en", `${slug}.mdx`);
    isFallback = locale !== "en";
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    order: data.order || 0,
    difficulty: data.difficulty || "beginner",
    duration: data.duration || 10,
    icon: data.icon || "📚",
    published: data.published !== false,
    content,
    contentLocale: isFallback ? "en" : locale,
    isFallback,
    machineTranslated: !isFallback && data.machineTranslated === true,
  };
}
