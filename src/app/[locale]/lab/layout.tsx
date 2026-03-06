import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const BASE_URL = "https://aieducademy.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lab" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/lab`,
    },
    openGraph: {
      title: `${t("pageTitle")} | AI Educademy`,
      description: t("pageDescription"),
    },
  };
}

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
