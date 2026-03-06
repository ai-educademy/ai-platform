"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ALL_GAMES } from "@/components/playground/MiniGames";

/* ─── AI or Human? Game ─── */
const GAME_ROUNDS = [
  { text: "The sunset painted the sky in hues of amber and violet, a daily masterpiece that most people barely noticed as they rushed home from work.", author: "human" as const, source: "Personal blog post" },
  { text: "In the tapestry of human experience, love serves as both the warp and weft, weaving together moments of joy and sorrow into a fabric of shared existence that transcends the boundaries of time and space.", author: "ai" as const, source: "GPT-4" },
  { text: "I tried to fix the kitchen tap myself. Three hours and two flooded towels later, I called a plumber. He fixed it in four minutes. I tipped him extra out of shame.", author: "human" as const, source: "Reddit comment" },
  { text: "Coffee is more than a beverage; it is a ritual, a moment of solitude in the chaos of modern life, a warm embrace that requires no words yet speaks volumes to the soul.", author: "ai" as const, source: "Claude" },
  { text: "My nan still prints out emails to read them. Last week she printed a spam email and rang me worried about a Nigerian prince who needed her help.", author: "human" as const, source: "Twitter/X post" },
  { text: "The quantum computer hummed softly in the laboratory, its qubits dancing in superposition — simultaneously everything and nothing, much like the hopes of the researchers who had staked their careers on its success.", author: "ai" as const, source: "GPT-4" },
  { text: "You know you're getting old when you get excited about a new sponge for the kitchen.", author: "human" as const, source: "Stand-up comedy" },
  { text: "Throughout history, the pen has proven mightier than the sword, for while armies conquer territories, it is the written word that conquers minds, shaping civilisations and bending the arc of progress toward enlightenment.", author: "ai" as const, source: "Claude" },
  { text: "The cat sat on my keyboard during a video call with the CEO. Sent 'ggggggggggg' to the entire leadership team. Got promoted the next week. Coincidence? Probably.", author: "human" as const, source: "LinkedIn post" },
  { text: "As autumn leaves cascade in golden spirals, nature orchestrates its annual symphony of transformation, reminding us that endings and beginnings are but two movements of the same eternal composition.", author: "ai" as const, source: "Gemini" },
  { text: "I asked my 5-year-old what she wants to be when she grows up. She said 'a dinosaur'. I said that's not a job. She said 'not with that attitude'.", author: "human" as const, source: "Parenting forum" },
  { text: "The integration of artificial intelligence into healthcare represents a paradigm shift of unprecedented magnitude, offering the potential to democratise access to diagnostic capabilities while simultaneously raising profound questions about the nature of medical expertise.", author: "ai" as const, source: "GPT-4" },
];

function AIOrHumanGame() {
  const t = useTranslations("playground");
  const [gameState, setGameState] = useState<"intro" | "playing" | "result">("intro");
  const [rounds, setRounds] = useState<typeof GAME_ROUNDS>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; round: typeof GAME_ROUNDS[0] }>>([]);
  const [animScore, setAnimScore] = useState(0);
  const totalRounds = 8;

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
    setGameState("playing");
  }, []);

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
      <div className="text-center py-8 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
          <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
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
          <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
            {t("aiOrHuman.learnDetection")}
          </span>
        </div>
        <button
          onClick={startGame}
          className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-violet-600/25"
        >
          {t("aiOrHuman.startGame")}
        </button>
      </div>
    );
  }

  if (gameState === "result") {
    const pct = Math.round((score / totalRounds) * 100);
    return (
      <div className="text-center py-6 space-y-6">
        <div className="text-6xl animate-bounce">{getScoreEmoji()}</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">{getScoreTitle()}</p>
          <p className="text-5xl font-bold tabular-nums">{score}/{totalRounds}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {t("aiOrHuman.accuracy", { pct })}
            {bestStreak > 1 ? ` · ${t("aiOrHuman.bestStreak", { count: bestStreak })}` : ""}
          </p>
        </div>

        {/* Score bar */}
        <div className="max-w-xs mx-auto">
          <div className="h-3 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Answer review */}
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

        <button
          onClick={startGame}
          className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-violet-600/25"
        >
          {t("aiOrHuman.playAgain")}
        </button>
      </div>
    );
  }

  // Playing state
  const round = rounds[currentRound];
  return (
    <div className="space-y-6">
      {/* Progress bar */}
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
      <div className={`relative rounded-2xl border-2 p-6 sm:p-8 transition-all duration-300 ${
        feedback
          ? feedback.correct
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-red-500/50 bg-red-500/5"
          : "border-[var(--color-border)] bg-[var(--color-bg-section)]"
      }`}>
        <svg className="absolute top-4 left-5 w-8 h-8 text-[var(--color-text-muted)] opacity-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-lg sm:text-xl md:text-2xl leading-relaxed pl-6 italic text-[var(--color-text)]">
          {round.text}
        </p>
        {feedback && (
          <div className={`mt-4 pl-6 text-sm font-medium ${feedback.correct ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.correct ? t("aiOrHuman.correct") : t("aiOrHuman.wrong")} — {t("aiOrHuman.writtenBy")} <strong>{feedback.answer === "ai" ? t("aiOrHuman.writtenByAI") : t("aiOrHuman.writtenByHuman")}</strong>
            <span className="text-[var(--color-text-muted)] font-normal"> ({round.source})</span>
          </div>
        )}
      </div>

      {/* Guess buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => makeGuess("human")}
          disabled={!!feedback}
          className={`group relative min-h-[64px] px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
            feedback
              ? feedback.answer === "human"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-[var(--color-border)] opacity-40"
              : "border-[var(--color-border)] hover:border-emerald-500/50 hover:bg-emerald-500/5 text-[var(--color-text)]"
          } disabled:cursor-default`}
        >
          <svg className="w-7 h-7 mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {t("aiOrHuman.human")}
        </button>
        <button
          onClick={() => makeGuess("ai")}
          disabled={!!feedback}
          className={`group relative min-h-[64px] px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
            feedback
              ? feedback.answer === "ai"
                ? "border-violet-500 bg-violet-500/10 text-violet-400"
                : "border-[var(--color-border)] opacity-40"
              : "border-[var(--color-border)] hover:border-violet-500/50 hover:bg-violet-500/5 text-[var(--color-text)]"
          } disabled:cursor-default`}
        >
          <svg className="w-7 h-7 mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          {t("aiOrHuman.ai")}
        </button>
      </div>
    </div>
  );
}

/* ─── Sentiment Analysis ─── */
function SentimentAnalyser() {
  const t = useTranslations("playground.sentimentSection");
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ label: string; score: number; breakdown: { positive: number; negative: number; neutral: number } } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyse = useCallback(() => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      const positiveWords = ["good", "great", "love", "amazing", "excellent", "happy", "wonderful", "fantastic", "awesome", "brilliant", "perfect", "best", "beautiful", "enjoy", "glad", "impressive", "outstanding", "superb", "terrific", "delightful", "magnificent", "pleasant", "remarkable", "splendid", "thankful", "grateful"];
      const negativeWords = ["bad", "terrible", "hate", "awful", "horrible", "sad", "worst", "ugly", "poor", "disgusting", "annoying", "disappointed", "frustrating", "dreadful", "pathetic", "miserable", "unpleasant", "useless", "waste", "broken", "fail", "boring", "angry", "stupid"];
      const intensifiers = ["very", "really", "extremely", "absolutely", "incredibly", "super", "totally"];

      const words = lower.split(/\s+/);
      let pos = 0, neg = 0;
      let hasIntensifier = false;

      words.forEach((w) => {
        const clean = w.replace(/[^a-z]/g, "");
        if (intensifiers.includes(clean)) { hasIntensifier = true; return; }
        const mult = hasIntensifier ? 1.5 : 1;
        if (positiveWords.includes(clean)) pos += mult;
        if (negativeWords.includes(clean)) neg += mult;
        hasIntensifier = false;
      });

      words.forEach((w, i) => {
        if (["not", "don't", "doesn't", "isn't", "wasn't", "no", "never", "neither"].includes(w.replace(/[^a-z']/g, ""))) {
          const next = words[i + 1]?.replace(/[^a-z]/g, "");
          if (next && positiveWords.includes(next)) { pos -= 1; neg += 0.5; }
          if (next && negativeWords.includes(next)) { neg -= 1; pos += 0.5; }
        }
      });

      pos = Math.max(0, pos);
      neg = Math.max(0, neg);
      const total = pos + neg + 1;
      const posP = Math.round((pos / total) * 100);
      const negP = Math.round((neg / total) * 100);
      const neuP = 100 - posP - negP;

      const label = posP > negP + 10 ? t("positive") : negP > posP + 10 ? t("negative") : t("neutral");
      const scoreVal = posP > negP + 10 ? posP : negP > posP + 10 ? negP : neuP;

      setResult({ label, score: scoreVal, breakdown: { positive: posP, negative: negP, neutral: neuP } });
      setLoading(false);
    }, 400);
  }, [text, t]);

  const sentimentColor = result?.label === t("positive") ? "#34D399" : result?.label === t("negative") ? "#EF4444" : "#A78BFA";
  const sentimentIcon = result?.label === t("positive") ? "↑" : result?.label === t("negative") ? "↓" : "→";

  return (
    <div className="space-y-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full h-28 px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
      />
      <button
        onClick={analyse}
        disabled={!text.trim() || loading}
        className="min-h-[48px] px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? t("analysing") : t("analyse")}
      </button>
      {result && (
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-4" style={{ borderLeft: `4px solid ${sentimentColor}` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: sentimentColor }}>
              {sentimentIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold">{result.label}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{t("confidence")}: {result.score}%</div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-[var(--color-border)] grid grid-cols-3 gap-4 text-center text-xs">
            {(["positive", "negative", "neutral"] as const).map((k) => (
              <div key={k}>
                <div className="h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${result.breakdown[k]}%`,
                    backgroundColor: k === "positive" ? "#34D399" : k === "negative" ? "#EF4444" : "#A78BFA",
                  }} />
                </div>
                <span className="text-[var(--color-text-muted)]">{t(k)} {result.breakdown[k]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Neural Network Visualiser ─── */
function NeuralNetworkViz() {
  const t = useTranslations("playground.neuralSection");
  const [inputValues, setInputValues] = useState([0.8, 0.3, 0.5]);
  const [activating, setActivating] = useState(false);
  const layers = [3, 4, 4, 2];

  const propagate = useCallback(() => {
    setActivating(true);
    setTimeout(() => setActivating(false), 1500);
  }, []);

  const svgW = 600, svgH = 300;
  const layerPositions = layers.map((_, i) => 80 + (i * (svgW - 160)) / (layers.length - 1));
  const nodePositions = layers.map((count, li) => {
    const spacing = svgH / (count + 1);
    return Array.from({ length: count }, (_, ni) => ({ x: layerPositions[li], y: spacing * (ni + 1) }));
  });

  const weights: number[][][] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    weights.push(nodePositions[l].map((_, ni) =>
      nodePositions[l + 1].map((_, nj) => {
        const seed = (l * 17 + ni * 7 + nj * 3) % 100;
        return (seed / 100) * 2 - 1;
      })
    ));
  }

  const layerLabels = [t("layerInput"), t("layerHidden1"), t("layerHidden2"), t("layerOutput")];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-6 flex-wrap">
        {inputValues.map((val, i) => (
          <div key={i} className="flex-1 min-w-[80px]">
            <label className="text-xs text-[var(--color-text-muted)] mb-1 block">{t("input", { num: i + 1 })}</label>
            <input type="range" min="0" max="1" step="0.01" value={val}
              onChange={(e) => { const next = [...inputValues]; next[i] = parseFloat(e.target.value); setInputValues(next); }}
              className="w-full accent-[var(--color-primary)]" />
            <div className="text-xs font-mono text-center mt-0.5">{val.toFixed(2)}</div>
          </div>
        ))}
        <button onClick={propagate} className="min-h-[48px] px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all shrink-0">
          {t("forwardPass")}
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-[280px]">
          {weights.map((layerWeights, l) =>
            layerWeights.map((nodeWeights, ni) =>
              nodeWeights.map((w, nj) => {
                const from = nodePositions[l][ni];
                const to = nodePositions[l + 1][nj];
                const opacity = Math.abs(w) * 0.6 + 0.1;
                const color = w > 0 ? "#6366f1" : "#ef4444";
                const strokeW = Math.abs(w) * 2 + 0.5;
                const delay = activating ? `${l * 0.3}s` : "0s";
                return (
                  <line key={`${l}-${ni}-${nj}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={color} strokeWidth={strokeW} opacity={activating ? opacity : opacity * 0.5}
                    style={{ transition: `opacity 0.5s ${delay}` }} />
                );
              })
            )
          )}
          {nodePositions.map((layer, li) =>
            layer.map((pos, ni) => {
              const isInput = li === 0;
              const isOutput = li === layers.length - 1;
              const val = isInput ? inputValues[ni] : undefined;
              const delay = activating ? `${li * 0.3}s` : "0s";
              const nodeOpacity = activating || isInput ? 1 : 0.6;
              return (
                <g key={`${li}-${ni}`} style={{ transition: `opacity 0.5s ${delay}` }} opacity={nodeOpacity}>
                  <circle cx={pos.x} cy={pos.y} r={isInput || isOutput ? 16 : 12}
                    fill={isInput ? "#6366f1" : isOutput ? "#8b5cf6" : "var(--color-bg-card, #1e1e2e)"}
                    stroke={isInput ? "#6366f1" : isOutput ? "#8b5cf6" : "#6366f1"} strokeWidth={2} />
                  {val !== undefined && (
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{val.toFixed(1)}</text>
                  )}
                  {isOutput && (
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{ni === 0 ? "A" : "B"}</text>
                  )}
                </g>
              );
            })
          )}
          {layerLabels.map((label, i) => (
            <text key={label} x={layerPositions[i]} y={svgH - 8} textAnchor="middle" fill="var(--color-text-muted, #888)" fontSize="11" fontWeight="500">{label}</text>
          ))}
        </svg>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{t("explanation")}</p>
    </div>
  );
}

/* ─── Sorting Algorithm Visualiser ─── */
function SortingVisualiser() {
  const t = useTranslations("playground.sortingSection");
  const [array, setArray] = useState(() => Array.from({ length: 24 }, () => Math.floor(Math.random() * 90) + 10));
  const [sorting, setSorting] = useState(false);
  const [algorithm, setAlgorithm] = useState<"bubble" | "quick" | "merge">("bubble");
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const [comparisons, setComparisons] = useState(0);
  const stopRef = useRef(false);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const randomise = useCallback(() => {
    setArray(Array.from({ length: 24 }, () => Math.floor(Math.random() * 90) + 10));
    setActiveIndices([]); setSortedIndices(new Set()); setComparisons(0);
    stopRef.current = true; setSorting(false);
  }, []);

  const bubbleSort = useCallback(async () => {
    const arr = [...array]; let comps = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return;
        setActiveIndices([j, j + 1]); comps++; setComparisons(comps);
        if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; setArray([...arr]); }
        await sleep(30);
      }
      setSortedIndices((prev) => new Set([...prev, arr.length - 1 - i]));
    }
    setActiveIndices([]); setSortedIndices(new Set(arr.map((_, i) => i)));
  }, [array]);

  const quickSort = useCallback(async () => {
    const arr = [...array]; let comps = 0;
    async function partition(lo: number, hi: number): Promise<number> {
      const pivot = arr[hi]; let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        if (stopRef.current) return lo;
        setActiveIndices([j, hi]); comps++; setComparisons(comps);
        if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; setArray([...arr]); }
        await sleep(40);
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]; setArray([...arr]);
      setSortedIndices((prev) => new Set([...prev, i + 1])); return i + 1;
    }
    async function qs(lo: number, hi: number) {
      if (lo >= hi || stopRef.current) return;
      const p = await partition(lo, hi); await qs(lo, p - 1); await qs(p + 1, hi);
    }
    await qs(0, arr.length - 1);
    setActiveIndices([]); setSortedIndices(new Set(arr.map((_, i) => i)));
  }, [array]);

  const mergeSort = useCallback(async () => {
    const arr = [...array]; let comps = 0;
    async function merge(lo: number, mid: number, hi: number) {
      const left = arr.slice(lo, mid + 1); const right = arr.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) {
        if (stopRef.current) return;
        setActiveIndices([k]); comps++; setComparisons(comps);
        if (left[i] <= right[j]) { arr[k++] = left[i++]; } else { arr[k++] = right[j++]; }
        setArray([...arr]); await sleep(40);
      }
      while (i < left.length) { arr[k++] = left[i++]; setArray([...arr]); await sleep(20); }
      while (j < right.length) { arr[k++] = right[j++]; setArray([...arr]); await sleep(20); }
    }
    async function ms(lo: number, hi: number) {
      if (lo >= hi || stopRef.current) return;
      const mid = Math.floor((lo + hi) / 2); await ms(lo, mid); await ms(mid + 1, hi); await merge(lo, mid, hi);
    }
    await ms(0, arr.length - 1);
    setActiveIndices([]); setSortedIndices(new Set(arr.map((_, i) => i)));
  }, [array]);

  const startSort = useCallback(async () => {
    stopRef.current = false; setSorting(true); setSortedIndices(new Set()); setComparisons(0);
    if (algorithm === "bubble") await bubbleSort();
    else if (algorithm === "quick") await quickSort();
    else await mergeSort();
    setSorting(false);
  }, [algorithm, bubbleSort, quickSort, mergeSort]);

  const maxVal = Math.max(...array);
  const algoMap = { bubble: t("bubble"), quick: t("quick"), merge: t("merge") };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {(["bubble", "quick", "merge"] as const).map((algo) => (
          <button key={algo} onClick={() => !sorting && setAlgorithm(algo)}
            className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              algorithm === algo ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}>
            {algoMap[algo]}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{comparisons} {t("comparisons")}</span>
        <button onClick={randomise} disabled={sorting} className="min-h-[40px] px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium hover:bg-[var(--color-bg)] transition-all disabled:opacity-40">
          {t("shuffle")}
        </button>
        <button onClick={startSort} disabled={sorting} className="min-h-[40px] px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40">
          {sorting ? t("sorting") : t("sort")}
        </button>
      </div>
      <div className="flex items-end gap-[2px] h-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        {array.map((val, i) => {
          const isActive = activeIndices.includes(i);
          const isSorted = sortedIndices.has(i);
          return (
            <div key={i} className="flex-1 rounded-t-sm transition-all duration-75" style={{
              height: `${(val / maxVal) * 100}%`,
              backgroundColor: isActive ? "#f97316" : isSorted ? "#34d399" : "#6366f1",
              opacity: isActive ? 1 : isSorted ? 0.9 : 0.6,
            }} />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Tokenizer Demo ─── */
function TokenizerDemo() {
  const t = useTranslations("playground.tokenizerSection");
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const tokenColors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#34d399", "#eab308", "#ef4444"];

  const tokenize = (input: string) => {
    const words = input.split(/(\s+)/);
    const tokens: { text: string; id: number }[] = [];
    let id = 0;
    words.forEach((word) => {
      if (/^\s+$/.test(word)) { tokens.push({ text: word, id: -1 }); }
      else if (word.length > 6) {
        const mid = Math.ceil(word.length * 0.6);
        tokens.push({ text: word.slice(0, mid), id: id++ });
        tokens.push({ text: word.slice(mid), id: id++ });
      } else { tokens.push({ text: word, id: id++ }); }
    });
    return tokens;
  };

  const tokens = tokenize(text);
  const tokenCount = tokens.filter((t) => t.id >= 0).length;

  return (
    <div className="space-y-5">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("placeholder")}
        className="w-full h-20 px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span className="font-semibold">{tokenCount} {t("tokens")}</span>
        <span>•</span>
        <span>{text.length} {t("characters")}</span>
        <span>•</span>
        <span>{t("wordsEquivalent", { count: (tokenCount * 0.75).toFixed(0) })}</span>
      </div>
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] min-h-[60px] flex flex-wrap gap-y-2 items-start">
        {tokens.map((token, i) =>
          token.id < 0 ? (
            <span key={i} className="inline-block w-1" />
          ) : (
            <span key={i} className="inline-block px-2 py-1 rounded text-xs font-mono text-white" style={{ backgroundColor: tokenColors[token.id % tokenColors.length] + "cc" }} title={`Token ID: ${token.id}`}>
              {token.text}
            </span>
          )
        )}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{t("explanation")}</p>
    </div>
  );
}

/* ─── Random Game Picker ─── */
function RandomGamePicker() {
  const t = useTranslations("playground");
  const [gameIndex, setGameIndex] = useState<number>(-1);
  const [showPicker, setShowPicker] = useState(true);
  const [diceSpinning, setDiceSpinning] = useState(false);

  const allGames = useMemo(() => [
    { id: "ai-or-human", name: "AI or Human?", desc: "Guess if text is human or AI", icon: "🤖", component: AIOrHumanGame },
    ...ALL_GAMES,
  ], []);

  useEffect(() => {
    setGameIndex(Math.floor(Math.random() * allGames.length));
  }, [allGames]);

  const switchGame = () => {
    setDiceSpinning(true);
    setTimeout(() => setDiceSpinning(false), 600);
    let next = Math.floor(Math.random() * allGames.length);
    while (next === gameIndex && allGames.length > 1) next = Math.floor(Math.random() * allGames.length);
    setGameIndex(next);
  };

  if (gameIndex < 0) return null;

  const currentGame = allGames[gameIndex];
  const GameComponent = currentGame.component;

  if (showPicker) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="text-6xl">{currentGame.icon}</div>
          <h2 className="text-2xl sm:text-3xl font-bold">{currentGame.name}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{currentGame.desc}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => setShowPicker(false)}
            className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-indigo-500/25">
            {t("common.playThisGame")}
          </button>
          <button onClick={switchGame}
            className="min-h-[48px] px-6 py-3 border-2 border-[var(--color-border)] rounded-xl font-semibold hover:border-indigo-400 transition-all text-sm">
            <span className={`inline-block ${diceSpinning ? "animate-spin" : ""}`}>🎲</span> {t("common.randomGame")}
          </button>
        </div>
        <div className="border-t border-[var(--color-border)] pt-5">
          <p className="text-xs text-[var(--color-text-muted)] text-center mb-3">{t("common.orPickOne")}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {allGames.map((g, i) => (
              <button key={g.id} onClick={() => { setGameIndex(i); setShowPicker(false); }}
                className={`min-h-[48px] p-3 rounded-xl border-2 text-center transition-all hover:border-indigo-400 hover:shadow-md active:scale-[0.97] ${
                  i === gameIndex ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--color-border)]"
                }`}>
                <div className="text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center">{g.icon}</div>
                <div className="text-[10px] font-medium leading-tight mt-1">{g.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{currentGame.icon}</span>
          <h2 className="text-lg font-bold">{currentGame.name}</h2>
        </div>
        <button onClick={() => { switchGame(); setShowPicker(true); }} className="min-h-[40px] text-xs px-4 py-2 rounded-xl border border-[var(--color-border)] hover:border-indigo-400 transition-colors">
          🎲 {t("common.newGame")}
        </button>
      </div>
      <GameComponent />
    </div>
  );
}

/* ─── Tab Icons ─── */
const TAB_ICONS = {
  game: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  sentiment: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
  neural: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" d="M12 2v4m0 12v4m-7.07-2.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" /></svg>,
  sorting: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>,
  tokenizer: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
};

const GRADIENT_HEADERS: Record<string, string> = {
  game: "from-violet-600/10 to-fuchsia-600/10",
  sentiment: "from-blue-600/10 to-cyan-600/10",
  neural: "from-indigo-600/10 to-purple-600/10",
  sorting: "from-orange-600/10 to-amber-600/10",
  tokenizer: "from-emerald-600/10 to-teal-600/10",
};

/* ─── Main Page ─── */
export default function PlaygroundPage() {
  const t = useTranslations("playground");
  const [activeTab, setActiveTab] = useState<"game" | "sentiment" | "neural" | "sorting" | "tokenizer">("game");
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "game" as const, labelKey: "tabs.games.label", descKey: "tabs.games.desc" },
    { id: "sentiment" as const, labelKey: "tabs.sentiment.label", descKey: "tabs.sentiment.desc" },
    { id: "neural" as const, labelKey: "tabs.neural.label", descKey: "tabs.neural.desc" },
    { id: "sorting" as const, labelKey: "tabs.sorting.label", descKey: "tabs.sorting.desc" },
    { id: "tokenizer" as const, labelKey: "tabs.tokenizer.label", descKey: "tabs.tokenizer.desc" },
  ];

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      {/* ─── Hero Header ─── */}
      <ScrollReveal animation="fade-up">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {t("badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)] bg-clip-text">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* ─── Tab Navigation — horizontal scroll on mobile ─── */}
      <div ref={scrollRef} className="flex overflow-x-auto gap-2 sm:gap-3 mb-8 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center gap-2.5 min-h-[48px] px-4 sm:px-5 py-3 rounded-xl border-2 transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-indigo-400 hover:shadow-md"
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors shrink-0 ${
              activeTab === tab.id
                ? "bg-indigo-500 text-white"
                : "bg-[var(--color-bg-section)] text-[var(--color-text-muted)] group-hover:bg-indigo-500/20 group-hover:text-indigo-500"
            }`}>
              {TAB_ICONS[tab.id]}
            </div>
            <div className="text-left">
              <span className={`text-sm font-semibold leading-tight block whitespace-nowrap ${
                activeTab === tab.id ? "text-indigo-400" : ""
              }`}>{t(tab.labelKey)}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] leading-tight hidden sm:block whitespace-nowrap">{t(tab.descKey)}</span>
            </div>
            {/* Active indicator pill */}
            {activeTab === tab.id && (
              <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-indigo-500" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Game Container ─── */}
      <ScrollReveal animation="fade-up">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
          {/* Gradient header per section */}
          <div className={`bg-gradient-to-r ${GRADIENT_HEADERS[activeTab]} px-5 sm:px-6 lg:px-8 py-4 border-b border-[var(--color-border)]`}>
            {activeTab !== "game" && (
              <div>
                <h2 className="text-xl font-bold">
                  {activeTab === "sentiment" && t("sentimentSection.title")}
                  {activeTab === "neural" && t("neuralSection.title")}
                  {activeTab === "sorting" && t("sortingSection.title")}
                  {activeTab === "tokenizer" && t("tokenizerSection.title")}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {activeTab === "sentiment" && t("sentimentSection.description")}
                  {activeTab === "neural" && t("neuralSection.description")}
                  {activeTab === "sorting" && t("sortingSection.description")}
                  {activeTab === "tokenizer" && t("tokenizerSection.description")}
                </p>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {activeTab === "game" && <RandomGamePicker />}
            {activeTab === "sentiment" && <SentimentAnalyser />}
            {activeTab === "neural" && <NeuralNetworkViz />}
            {activeTab === "sorting" && <SortingVisualiser />}
            {activeTab === "tokenizer" && <TokenizerDemo />}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── Footer note ─── */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--color-text-muted)]">
          {t("footer")}
        </p>
      </div>
    </div>
  );
}
