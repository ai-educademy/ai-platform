import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";

const BASE_URL = "https://aieducademy.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journey" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/journey`,
      ...buildAlternates("/journey"),
    },
    openGraph: {
      title: `${t("title")} | AI Educademy`,
      description: t("subtitle"),
    },
  };
}

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
