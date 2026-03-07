"use client";

import { useTheme } from "@ai-educademy/ai-ui-library";
import { useTranslations } from "next-intl";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("ui");
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center rounded-lg bg-black/[0.04] dark:bg-white/[0.06] p-[3px] shrink-0">
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
          compact ? "px-1.5 py-1.5" : "px-2.5 py-1.5"
        } ${
          !isDark
            ? "bg-white text-amber-600 shadow-sm"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        }`}
        aria-label="Light mode"
        aria-pressed={!isDark}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        {!compact && <span>{t("light")}</span>}
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
          compact ? "px-1.5 py-1.5" : "px-2.5 py-1.5"
        } ${
          isDark
            ? "bg-indigo-500/15 text-indigo-400 shadow-sm"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        }`}
        aria-label="Dark mode"
        aria-pressed={isDark}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        {!compact && <span>{t("dark")}</span>}
      </button>
    </div>
  );
}
