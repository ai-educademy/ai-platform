"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales, localeNames, localeFlags } from "@/i18n/locales";
import type { Locale } from "@/i18n/locales";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("ui");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function switchLocale(newLocale: string) {
    setOpen(false);
    if (newLocale === currentLocale) return;

    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

    // An explicit language change is the strongest signal we get about which
    // language to write to someone in. Persist it for signed-in learners so
    // their emails follow. Fire and forget: navigation must not wait on it,
    // and the endpoint ignores anonymous callers.
    fetch("/api/user/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
      keepalive: true,
    }).catch(() => {
      /* preference sync is best-effort */
    });

    const segments = pathname.split("/").filter(Boolean);
    if ((locales as readonly string[]).includes(segments[0])) {
      segments.shift();
    }

    let newPath: string;
    if (newLocale === "en") {
      newPath = "/" + segments.join("/");
    } else {
      newPath = "/" + newLocale + (segments.length > 0 ? "/" + segments.join("/") : "");
    }

    newPath = newPath.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
    window.location.href = newPath;
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("changeLanguage", { language: localeNames[currentLocale as Locale] })}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all duration-200"
      >
        <span className="text-[15px] leading-none">{localeFlags[currentLocale as Locale]}</span>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={t("selectLanguage")}
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] max-sm:left-0 max-sm:right-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {locales.map((locale) => (
            <li key={locale} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === currentLocale}
                onClick={() => switchLocale(locale)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm cursor-pointer transition-colors ${
                  locale === currentLocale
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[var(--color-text)]"
                }`}
              >
                <span className="text-[15px] leading-none">{localeFlags[locale as Locale]}</span>
                <span>{localeNames[locale as Locale]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
