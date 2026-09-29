import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import { BASE_URL, createSeoMetadata } from "@/lib/seo";
import { getPrograms } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { getBlogPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sitemap");

  return createSeoMetadata({
    locale,
    path: "/sitemap",
    title: t("seo.title"),
    description: t("seo.description"),
  });
}

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sitemap");
  const tPrograms = await getTranslations("programs");
  const basePath = locale === "en" ? "" : `/${locale}`;
  const pageUrl = `${BASE_URL}${basePath}/sitemap`;

  const programs = getPrograms();
  const blogPosts = getBlogPosts(locale);

  const mainPages: { href: string; label: string }[] = [
    { href: `${basePath}/`, label: t("links.home") },
    { href: `${basePath}/programs`, label: t("links.programs") },
    { href: `${basePath}/lab`, label: t("links.lab") },
    { href: `${basePath}/mock-interview`, label: t("links.mockInterview") },
    { href: `${basePath}/journey`, label: t("links.journey") },
    { href: `${basePath}/tools`, label: t("links.tools") },
    { href: `${basePath}/blog`, label: t("links.blog") },
    { href: `${basePath}/about`, label: t("links.about") },
    { href: `${basePath}/faq`, label: t("links.faq") },
    {
      href: `${basePath}/resources/ai-starter-kit`,
      label: t("links.starterKit"),
    },
    { href: `${basePath}/pricing`, label: t("links.pricing") },
    { href: `${basePath}/contact`, label: t("links.contact") },
  ];

  const legalPages: { href: string; label: string }[] = [
    { href: `${basePath}/privacy`, label: t("links.privacy") },
    { href: `${basePath}/terms`, label: t("links.terms") },
  ];

  const academies = programs.map((program) => ({
    slug: program.slug,
    title: tPrograms(
      `${program.slug}.title` as Parameters<typeof tPrograms>[0],
    ),
    lessons: getLessons(program.slug, locale),
  }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: t("links.home"), url: `${BASE_URL}${basePath}/` },
          { name: t("title"), url: pageUrl },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <AnimatedSection>
          <header className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)]">
              {t("intro")}
            </p>
          </header>
        </AnimatedSection>

        {/* Main pages */}
        <AnimatedSection>
          <section className="mt-16" aria-labelledby="sitemap-main">
            <h2
              id="sitemap-main"
              className="mb-6 text-2xl font-bold text-[var(--color-text)]"
            >
              {t("headings.main")}
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
              {mainPages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </AnimatedSection>

        {/* Academies and lessons */}
        <AnimatedSection>
          <section className="mt-16" aria-labelledby="sitemap-academies">
            <h2
              id="sitemap-academies"
              className="mb-6 text-2xl font-bold text-[var(--color-text)]"
            >
              {t("headings.academies")}
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {academies.map((academy) => (
                <div
                  key={academy.slug}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
                >
                  <h3 className="mb-3 text-lg font-bold">
                    <Link
                      href={`${basePath}/programs/${academy.slug}`}
                      className="text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      {academy.title}
                    </Link>
                  </h3>
                  {academy.lessons.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {academy.lessons.map((lesson) => (
                        <li key={lesson.slug}>
                          <Link
                            href={`${basePath}/programs/${academy.slug}/lessons/${lesson.slug}`}
                            className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                          >
                            {lesson.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {t("comingSoon")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Blog */}
        {blogPosts.length > 0 && (
          <AnimatedSection>
            <section className="mt-16" aria-labelledby="sitemap-blog">
              <h2
                id="sitemap-blog"
                className="mb-6 text-2xl font-bold text-[var(--color-text)]"
              >
                {t("headings.blog")}
              </h2>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`${basePath}/blog/${post.slug}`}
                      className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </AnimatedSection>
        )}

        {/* Legal */}
        <AnimatedSection>
          <section className="mt-16" aria-labelledby="sitemap-legal">
            <h2
              id="sitemap-legal"
              className="mb-6 text-2xl font-bold text-[var(--color-text)]"
            >
              {t("headings.legal")}
            </h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {legalPages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </AnimatedSection>

        {/* XML sitemap note for machines */}
        <AnimatedSection>
          <p className="mt-16 border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-muted)]">
            {t("xmlNote")}{" "}
            <a
              href={`${BASE_URL}/sitemap.xml`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              sitemap.xml
            </a>
          </p>
        </AnimatedSection>
      </div>
    </>
  );
}
