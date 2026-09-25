import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { BASE_URL, createSeoMetadata, getPageSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo(locale, "privacy");
  return createSeoMetadata({
    locale,
    path: "/privacy",
    ...seo,
    robots: { index: true, follow: true },
  });
}
const sectionKeys = [
  "collect",
  "use",
  "sharing",
  "cookies",
  "retention",
  "rights",
  "security",
  "children",
  "international",
  "changes",
  "contact",
] as const;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}${basePath}` },
          { name: t("title"), url: `${BASE_URL}${basePath}/privacy` },
        ]}
      />

      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <header className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {t("title")}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t("subtitle")}
            </p>
          </header>

          <p className="text-[var(--color-text-muted)] leading-relaxed mb-10">
            {t("intro")}
          </p>

          <div className="space-y-10">
            {sectionKeys.map((key) => (
              <section key={key}>
                <h2 className="text-xl font-semibold mb-3">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {t(`sections.${key}.content`)}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
