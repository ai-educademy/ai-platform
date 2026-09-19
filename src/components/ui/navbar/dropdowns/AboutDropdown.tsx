import Link from "next/link";

export function AboutDropdownContent({ basePath, t }: { basePath: string; t: (key: string) => string }) {
  return (
    <div className="w-[min(300px,calc(100vw-2rem))] p-4">
      <div className="space-y-0.5">
        <Link
          href={`${basePath}/about`}
          className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
        >
          <span className="text-base mt-0.5">🎯</span>
          <div>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {t("about")}
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("missionDesc")}</p>
          </div>
        </Link>
        <Link
          href={`${basePath}/faq`}
          className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
        >
          <span className="text-base mt-0.5">❓</span>
          <div>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {t("faq")}
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("faqDesc")}</p>
          </div>
        </Link>
        <Link
          href={`${basePath}/contact`}
          className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
        >
          <span className="text-base mt-0.5">✉️</span>
          <div>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {t("contact")}
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("contactDesc")}</p>
          </div>
        </Link>
        <a
          href="https://github.com/ai-educademy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
        >
          <span className="text-base mt-0.5">⭐</span>
          <div>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {t("openSource")}
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("openSourceDesc")}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
