"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback, useEffect } from "react";
import { savePersonalBest } from "./GameCard";
import ConfettiCelebration from "./ConfettiCelebration";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const GAME_ROUNDS = [
  { text: "The sunset painted the sky in hues of amber and violet, a daily masterpiece that most people barely noticed as they rushed home from work.", author: "human" as const, source: "Personal blog post" },
  { text: "In the tapestry of human experience, love serves as both the warp and weft, weaving together moments of joy and sorrow into a fabric of shared existence that transcends the boundaries of time and space.", author: "ai" as const, source: "GPT-4" },
  { text: "I tried to fix the kitchen tap myself. Three hours and two flooded towels later, I called a plumber. He fixed it in four minutes. I tipped him extra out of shame.", author: "human" as const, source: "Reddit comment" },
  { text: "Coffee is more than a beverage; it is a ritual, a moment of solitude in the chaos of modern life, a warm embrace that requires no words yet speaks volumes to the soul.", author: "ai" as const, source: "Claude" },
  { text: "My nan still prints out emails to read them. Last week she printed a spam email and rang me worried about a Nigerian prince who needed her help.", author: "human" as const, source: "Twitter/X post" },
  { text: "The quantum computer hummed softly in the laboratory, its qubits dancing in superposition - simultaneously everything and nothing, much like the hopes of the researchers who had staked their careers on its success.", author: "ai" as const, source: "GPT-4" },
  { text: "You know you're getting old when you get excited about a new sponge for the kitchen.", author: "human" as const, source: "Stand-up comedy" },
  { text: "Throughout history, the pen has proven mightier than the sword, for while armies conquer territories, it is the written word that conquers minds, shaping civilisations and bending the arc of progress toward enlightenment.", author: "ai" as const, source: "Claude" },
  { text: "The cat sat on my keyboard during a video call with the CEO. Sent 'ggggggggggg' to the entire leadership team. Got promoted the next week. Coincidence? Probably.", author: "human" as const, source: "LinkedIn post" },
  { text: "As autumn leaves cascade in golden spirals, nature orchestrates its annual symphony of transformation, reminding us that endings and beginnings are but two movements of the same eternal composition.", author: "ai" as const, source: "Gemini" },
  { text: "I asked my 5-year-old what she wants to be when she grows up. She said 'a dinosaur'. I said that's not a job. She said 'not with that attitude'.", author: "human" as const, source: "Parenting forum" },
  { text: "The integration of artificial intelligence into healthcare represents a paradigm shift of unprecedented magnitude, offering the potential to democratise access to diagnostic capabilities while simultaneously raising profound questions about the nature of medical expertise.", author: "ai" as const, source: "GPT-4" },
];

const totalRounds = 8;

export default function AIOrHumanGame() {
  const t = useTranslations("lab");
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;
  const [gameState, setGameState] = useState<"intro" | "playing" | "result">("intro");
  const [rounds, setRounds] = useState<typeof GAME_ROUNDS>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; round: typeof GAME_ROUNDS[0] }>>([]);
  const [animScore, setAnimScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    if (animScore < score) {
      const timer = setTimeout(() => setAnimScore(s => s + 1), 100);
      return () => clearTimeout(timer);
    }
  }, [animScore, score]);

  const startGame = useCallback(() => {
    const shuffled = [...GAME_ROUNDS].sort(() => Math.random() - 0.5).slice(0, totalRounds);
    setRounds(shuffled);
    setCurrentRound(0);
    setScore(0);
    setAnimScore(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setAnswers([]);
    setIsNewBest(false);
    setGameState("playing");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "playing" && !feedback) {
        if (e.key === "1") makeGuess("human");
        else if (e.key === "2") makeGuess("ai");
      }
      if (e.key === "Enter") {
        if (gameState === "intro" || gameState === "result") startGame();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const makeGuess = useCallback((guess: "ai" | "human") => {
    if (feedback) return;
    const round = rounds[currentRound];
    const correct = guess === round.author;
    const newStreak = correct ? streak + 1 : 0;
    const newScore = correct ? score + 1 : score;

    setFeedback({ correct, answer: round.author });
    setScore(newScore);
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);
    setAnswers(prev => [...prev, { correct, round }]);

    setTimeout(() => {
      setFeedback(null);
      if (currentRound + 1 >= totalRounds) {
        const best = savePersonalBest("ai-or-human", newScore);
        setIsNewBest(best);
        setGameState("result");
      } else {
        setCurrentRound(prev => prev + 1);
      }
    }, 1800);
  }, [feedback, rounds, currentRound, streak, score, bestStreak]);

  const getScoreTitle = () => {
    const pct = (score / totalRounds) * 100;
    if (pct >= 90) return t("aiOrHuman.scoreTitle90");
    if (pct >= 75) return t("aiOrHuman.scoreTitle75");
    if (pct >= 50) return t("aiOrHuman.scoreTitle50");
    return t("aiOrHuman.scoreTitleLow");
  };

  const getScoreEmoji = () => {
    const pct = (score / totalRounds) * 100;
    if (pct >= 90) return "🏆";
    if (pct >= 75) return "🎯";
    if (pct >= 50) return "💡";
    return "🤖";
  };

  if (gameState === "intro") {
    return (
      <motion.div
        className="text-center py-8 space-y-6"
        initial={noMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30"
          initial={noMotion ? undefined : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        >
          <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </motion.div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">{t("aiOrHuman.title")}</h3>
          <p className="text-[var(--color-text-muted)] max-w-lg mx-auto leading-relaxed">
            {t("aiOrHuman.description", { count: totalRounds })}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t("aiOrHuman.duration")}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
            {t("aiOrHuman.rounds", { count: totalRounds })}
          </span>
        </div>
        <motion.button
          onClick={startGame}
          className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:brightness-110 active:brightness-90 transition-all shadow-lg shadow-violet-600/25"
          whileHover={noMotion ? undefined : { scale: 1.05 }}
          whileTap={noMotion ? undefined : { scale: 0.96 }}
        >
          {t("aiOrHuman.startGame")}
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === "result") {
    const pct = Math.round((score / totalRounds) * 100);
    return (
      <motion.div
        className="text-center py-6 space-y-6 relative"
        initial={noMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isNewBest && <ConfettiCelebration />}
        <motion.div
          className="text-6xl"
          initial={noMotion ? undefined : { scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 12 }}
        >
          {getScoreEmoji()}
        </motion.div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">{getScoreTitle()}</p>
          <p className="text-5xl font-bold tabular-nums">{score}/{totalRounds}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {t("aiOrHuman.accuracy", { pct })}
            {bestStreak > 1 ? ` · ${t("aiOrHuman.bestStreak", { count: bestStreak })}` : ""}
          </p>
          {isNewBest && (
            <p className="text-sm font-bold text-amber-400 mt-2 animate-pulse">
              ⭐ {t("common.newHighScore")}
            </p>
          )}
        </div>

        <div className="max-w-xs mx-auto">
          <div className="h-3 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="max-w-lg mx-auto space-y-2 text-left">
          {answers.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
              a.correct
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}>
              <span className="mt-0.5 shrink-0 text-base">{a.correct ? "✓" : "✗"}</span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[var(--color-text-muted)] leading-relaxed">{a.round.text}</p>
                <p className="text-xs mt-1">
                  <span className={a.round.author === "ai" ? "text-violet-400 font-semibold" : "text-emerald-400 font-semibold"}>
                    {a.round.author === "ai" ? t("aiOrHuman.writtenByAI") : t("aiOrHuman.writtenByHuman")}
                  </span>
                  <span className="text-[var(--color-text-muted)]"> · {a.round.source}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <motion.button
          onClick={startGame}
          className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:brightness-110 active:brightness-90 transition-all shadow-lg shadow-violet-600/25"
          whileHover={noMotion ? undefined : { scale: 1.05 }}
          whileTap={noMotion ? undefined : { scale: 0.96 }}
        >
          {t("aiOrHuman.playAgain")}
        </motion.button>
      </motion.div>
    );
  }

  // Playing state
  const round = rounds[currentRound];
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)] mb-2">
        <span>{t("aiOrHuman.round", { current: currentRound + 1, total: totalRounds })}</span>
        <span className="flex items-center gap-3">
          <span>{t("aiOrHuman.score")}: <strong className="text-[var(--color-text)] tabular-nums">{animScore}</strong></span>
          {streak > 1 && <span className="text-amber-400 font-semibold">🔥 {t("aiOrHuman.streak", { count: streak })}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${((currentRound) / totalRounds) * 100}%` }}
        />
      </div>

      {/* Quote card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRound}
          className={`relative rounded-2xl border-2 p-5 sm:p-8 transition-colors duration-300 ${
            feedback
              ? feedback.correct
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-red-500/50 bg-red-500/5"
              : "border-[var(--color-border)] bg-[var(--color-bg-section)]"
          }`}
          initial={noMotion ? undefined : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={noMotion ? undefined : { opacity: 0, x: -30 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
        <svg className="absolute top-4 left-5 w-8 h-8 text-[var(--color-text-muted)] opacity-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-lg sm:text-xl md:text-2xl leading-relaxed pl-6 italic text-[var(--color-text)]">
          {round.text}
        </p>
        {feedback && (
          <div className={`mt-4 pl-6 text-sm font-medium ${feedback.correct ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.correct ? t("aiOrHuman.correct") : t("aiOrHuman.wrong")} - {t("aiOrHuman.writtenBy")} <strong>{feedback.answer === "ai" ? t("aiOrHuman.writtenByAI") : t("aiOrHuman.writtenByHuman")}</strong>
            <span className="text-[var(--color-text-muted)] font-normal"> ({round.source})</span>
          </div>
        )}
        </motion.div>
      </AnimatePresence>

      {/* Guess buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <motion.button
          onClick={() => makeGuess("human")}
          disabled={!!feedback}
          className={`group relative min-h-[64px] px-4 sm:px-6 py-4 rounded-xl border-2 font-semibold transition-colors ${
            feedback
              ? feedback.answer === "human"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-[var(--color-border)] opacity-40"
              : "border-[var(--color-border)] hover:border-emerald-500/50 hover:bg-emerald-500/5 active:border-emerald-500/50 active:bg-emerald-500/5 text-[var(--color-text)]"
          } disabled:cursor-default`}
          whileHover={noMotion || feedback ? undefined : { scale: 1.03 }}
          whileTap={noMotion || feedback ? undefined : { scale: 0.97 }}
        >
          <svg className="w-7 h-7 mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {t("aiOrHuman.human")}
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-1">{t("games.aiOrHuman.press1")}</span>
        </motion.button>
        <motion.button
          onClick={() => makeGuess("ai")}
          disabled={!!feedback}
          className={`group relative min-h-[64px] px-4 sm:px-6 py-4 rounded-xl border-2 font-semibold transition-colors ${
            feedback
              ? feedback.answer === "ai"
                ? "border-violet-500 bg-violet-500/10 text-violet-400"
                : "border-[var(--color-border)] opacity-40"
              : "border-[var(--color-border)] hover:border-violet-500/50 hover:bg-violet-500/5 active:border-violet-500/50 active:bg-violet-500/5 text-[var(--color-text)]"
          } disabled:cursor-default`}
          whileHover={noMotion || feedback ? undefined : { scale: 1.03 }}
          whileTap={noMotion || feedback ? undefined : { scale: 0.97 }}
        >
          <svg className="w-7 h-7 mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          {t("aiOrHuman.ai")}
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-1">{t("games.aiOrHuman.press2")}</span>
        </motion.button>
      </div>
    </div>
  );
}
