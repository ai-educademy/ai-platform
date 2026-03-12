import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { LessonRenderer } from "@/components/lessons/LessonRenderer";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import { ListenButton } from "@/components/ui/ListenButton";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { slugify } from "@/lib/slugify";
import { buildAlternates } from "@/lib/seo";

const BASE_URL = "https://aieducademy.org";

/* ID-aware heading wrappers for blog posts – enables TableOfContents scroll tracking */
function BlogH2({
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
      ? children.filter((c) => typeof c === "string").join("")
      : "";
  const id = slugify(text);
  return (
    <h2 id={id} className="text-2xl font-bold mt-8 mb-3 scroll-mt-24" {...props}>
      {children}
    </h2>
  );
}

function BlogH3({
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
      ? children.filter((c) => typeof c === "string").join("")
      : "";
  const id = slugify(text);
  return (
    <h3 id={id} className="text-xl font-semibold mt-6 mb-2 scroll-mt-24" {...props}>
      {children}
    </h3>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale);
  if (!post) return { robots: { index: false, follow: false } };

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/blog/${slug}`,
      ...buildAlternates(`/blog/${slug}`),
    },
    openGraph: {
      title: `${post.title} | AI Educademy`,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      ...(post.image ? { images: [post.image] } : {}),
    },
  };
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("blog");
  const post = getBlogPost(slug, locale);

  if (!post) {
    notFound();
  }

  const basePath = locale === "en" ? "" : `/${locale}`;
  const readTime = estimateReadTime(post.content);
  const postUrl = `${BASE_URL}${basePath}/blog/${slug}`;

  // Get 3 related posts (same tags, excluding current)
  const allPosts = getBlogPosts(locale);
  const related = allPosts
    .filter((p) => p.slug !== slug && p.published)
    .filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <ArticleJsonLd
        headline={post.title}
        description={post.description}
        datePublished={post.date}
        author={post.author}
        image={post.image}
        url={postUrl}
        tags={post.tags}
      />

      {/*
        Two-column layout strategy:
        - TOC is first in DOM → appears above article on mobile (mobile collapsible via lg:hidden)
        - On desktop: TOC is placed in column 2 via explicit grid placement (lg:col-start-2)
        - Article is placed in column 1 on desktop (lg:col-start-1)
        This means a single <TableOfContents> handles both layouts with no duplication.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
        {/* ── TOC (first in DOM = first on mobile; placed in col 2 on desktop) ── */}
        <div className="lg:col-start-2 lg:row-start-1">
          <TableOfContents content={post.content} />
        </div>

        {/* ── Main content column (col 1 on desktop) ── */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {/* Back link */}
          <AnimatedSection animation="fade-in">
            <Link
              href={`${basePath}/blog`}
              className="group inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-8"
            >
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> {t("backToBlog")}
            </Link>
          </AnimatedSection>

          {/* Header */}
          <AnimatedSection animation="fade-up" delay={80}>
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
              <p className="text-lg text-[var(--color-text-muted)] mb-4">
                {post.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
                <time dateTime={post.date}>
                  {t("publishedOn")}{" "}
                  {new Date(post.date).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>•</span>
                <span>{post.author}</span>
                <span>•</span>
                <span>
                  {readTime} {t("minuteRead")}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <ListenButton locale={locale} />
                <ShareButtons url={postUrl} title={post.title} description={post.description} />
              </div>
            </div>
          </AnimatedSection>

          {/* Content */}
          <AnimatedSection animation="fade-in" delay={200}>
            <div className="lesson-content">
              <LessonRenderer
                content={post.content}
                extraComponents={{ h2: BlogH2, h3: BlogH3 }}
              />
            </div>
          </AnimatedSection>

          {/* Share + CTA + Related */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="mt-16 space-y-8">
              {/* Share bar */}
              <div className="py-6 border-t border-b border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <p className="text-sm font-medium text-[var(--color-text)] shrink-0">Found this useful?</p>
                <ShareButtons url={postUrl} title={post.title} description={post.description} />
              </div>

              {/* Start Learning CTA */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-purple-500/10 border border-indigo-500/20 p-8 text-center">
                <div className="text-3xl mb-3">🌱</div>
                <h3 className="text-xl font-bold mb-2">Ready to learn AI properly?</h3>
                <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-md mx-auto">
                  Start with AI Seeds, a structured, beginner-friendly program. Free, in your language, no account required.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`${basePath}/programs/ai-seeds`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow duration-300"
                  >
                    Start AI Seeds: Free →
                  </Link>
                  <Link
                    href={`${basePath}/programs`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:border-[var(--color-primary)] transition-colors duration-200"
                  >
                    Browse all programs
                  </Link>
                </div>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Related articles</h3>
                  <div className="grid gap-4">
                    {related.map((rp) => (
                      <Link
                        key={rp.slug}
                        href={`${basePath}/blog/${rp.slug}`}
                        className="group flex gap-4 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-section)] transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                            {rp.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                            {rp.description}
                          </p>
                        </div>
                        <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors shrink-0 self-center">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to blog */}
              <Link
                href={`${basePath}/blog`}
                className="group inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> {t("backToBlog")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
