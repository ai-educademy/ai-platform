import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { buildAlternates } from "@/lib/seo";
import { getPurchasablePlans } from "@/lib/stripe";
import { trackEvent } from "@/lib/funnel";
import { resolvePricingCurrency } from "@/lib/pricing";
import { PricingCards } from "./PricingCards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    // The root layout already applies a `%s | AI Educademy` title
    // template, so appending the brand here rendered it twice.
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: {
      canonical: `https://aieducademy.org${locale === "en" ? "" : `/${locale}`}/pricing`,
      ...buildAlternates("/pricing"),
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  trackEvent("pricing_viewed", {
    locale,
    path: `${locale === "en" ? "" : `/${locale}`}/pricing`,
  });
  const requestHeaders = await headers();
  const pricingCurrency = resolvePricingCurrency(
    locale,
    requestHeaders.get("x-vercel-ip-country"),
  );

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          {t("badge")}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text)] mb-4">
          {t("heading")}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {t("subheading")}
        </p>
      </div>

      <PricingCards
        locale={locale}
        pricingCurrency={pricingCurrency}
        purchasablePlans={getPurchasablePlans(pricingCurrency)}
      />

      {/* FAQ teaser */}
      <div className="mt-20 text-center">
        <p className="text-[var(--color-text-muted)]">
          {t("faqTeaser")}{" "}
          <a
            href={`${locale === "en" ? "" : `/${locale}`}/faq`}
            className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:no-underline"
          >
            {t("faqLink")}
          </a>
        </p>
      </div>
    </section>
  );
}
