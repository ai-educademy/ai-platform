import type { Metadata } from "next";
import { createSeoMetadata, getPageSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo(locale, "lab");
  return createSeoMetadata({ locale, path: "/lab", ...seo });
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
