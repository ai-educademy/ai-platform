"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { locales, localeNames, localeFlags } from "@/i18n/request";
import type { Locale } from "@/i18n/request";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  function switchLocale(newLocale: string) {
    setOpen(false);
    if (newLocale === currentLocale) return;

    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

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
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language: ${localeNames[currentLocale as Locale]}. Click to change.`}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all duration-200"
      >
        <span className="text-[15px] leading-none">{localeFlags[currentLocale as Locale]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {locales.map((locale) => (
            <li
              key={locale}
              role="option"
              aria-selected={locale === currentLocale}
              onClick={() => switchLocale(locale)}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                locale === currentLocale
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-[var(--color-primary)] font-medium"
                  : "text-[var(--color-text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[var(--color-text)]"
              }`}
            >
              <span className="text-[15px] leading-none">{localeFlags[locale as Locale]}</span>
              <span>{localeNames[locale as Locale]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
