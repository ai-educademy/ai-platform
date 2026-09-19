import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createSeoMetadata } from "@/components/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leadMagnet" });

  return createSeoMetadata({
    locale,
    path: "/resources/ai-starter-kit",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default function AIStarterKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
