"use client";

import { useState, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";

interface BookmarkButtonProps {
  programSlug: string;
  lessonSlug: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({
  programSlug,
  lessonSlug,
  initialBookmarked,
}: BookmarkButtonProps) {
  const t = useTranslations("bookmarks");
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toggle = useCallback(async () => {
    if (pending) return;

    // Optimistic update
    const prev = bookmarked;
    setBookmarked(!prev);
    setPending(true);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programSlug, lessonSlug }),
      });

      if (!res.ok) {
        // Revert on error
        setBookmarked(prev);
        return;
      }

      const data = await res.json();
      setBookmarked(data.bookmarked);

      // Show brief toast
      setToast(data.bookmarked ? t("bookmarked") : t("removed"));
      setTimeout(() => setToast(null), 2000);
    } catch {
      setBookmarked(prev);
    } finally {
      setPending(false);
    }
  }, [bookmarked, pending, programSlug, lessonSlug, t]);

  const label = bookmarked ? t("removeBookmark") : t("bookmark");

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={toggle}
        disabled={pending}
        aria-label={label}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`
          relative inline-flex items-center justify-center
          w-9 h-9 rounded-full
          transition-all duration-200
          hover:scale-110 active:scale-95
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]
          ${bookmarked
            ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
          }
          ${pending ? "opacity-60 cursor-wait" : "cursor-pointer"}
        `}
      >
        <Bookmark
          size={18}
          fill={bookmarked ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>

      {/* Tooltip */}
      {showTooltip && !toast && (
        <span
          role="tooltip"
          className="
            absolute -top-9 left-1/2 -translate-x-1/2
            px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap
            bg-[var(--color-bg-card)] text-[var(--color-text)]
            border border-[var(--color-border)]
            shadow-sm pointer-events-none z-10
          "
        >
          {label}
        </span>
      )}

      {/* Toast */}
      {toast && (
        <span
          role="status"
          aria-live="polite"
          className="
            absolute -top-9 left-1/2 -translate-x-1/2
            px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap
            bg-[var(--color-primary)] text-white
            shadow-sm pointer-events-none z-10
            animate-[fadeIn_0.2s_ease-out]
          "
        >
          {toast}
        </span>
      )}
    </span>
  );
}
