import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

const BASE_URL = "https://aieducademy.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
    },
    openGraph: {
      title: `${t("title")} | AI Educademy`,
      description: t("subtitle"),
    },
  };
}

function estimateReadTime(description: string): number {
  // Rough estimate: average blog post ~1000 words = 5 min
  const words = description.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");
  const posts = getBlogPosts(locale);
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gradient leading-tight tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Blog Grid */}
      {posts.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)]">
          {t("noPosts")}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`${basePath}/blog/${post.slug}`}
              className="block group"
            >
              <article className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]">
                <div className="p-6 h-full flex flex-col">
                  {/* Date + Read time */}
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-3">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span>•</span>
                    <span>
                      {estimateReadTime(post.description)} {t("minuteRead")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 leading-relaxed group-hover:text-[var(--color-primary)] transition-colors">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-3 flex-1">
                    {post.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Arrow indicator */}
                  <span className="text-sm font-medium text-[var(--color-primary)] inline-flex items-center gap-1">
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
