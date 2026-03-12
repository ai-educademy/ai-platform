"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STORAGE_KEY = "aieducademy-feedback";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

interface FeedbackEntry {
  lessonSlug: string;
  helpful: boolean;
  comment: string;
  timestamp: string;
}

interface LessonFeedbackProps {
  lessonSlug: string;
  programSlug?: string;
  locale?: string;
}

function saveToLocalStorage(lessonSlug: string, isHelpful: boolean, text: string) {
  try {
    const existing: FeedbackEntry[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    existing.push({
      lessonSlug,
      helpful: isHelpful,
      comment: text,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage unavailable
  }
}

export function LessonFeedback({ lessonSlug, programSlug, locale }: LessonFeedbackProps) {
  const t = useTranslations("feedback");
  const { isCompleted } = useProgress(programSlug);
  const noMotion = useReducedMotion();
  const [step, setStep] = useState<"ask" | "comment" | "done">("ask");
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const completionKey = programSlug ? `${programSlug}/${lessonSlug}` : lessonSlug;
  const lessonComplete = isCompleted(completionKey);

  if (!lessonComplete) return null;

  const saveFeedback = async (isHelpful: boolean, text: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug,
          programSlug: programSlug || "unknown",
          rating: isHelpful ? "up" : "down",
          comment: text || undefined,
          locale: locale || "en",
        }),
      });
      if (!res.ok) throw new Error("API failed");
      saveToLocalStorage(lessonSlug, isHelpful, text);
    } catch {
      saveToLocalStorage(lessonSlug, isHelpful, text);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    setStep("comment");
  };

  const handleSubmit = async () => {
    if (helpful === null) return;
    await saveFeedback(helpful, comment);
    setStep("done");
  };

  return (
    <div
      className="mt-10 p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
      style={noMotion ? undefined : { animation: `fade-up 0.4s ${EASE} both` }}
    >
      {step === "ask" && (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">{t("title")}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleVote(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:bg-[var(--color-accent)]/10 transition-all cursor-pointer min-h-[48px] hover:scale-[1.04] active:scale-[0.96]"
            >
              <ThumbsUp size={20} />
              <span className="text-sm font-medium">{t("helpful")}</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] active:bg-[var(--color-secondary)]/10 transition-all cursor-pointer min-h-[48px] hover:scale-[1.04] active:scale-[0.96]"
            >
              <ThumbsDown size={20} />
              <span className="text-sm font-medium">{t("notHelpful")}</span>
            </button>
          </div>
        </div>
      )}

      {step === "comment" && (
        <div
          className="space-y-4"
          style={noMotion ? undefined : { animation: `fade-up 0.3s ${EASE} both` }}
        >
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("tellUsMore")}
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            disabled={loading}
            className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-base disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || helpful === null}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 active:brightness-90 transition-all cursor-pointer min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t("submit")}
          </button>
        </div>
      )}

      {step === "done" && (
        <p
          className="text-center text-[var(--color-accent)] font-semibold py-2"
          style={noMotion ? undefined : { animation: `scale-in 0.4s ${EASE} both` }}
        >
          ✅ {t("thanks")}
        </p>
      )}
    </div>
  );
}
