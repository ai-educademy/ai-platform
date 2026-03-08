import { useTranslations } from "next-intl";
import Link from "next/link";

const suggestedLinks = [
  { href: "/programs", key: "programs" },
  { href: "/blog", key: "blog" },
  { href: "/lab", key: "lab" },
  { href: "/about", key: "about" },
] as const;

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg space-y-6">
        <div className="text-8xl font-extrabold text-[var(--color-primary)] opacity-15 leading-none select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("title")}</h1>
        <p className="text-[var(--color-text-muted)] leading-relaxed">{t("description")}</p>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:brightness-110 transition-all"
        >
          {t("backHome")}
        </Link>

        <p className="text-sm text-[var(--color-text-muted)] italic">{t("searchSuggestion")}</p>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
            {t("popularPages")}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 bg-[var(--color-bg-card)] text-[var(--color-primary)] rounded-lg text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:brightness-110 transition-all"
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
