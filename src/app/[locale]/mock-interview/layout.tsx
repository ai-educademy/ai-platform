import type { Metadata } from "next";
import { createSeoMetadata, getPageSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo(locale, "mockInterview");

  return createSeoMetadata({ locale, path: "/mock-interview", ...seo });
}

export default function MockInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
