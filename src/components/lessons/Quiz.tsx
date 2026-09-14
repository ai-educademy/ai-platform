"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useQuizContext } from "./QuizContext";

interface QuizProps {
  question: string;
  options: string[] | string;
  answer?: number | string;
  /**
   * Alias for `answer`. Part of the content corpus was authored as
   * `correct={1}` rather than `answer="1"`. Only `answer` was ever read, so
   * those quizzes silently fell back to index 0 and marked the wrong option as
   * correct. Accepting both keeps the existing content working.
   */
  correct?: number | string;
  explanation?: string;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Parses an answer index, tolerating both the string and numeric spellings. */
export function parseAnswerIndex(value: number | string | undefined): number {
  if (typeof value === "number") return Number.isInteger(value) && value >= 0 ? value : 0;
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function Quiz({
  question,
  options: rawOptions,
  answer: rawAnswer,
  correct: rawCorrect,
  explanation,
}: QuizProps) {
  const t = useTranslations("lessons");
  const noMotion = useReducedMotion();
  const { registerQuiz, markQuizPassed } = useQuizContext();
  const options = Array.isArray(rawOptions)
    ? rawOptions
    : typeof rawOptions === "string"
      ? rawOptions.split("|")
      : [];
  const answer = parseAnswerIndex(rawAnswer ?? rawCorrect);

  // Stable quiz ID derived from question text
  const quizId = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < question.length; i++) {
      hash = ((hash << 5) - hash + question.charCodeAt(i)) | 0;
    }
    return `quiz-${Math.abs(hash)}`;
  }, [question]);

  // Register this quiz with the context on mount
  useEffect(() => {
    if (options.length > 0) registerQuiz(quizId);
  }, [quizId, registerQuiz, options.length]);

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: "-40px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSelect = useCallback(
    (idx: number) => { if (!revealed) setSelected(idx); },
    [revealed]
  );

  const handleCheck = useCallback(() => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === answer) {
      markQuizPassed(quizId);
    } else {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
  }, [selected, answer, markQuizPassed, quizId]);

  const handleRetry = useCallback(() => {
    setSelected(null);
    setRevealed(false);
    setShakeWrong(false);
  }, []);

  const isCorrect = selected === answer;

  // Must sit below every hook call: returning earlier changes the hook count
  // between renders and trips "Rendered fewer hooks than expected".
  if (!options.length) return null;

  return (
    <div
      ref={containerRef}
      className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden"
      style={noMotion ? undefined : {
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(24px)",
        transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
      }}
    >
      <div className="px-5 sm:px-6 py-4 bg-[var(--color-primary)]/8 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
          <span className="text-lg">🧠</span>
          {t("quickCheck")}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-lg font-medium text-[var(--color-text)] mb-5">
          {question}
        </p>

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
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex items-center gap-3 min-h-[48px] ${style} ${
                  isWrongSelected && shakeWrong && !noMotion ? "animate-shake" : ""
                } ${revealed && idx === answer && !noMotion ? "animate-pulse-once" : ""}`}
                style={noMotion ? undefined : {
                  transitionDelay: `${idx * 50}ms`,
                }}
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
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {revealed && selected === idx && idx !== answer && (
                  <svg className="w-5 h-5 text-red-400 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {!revealed ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-primary)]/25 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] hover:scale-[1.03]"
          >
            {t("checkAnswer")}
          </button>
        ) : (
          <div
            className="space-y-4"
            style={noMotion ? undefined : { animation: `fade-up 0.4s ${EASE} both` }}
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                isCorrect
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
              style={noMotion ? undefined : { animation: `scale-in 0.4s ${EASE} both` }}
            >
              <span className="text-xl">{isCorrect ? "🎉" : "💡"}</span>
              {isCorrect ? t("quizCorrect") : t("quizIncorrect")}
            </div>

            {explanation && (
              <div
                className="px-4 py-3 rounded-xl bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)] leading-relaxed"
                style={noMotion ? undefined : { animation: `fade-in 0.4s ease 200ms both` }}
              >
                {explanation}
              </div>
            )}

            {!isCorrect && (
              <button
                onClick={handleRetry}
                className="px-5 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] active:scale-[0.97] transition-all min-h-[44px] hover:scale-[1.02]"
              >
                {t("tryAgain")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
