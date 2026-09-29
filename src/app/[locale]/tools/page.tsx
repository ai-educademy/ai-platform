import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import { ToolsDirectory } from "@/components/tools/ToolsDirectory";
import { BASE_URL, createSeoMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tools");

  return createSeoMetadata({
    locale,
    path: "/tools",
    title: t("seo.title"),
    description: t("seo.description"),
  });
}

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tools");
  const basePath = locale === "en" ? "" : `/${locale}`;
  const pageUrl = `${BASE_URL}${basePath}/tools`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}${basePath}/` },
          { name: t("title"), url: pageUrl },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        {/* Hero */}
        <AnimatedSection animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
              <span className="text-2xl" aria-hidden="true">
                🧰
              </span>
            </div>
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
              {t("eyebrow")}
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
              {t("subtitle")}
            </p>
          </div>
        </AnimatedSection>

        {/* Affiliate disclosure */}
        <AnimatedSection animation="fade-up" delay={80}>
          <p className="mx-auto mt-8 max-w-2xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-section)] px-4 py-3 text-center text-xs leading-relaxed text-[var(--color-text-muted)]">
            {t("disclosure")}
          </p>
        </AnimatedSection>

        {/* Directory */}
        <AnimatedSection animation="fade-up" delay={140}>
          <div className="mt-12">
            <ToolsDirectory />
          </div>
        </AnimatedSection>
      </div>
    </>
  );
}
