"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/i18n/request";

import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <footer className="relative border-t border-[var(--color-border)] bg-[var(--color-bg-section)]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={`${basePath}/`} className="flex items-center gap-2 font-bold text-lg mb-3">
              <Logo size={24} />
              <span className="text-gradient text-sm font-bold tracking-tight">aieducademy</span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{t("learnHeader")}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>
                <Link href={`${basePath}/programs`} className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("programs")}
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/programs/ai-seeds`} className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("lessons")}
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/playground`} className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("playground")}
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/dashboard`} className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("dashboard")}
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/about`} className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{t("communityHeader")}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>
                <a href="https://github.com/ai-educademy" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("github")}
                </a>
              </li>
              <li>
                <a href="https://github.com/ai-educademy/ai-platform/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("contributing")}
                </a>
              </li>
              <li>
                <a href="https://github.com/ai-educademy/ai-platform/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("coc")}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{t("supportHeader")}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>
                <a href="https://github.com/sponsors/rameshreddy-adutla" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] hover:translate-x-0.5 transition-all inline-block">
                  {t("sponsor")} <span className="text-red-500 animate-pulse">❤️</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 relative flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
          <p>{t("madeWith")}</p>
          <p>{t("license")}</p>
        </div>
      </div>
    </footer>
  );
}
