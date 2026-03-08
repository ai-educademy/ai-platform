"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { savePersonalBest } from "./GameCard";
import ConfettiCelebration from "./ConfettiCelebration";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const TRIVIA_QUESTIONS = [
  { question: "Who is considered the 'father of artificial intelligence'?", options: ["Alan Turing", "John McCarthy", "Marvin Minsky", "Geoffrey Hinton"], answer: 1 },
  { question: "What year was the Turing Test proposed?", options: ["1936", "1950", "1965", "1980"], answer: 1 },
  { question: "Which company created GPT-4?", options: ["Google", "Meta", "OpenAI", "Anthropic"], answer: 2 },
  { question: "What does 'CNN' stand for in deep learning?", options: ["Computer Neural Network", "Convolutional Neural Network", "Connected Node Network", "Core Neuron Network"], answer: 1 },
  { question: "Which AI system defeated the world Go champion in 2016?", options: ["Deep Blue", "Watson", "AlphaGo", "GPT-3"], answer: 2 },
  { question: "What is the 'attention mechanism' fundamental to?", options: ["CNNs", "Decision Trees", "Transformers", "Random Forests"], answer: 2 },
  { question: "Who coined the term 'machine learning' in 1959?", options: ["Alan Turing", "Arthur Samuel", "Frank Rosenblatt", "Yann LeCun"], answer: 1 },
  { question: "What does LLM stand for?", options: ["Large Logic Model", "Linear Language Module", "Large Language Model", "Learned Linguistic Machine"], answer: 2 },
  { question: "Which technique trains AI using rewards and penalties?", options: ["Supervised Learning", "Unsupervised Learning", "Transfer Learning", "Reinforcement Learning"], answer: 3 },
  { question: "What is a 'hallucination' in AI?", options: ["Visual glitch in image AI", "When AI generates confident but false info", "A type of neural network", "An AI dreaming state"], answer: 1 },
  { question: "Which AI lab created Claude?", options: ["OpenAI", "Google DeepMind", "Anthropic", "Meta AI"], answer: 2 },
  { question: "What is 'backpropagation' used for?", options: ["Data backup", "Training neural networks", "Reverse engineering", "Network routing"], answer: 1 },
  { question: "The 'Transformer' architecture was introduced in which paper?", options: ["ImageNet", "Attention Is All You Need", "Playing Atari with Deep RL", "BERT: Pre-training"], answer: 1 },
  { question: "What is 'overfitting'?", options: ["Model is too large", "Model memorises training data", "Model is too fast", "Model uses too much memory"], answer: 1 },
  { question: "Which was the first AI to beat a human chess world champion?", options: ["AlphaZero", "Stockfish", "Deep Blue", "Leela Chess"], answer: 2 },
];

const SECONDS_PER_QUESTION = 15;

interface LeaderboardEntry {
  score: number;
  date: string;
  correct: number;
  total: number;
}

function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const val = localStorage.getItem("playground_trivia_leaderboard");
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

function addToLeaderboard(entry: LeaderboardEntry) {
  if (typeof window === "undefined") return;
  try {
    const lb = getLeaderboard();
    lb.push(entry);
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem("playground_trivia_leaderboard", JSON.stringify(lb.slice(0, 10)));
  } catch { /* ignore */ }
}

export default function AITriviaChallenge() {
  const t = useTranslations("lab");
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;
  const [gameState, setGameState] = useState<"intro" | "playing" | "result">("intro");
  const [questions, setQuestions] = useState<typeof TRIVIA_QUESTIONS>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "timeout" | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const totalQuestions = 10;

  const startGame = useCallback(() => {
    const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
    setQuestions(shuffled);
    setCurrent(0);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setSelected(null);
    setFeedback(null);
    setIsNewBest(false);
    setGameState("playing");
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || feedback !== null) return;
    setTimeLeft(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setFeedback("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, gameState, feedback]);

  // Auto-advance after feedback
  useEffect(() => {
    if (feedback === null) return;
    const timer = setTimeout(() => {
      if (current + 1 >= questions.length) {
        const best = savePersonalBest("ai-trivia", score);
        setIsNewBest(best);
        addToLeaderboard({
          score,
          date: new Date().toLocaleDateString(),
          correct: correctCount,
          total: questions.length,
        });
        setLeaderboard(getLeaderboard());
        setGameState("result");
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [feedback, current, questions.length, score, correctCount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState === "playing" && feedback === null) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) handleAnswer(num - 1);
      }
      if (e.key === "Enter" && (gameState === "intro" || gameState === "result")) {
        startGame();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const handleAnswer = useCallback((index: number) => {
    if (feedback !== null || selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(index);
    const q = questions[current];
    const correct = index === q.answer;
    if (correct) {
      // Speed multiplier: more time left = higher score
      const multiplier = timeLeft >= 10 ? 3 : timeLeft >= 5 ? 2 : 1;
      setScore(s => s + 100 * multiplier);
      setCorrectCount(c => c + 1);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  }, [feedback, selected, questions, current, timeLeft]);

  useEffect(() => {
    if (gameState === "result") {
      setLeaderboard(getLeaderboard());
    }
  }, [gameState]);

  if (gameState === "intro") {
    return (
      <motion.div
        className="text-center py-8 space-y-6"
        initial={noMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="text-6xl"
          initial={noMotion ? undefined : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        >
          🧠
        </motion.div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">{t("games.aiTrivia.title")}</h3>
          <p className="text-[var(--color-text-muted)] max-w-lg mx-auto leading-relaxed">
            {t("games.aiTrivia.instruction")}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            ⏱️ {SECONDS_PER_QUESTION}s {t("games.aiTrivia.perQuestion")}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            🎯 {totalQuestions} {t("games.aiTrivia.questions")}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            ⚡ {t("games.aiTrivia.speedBonus")}
          </span>
        </div>
        <motion.button
          onClick={startGame}
          className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:brightness-110 active:brightness-90 transition-all shadow-lg shadow-indigo-500/25"
          whileHover={noMotion ? undefined : { scale: 1.05 }}
          whileTap={noMotion ? undefined : { scale: 0.96 }}
        >
          {t("aiOrHuman.startGame")}
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === "result") {
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
          {score >= 2000 ? "🏆" : score >= 1000 ? "🎯" : "🧠"}
        </motion.div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">{t("games.aiTrivia.finalScore")}</p>
          <p className="text-5xl font-bold tabular-nums">{score}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {t("games.aiTrivia.questionsCorrect", { correct: correctCount, total: questions.length })}
          </p>
          {isNewBest && (
            <p className="text-sm font-bold text-amber-400 mt-2 animate-pulse">⭐ {t("common.newHighScore")}</p>
          )}
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="max-w-xs mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">{t("games.aiTrivia.leaderboard")}</p>
            <div className="space-y-1">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-bg-section)] text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-[var(--color-text-muted)] w-5">{i + 1}.</span>
                    <span className="font-semibold tabular-nums">{entry.score}</span>
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">{entry.correct}/{entry.total} · {entry.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <motion.button
          onClick={startGame}
          className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:brightness-110 active:brightness-90 transition-all shadow-lg shadow-indigo-500/25"
          whileHover={noMotion ? undefined : { scale: 1.05 }}
          whileTap={noMotion ? undefined : { scale: 0.96 }}
        >
          {t("common.playAgain")}
        </motion.button>
      </motion.div>
    );
  }

  // Playing state
  const q = questions[current];
  const multiplier = timeLeft >= 10 ? 3 : timeLeft >= 5 ? 2 : 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <span>{t("games.aiTrivia.questionOf", { current: current + 1, total: questions.length })}</span>
        <span className="font-bold tabular-nums">{score} pts</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${((current) / questions.length) * 100}%` }}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between">
        <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-section)] overflow-hidden mr-3">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-mono font-bold tabular-nums w-8 text-right ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-[var(--color-text-muted)]"}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Speed multiplier indicator */}
      <div className="text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          multiplier === 3 ? "bg-emerald-500/20 text-emerald-400" :
          multiplier === 2 ? "bg-amber-500/20 text-amber-400" :
          "bg-red-500/20 text-red-400"
        }`}>
          ×{multiplier} {multiplier === 3 ? t("games.aiTrivia.fastAnswer") : multiplier === 2 ? t("games.aiTrivia.goodSpeed") : t("games.aiTrivia.justInTime")}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="p-4 sm:p-6 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)] text-center"
          initial={noMotion ? undefined : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={noMotion ? undefined : { opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <p className="text-base sm:text-lg font-semibold leading-relaxed">{q.question}</p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isSelected = selected === i;
          let style = "border-[var(--color-border)] hover:border-indigo-400 active:border-indigo-400 active:scale-[0.98]";
          if (feedback) {
            if (isCorrect) style = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
            else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-400";
            else style = "border-[var(--color-border)] opacity-40";
          }
          return (
            <motion.button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={feedback !== null}
              className={`min-h-[48px] p-4 rounded-xl border-2 font-medium text-left transition-colors ${style}`}
              initial={noMotion ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={noMotion ? undefined : { delay: i * 0.05 }}
              whileHover={noMotion || feedback !== null ? undefined : { scale: 1.02 }}
              whileTap={noMotion || feedback !== null ? undefined : { scale: 0.97 }}
            >
              <span className="text-xs text-[var(--color-text-muted)] mr-2">{i + 1}.</span>
              {opt}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`text-center text-sm font-semibold py-2 rounded-lg ${
              feedback === "correct" ? "text-emerald-400 bg-emerald-500/10" :
              feedback === "wrong" ? "text-red-400 bg-red-500/10" :
              "text-amber-400 bg-amber-500/10"
            }`}
            initial={noMotion ? undefined : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={noMotion ? undefined : { opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {feedback === "correct" && t("games.aiTrivia.correctAnswer", { points: 100 * multiplier })}
            {feedback === "wrong" && t("games.aiTrivia.wrongAnswer", { answer: q.options[q.answer] })}
            {feedback === "timeout" && t("games.aiTrivia.timesUp")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
