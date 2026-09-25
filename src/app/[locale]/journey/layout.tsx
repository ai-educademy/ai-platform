import type { Metadata } from "next";
import { createSeoMetadata, getPageSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo(locale, "journey");
  return createSeoMetadata({ locale, path: "/journey", ...seo });
}

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
