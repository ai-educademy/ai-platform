"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { LessonComments } from "@/components/lessons/LessonComments";

/**
 * Blog comments, reusing the platform's existing GitHub-authenticated comment
 * system (the same one used on lessons) so there is one consistent discussion
 * feature, one moderation path and full i18n.
 *
 * The thread is deferred behind a click: the underlying component fetches from
 * `/api/comments` on mount, and the blog is the highest-traffic surface, so
 * loading on demand keeps serverless function invocations (a hard quota on the
 * free tier) proportional to readers who actually engage rather than every view.
 * Comments are namespaced under a synthetic "blog" programme so they never
 * collide with lesson threads.
 */
export function BlogComments({ slug }: { slug: string }) {
  const t = useTranslations("comments");
  const [open, setOpen] = useState(false);

  if (open) {
    return <LessonComments lessonSlug={slug} programSlug="blog" />;
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {t("title")}
    </button>
  );
}

export default BlogComments;
