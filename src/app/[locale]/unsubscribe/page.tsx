import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { UnsubscribeForm } from "./UnsubscribeForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "unsubscribe" });
  return {
    // The root layout already applies a `%s | AI Educademy` title
    // template, so appending the brand here rendered it twice.
    title: t("title"),
    // An unsubscribe page has no business in search results.
    robots: { index: false, follow: false },
  };
}

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  const t = await getTranslations({ locale, namespace: "unsubscribe" });

  return (
    <section className="py-20 px-4 sm:px-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] mb-6">
        {t("title")}
      </h1>
      {token ? (
        <UnsubscribeForm token={token} />
      ) : (
        <p className="text-sm leading-6 text-[var(--color-text-muted)]">{t("missingToken")}</p>
      )}
    </section>
  );
}
