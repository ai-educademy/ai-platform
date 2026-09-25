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

export interface LessonPreview {
  introExcerpt: string;
  outline: { level: 2 | 3; title: string }[];
  objectives: string[];
  wordCount: number;
  excerptWordCount: number;
}


function contentDir(programSlug: string): string {
  return path.join(
    process.cwd(),
    "content",
    "programs",
    programSlug,
    "lessons",
  );
}

function stripMdxSyntax(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, " ")
    .replace(/\{[^}]*}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value: string): number {
  const text = stripMdxSyntax(value);
  return text ? text.split(/\s+/).length : 0;
}

function truncateWords(value: string, maxWords: number): string {
  const words = stripMdxSyntax(value).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function extractIntroExcerpt(content: string, totalWords: number): string {
  const firstSection = content.split(/\n##\s+/)[0] ?? content;
  const paragraphs = firstSection
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => {
      if (!paragraph) return false;
      if (/^#\s+/.test(paragraph)) return false;
      if (/^```/.test(paragraph)) return false;
      if (/^</.test(paragraph)) return false;
      if (/^\|/.test(paragraph)) return false;
      return wordCount(paragraph) > 0;
    });

  if (paragraphs.length === 0) return "";

  const maxWords = Math.max(1, Math.floor(totalWords * 0.15));
  const firstSectionWords = wordCount(firstSection);
  const cap = Math.max(1, Math.min(maxWords, firstSectionWords));
  const selected: string[] = [];
  let selectedWords = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = wordCount(paragraph);
    if (selectedWords > 0 && selectedWords + paragraphWords > cap) break;
    selected.push(paragraph);
    selectedWords += paragraphWords;
    if (selectedWords >= cap) break;
  }

  return truncateWords(selected.join("\n\n"), cap);
}

export function buildLessonPreview(lesson: Lesson): LessonPreview {
  const outline = Array.from(
    lesson.content.matchAll(/^(##|###)\s+(.+)$/gm),
  ).map(([, hashes, title]) => ({
    level: (hashes === "##" ? 2 : 3) as 2 | 3,
    title: stripMdxSyntax(title),
  }));
  const totalWords = wordCount(lesson.content);
  const objectives = outline
    .filter((heading) => heading.level === 2)
    .slice(0, 5)
    .map((heading) => heading.title);
  const introExcerpt = extractIntroExcerpt(lesson.content, totalWords);

  return {
    introExcerpt,
    outline,
    objectives,
    wordCount: totalWords,
    excerptWordCount: wordCount(introExcerpt),
  };
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

  const lessons = Array.from(allFiles)
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
  return lessons;
}

export function getLesson(
  programSlug: string,
  locale: string,
  slug: string,
): Lesson | null {
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
