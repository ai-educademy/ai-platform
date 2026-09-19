import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createSeoMetadata } from "@/components/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return createSeoMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
