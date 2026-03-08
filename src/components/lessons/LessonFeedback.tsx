"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const STORAGE_KEY = "aieducademy-feedback";

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
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;
  const [step, setStep] = useState<"ask" | "comment" | "done">("ask");
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Build the completion key the same way LessonComplete does
  const completionKey = programSlug ? `${programSlug}/${lessonSlug}` : lessonSlug;
  const lessonComplete = isCompleted(completionKey);

  // Only show feedback after the lesson is marked complete
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
      // Fallback to localStorage if API fails
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
    if (helpful === null) return; // validation: thumb required
    await saveFeedback(helpful, comment);
    setStep("done");
  };

  return (
    <motion.div
      className="mt-10 p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
      initial={noMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        {step === "ask" && (
          <motion.div
            key="ask"
            className="text-center space-y-4"
            initial={noMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={noMotion ? undefined : { opacity: 0, y: -8 }}
          >
            <p className="text-lg font-semibold">{t("title")}</p>
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={() => handleVote(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:bg-[var(--color-accent)]/10 transition-all cursor-pointer min-h-[48px]"
                whileHover={noMotion ? undefined : { scale: 1.04 }}
                whileTap={noMotion ? undefined : { scale: 0.96 }}
              >
                <ThumbsUp size={20} />
                <span className="text-sm font-medium">{t("helpful")}</span>
              </motion.button>
              <motion.button
                onClick={() => handleVote(false)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] active:bg-[var(--color-secondary)]/10 transition-all cursor-pointer min-h-[48px]"
                whileHover={noMotion ? undefined : { scale: 1.04 }}
                whileTap={noMotion ? undefined : { scale: 0.96 }}
              >
                <ThumbsDown size={20} />
                <span className="text-sm font-medium">{t("notHelpful")}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "comment" && (
          <motion.div
            key="comment"
            className="space-y-4"
            initial={noMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={noMotion ? undefined : { opacity: 0 }}
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
            <motion.button
              onClick={handleSubmit}
              disabled={loading || helpful === null}
              className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 active:brightness-90 transition-all cursor-pointer min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={noMotion ? undefined : { scale: 1.03 }}
              whileTap={noMotion ? undefined : { scale: 0.97 }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {t("submit")}
            </motion.button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.p
            key="done"
            className="text-center text-[var(--color-accent)] font-semibold py-2"
            initial={noMotion ? undefined : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            ✅ {t("thanks")}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
