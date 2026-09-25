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

function parseLessonMeta(
  raw: string,
): Record<string, string | number | boolean> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const data: Record<string, string | number | boolean> = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (!key) continue;

    if (rawValue === "true") data[key] = true;
    else if (rawValue === "false") data[key] = false;
    else if (/^\d+$/.test(rawValue)) data[key] = Number.parseInt(rawValue, 10);
    else data[key] = rawValue;
  }

  return data;
}

function readFrontmatter(filePath: string): string {
  if (
    typeof fs.openSync !== "function" ||
    typeof fs.readSync !== "function" ||
    typeof fs.closeSync !== "function"
  ) {
    return fs.readFileSync(filePath, "utf-8");
  }

  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(8192);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    const head = buffer.subarray(0, bytesRead).toString("utf-8");
    const end = head.indexOf("\n---", 4);
    return end === -1 ? head : head.slice(0, end + 4);
  } finally {
    fs.closeSync(fd);
  }
}

type LessonMetaByFile = Map<string, Record<string, string | number | boolean>>;
const lessonMetaCache = new Map<
  string,
  { signature: string; entries: LessonMetaByFile }
>();

function readLessonMetaByFile(dir: string): LessonMetaByFile {
  if (!fs.existsSync(dir)) return new Map();

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort();
  const signature = files.join("|");
  const cached = lessonMetaCache.get(dir);
  if (cached?.signature === signature) return cached.entries;

  const entries: LessonMetaByFile = new Map();
  for (const file of files) {
    const raw = readFrontmatter(path.join(dir, file));
    entries.set(file, parseLessonMeta(raw));
  }

  lessonMetaCache.set(dir, { signature, entries });
  return entries;
}

export function getLessons(programSlug: string, locale: string): LessonMeta[] {
  const baseDir = contentDir(programSlug);
  const dir = path.join(baseDir, locale);
  const enDir = path.join(baseDir, "en");

  const enEntries = readLessonMetaByFile(enDir);
  const localeEntries =
    locale !== "en"
      ? readLessonMetaByFile(dir)
      : new Map<string, Record<string, string | number | boolean>>();
  const enFiles = Array.from(enEntries.keys());
  const localeFiles = Array.from(localeEntries.keys());

  const allFiles = new Set([...enFiles, ...localeFiles]);

  const lessons = Array.from(allFiles)
    .map((file) => {
      const data = localeEntries.get(file) ?? enEntries.get(file);
      if (!data) return null;
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
