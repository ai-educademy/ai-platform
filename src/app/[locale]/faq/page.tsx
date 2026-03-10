import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { AnimatedSection } from "@/components/ui/MotionWrappers";

const BASE_URL = "https://aieducademy.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("faq");
  const canonical = `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/faq`;

  return {
    title: `${t("title")} | AI Educademy`,
    description: t("subtitle"),
    alternates: { canonical },
    openGraph: {
      title: `${t("title")} | AI Educademy`,
      description: t("subtitle"),
      url: canonical,
      type: "website",
    },
  };
}

const FAQ_COUNT = 25;

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("faq");
  const basePath = locale === "en" ? "" : `/${locale}`;
  const pageUrl = `${BASE_URL}${basePath}/faq`;

  const questions = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`q${i + 1}` as Parameters<typeof t>[0]),
    answer: t(`a${i + 1}` as Parameters<typeof t>[0]),
  }));

  const categories = [
    { label: "About", emoji: "🎓", range: [0, 3] },
    { label: "Programs & Learning", emoji: "📚", range: [3, 8] },
    { label: "Languages & Access", emoji: "🌍", range: [8, 11] },
    { label: "Open Source", emoji: "⭐", range: [11, 13] },
    { label: "Learning AI", emoji: "🤖", range: [13, 16] },
    { label: "Account & Progress", emoji: "📊", range: [16, 20] },
    { label: "Platform", emoji: "💡", range: [20, 25] },
  ];

  return (
    <>
      <FAQJsonLd questions={questions} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}${basePath}/` },
          { name: t("title"), url: pageUrl },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Hero */}
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 mb-5">
              <span className="text-2xl" aria-hidden="true">❓</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t("title")}</h1>
            <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </AnimatedSection>

        {/* Category-grouped FAQ sections */}
        {categories.map((cat, catIdx) => (
          <AnimatedSection
            key={cat.label}
            animation="fade-up"
            delay={catIdx * 60}
          >
            <section className="mb-10">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                <span aria-hidden="true">{cat.emoji}</span>
                {cat.label}
              </h2>

              <div className="space-y-2">
                {questions.slice(cat.range[0], cat.range[1]).map((item, idx) => {
                  const qNum = cat.range[0] + idx + 1;
                  return (
                    <details
                      key={qNum}
                      className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors select-none">
                        <span>{item.question}</span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-[var(--color-text-muted)] transition-transform duration-300 group-open:rotate-180"
                        >
                          ▾
                        </span>
                      </summary>
                      <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
                        {item.answer}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          </AnimatedSection>
        ))}

        {/* CTA */}
        <AnimatedSection animation="fade-up" delay={480}>
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-purple-500/10 border border-indigo-500/20 p-8 text-center">
            <div className="text-3xl mb-3">🌱</div>
            <h2 className="text-xl font-bold mb-2">Ready to start your AI journey?</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-md mx-auto">
              No account required. Free, in your language, at your own pace.
            </p>
            <Link
              href={`${basePath}${t("ctaHref")}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow duration-300"
            >
              {t("cta")} →
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
}
