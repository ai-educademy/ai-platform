"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MessageCircle, Trash2, Loader2, Send } from "lucide-react";

/* ────────────── Types ────────────── */

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string | null;
  userImage: string | null;
  userRole: string;
}

interface Props {
  lessonSlug: string;
  programSlug: string;
}

/* ────────────── Helpers ────────────── */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function getInitial(name: string | null): string {
  return (name ?? "?").charAt(0).toUpperCase();
}

const MAX_CHARS = 2000;

/* ────────────── Component ────────────── */

export function LessonComments({ lessonSlug, programSlug }: Props) {
  const { data: session } = useSession();
  const t = useTranslations("comments");
  const locale = useLocale();
  const basePath = locale === "en" ? "" : `/${locale}`;
  const userId = session?.user?.id;
  const userRole = (session?.user as { role?: string })?.role;

  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Fetch comments ── */
  const fetchComments = useCallback(
    async (offset = 0, append = false) => {
      try {
        const res = await fetch(
          `/api/comments?lesson=${encodeURIComponent(lessonSlug)}&program=${encodeURIComponent(programSlug)}&offset=${offset}`
        );
        if (!res.ok) throw new Error("Failed to load comments");
        const data = await res.json();
        setComments((prev) =>
          append ? [...prev, ...data.comments] : data.comments
        );
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        setError(t("loadError"));
      }
    },
    [lessonSlug, programSlug, t]
  );

  useEffect(() => {
    setLoading(true);
    fetchComments().finally(() => setLoading(false));
  }, [fetchComments]);

  /* ── Load more ── */
  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchComments(comments.length, true);
    setLoadingMore(false);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug,
          programSlug,
          content: trimmed,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to post comment");
      }

      setContent("");
      await fetchComments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("postError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;

    setDeletingId(id);
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setComments((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      setError(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Keyboard submit ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <MessageCircle size={22} className="text-[var(--color-primary)]" />
        <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>
        {!loading && (
          <span className="text-sm text-[var(--color-text-muted)] font-medium ml-1">
            ({total})
          </span>
        )}
      </div>

      {/* Composer */}
      {session?.user ? (
        <div className="mb-10">
          <div
            className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] p-4"
            style={{
              background: "var(--color-glass)",
              backdropFilter: "saturate(180%) blur(20px)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              rows={3}
              className="w-full bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] resize-none outline-none text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
              <span
                className={`text-xs ${
                  content.length >= MAX_CHARS
                    ? "text-red-500 font-medium"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {content.length}/{MAX_CHARS}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">
                  {t("sendHint")}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                  }}
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {t("post")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mb-10 rounded-[var(--radius-md)] border border-[var(--color-glass-border)] p-6 text-center"
          style={{
            background: "var(--color-glass)",
            backdropFilter: "saturate(180%) blur(20px)",
          }}
        >
          <p className="text-sm text-[var(--color-text-muted)]">
            <Link
              href={`${basePath}/signin`}
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              {t("signIn")}
            </Link>{" "}
            {t("signInSuffix")}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] p-4 animate-pulse"
              style={{
                background: "var(--color-glass)",
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-border)]" />
                <div className="h-3 w-24 rounded bg-[var(--color-border)]" />
                <div className="h-3 w-12 rounded bg-[var(--color-border)] ml-auto" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-[var(--color-border)]" />
                <div className="h-3 w-3/4 rounded bg-[var(--color-border)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <MessageCircle
            size={40}
            className="mx-auto mb-3 opacity-30"
          />
          <p className="text-sm">{t("empty")}</p>
        </div>
      )}

      {/* Comment list */}
      {!loading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((c, i) => (
            <div
              key={c.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] p-4 transition-all duration-300"
              style={{
                background: "var(--color-glass)",
                backdropFilter: "saturate(180%) blur(20px)",
                animation: `commentIn 0.35s ease-out ${i * 60}ms both`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {c.userImage ? (
                  <img
                    src={c.userImage}
                    alt={c.userName ?? t("userAvatar")}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-secondary, #ec4899))",
                    }}
                  >
                    {getInitial(c.userName)}
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {c.userName ?? t("anonymous")}
                    </span>
                    {c.userRole === "admin" && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white leading-none">
                        Admin
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                </div>

                {/* Delete */}
                {(userId === c.userId || userRole === "admin") && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="shrink-0 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    title={t("deleteComment")}
                    aria-label={t("deleteComment")}
                  >
                    {deletingId === c.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[var(--radius-sm)] text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
          >
            {loadingMore && <Loader2 size={14} className="animate-spin" />}
            Load more
          </button>
        </div>
      )}

      {/* Entrance animation keyframes */}
      <style>{`
        @keyframes commentIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
