import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";
import type { BlogPostMeta } from "@/lib/blog";

const PROGRAM_ARTICLES: Record<string, string[]> = {
  "ai-seeds": [
    "what-is-artificial-intelligence",
    "how-to-learn-ai-from-scratch",
    "ai-tools-for-students",
  ],
  "ai-sprouts": [
    "ai-vs-machine-learning-difference",
    "machine-learning-for-beginners",
    "responsible-ai-ethics",
  ],
  "ai-branches": [
    "what-is-nlp",
    "ai-image-generation-guide",
    "neural-networks-explained-simply",
  ],
  "ai-canopy": [
    "neural-networks-explained-simply",
    "prompt-engineering-guide",
    "what-is-generative-ai",
  ],
  "ai-forest": [
    "what-is-rag",
    "ai-startups-2026",
    "responsible-ai-ethics",
  ],
  "ai-sketch": [
    "learn-python-for-ai",
    "ai-career-paths",
    "ai-interview-questions",
  ],
  "ai-chisel": [
    "learn-python-for-ai",
    "neural-networks-explained-simply",
    "ai-interview-questions",
  ],
  "ai-craft": [
    "ai-career-paths",
    "ai-interview-questions",
    "what-is-rag",
  ],
  "ai-polish": [
    "ai-interview-questions",
    "ai-career-paths",
    "responsible-ai-ethics",
  ],
  "ai-masterpiece": [
    "ai-career-paths",
    "ai-interview-questions",
    "ai-startups-2026",
  ],
  "ai-launchpad": [
    "ai-career-paths",
    "how-to-learn-ai-from-scratch",
    "ai-interview-questions",
  ],
  "ai-behavioral": [
    "ai-interview-questions",
    "ai-career-paths",
    "responsible-ai-ethics",
  ],
  "ai-technical": [
    "learn-python-for-ai",
    "ai-interview-questions",
    "machine-learning-for-beginners",
  ],
  "ai-ml-interview": [
    "machine-learning-for-beginners",
    "ai-vs-machine-learning-difference",
    "ai-interview-questions",
  ],
  "ai-offer": [
    "ai-career-paths",
    "ai-interview-questions",
    "why-learn-ai-in-2026",
  ],
};

function estimateReadTime(description: string): number {
  const words = description.split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 50) + 3);
}

export function RelatedArticles({
  programSlug,
  basePath,
  label,
}: {
  programSlug: string;
  basePath: string;
  label: string;
}) {
  const articleSlugs = PROGRAM_ARTICLES[programSlug];
  if (!articleSlugs || articleSlugs.length === 0) return null;

  const allPosts = getBlogPosts("en");
  const postMap = new Map<string, BlogPostMeta>();
  for (const post of allPosts) {
    postMap.set(post.slug, post);
  }

  const articles = articleSlugs
    .map((slug) => postMap.get(slug))
    .filter((p): p is BlogPostMeta => p != null)
    .slice(0, 3);

  if (articles.length === 0) return null;

  return (
    <div className="mb-14">
      <h2 className="text-lg font-bold mb-4">📖 {label}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((post) => (
          <Link
            key={post.slug}
            href={`${basePath}/blog/${post.slug}`}
            className="group block p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40"
          >
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
              {post.title}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">
              {post.description}
            </p>
            <span className="text-xs text-[var(--color-text-muted)]">
              ⏱️ {estimateReadTime(post.description)} min read
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
