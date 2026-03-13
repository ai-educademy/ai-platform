"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTheme } from "@ai-educademy/ai-ui-library";
import {
  Search,
  X,
  ArrowRight,
  BookOpen,
  FileText,
  FlaskConical,
  Zap,
  Sun,
  Moon,
  Github,
  LogIn,
  LogOut,
  Home,
  Info,
  Mail,
  HelpCircle,
  CreditCard,
  LayoutDashboard,
  Mic,
  Shield,
  Scale,
  CornerDownLeft,
  Sparkles,
  MapIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import programsData from "@data/programs.json";

/* ─── Types ─── */

type CommandCategory = "recent" | "programs" | "pages" | "lab" | "actions";

interface CommandItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: CommandCategory;
  keywords: string;
  href?: string;
  action?: () => void;
}

/* ─── Programs data ─── */

interface ProgramEntry {
  slug: string;
  icon: string;
  level: number;
  track: string;
}

const PROGRAMS: ProgramEntry[] = Object.entries(programsData.programs)
  .map(([slug, data]) => ({
    slug,
    icon: data.icon,
    level: data.level,
    track: data.track,
  }))
  .sort((a, b) => a.level - b.level);

/* ─── Lab experiments ─── */

const LAB_EXPERIMENTS = [
  { slug: "neural-playground", icon: "🧠", label: "Neural Playground" },
  { slug: "ai-or-human", icon: "🤖", label: "AI or Human" },
  { slug: "prompt-lab", icon: "💬", label: "Prompt Engineering" },
  { slug: "image-gen", icon: "🎨", label: "Image Generation" },
  { slug: "sentiment", icon: "😊", label: "Sentiment Analysis" },
  { slug: "chatbot", icon: "💡", label: "AI Chat" },
  { slug: "ethics-sim", icon: "⚖️", label: "Ethics Scenarios" },
];

/* ─── Pages ─── */

const PAGES = [
  { slug: "", label: "Home", icon: <Home className="w-4 h-4" /> },
  { slug: "about", label: "About", icon: <Info className="w-4 h-4" /> },
  { slug: "contact", label: "Contact", icon: <Mail className="w-4 h-4" /> },
  { slug: "blog", label: "Blog", icon: <FileText className="w-4 h-4" /> },
  { slug: "journey", label: "Journey", icon: <MapIcon className="w-4 h-4" /> },
  { slug: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
  { slug: "pricing", label: "Pricing", icon: <CreditCard className="w-4 h-4" /> },
  { slug: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { slug: "lab", label: "Lab", icon: <FlaskConical className="w-4 h-4" /> },
  { slug: "mock-interview", label: "Mock Interview", icon: <Mic className="w-4 h-4" /> },
  { slug: "onboarding", label: "Onboarding", icon: <Sparkles className="w-4 h-4" /> },
  { slug: "privacy", label: "Privacy Policy", icon: <Shield className="w-4 h-4" /> },
  { slug: "terms", label: "Terms of Service", icon: <Scale className="w-4 h-4" /> },
];

/* ─── Recent searches (localStorage) ─── */

const RECENT_KEY = "cmd-palette-recent";
const MAX_RECENT = 5;

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecent(id: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = getRecent().filter((r) => r !== id);
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev].slice(0, MAX_RECENT)));
  } catch {
    /* noop */
  }
}

/* ─── Category labels and icons ─── */

const CATEGORY_META: Record<CommandCategory, { label: string; icon: React.ReactNode }> = {
  recent: { label: "Recent", icon: <ArrowRight className="w-3.5 h-3.5" /> },
  programs: { label: "Programs", icon: <BookOpen className="w-3.5 h-3.5" /> },
  pages: { label: "Pages", icon: <FileText className="w-3.5 h-3.5" /> },
  lab: { label: "Lab Experiments", icon: <FlaskConical className="w-3.5 h-3.5" /> },
  actions: { label: "Actions", icon: <Zap className="w-3.5 h-3.5" /> },
};

/* ─── Track label helper ─── */

const TRACK_LABELS: Record<string, string> = {
  "ai-learning": "AI Learning",
  "craft-engineering": "Craft & Engineering",
  "career-ready": "Career Ready",
};

/* ═══════════════════════════════════════════════════ */
/* ─── CommandPalette Component ─── */
/* ═══════════════════════════════════════════════════ */

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const tP = useTranslations("programs");
  const tNav = useTranslations("nav");
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();

  const basePath = locale === "en" ? "" : `/${locale}`;

  /* ─── Build all command items ─── */

  const allCommands = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [];

    // Programs
    for (const p of PROGRAMS) {
      const title = tP(`${p.slug}.title` as never);
      items.push({
        id: `program-${p.slug}`,
        title,
        icon: <span className="text-base leading-none">{p.icon}</span>,
        category: "programs",
        keywords: `${title} ${p.slug.replace(/-/g, " ")} ${p.track} ${TRACK_LABELS[p.track] || ""}`,
        href: `${basePath}/programs/${p.slug}`,
      });
    }

    // Pages
    for (const page of PAGES) {
      items.push({
        id: `page-${page.slug || "home"}`,
        title: page.label,
        icon: page.icon,
        category: "pages",
        keywords: `${page.label} ${page.slug}`,
        href: `${basePath}/${page.slug}`,
      });
    }

    // Lab experiments
    for (const exp of LAB_EXPERIMENTS) {
      items.push({
        id: `lab-${exp.slug}`,
        title: exp.label,
        icon: <span className="text-base leading-none">{exp.icon}</span>,
        category: "lab",
        keywords: `${exp.label} ${exp.slug.replace(/-/g, " ")} lab experiment`,
        href: `${basePath}/lab`,
      });
    }

    // Actions
    items.push({
      id: "action-theme",
      title: resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      icon: resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      category: "actions",
      keywords: "toggle theme dark light mode appearance",
      action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    });

    items.push({
      id: "action-github",
      title: "Go to GitHub",
      icon: <Github className="w-4 h-4" />,
      category: "actions",
      keywords: "github source code repository open source",
      action: () => window.open("https://github.com/ai-educademy", "_blank"),
    });

    if (session?.user) {
      items.push({
        id: "action-signout",
        title: "Sign Out",
        icon: <LogOut className="w-4 h-4" />,
        category: "actions",
        keywords: "sign out logout disconnect",
        href: `${basePath}/api/auth/signout`,
      });
    } else {
      items.push({
        id: "action-signin",
        title: "Sign In",
        icon: <LogIn className="w-4 h-4" />,
        category: "actions",
        keywords: "sign in login authenticate get started",
        href: `${basePath}/signin`,
      });
    }

    return items;
  }, [tP, basePath, resolvedTheme, setTheme, session]);

  /* ─── Filtered results ─── */

  const filteredResults = useMemo((): CommandItem[] => {
    if (!query.trim()) {
      // Show recent items first, then all categories
      const recentIds = getRecent();
      const recentItems: CommandItem[] = [];
      for (const id of recentIds) {
        const item = allCommands.find((c) => c.id === id);
        if (item) recentItems.push({ ...item, category: "recent" });
      }
      return [...recentItems, ...allCommands];
    }

    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    return allCommands.filter((item) => {
      const haystack = item.keywords.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [query, allCommands]);

  /* ─── Group results by category ─── */

  const groupedResults = useMemo(() => {
    const order: CommandCategory[] = ["recent", "programs", "pages", "lab", "actions"];
    const groups: { category: CommandCategory; items: CommandItem[] }[] = [];

    for (const cat of order) {
      const items = filteredResults.filter((r) => r.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    }
    return groups;
  }, [filteredResults]);

  /* ─── Flat list for keyboard navigation ─── */

  const flatResults = useMemo(
    () => groupedResults.flatMap((g) => g.items),
    [groupedResults],
  );

  /* ─── Execute a command ─── */

  const execute = useCallback(
    (item: CommandItem) => {
      addRecent(item.category === "recent" ? item.id.replace(/^recent-/, "") : item.id);
      setOpen(false);
      setQuery("");
      setSelectedIdx(0);

      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [router],
  );

  /* ─── Open / close handlers ─── */

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelectedIdx(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIdx(0);
  }, []);

  /* ─── Global Cmd+K / Ctrl+K listener ─── */

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIdx(0);
          }
          return !prev;
        });
      }
      if (e.key === "Escape" && open) {
        closePalette();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, closePalette]);

  /* ─── Focus input when opened ─── */

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* ─── Lock body scroll when open ─── */

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ─── Scroll selected item into view ─── */

  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected='true']");
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  /* ─── Keyboard nav inside input ─── */

  function handleInputKey(e: ReactKeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIdx]) {
        execute(flatResults[selectedIdx]);
      }
    } else if (e.key === "Escape") {
      closePalette();
    }
  }

  /* ─── Track label for program items ─── */

  function getTrackBadge(item: CommandItem): string | null {
    if (item.category !== "programs") return null;
    const slug = item.id.replace("program-", "");
    const prog = PROGRAMS.find((p) => p.slug === slug);
    return prog ? TRACK_LABELS[prog.track] || prog.track : null;
  }

  /* ─── Category badge for non-program items ─── */

  function getCategoryBadge(item: CommandItem): string {
    return CATEGORY_META[item.category]?.label || "";
  }

  /* ─── Precompute flat index map for each item ─── */

  const flatIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const group of groupedResults) {
      for (const item of group.items) {
        map.set(item.id, idx++);
      }
    }
    return map;
  }, [groupedResults]);

  return (
    <>
      {/* ─── Trigger Button ─── */}
      <button
        onClick={openPalette}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all duration-200 group"
        aria-label={tNav("searchAriaLabel")}
        title="⌘K"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline text-[11px] font-medium text-[var(--color-text-muted)]/60 border border-[var(--color-border)] rounded px-1 py-0.5 group-hover:border-[var(--color-text-muted)]/40 transition-colors">
          ⌘K
        </span>
      </button>

      {/* ─── Overlay + Modal ─── */}
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm cmd-palette-backdrop-in"
            onClick={closePalette}
            aria-hidden
          />

          {/* Modal container */}
          <div className="relative flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
            <div
              className="w-full max-w-[560px] rounded-2xl border border-[var(--color-border)] overflow-hidden cmd-palette-modal-in"
              style={{
                background: "var(--color-glass)",
                backdropFilter: "blur(24px) saturate(1.6)",
                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                boxShadow: "var(--shadow-lg), 0 0 0 1px var(--color-glass-border)",
              }}
            >
              {/* ─── Search Input ─── */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
                <Search className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIdx(0);
                  }}
                  onKeyDown={handleInputKey}
                  placeholder="Search or jump to..."
                  className="flex-1 bg-transparent text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedIdx(0);
                      inputRef.current?.focus();
                    }}
                    className="p-0.5 rounded hover:bg-[var(--color-text)]/[0.06] transition-colors"
                  >
                    <X className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center text-[11px] font-medium text-[var(--color-text-muted)]/60 border border-[var(--color-border)] rounded px-1.5 py-0.5 shrink-0 select-none">
                  ESC
                </kbd>
              </div>

              {/* ─── Results ─── */}
              <div
                ref={listRef}
                className="max-h-[50vh] overflow-y-auto overscroll-contain"
                role="listbox"
              >
                {flatResults.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]/50 mt-1">
                      Try searching for programs, pages, or actions
                    </p>
                  </div>
                ) : (
                  groupedResults.map((group) => {
                    const header = (
                      <div
                        key={`header-${group.category}`}
                        className="flex items-center gap-2 px-4 pt-3 pb-1.5"
                      >
                        <span className="text-[var(--color-text-muted)]/60">
                          {CATEGORY_META[group.category].icon}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]/60">
                          {CATEGORY_META[group.category].label}
                        </span>
                        <span className="text-[10px] font-medium text-[var(--color-text-muted)]/40 ml-auto">
                          {group.items.length}
                        </span>
                      </div>
                    );

                    const items = group.items.map((item) => {
                      const currentFlatIdx = flatIndexMap.get(item.id) ?? 0;
                      const isSelected = currentFlatIdx === selectedIdx;
                      const trackBadge = getTrackBadge(item);
                      const badge = trackBadge || getCategoryBadge(item);

                      return (
                        <button
                          key={item.id}
                          role="option"
                          aria-selected={isSelected}
                          data-selected={isSelected}
                          onClick={() => execute(item)}
                          onMouseEnter={() => setSelectedIdx(currentFlatIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100 ${
                            isSelected
                              ? "bg-[var(--color-primary)]/[0.08] text-[var(--color-text)]"
                              : "text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.03]"
                          }`}
                          style={
                            isSelected
                              ? {
                                  boxShadow:
                                    "inset 3px 0 0 0 var(--color-primary)",
                                }
                              : undefined
                          }
                        >
                          {/* Icon */}
                          <span
                            className={`shrink-0 ${
                              isSelected
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text-muted)]"
                            }`}
                          >
                            {item.icon}
                          </span>

                          {/* Title */}
                          <span className="flex-1 text-sm font-medium truncate">
                            {item.title}
                          </span>

                          {/* Badge */}
                          {badge && (
                            <span className="hidden sm:inline text-[10px] font-medium text-[var(--color-text-muted)]/50 bg-[var(--color-text)]/[0.04] border border-[var(--color-border)]/50 rounded-full px-2 py-0.5 shrink-0">
                              {badge}
                            </span>
                          )}

                          {/* Enter hint for selected */}
                          {isSelected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-[var(--color-primary)]/60 shrink-0" />
                          )}
                        </button>
                      );
                    });

                    return (
                      <div key={group.category}>
                        {header}
                        {items}
                      </div>
                    );
                  })
                )}
              </div>

              {/* ─── Footer ─── */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]/50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] text-[10px] font-mono">
                      ↑↓
                    </kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] text-[10px] font-mono">
                      ↵
                    </kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] text-[10px] font-mono">
                      esc
                    </kbd>
                    close
                  </span>
                </div>
                <span className="hidden sm:block">
                  {flatResults.length} result{flatResults.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
