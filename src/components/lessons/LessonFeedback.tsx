"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const STORAGE_KEY = "open-ai-school-feedback";

interface FeedbackEntry {
  lessonSlug: string;
  helpful: boolean;
  comment: string;
  timestamp: string;
}

export function LessonFeedback({ lessonSlug }: { lessonSlug: string }) {
  const t = useTranslations("feedback");
  const [step, setStep] = useState<"ask" | "comment" | "done">("ask");
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");

  const saveFeedback = (isHelpful: boolean, text: string) => {
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
  };

  const handleVote = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    setStep("comment");
  };

  const handleSubmit = () => {
    saveFeedback(helpful!, comment);
    setStep("done");
  };

  return (
    <div className="mt-10 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
      {step === "ask" && (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">{t("title")}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleVote(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all cursor-pointer min-h-[48px]"
            >
              <ThumbsUp size={20} />
              <span className="text-sm font-medium">{t("helpful")}</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-all cursor-pointer min-h-[48px]"
            >
              <ThumbsDown size={20} />
              <span className="text-sm font-medium">{t("notHelpful")}</span>
            </button>
          </div>
        </div>
      )}

      {step === "comment" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("tellUsMore")}
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
          />
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all cursor-pointer min-h-[48px]"
          >
            {t("submit")}
          </button>
        </div>
      )}

      {step === "done" && (
        <p className="text-center text-[var(--color-accent)] font-semibold">
          {t("thanks")}
        </p>
      )}
    </div>
  );
}
