import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createSeoMetadata } from "@/components/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding" });
  return createSeoMetadata({
    locale,
    path: "/onboarding",
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  });
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-bg)]">
      {children}
    </div>
  );
}
