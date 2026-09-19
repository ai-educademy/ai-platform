import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createSeoMetadata } from "@/components/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mockInterview" });

  return createSeoMetadata({
    locale,
    path: "/mock-interview",
    title: t("title"),
    description: t("description"),
  });
}

export default function MockInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
