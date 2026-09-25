import { permanentRedirect } from "next/navigation";

// Legacy entry point. /programs is the canonical catalogue in every locale.
export default async function LessonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === "en" ? "" : `/${locale}`;
  permanentRedirect(`${basePath}/programs`);
}
