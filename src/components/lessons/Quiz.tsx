"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface QuizProps {
  question: string;
  /** Accepts a string[] or a pipe-separated string "A|B|C|D" */
  options: string[] | string;
  /** Accepts a number or numeric string */
  answer: number | string;
  explanation?: string;
}

/**
 * Interactive multiple-choice quiz with animation feedback.
 *
 * Usage in MDX (pipe-separated strings work reliably with next-mdx-remote RSC):
 *   <Quiz
 *     question="What does AI learn from?"
 *     options="Magic|Data|The internet|Electricity"
 *     answer="1"
 *     explanation="AI systems learn patterns from data — millions of examples!"
 *   />
 */
export function Quiz({ question, options: rawOptions, answer: rawAnswer, explanation }: QuizProps) {
  const t = useTranslations("lessons");
  const prefersReduced = useReducedMotion();
  const options = Array.isArray(rawOptions)
    ? rawOptions
    : typeof rawOptions === "string"
      ? rawOptions.split("|")
      : [];
  const answer = typeof rawAnswer === "number" ? rawAnswer : parseInt(String(rawAnswer), 10) || 0;

  if (!options.length) return null;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);

  const handleSelect = useCallback(
    (idx: number) => {
      if (revealed) return;
      setSelected(idx);
    },
    [revealed]
  );

  const handleCheck = useCallback(() => {
    if (selected === null) return;
    setRevealed(true);
    if (selected !== answer) {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
  }, [selected, answer]);

  const handleRetry = useCallback(() => {
    setSelected(null);
    setRevealed(false);
    setShakeWrong(false);
  }, []);

  const isCorrect = selected === answer;
  const noMotion = !!prefersReduced;

  return (
    <motion.div
      className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden"
      initial={noMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
    >
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 bg-[var(--color-primary)]/8 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
          <span className="text-lg">🧠</span>
          {t("quickCheck")}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Question */}
        <motion.p
          className="text-lg font-medium text-[var(--color-text)] mb-5"
          initial={noMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {question}
        </motion.p>

        {/* Options */}
        <div className="space-y-2.5 mb-6">
          {options.map((opt, idx) => {
            let style = "border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 active:bg-[var(--color-primary)]/10";

            if (selected === idx && !revealed) {
              style = "border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/30";
            } else if (revealed && idx === answer) {
              style = "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30";
            } else if (revealed && selected === idx && idx !== answer) {
              style = "border-red-400 bg-red-400/10 ring-1 ring-red-400/30 line-through opacity-60";
            } else if (revealed) {
              style = "border-[var(--color-border)] opacity-40";
            }

            const isWrongSelected = revealed && selected === idx && idx !== answer;

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors duration-200 flex items-center gap-3 min-h-[48px] ${style}`}
                initial={noMotion ? undefined : { opacity: 0, x: -16 }}
                whileInView={noMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={noMotion ? undefined : { delay: 0.15 + idx * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                animate={
                  isWrongSelected && shakeWrong && !noMotion
                    ? { x: [0, -8, 8, -6, 6, -2, 2, 0] }
                    : revealed && idx === answer && !noMotion
                      ? { scale: [1, 1.03, 1] }
                      : undefined
                }
              >
                <span
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    selected === idx
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                  } ${revealed && idx === answer ? "border-emerald-500 bg-emerald-500 text-white" : ""}
                    ${revealed && selected === idx && idx !== answer ? "border-red-400 bg-red-400 text-white" : ""}`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-[var(--color-text)]">{opt}</span>
                {revealed && idx === answer && (
                  <svg className="w-5 h-5 text-emerald-500 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {revealed && selected === idx && idx !== answer && (
                  <svg className="w-5 h-5 text-red-400 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Action button */}
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="check"
              onClick={handleCheck}
              disabled={selected === null}
              className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-primary)]/25 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
              whileHover={noMotion ? undefined : { scale: 1.03 }}
              whileTap={noMotion ? undefined : { scale: 0.97 }}
            >
              {t("checkAnswer")}
            </motion.button>
          ) : (
            <motion.div
              key="result"
              className="space-y-4"
              initial={noMotion ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {/* Result banner */}
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  isCorrect
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
                initial={noMotion ? undefined : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <span className="text-xl">{isCorrect ? "🎉" : "💡"}</span>
                {isCorrect ? t("quizCorrect") : t("quizIncorrect")}
              </motion.div>

              {/* Explanation */}
              {explanation && (
                <motion.div
                  className="px-4 py-3 rounded-xl bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)] leading-relaxed"
                  initial={noMotion ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {explanation}
                </motion.div>
              )}

              {!isCorrect && (
                <motion.button
                  onClick={handleRetry}
                  className="px-5 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] active:scale-[0.97] transition-all min-h-[44px]"
                  whileHover={noMotion ? undefined : { scale: 1.02 }}
                  whileTap={noMotion ? undefined : { scale: 0.97 }}
                >
                  {t("tryAgain")}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
