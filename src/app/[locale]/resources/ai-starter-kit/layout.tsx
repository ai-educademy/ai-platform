import type { Metadata } from "next";
import { createSeoMetadata, getPageSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo(locale, "starterKit");

  return createSeoMetadata({
    locale,
    path: "/resources/ai-starter-kit",
    ...seo,
  });
}

export default function AIStarterKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
