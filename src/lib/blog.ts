import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  published: boolean;
  image?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function blogDir(locale: string): string {
  return path.join(process.cwd(), "content", "blog", locale);
}

export function getBlogPosts(locale: string): BlogPostMeta[] {
  const dir = blogDir(locale);
  const enDir = blogDir("en");

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
        date: data.date || "",
        author: data.author || "",
        tags: data.tags || [],
        published: data.published !== false,
        image: data.image || undefined,
      } as BlogPostMeta;
    })
    .filter((p): p is BlogPostMeta => p !== null && p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string, locale: string): BlogPost | null {
  const localeDir = blogDir(locale);
  let filePath = path.join(localeDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(blogDir("en"), `${slug}.mdx`);
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
    date: data.date || "",
    author: data.author || "",
    tags: data.tags || [],
    published: data.published !== false,
    image: data.image || undefined,
    content,
  };
}

export function getAllBlogSlugs(): string[] {
  const enDir = blogDir("en");
  if (!fs.existsSync(enDir)) return [];
  return fs
    .readdirSync(enDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
