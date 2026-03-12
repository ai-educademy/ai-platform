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
  const t = await getTranslations({ locale, namespace: "mockInterview" });
  const canonical = `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/mock-interview`;

  return {
    title: `${t("title")} | AI Educademy`,
    description: t("description"),
    alternates: {
      canonical,
      ...buildAlternates("/mock-interview"),
    },
    openGraph: {
      title: `${t("title")} | AI Educademy`,
      description: t("description"),
      url: canonical,
      type: "website",
    },
  };
}

export default function MockInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
