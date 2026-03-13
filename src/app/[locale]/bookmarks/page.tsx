"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Bookmark, X, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import { locales } from "@/i18n/request";

interface BookmarkItem {
  id: string;
  programSlug: string;
  lessonSlug: string;
  createdAt: string;
  programColor: string;
  programIcon: string;
  lessonIcon: string;
  lessonDescription: string;
  lessonDifficulty: string;
  lessonDuration: number;
}

function BookmarkCard({
  bookmark,
  onRemove,
  basePath,
}: {
  bookmark: BookmarkItem;
  onRemove: (id: string) => void;
  basePath: string;
}) {
  const tB = useTranslations("bookmarks");
  const tP = useTranslations("programs");
  const tLT = useTranslations("lessonTitles");
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";

  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programSlug: bookmark.programSlug,
          lessonSlug: bookmark.lessonSlug,
        }),
      });
      if (res.ok) {
        onRemove(bookmark.id);
      }
    } catch {
      // ignore
    } finally {
      setRemoving(false);
    }
  };

  const date = new Date(bookmark.createdAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="
        group relative rounded-2xl p-5
        border border-[var(--color-border)]
        bg-[var(--color-bg-card)]
        backdrop-blur-sm
        hover:border-[var(--color-primary)]/40
        hover:shadow-lg hover:shadow-[var(--color-primary)]/5
        transition-all duration-300
      "
    >
      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={removing}
        aria-label={tB("removeBookmark")}
        className="
          absolute top-3 right-3
          w-7 h-7 rounded-full
          flex items-center justify-center
          text-[var(--color-text-muted)]
          hover:text-red-500 hover:bg-red-500/10
          opacity-0 group-hover:opacity-100
          transition-all duration-200
          focus-visible:opacity-100
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500
        "
      >
        <X size={14} />
      </button>

      {/* Program badge */}
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-3"
        style={{ backgroundColor: `${bookmark.programColor}15`, color: bookmark.programColor }}
      >
        <span>{bookmark.programIcon}</span>
        {tP(`${bookmark.programSlug}.title`)}
      </span>

      {/* Lesson info */}
      <Link
        href={`${basePath}/programs/${bookmark.programSlug}/lessons/${bookmark.lessonSlug}`}
        className="block group/link"
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl shrink-0">{bookmark.lessonIcon}</span>
          <h3 className="font-semibold text-[var(--color-text)] group-hover/link:text-[var(--color-primary)] transition-colors leading-snug">
            {tLT(bookmark.lessonSlug)}
          </h3>
        </div>

        {bookmark.lessonDescription && (
          <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2">
            {bookmark.lessonDescription}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">
            {tB("addedOn")} {date}
          </span>
          <ArrowRight
            size={14}
            className="text-[var(--color-text-muted)] group-hover/link:text-[var(--color-primary)] group-hover/link:translate-x-0.5 transition-all"
          />
        </div>
      </Link>
    </div>
  );
}

export default function BookmarksPage() {
  const t = useTranslations("bookmarks");
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((data) => setBookmarks(data.bookmarks ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  const handleRemove = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Redirect to sign in if not authenticated
  if (status !== "loading" && !session?.user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <AnimatedSection animation="fade-up">
          <Bookmark size={48} className="mx-auto mb-4 text-[var(--color-text-muted)]" />
          <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
          <p className="text-[var(--color-text-muted)] mb-6">{t("description")}</p>
          <Link
            href={`${basePath}/signin`}
            className="
              inline-flex items-center gap-2 px-6 py-2.5
              text-sm font-semibold rounded-full text-white
              transition-all hover:scale-105
            "
            style={{
              background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
              boxShadow: "0 2px 8px var(--color-primary-glow)",
            }}
          >
            Sign in to view bookmarks
          </Link>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      {/* Header */}
      <AnimatedSection animation="fade-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
            <Bookmark size={16} />
            {t("title")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg">
            {t("description")}
          </p>
        </div>
      </AnimatedSection>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse"
            >
              <div className="h-5 w-24 rounded-full bg-[var(--color-border)] mb-4" />
              <div className="h-5 w-full rounded bg-[var(--color-border)] mb-2" />
              <div className="h-4 w-2/3 rounded bg-[var(--color-border)]" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && bookmarks.length === 0 && (
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="text-center py-16">
            <div
              className="
                inline-flex items-center justify-center
                w-20 h-20 rounded-2xl mb-6
                bg-[var(--color-primary)]/10
              "
            >
              <Bookmark size={36} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t("empty")}</h2>
            <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
              {t("emptyDescription")}
            </p>
            <Link
              href={`${basePath}/programs`}
              className="
                inline-flex items-center gap-2 px-6 py-2.5
                text-sm font-semibold rounded-full text-white
                transition-all hover:scale-105
              "
              style={{
                background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
                boxShadow: "0 2px 8px var(--color-primary-glow)",
              }}
            >
              {t("browsePrograms")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </AnimatedSection>
      )}

      {/* Bookmarks grid */}
      {!loading && bookmarks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((b, i) => (
            <AnimatedSection key={b.id} animation="fade-up" delay={i * 60}>
              <BookmarkCard bookmark={b} onRemove={handleRemove} basePath={basePath} />
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
