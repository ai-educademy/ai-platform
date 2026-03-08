"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface ProgramEntry {
  slug: string;
  icon: string;
  level: number;
}

interface LessonEntry {
  slug: string;
  programSlug: string;
  programIcon: string;
}

const PROGRAMS: ProgramEntry[] = [
  { slug: "ai-seeds", icon: "🌱", level: 1 },
  { slug: "ai-sprouts", icon: "🌿", level: 2 },
  { slug: "ai-branches", icon: "🌳", level: 3 },
  { slug: "ai-canopy", icon: "🏕️", level: 4 },
  { slug: "ai-forest", icon: "🌲", level: 5 },
  { slug: "ai-sketch", icon: "✏️", level: 1 },
  { slug: "ai-chisel", icon: "🪨", level: 2 },
  { slug: "ai-craft", icon: "⚒️", level: 3 },
  { slug: "ai-polish", icon: "💎", level: 4 },
  { slug: "ai-masterpiece", icon: "🏆", level: 5 },
];

export function NavSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const tPT = useTranslations("programTitles");
  const tLT = useTranslations("lessonTitles");
  const tNav = useTranslations("nav");

  const basePath = locale === "en" ? "" : `/${locale}`;

  // Build searchable lesson list from i18n keys
  const lessons = useMemo(() => {
    const result: LessonEntry[] = [];
    // We derive lesson→program mapping from known structure
    const PROGRAM_LESSONS: Record<string, string[]> = {};
    // Populate from lessonTitles keys (we'll search all available)
    return result;
  }, []);

  const programResults = useMemo(() => {
    if (!query.trim()) return PROGRAMS.slice(0, 5);
    const q = query.toLowerCase();
    return PROGRAMS.filter((p) => {
      const title = tPT(p.slug as never);
      return (
        title.toLowerCase().includes(q) ||
        p.slug.replace(/-/g, " ").includes(q)
      );
    });
  }, [query, tPT]);

  const allResults = useMemo(() => {
    return programResults.map((p) => ({
      type: "program" as const,
      slug: p.slug,
      icon: p.icon,
      title: tPT(p.slug as never),
      href: `${basePath}/programs/${p.slug}`,
    }));
  }, [programResults, tPT, basePath]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setSelectedIdx(-1);
      router.push(href);
    },
    [router],
  );

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Arrow key navigation in results
  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIdx >= 0 && allResults[selectedIdx]) {
      e.preventDefault();
      navigate(allResults[selectedIdx].href);
    } else if (e.key === "Enter" && allResults.length === 1) {
      e.preventDefault();
      navigate(allResults[0].href);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all duration-200 group"
          aria-label={tNav("searchAriaLabel")}
          title="⌘K"
        >
          <Search className="w-4 h-4" />
          <span className="hidden lg:inline text-[11px] font-medium text-[var(--color-text-muted)]/60 border border-[var(--color-border)] rounded px-1 py-0.5 group-hover:border-[var(--color-text-muted)]/40">
            ⌘K
          </span>
        </button>
      )}

      {/* Expanded search */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 animate-fade-in">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden w-[280px] sm:w-[320px]">
            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)]">
              <Search className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIdx(-1);
                }}
                onKeyDown={handleInputKey}
                placeholder={tNav("programs") + "..."}
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
                  <X className="w-3.5 h-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] font-medium text-[var(--color-text-muted)]/60 border border-[var(--color-border)] rounded px-1 py-0.5 hover:bg-[var(--color-bg)]"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto overscroll-contain">
              {allResults.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  {tNav("noResults")}
                </div>
              ) : (
                <div className="py-1">
                  {allResults.map((r, i) => (
                    <button
                      key={r.slug}
                      onClick={() => navigate(r.href)}
                      onMouseEnter={() => setSelectedIdx(i)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                        selectedIdx === i
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                      }`}
                    >
                      <span className="text-base shrink-0">{r.icon}</span>
                      <span className="text-sm font-medium truncate">{r.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
