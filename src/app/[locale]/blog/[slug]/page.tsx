import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getBlogPost } from "@/lib/blog";
import { LessonRenderer } from "@/components/lessons/LessonRenderer";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import { ListenButton } from "@/components/ui/ListenButton";

const BASE_URL = "https://aieducademy.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${slug}`,
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
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
          <div className="mt-4">
            <ListenButton locale={locale} />
          </div>
        </div>
      </AnimatedSection>

      {/* Content - uses the same MDX renderer as lessons */}
      <AnimatedSection animation="fade-in" delay={200}>
        <div className="lesson-content">
          <LessonRenderer content={post.content} />
        </div>
      </AnimatedSection>

      {/* Footer nav */}
      <AnimatedSection animation="fade-up" delay={300}>
        <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
          <Link
            href={`${basePath}/blog`}
            className="group inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> {t("backToBlog")}
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
