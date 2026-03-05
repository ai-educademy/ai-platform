"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales, localeNames, localeFlags } from "@/i18n/request";
import type { Locale } from "@/i18n/request";
import { useState, useRef, useEffect, useCallback } from "react";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  function switchLocale(newLocale: string) {
    if (newLocale === currentLocale) {
      setOpen(false);
      return;
    }

    const segments = pathname.split("/").filter(Boolean);

    // Remove any locale prefix if present (covers both prefixed and unprefixed cases)
    if ((locales as readonly string[]).includes(segments[0])) {
      segments.shift();
    }

    // Build new path
    let newPath: string;
    if (newLocale === "en") {
      // English uses no prefix (localePrefix: "as-needed")
      newPath = "/" + segments.join("/");
    } else {
      newPath = "/" + newLocale + (segments.length > 0 ? "/" + segments.join("/") : "");
    }

    // Ensure clean path (no double slashes, no trailing slash except root)
    newPath = newPath.replace(/\/+/g, "/").replace(/\/$/, "") || "/";

    router.push(newPath);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] hover:border-[var(--color-primary)]/30 transition-all duration-200 active:scale-95"
        aria-label={t("language")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base leading-none">{localeFlags[currentLocale as Locale]}</span>
        <span className="hidden sm:inline text-xs">
          {localeNames[currentLocale as Locale]}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-52 py-1.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xl z-50 animate-fade-in"
            role="listbox"
            aria-label="Select language"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                role="option"
                aria-selected={locale === currentLocale}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                  locale === currentLocale
                    ? "text-[var(--color-primary)] font-semibold bg-[var(--color-primary)]/5"
                    : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                }`}
              >
                <span className="text-lg leading-none w-6 text-center">{localeFlags[locale]}</span>
                <span className="flex-1">{localeNames[locale]}</span>
                {locale === currentLocale && (
                  <svg className="w-4 h-4 text-[var(--color-primary)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
