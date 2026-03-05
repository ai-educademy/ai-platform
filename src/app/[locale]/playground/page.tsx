"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";

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
  const [gameState, setGameState] = useState<"intro" | "playing" | "result">("intro");
  const [rounds, setRounds] = useState<typeof GAME_ROUNDS>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; round: typeof GAME_ROUNDS[0] }>>([]);
  const totalRounds = 8;

  const startGame = useCallback(() => {
    const shuffled = [...GAME_ROUNDS].sort(() => Math.random() - 0.5).slice(0, totalRounds);
    setRounds(shuffled);
    setCurrentRound(0);
    setScore(0);
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
    if (pct >= 90) return "AI Detective";
    if (pct >= 75) return "Sharp Eye";
    if (pct >= 50) return "Getting There";
    return "AI Fooled You";
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
          <h3 className="text-2xl font-bold mb-2">Can You Tell the Difference?</h3>
          <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
            Read {totalRounds} text snippets and guess whether each was written by a <strong className="text-[var(--color-text)]">human</strong> or generated by <strong className="text-[var(--color-text)]">AI</strong>. It&apos;s harder than you think.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ~2 minutes
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
            {totalRounds} rounds
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-section)] border border-[var(--color-border)]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
            Learn AI detection
          </span>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-violet-600/25"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (gameState === "result") {
    const pct = Math.round((score / totalRounds) * 100);
    return (
      <div className="text-center py-6 space-y-6">
        <div className="text-5xl mb-2">{getScoreEmoji()}</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">{getScoreTitle()}</p>
          <p className="text-4xl font-bold">{score}/{totalRounds}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{pct}% accuracy{bestStreak > 1 ? ` · ${bestStreak} best streak` : ""}</p>
        </div>

        {/* Score bar */}
        <div className="max-w-xs mx-auto">
          <div className="h-2 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Answer review */}
        <div className="max-w-lg mx-auto space-y-2 text-left">
          {answers.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${
              a.correct
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}>
              <span className="mt-0.5 shrink-0">{a.correct ? "✓" : "✗"}</span>
              <div className="min-w-0">
                <p className="line-clamp-1 text-[var(--color-text-muted)]">{a.round.text}</p>
                <p className="text-xs mt-0.5">
                  <span className={a.round.author === "ai" ? "text-violet-400" : "text-emerald-400"}>
                    {a.round.author === "ai" ? "AI" : "Human"}
                  </span>
                  <span className="text-[var(--color-text-muted)]"> · {a.round.source}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-violet-600/25"
        >
          Play Again
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
        <span>Round {currentRound + 1} of {totalRounds}</span>
        <span className="flex items-center gap-3">
          <span>Score: <strong className="text-[var(--color-text)]">{score}</strong></span>
          {streak > 1 && <span className="text-amber-400 font-semibold">{streak} streak</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${((currentRound) / totalRounds) * 100}%` }}
        />
      </div>

      {/* Quote card */}
      <div className={`relative rounded-xl border-2 p-6 md:p-8 transition-all duration-300 ${
        feedback
          ? feedback.correct
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-red-500/50 bg-red-500/5"
          : "border-[var(--color-border)] bg-[var(--color-bg-section)]"
      }`}>
        <svg className="absolute top-4 left-5 w-8 h-8 text-[var(--color-text-muted)] opacity-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-lg md:text-xl leading-relaxed pl-6 italic text-[var(--color-text)]">
          {round.text}
        </p>
        {feedback && (
          <div className={`mt-4 pl-6 text-sm font-medium ${feedback.correct ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.correct ? "Correct!" : "Wrong!"} — Written by <strong>{feedback.answer === "ai" ? "AI" : "a human"}</strong>
            <span className="text-[var(--color-text-muted)] font-normal"> ({round.source})</span>
          </div>
        )}
      </div>

      {/* Guess buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => makeGuess("human")}
          disabled={!!feedback}
          className={`group relative px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
            feedback
              ? feedback.answer === "human"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-[var(--color-border)] opacity-40"
              : "border-[var(--color-border)] hover:border-emerald-500/50 hover:bg-emerald-500/5 text-[var(--color-text)]"
          } disabled:cursor-default`}
        >
          <svg className="w-6 h-6 mx-auto mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Human
        </button>
        <button
          onClick={() => makeGuess("ai")}
          disabled={!!feedback}
          className={`group relative px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
            feedback
              ? feedback.answer === "ai"
                ? "border-violet-500 bg-violet-500/10 text-violet-400"
                : "border-[var(--color-border)] opacity-40"
              : "border-[var(--color-border)] hover:border-violet-500/50 hover:bg-violet-500/5 text-[var(--color-text)]"
          } disabled:cursor-default`}
        >
          <svg className="w-6 h-6 mx-auto mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          AI Generated
        </button>
      </div>
    </div>
  );
}

/* ─── Sentiment Analysis ─── */
function SentimentAnalyser() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ label: string; score: number; breakdown: { positive: number; negative: number; neutral: number } } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyse = useCallback(() => {
    if (!text.trim()) return;
    setLoading(true);
    // Client-side sentiment via keyword scoring (no API needed)
    setTimeout(() => {
      const lower = text.toLowerCase();
      const positiveWords = ["good", "great", "love", "amazing", "excellent", "happy", "wonderful", "fantastic", "awesome", "brilliant", "perfect", "best", "beautiful", "enjoy", "glad", "impressive", "outstanding", "superb", "terrific", "delightful", "magnificent", "pleasant", "remarkable", "splendid", "thankful", "grateful"];
      const negativeWords = ["bad", "terrible", "hate", "awful", "horrible", "sad", "worst", "ugly", "poor", "disgusting", "annoying", "disappointed", "frustrating", "dreadful", "pathetic", "miserable", "unpleasant", "useless", "waste", "broken", "fail", "boring", "angry", "stupid"];
      const intensifiers = ["very", "really", "extremely", "absolutely", "incredibly", "super", "totally"];

      const words = lower.split(/\s+/);
      let pos = 0, neg = 0;
      let hasIntensifier = false;

      words.forEach((w, i) => {
        const clean = w.replace(/[^a-z]/g, "");
        if (intensifiers.includes(clean)) { hasIntensifier = true; return; }
        const mult = hasIntensifier ? 1.5 : 1;
        if (positiveWords.includes(clean)) pos += mult;
        if (negativeWords.includes(clean)) neg += mult;
        hasIntensifier = false;
      });

      // Negation handling
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

      const label = posP > negP + 10 ? "Positive" : negP > posP + 10 ? "Negative" : "Neutral";
      const score = label === "Positive" ? posP : label === "Negative" ? negP : neuP;

      setResult({ label, score, breakdown: { positive: posP, negative: negP, neutral: neuP } });
      setLoading(false);
    }, 400);
  }, [text]);

  const sentimentColor = result?.label === "Positive" ? "#34D399" : result?.label === "Negative" ? "#EF4444" : "#A78BFA";
  const sentimentIcon = result?.label === "Positive" ? "↑" : result?.label === "Negative" ? "↓" : "→";

  return (
    <div className="space-y-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste any text to analyse its sentiment..."
        className="w-full h-28 px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
      />
      <button
        onClick={analyse}
        disabled={!text.trim() || loading}
        className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Analysing..." : "Analyse Sentiment"}
      </button>
      {result && (
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-4" style={{ borderLeft: `4px solid ${sentimentColor}` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: sentimentColor }}>
              {sentimentIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold">{result.label}</div>
              <div className="text-xs text-[var(--color-text-muted)]">Confidence: {result.score}%</div>
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
                <span className="capitalize text-[var(--color-text-muted)]">{k} {result.breakdown[k]}%</span>
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
  const [inputValues, setInputValues] = useState([0.8, 0.3, 0.5]);
  const [activating, setActivating] = useState(false);
  const layers = [3, 4, 4, 2]; // input, hidden1, hidden2, output

  const propagate = useCallback(() => {
    setActivating(true);
    setTimeout(() => setActivating(false), 1500);
  }, []);

  // Calculate node positions
  const svgW = 600, svgH = 300;
  const layerPositions = layers.map((_, i) => 80 + (i * (svgW - 160)) / (layers.length - 1));
  const nodePositions = layers.map((count, li) => {
    const spacing = svgH / (count + 1);
    return Array.from({ length: count }, (_, ni) => ({
      x: layerPositions[li],
      y: spacing * (ni + 1),
    }));
  });

  // Generate pseudo-weights for visualization
  const weights: number[][][] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    weights.push(nodePositions[l].map((_, ni) =>
      nodePositions[l + 1].map((_, nj) => {
        const seed = (l * 17 + ni * 7 + nj * 3) % 100;
        return (seed / 100) * 2 - 1;
      })
    ));
  }

  return (
    <div className="space-y-5">
      {/* Input sliders */}
      <div className="flex items-center gap-6">
        {inputValues.map((val, i) => (
          <div key={i} className="flex-1">
            <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Input {i + 1}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={val}
              onChange={(e) => {
                const next = [...inputValues];
                next[i] = parseFloat(e.target.value);
                setInputValues(next);
              }}
              className="w-full accent-[var(--color-primary)]"
            />
            <div className="text-xs font-mono text-center mt-0.5">{val.toFixed(2)}</div>
          </div>
        ))}
        <button
          onClick={propagate}
          className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all shrink-0"
        >
          Forward Pass →
        </button>
      </div>

      {/* Network SVG */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-[280px]">
          {/* Connections */}
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
                  <line
                    key={`${l}-${ni}-${nj}`}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={color}
                    strokeWidth={strokeW}
                    opacity={activating ? opacity : opacity * 0.5}
                    style={{ transition: `opacity 0.5s ${delay}` }}
                  />
                );
              })
            )
          )}
          {/* Nodes */}
          {nodePositions.map((layer, li) =>
            layer.map((pos, ni) => {
              const isInput = li === 0;
              const isOutput = li === layers.length - 1;
              const val = isInput ? inputValues[ni] : undefined;
              const delay = activating ? `${li * 0.3}s` : "0s";
              const nodeOpacity = activating || isInput ? 1 : 0.6;
              return (
                <g key={`${li}-${ni}`} style={{ transition: `opacity 0.5s ${delay}` }} opacity={nodeOpacity}>
                  <circle
                    cx={pos.x} cy={pos.y} r={isInput || isOutput ? 16 : 12}
                    fill={isInput ? "#6366f1" : isOutput ? "#8b5cf6" : "var(--color-bg-card, #1e1e2e)"}
                    stroke={isInput ? "#6366f1" : isOutput ? "#8b5cf6" : "#6366f1"}
                    strokeWidth={2}
                  />
                  {val !== undefined && (
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      {val.toFixed(1)}
                    </text>
                  )}
                  {isOutput && (
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      {ni === 0 ? "A" : "B"}
                    </text>
                  )}
                </g>
              );
            })
          )}
          {/* Layer labels */}
          {["Input", "Hidden 1", "Hidden 2", "Output"].map((label, i) => (
            <text key={label} x={layerPositions[i]} y={svgH - 8} textAnchor="middle" fill="var(--color-text-muted, #888)" fontSize="11" fontWeight="500">
              {label}
            </text>
          ))}
        </svg>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
        Adjust the input sliders and click <strong>Forward Pass</strong> to watch data propagate through the network. Blue connections are positive weights, red are negative. Thicker lines mean stronger connections.
      </p>
    </div>
  );
}

/* ─── Sorting Algorithm Visualiser ─── */
function SortingVisualiser() {
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
    setActiveIndices([]);
    setSortedIndices(new Set());
    setComparisons(0);
    stopRef.current = true;
    setSorting(false);
  }, []);

  const bubbleSort = useCallback(async () => {
    const arr = [...array];
    let comps = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return;
        setActiveIndices([j, j + 1]);
        comps++;
        setComparisons(comps);
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
        }
        await sleep(30);
      }
      setSortedIndices((prev) => new Set([...prev, arr.length - 1 - i]));
    }
    setActiveIndices([]);
    setSortedIndices(new Set(arr.map((_, i) => i)));
  }, [array]);

  const quickSort = useCallback(async () => {
    const arr = [...array];
    let comps = 0;

    async function partition(lo: number, hi: number): Promise<number> {
      const pivot = arr[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        if (stopRef.current) return lo;
        setActiveIndices([j, hi]);
        comps++;
        setComparisons(comps);
        if (arr[j] <= pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
        }
        await sleep(40);
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
      setArray([...arr]);
      setSortedIndices((prev) => new Set([...prev, i + 1]));
      return i + 1;
    }

    async function qs(lo: number, hi: number) {
      if (lo >= hi || stopRef.current) return;
      const p = await partition(lo, hi);
      await qs(lo, p - 1);
      await qs(p + 1, hi);
    }

    await qs(0, arr.length - 1);
    setActiveIndices([]);
    setSortedIndices(new Set(arr.map((_, i) => i)));
  }, [array]);

  const mergeSort = useCallback(async () => {
    const arr = [...array];
    let comps = 0;

    async function merge(lo: number, mid: number, hi: number) {
      const left = arr.slice(lo, mid + 1);
      const right = arr.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) {
        if (stopRef.current) return;
        setActiveIndices([k]);
        comps++;
        setComparisons(comps);
        if (left[i] <= right[j]) { arr[k++] = left[i++]; }
        else { arr[k++] = right[j++]; }
        setArray([...arr]);
        await sleep(40);
      }
      while (i < left.length) { arr[k++] = left[i++]; setArray([...arr]); await sleep(20); }
      while (j < right.length) { arr[k++] = right[j++]; setArray([...arr]); await sleep(20); }
    }

    async function ms(lo: number, hi: number) {
      if (lo >= hi || stopRef.current) return;
      const mid = Math.floor((lo + hi) / 2);
      await ms(lo, mid);
      await ms(mid + 1, hi);
      await merge(lo, mid, hi);
    }

    await ms(0, arr.length - 1);
    setActiveIndices([]);
    setSortedIndices(new Set(arr.map((_, i) => i)));
  }, [array]);

  const startSort = useCallback(async () => {
    stopRef.current = false;
    setSorting(true);
    setSortedIndices(new Set());
    setComparisons(0);
    if (algorithm === "bubble") await bubbleSort();
    else if (algorithm === "quick") await quickSort();
    else await mergeSort();
    setSorting(false);
  }, [algorithm, bubbleSort, quickSort, mergeSort]);

  const maxVal = Math.max(...array);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {(["bubble", "quick", "merge"] as const).map((algo) => (
          <button
            key={algo}
            onClick={() => !sorting && setAlgorithm(algo)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              algorithm === algo
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            {algo === "bubble" ? "Bubble Sort" : algo === "quick" ? "Quick Sort" : "Merge Sort"}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{comparisons} comparisons</span>
        <button onClick={randomise} disabled={sorting} className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium hover:bg-[var(--color-bg)] transition-all disabled:opacity-40">
          Shuffle
        </button>
        <button onClick={startSort} disabled={sorting} className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40">
          {sorting ? "Sorting..." : "Sort"}
        </button>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[2px] h-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        {array.map((val, i) => {
          const isActive = activeIndices.includes(i);
          const isSorted = sortedIndices.has(i);
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-75"
              style={{
                height: `${(val / maxVal) * 100}%`,
                backgroundColor: isActive ? "#f97316" : isSorted ? "#34d399" : "#6366f1",
                opacity: isActive ? 1 : isSorted ? 0.9 : 0.6,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Tokenizer Demo ─── */
function TokenizerDemo() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const tokenColors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#34d399", "#eab308", "#ef4444"];

  // Simple BPE-like tokenization (word-level with subword splits for demo)
  const tokenize = (input: string) => {
    const words = input.split(/(\s+)/);
    const tokens: { text: string; id: number }[] = [];
    let id = 0;
    words.forEach((word) => {
      if (/^\s+$/.test(word)) {
        tokens.push({ text: word, id: -1 });
      } else if (word.length > 6) {
        // Split longer words to simulate subword tokenization
        const mid = Math.ceil(word.length * 0.6);
        tokens.push({ text: word.slice(0, mid), id: id++ });
        tokens.push({ text: word.slice(mid), id: id++ });
      } else {
        tokens.push({ text: word, id: id++ });
      }
    });
    return tokens;
  };

  const tokens = tokenize(text);
  const tokenCount = tokens.filter((t) => t.id >= 0).length;

  return (
    <div className="space-y-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type text to see how AI breaks it into tokens..."
        className="w-full h-20 px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
      />
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span className="font-semibold">{tokenCount} tokens</span>
        <span>•</span>
        <span>{text.length} characters</span>
        <span>•</span>
        <span>~{(tokenCount * 0.75).toFixed(0)} words equivalent</span>
      </div>
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] min-h-[60px] flex flex-wrap gap-y-2 items-start">
        {tokens.map((token, i) =>
          token.id < 0 ? (
            <span key={i} className="inline-block w-1" />
          ) : (
            <span
              key={i}
              className="inline-block px-1.5 py-0.5 rounded text-xs font-mono text-white"
              style={{ backgroundColor: tokenColors[token.id % tokenColors.length] + "cc" }}
              title={`Token ID: ${token.id}`}
            >
              {token.text}
            </span>
          )
        )}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
        AI models don&apos;t read text like humans. They break text into <strong>tokens</strong> — subword pieces that the model processes individually. Longer words get split into smaller chunks.
      </p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function PlaygroundPage() {
  const t = useTranslations("playground");
  const [activeTab, setActiveTab] = useState<"game" | "sentiment" | "neural" | "sorting" | "tokenizer">("game");

  const tabs = [
    { id: "game" as const, label: "AI or Human?", desc: "Guess if text is human or AI", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
    )},
    { id: "sentiment" as const, label: "Sentiment Analysis", desc: "Detect emotions in text", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
    )},
    { id: "neural" as const, label: "Neural Network", desc: "Visualise how neurons learn", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" d="M12 2v4m0 12v4m-7.07-2.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" /></svg>
    )},
    { id: "sorting" as const, label: "Sorting Algorithms", desc: "Watch algorithms sort in real time", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
    )},
    { id: "tokenizer" as const, label: "Tokenizer", desc: "See how AI reads your text", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    )},
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <ScrollReveal animation="fade-up">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t("title")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* Experiment Picker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-indigo-400 hover:shadow-md"
            }`}
          >
            <div className={`p-2.5 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-indigo-500 text-white"
                : "bg-[var(--color-bg-section)] text-[var(--color-text-muted)] group-hover:bg-indigo-500/20 group-hover:text-indigo-500"
            }`}>
              {tab.icon}
            </div>
            <span className={`text-sm font-semibold leading-tight ${
              activeTab === tab.id ? "text-indigo-500" : ""
            }`}>{tab.label}</span>
            <span className="text-[10px] text-[var(--color-text-muted)] leading-tight hidden sm:block">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <ScrollReveal animation="fade-up">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 md:p-8">
          {activeTab === "game" && (
            <div>
              <h2 className="text-xl font-bold mb-2">AI or Human?</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Can you tell if a piece of text was written by a human or generated by AI? Test your instincts.</p>
              <AIOrHumanGame />
            </div>
          )}
          {activeTab === "sentiment" && (
            <div>
              <h2 className="text-xl font-bold mb-2">Sentiment Analysis</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Analyse the emotional tone of any text using keyword-based NLP — runs entirely in your browser.</p>
              <SentimentAnalyser />
            </div>
          )}
          {activeTab === "neural" && (
            <div>
              <h2 className="text-xl font-bold mb-2">Neural Network Visualiser</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">See how data flows through a neural network. Adjust inputs and watch activations propagate through hidden layers.</p>
              <NeuralNetworkViz />
            </div>
          )}
          {activeTab === "sorting" && (
            <div>
              <h2 className="text-xl font-bold mb-2">Sorting Algorithm Visualiser</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Watch sorting algorithms in action. Compare Bubble Sort, Quick Sort, and Merge Sort side by side.</p>
              <SortingVisualiser />
            </div>
          )}
          {activeTab === "tokenizer" && (
            <div>
              <h2 className="text-xl font-bold mb-2">AI Tokenizer</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">See how large language models break text into tokens — the fundamental unit that AI reads and processes.</p>
              <TokenizerDemo />
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Footer note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--color-text-muted)]">
          All demos run entirely in your browser — no data is sent to any server.
        </p>
      </div>
    </div>
  );
}
