"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

/* ═══════════════════════════════════════════════════════════════
   GameShell — consistent wrapper for all mini-games
   ═══════════════════════════════════════════════════════════════ */
function GameShell({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      {icon && (
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)]">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function StatusBar({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
      <span>{left}</span>
      {right && <span>{right}</span>}
    </div>
  );
}

function GameOverScreen({ emoji, stat, label, onReplay }: { emoji: string; stat: string; label: string; onReplay: () => void }) {
  const t = useTranslations("playground.common");
  return (
    <div className="text-center py-8 space-y-4">
      <div className="text-6xl animate-bounce">{emoji}</div>
      <p className="text-4xl font-bold">{stat}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <button onClick={onReplay} className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20">
        {t("playAgain")}
      </button>
    </div>
  );
}

/* ─── 1. Emoji Decoder ─── */
const EMOJI_PUZZLES = [
  { emojis: "🧠 + 🕸️", answer: "Neural Network", options: ["Neural Network", "Deep Learning", "Decision Tree", "Random Forest"] },
  { emojis: "🤖 + 📝", answer: "Natural Language Processing", options: ["Computer Vision", "Natural Language Processing", "Robotics", "Data Mining"] },
  { emojis: "👁️ + 💻", answer: "Computer Vision", options: ["Computer Vision", "Neural Network", "OCR", "Facial Recognition"] },
  { emojis: "🎲 + 🌲", answer: "Random Forest", options: ["Decision Tree", "Random Forest", "Monte Carlo", "Bayesian Network"] },
  { emojis: "🔄 + 📊", answer: "Feedback Loop", options: ["Feedback Loop", "Data Pipeline", "Recursion", "Backpropagation"] },
  { emojis: "🏋️ + 📈", answer: "Training", options: ["Training", "Inference", "Testing", "Validation"] },
  { emojis: "🎯 + 📉", answer: "Loss Function", options: ["Activation Function", "Loss Function", "Gradient Descent", "Optimiser"] },
  { emojis: "🧬 + 💡", answer: "Genetic Algorithm", options: ["Genetic Algorithm", "Evolution Strategy", "DNA Computing", "Bioinformatics"] },
  { emojis: "🗣️ + 🔊", answer: "Speech Recognition", options: ["Speech Recognition", "Text-to-Speech", "Voice Cloning", "Audio Processing"] },
  { emojis: "🎨 + 🤖", answer: "Generative AI", options: ["Generative AI", "Style Transfer", "Image Classification", "Art Recognition"] },
];

export function EmojiDecoder() {
  const t = useTranslations("playground");
  const [puzzles, setPuzzles] = useState<typeof EMOJI_PUZZLES>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const reset = useCallback(() => {
    setPuzzles([...EMOJI_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 6));
    setCurrent(0); setScore(0); setSelected(null); setGameOver(false);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === puzzles[current].answer) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= puzzles.length) setGameOver(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 1200);
  };

  if (!puzzles.length) return null;

  if (gameOver) {
    return <GameOverScreen emoji={score >= 5 ? "🏆" : score >= 3 ? "👏" : "🎯"} stat={`${score}/${puzzles.length}`} label={t("common.conceptsDecoded")} onReplay={reset} />;
  }

  const puzzle = puzzles[current];
  return (
    <GameShell title={t("games.emojiDecoder.title")} icon="🧩">
      <StatusBar left={`${t("common.round")} ${current + 1}/${puzzles.length}`} right={`${t("common.score")}: ${score}`} />
      <div className="text-center py-8">
        <div className="text-7xl sm:text-8xl mb-5 leading-tight">{puzzle.emojis}</div>
        <p className="text-[var(--color-text-muted)]">{t("games.emojiDecoder.instruction")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {puzzle.options.map(opt => (
          <button key={opt} onClick={() => handleSelect(opt)} disabled={!!selected}
            className={`min-h-[48px] p-4 rounded-xl border-2 font-medium text-left transition-all ${
              selected === opt
                ? opt === puzzle.answer ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-red-500 bg-red-500/10 text-red-400"
                : selected && opt === puzzle.answer ? "border-emerald-500 bg-emerald-500/10" : "border-[var(--color-border)] hover:border-indigo-400 active:scale-[0.98]"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </GameShell>
  );
}

/* ─── 2. Binary Translator ─── */
const BINARY_WORDS = [
  { binary: "01001000 01001001", answer: "HI" },
  { binary: "01000001 01001001", answer: "AI" },
  { binary: "01000010 01001111 01010100", answer: "BOT" },
  { binary: "01000011 01001111 01000100 01000101", answer: "CODE" },
  { binary: "01000100 01000001 01010100 01000001", answer: "DATA" },
  { binary: "01001110 01000101 01010100", answer: "NET" },
];

export function BinaryTranslator() {
  const t = useTranslations("playground");
  const [words, setWords] = useState<typeof BINARY_WORDS>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const reset = useCallback(() => {
    setWords([...BINARY_WORDS].sort(() => Math.random() - 0.5).slice(0, 4));
    setCurrent(0); setInput(""); setScore(0); setFeedback(null); setGameOver(false);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const handleSubmit = () => {
    if (!input.trim() || !words.length) return;
    const correct = input.trim().toUpperCase() === words[current].answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= words.length) setGameOver(true);
      else { setCurrent(c => c + 1); setInput(""); setFeedback(null); }
    }, 1000);
  };

  if (!words.length) return null;

  if (gameOver) {
    return <GameOverScreen emoji={score === words.length ? "🤖" : "💻"} stat={`${score}/${words.length}`} label={t("common.binaryDecoded")} onReplay={reset} />;
  }

  return (
    <GameShell title={t("games.binaryTranslator.title")} icon="💾">
      <StatusBar left={`${t("common.round")} ${current + 1}/${words.length}`} right={`${t("common.score")}: ${score}`} />
      <div className="text-center py-4">
        <p className="text-xs text-[var(--color-text-muted)] mb-3">{t("games.binaryTranslator.hint")}</p>
        <div className="font-mono text-2xl sm:text-3xl tracking-wider p-5 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)]">
          {words[current].binary}
        </div>
      </div>
      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder={t("games.binaryTranslator.placeholder")} maxLength={10} inputMode="text" autoCapitalize="characters"
          className={`flex-1 min-h-[48px] px-4 py-3 rounded-xl border-2 bg-[var(--color-bg)] text-lg font-mono uppercase tracking-widest text-center transition-colors ${
            feedback === "correct" ? "border-emerald-500" : feedback === "wrong" ? "border-red-500" : "border-[var(--color-border)] focus:border-indigo-500"
          } focus:outline-none`} />
        <button onClick={handleSubmit} className="min-h-[48px] px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          {t("common.go")}
        </button>
      </div>
    </GameShell>
  );
}

/* ─── 3. Speed Typer ─── */
const AI_TERMS = ["machine learning", "neural network", "deep learning", "natural language", "computer vision", "reinforcement", "classification", "regression", "transformer", "attention", "gradient descent", "backpropagation", "convolutional", "generative ai", "large language model"];

export function SpeedTyper() {
  const t = useTranslations("playground");
  const [terms, setTerms] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setTerms([...AI_TERMS].sort(() => Math.random() - 0.5).slice(0, 8));
    setCurrent(0); setInput(""); setStarted(false); setTimes([]); setGameOver(false);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const handleInput = (val: string) => {
    if (!started) { setStarted(true); setStartTime(Date.now()); }
    setInput(val);
    if (terms.length && val.toLowerCase() === terms[current]) {
      const elapsed = Date.now() - startTime;
      setTimes(t => [...t, elapsed]);
      if (current + 1 >= terms.length) setGameOver(true);
      else { setCurrent(c => c + 1); setInput(""); setStartTime(Date.now()); }
    }
  };

  useEffect(() => { inputRef.current?.focus(); }, [current]);

  if (!terms.length) return null;

  if (gameOver) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length / 1000;
    return <GameOverScreen emoji="⚡" stat={`${avg.toFixed(1)}s`} label={t("common.perTerm", { count: terms.length })} onReplay={reset} />;
  }

  const term = terms[current];
  return (
    <GameShell title={t("games.speedTyper.title")} icon="⚡">
      <StatusBar left={`${t("common.round")} ${current + 1}/${terms.length}`} right={times.length > 0 ? `${(times[times.length - 1] / 1000).toFixed(1)}s` : t("common.ready")} />
      <div className="text-center py-6">
        <div className="text-3xl sm:text-5xl font-mono font-bold tracking-wide leading-relaxed">
          {term.split("").map((ch, i) => (
            <span key={i} className={i < input.length ? (input[i] === ch ? "text-emerald-400" : "text-red-400") : "text-[var(--color-text-muted)] opacity-40"}>
              {ch}
            </span>
          ))}
        </div>
      </div>
      <input ref={inputRef} value={input} onChange={e => handleInput(e.target.value)} placeholder={t("games.speedTyper.placeholder")} autoFocus inputMode="text"
        className="w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-lg font-mono text-center focus:border-indigo-500 focus:outline-none transition-colors" />
    </GameShell>
  );
}

/* ─── 4. Pattern Matcher (Odd One Out) ─── */
const PATTERN_ROUNDS = [
  { items: ["CNN", "RNN", "LSTM", "SQL"], odd: "SQL", hint: "Three are neural network architectures" },
  { items: ["Python", "TensorFlow", "PyTorch", "Keras"], odd: "Python", hint: "Three are ML frameworks" },
  { items: ["GPT-4", "Claude", "Gemini", "Linux"], odd: "Linux", hint: "Three are large language models" },
  { items: ["Sigmoid", "ReLU", "Tanh", "Fibonacci"], odd: "Fibonacci", hint: "Three are activation functions" },
  { items: ["Overfitting", "Underfitting", "Regularisation", "Compilation"], odd: "Compilation", hint: "Three relate to model training issues" },
  { items: ["BERT", "GPT", "T5", "HTTP"], odd: "HTTP", hint: "Three are transformer models" },
  { items: ["Epoch", "Batch", "Layer", "Router"], odd: "Router", hint: "Three are deep learning terms" },
  { items: ["Precision", "Recall", "F1-Score", "Bandwidth"], odd: "Bandwidth", hint: "Three are evaluation metrics" },
];

export function PatternMatcher() {
  const t = useTranslations("playground");
  const [rounds, setRounds] = useState<typeof PATTERN_ROUNDS>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const reset = useCallback(() => {
    setRounds([...PATTERN_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 6));
    setCurrent(0); setScore(0); setSelected(null); setGameOver(false);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const handleSelect = (item: string) => {
    if (selected) return;
    setSelected(item);
    if (item === rounds[current].odd) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= rounds.length) setGameOver(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 1500);
  };

  if (!rounds.length) return null;

  if (gameOver) {
    return <GameOverScreen emoji={score >= 5 ? "🧠" : score >= 3 ? "🎯" : "💡"} stat={`${score}/${rounds.length}`} label={t("common.patternsSpotted")} onReplay={reset} />;
  }

  const round = rounds[current];
  return (
    <GameShell title={t("games.oddOneOut.title")} icon="🔍">
      <StatusBar left={`${t("common.round")} ${current + 1}/${rounds.length}`} right={`${t("common.score")}: ${score}`} />
      <div className="text-center py-3">
        <p className="text-lg font-semibold mb-1">{t("games.oddOneOut.instruction")}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{round.hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {round.items.map(item => (
          <button key={item} onClick={() => handleSelect(item)} disabled={!!selected}
            className={`min-h-[56px] p-5 rounded-xl border-2 text-lg font-bold text-center transition-all hover:shadow-md ${
              selected === item
                ? item === round.odd ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 scale-105" : "border-red-500 bg-red-500/10 text-red-400"
                : selected && item === round.odd ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-[var(--color-border)] hover:border-indigo-400 active:scale-[0.97]"
            }`}>
            {item}
          </button>
        ))}
      </div>
    </GameShell>
  );
}

/* ─── 5. Memory Match ─── */
const MEMORY_PAIRS = [
  { term: "Epoch", def: "One full pass through training data" },
  { term: "Neuron", def: "Basic unit of a neural network" },
  { term: "Token", def: "Smallest piece of text for LLMs" },
  { term: "Bias", def: "Systematic error in predictions" },
  { term: "Gradient", def: "Direction of steepest change" },
  { term: "Prompt", def: "Input instruction to an AI model" },
  { term: "Hallucination", def: "AI confidently generating false info" },
  { term: "Fine-tuning", def: "Training a pre-trained model further" },
];

export function MemoryMatch() {
  const t = useTranslations("playground");
  const [pairs, setPairs] = useState<typeof MEMORY_PAIRS>([]);
  const [cards, setCards] = useState<{ id: number; text: string; pairId: number; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);

  const reset = useCallback(() => {
    const p = [...MEMORY_PAIRS].sort(() => Math.random() - 0.5).slice(0, 5);
    setPairs(p);
    const c: typeof cards = [];
    p.forEach((pair, i) => {
      c.push({ id: i * 2, text: pair.term, pairId: i, flipped: false, matched: false });
      c.push({ id: i * 2 + 1, text: pair.def, pairId: i, flipped: false, matched: false });
    });
    setCards(c.sort(() => Math.random() - 0.5));
    setFlippedIds([]); setMoves(0); setMatched(0);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const handleFlip = (id: number) => {
    if (flippedIds.length >= 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!);
      if (a.pairId === b.pairId) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.pairId === a.pairId ? { ...c, matched: true } : c));
          setMatched(m => m + 1);
          setFlippedIds([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  if (matched === pairs.length && pairs.length > 0) {
    return <GameOverScreen emoji="🎉" stat={`${moves} ${t("common.moves")}`} label={t("common.allPairsMatched", { count: pairs.length })} onReplay={reset} />;
  }

  return (
    <GameShell title={t("games.memoryMatch.title")} icon="🃏">
      <StatusBar left={`${matched}/${pairs.length} ${t("common.pairs")}`} right={`${moves} ${t("common.moves")}`} />
      <p className="text-center text-sm text-[var(--color-text-muted)]">{t("games.memoryMatch.instruction")}</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {cards.map(card => (
          <button key={card.id} onClick={() => handleFlip(card.id)}
            className={`min-h-[64px] sm:min-h-[72px] p-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center text-center ${
              card.matched ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" :
              card.flipped ? "border-indigo-500 bg-indigo-500/10 scale-105" :
              "border-[var(--color-border)] bg-[var(--color-bg-section)] hover:border-indigo-400 hover:shadow-md active:scale-[0.97]"
            }`}
            style={{ perspective: "600px" }}>
            <span className={`transition-all duration-300 ${card.flipped || card.matched ? "opacity-100" : "opacity-50 text-2xl"}`}>
              {card.flipped || card.matched ? card.text : "?"}
            </span>
          </button>
        ))}
      </div>
    </GameShell>
  );
}

/* ─── 6. AI Timeline ─── */
const TIMELINE_EVENTS = [
  { year: 1950, event: "Turing Test proposed" },
  { year: 1957, event: "Perceptron invented" },
  { year: 1997, event: "Deep Blue beats Kasparov" },
  { year: 2011, event: "Siri launched by Apple" },
  { year: 2012, event: "AlexNet wins ImageNet" },
  { year: 2014, event: "GANs introduced" },
  { year: 2016, event: "AlphaGo beats Lee Sedol" },
  { year: 2017, event: "Transformer paper published" },
  { year: 2020, event: "GPT-3 released" },
  { year: 2022, event: "ChatGPT goes viral" },
];

export function AITimeline() {
  const t = useTranslations("playground");
  const [events, setEvents] = useState<typeof TIMELINE_EVENTS>([]);
  const [order, setOrder] = useState<typeof TIMELINE_EVENTS>([]);
  const [remaining, setRemaining] = useState<typeof TIMELINE_EVENTS>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const reset = useCallback(() => {
    const e = [...TIMELINE_EVENTS].sort(() => Math.random() - 0.5).slice(0, 5);
    setEvents(e);
    setOrder([]);
    setRemaining([...e].sort(() => Math.random() - 0.5));
    setResult(null);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const handlePick = (event: typeof TIMELINE_EVENTS[0]) => {
    setOrder(o => [...o, event]);
    setRemaining(r => r.filter(e => e !== event));
  };

  const handleUndo = () => {
    if (!order.length) return;
    const last = order[order.length - 1];
    setOrder(o => o.slice(0, -1));
    setRemaining(r => [...r, last]);
  };

  const handleCheck = () => {
    const correct = order.every((e, i) => i === 0 || e.year >= order[i - 1].year);
    setResult(correct ? "correct" : "wrong");
  };

  if (!events.length) return null;

  if (result) {
    const sorted = [...events].sort((a, b) => a.year - b.year);
    return (
      <div className="text-center py-8 space-y-5">
        <div className="text-6xl animate-bounce">{result === "correct" ? "🏆" : "📚"}</div>
        <p className="text-xl font-bold">{result === "correct" ? t("common.perfectOrder") : t("common.notQuiteTimeline")}</p>
        <div className="space-y-2 max-w-sm mx-auto text-left">
          {sorted.map((e, i) => (
            <div key={e.year} className="flex gap-3 items-center text-sm p-2 rounded-lg bg-[var(--color-bg-section)]">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              <span className="font-mono font-bold text-indigo-400 w-12">{e.year}</span>
              <span>{e.event}</span>
              {i < sorted.length - 1 && <div className="absolute left-[18px] top-full w-0.5 h-2 bg-indigo-500/30" />}
            </div>
          ))}
        </div>
        <button onClick={reset} className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">
          {t("common.playAgain")}
        </button>
      </div>
    );
  }

  return (
    <GameShell title={t("games.aiTimeline.title")} icon="📅">
      <p className="text-center text-sm text-[var(--color-text-muted)]">{t("games.aiTimeline.instruction")}</p>
      {order.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-text-muted)] font-semibold">{t("common.yourOrder")}</p>
          {order.map((e, i) => (
            <div key={e.year} className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-sm">
              <span className="text-indigo-400 font-bold w-5">{i + 1}.</span>
              <span>{e.event}</span>
            </div>
          ))}
          <button onClick={handleUndo} className="text-xs text-red-400 hover:text-red-300 mt-1 min-h-[32px]">↩ {t("common.undoLast")}</button>
        </div>
      )}
      {remaining.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5">
          {remaining.map(e => (
            <button key={e.year} onClick={() => handlePick(e)}
              className="min-h-[48px] p-4 rounded-xl border-2 border-[var(--color-border)] text-sm font-medium hover:border-indigo-400 hover:shadow-md active:scale-[0.98] transition-all text-left">
              {e.event}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={handleCheck} className="w-full min-h-[48px] py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:brightness-110 transition-all">
          {t("common.checkOrder")}
        </button>
      )}
    </GameShell>
  );
}

/* ─── 7. Bias Detective ─── */
const BIAS_SCENARIOS = [
  { scenario: "A hiring AI trained only on tech company data from Silicon Valley is used to screen candidates globally.", bias: "Geographic & cultural bias", explanation: "The model learned patterns from one region and may penalise candidates from different backgrounds." },
  { scenario: "A facial recognition system achieves 99% accuracy on light-skinned faces but only 65% on dark-skinned faces.", bias: "Racial bias in training data", explanation: "The training dataset was not diverse, leading to unequal performance across skin tones." },
  { scenario: "A loan approval AI denies more applications from certain postcodes, which correlate with minority neighbourhoods.", bias: "Proxy discrimination", explanation: "Even without using race directly, the postcode acts as a proxy for racial demographics." },
  { scenario: "An AI writing assistant always suggests male pronouns when writing about engineers and female pronouns for nurses.", bias: "Gender stereotyping", explanation: "The model learned gendered associations from biased text data reflecting societal stereotypes." },
  { scenario: "A medical AI performs well for common diseases but fails for rare conditions that mostly affect elderly patients.", bias: "Age-related data imbalance", explanation: "Rare conditions in underrepresented demographics get fewer training examples." },
  { scenario: "An AI-powered news feed only shows users content that confirms their existing beliefs.", bias: "Confirmation bias amplification", explanation: "The recommendation algorithm optimises for engagement, creating filter bubbles." },
];

export function BiasDetective() {
  const t = useTranslations("playground");
  const [scenarios, setScenarios] = useState<typeof BIAS_SCENARIOS>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setScenarios([...BIAS_SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 4));
    setCurrent(0); setRevealed(false); setDone(false);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  if (!scenarios.length) return null;

  if (done) {
    return <GameOverScreen emoji="🕵️" stat={t("common.greatDetective")} label={t("common.reviewedBias", { count: scenarios.length })} onReplay={reset} />;
  }

  const s = scenarios[current];
  return (
    <GameShell title={t("games.biasDetective.title")} icon="🕵️">
      <StatusBar left={`${t("common.round")} ${current + 1}/${scenarios.length}`} />
      <div className="p-5 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)] leading-relaxed">
        <p className="text-sm sm:text-base">{s.scenario}</p>
      </div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="w-full min-h-[48px] py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:brightness-110 transition-all">
          🔍 {t("games.biasDetective.revealBias")}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-amber-500/10 border-2 border-amber-500/30">
            <p className="font-bold text-amber-400 text-sm mb-2">{s.bias}</p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{s.explanation}</p>
          </div>
          <button onClick={() => { if (current + 1 >= scenarios.length) setDone(true); else { setCurrent(c => c + 1); setRevealed(false); } }}
            className="w-full min-h-[48px] py-3 border-2 border-[var(--color-border)] rounded-xl font-semibold hover:border-indigo-400 transition-all">
            {current + 1 >= scenarios.length ? t("common.finish") : `${t("games.biasDetective.nextCase")} →`}
          </button>
        </div>
      )}
    </GameShell>
  );
}

/* ─── 8. Token Counter ─── */
const TOKEN_SENTENCES = [
  { text: "Hello world", tokens: 2 },
  { text: "The quick brown fox jumps over the lazy dog", tokens: 9 },
  { text: "Artificial intelligence is transforming healthcare", tokens: 5 },
  { text: "I love programming in Python", tokens: 5 },
  { text: "Machine learning models require large datasets", tokens: 6 },
  { text: "OpenAI released GPT-4 in March 2023", tokens: 9 },
  { text: "The cat sat on the mat", tokens: 6 },
  { text: "Supercalifragilisticexpialidocious", tokens: 7 },
];

export function TokenCounter() {
  const t = useTranslations("playground");
  const [sentences, setSentences] = useState<typeof TOKEN_SENTENCES>([]);
  const [current, setCurrent] = useState(0);
  const [guess, setGuess] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [totalDiff, setTotalDiff] = useState(0);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setSentences([...TOKEN_SENTENCES].sort(() => Math.random() - 0.5).slice(0, 5));
    setCurrent(0); setGuess(5); setSubmitted(false); setTotalDiff(0); setDone(false);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTotalDiff(d => d + Math.abs(guess - sentences[current].tokens));
  };

  const handleNext = () => {
    if (current + 1 >= sentences.length) setDone(true);
    else { setCurrent(c => c + 1); setGuess(5); setSubmitted(false); }
  };

  if (!sentences.length) return null;

  if (done) {
    const avgDiff = (totalDiff / sentences.length).toFixed(1);
    return <GameOverScreen emoji={Number(avgDiff) <= 1 ? "🎯" : Number(avgDiff) <= 2 ? "👍" : "📝"} stat={`${avgDiff} ${t("common.avgDiff")}`} label={t("common.avgDistance")} onReplay={reset} />;
  }

  const s = sentences[current];
  const diff = Math.abs(guess - s.tokens);
  return (
    <GameShell title={t("games.tokenCounter.title")} icon="🔢">
      <StatusBar left={`${t("common.round")} ${current + 1}/${sentences.length}`} />
      <div className="p-5 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)] text-center">
        <p className="text-lg sm:text-xl font-medium">&ldquo;{s.text}&rdquo;</p>
      </div>
      {!submitted ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-[var(--color-text-muted)]">{t("games.tokenCounter.instruction")}</p>
          <div className="flex items-center justify-center gap-5">
            <button onClick={() => setGuess(g => Math.max(1, g - 1))} className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] font-bold text-xl hover:border-indigo-400 transition-colors">−</button>
            <span className="text-5xl font-bold w-20 text-center tabular-nums">{guess}</span>
            <button onClick={() => setGuess(g => g + 1)} className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] font-bold text-xl hover:border-indigo-400 transition-colors">+</button>
          </div>
          <button onClick={handleSubmit} className="w-full min-h-[48px] py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:brightness-110 transition-all">{t("common.lockIn")}</button>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">{t("games.tokenCounter.actual")}</p>
              <p className="text-3xl font-bold text-indigo-400">{s.tokens}</p>
            </div>
            <div className="text-2xl text-[var(--color-text-muted)]">vs</div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">{t("games.tokenCounter.yourGuess")}</p>
              <p className="text-3xl font-bold">{guess}</p>
            </div>
          </div>
          <p className={`text-sm font-semibold ${guess === s.tokens ? "text-emerald-400" : diff <= 1 ? "text-amber-400" : "text-red-400"}`}>
            {guess === s.tokens ? `${t("games.tokenCounter.exact")} 🎯` : diff <= 1 ? t("games.tokenCounter.soClose") : t("games.tokenCounter.offBy", { count: diff })}
          </p>
          <button onClick={handleNext} className="w-full min-h-[48px] py-3 border-2 border-[var(--color-border)] rounded-xl font-semibold hover:border-indigo-400 transition-all">
            {current + 1 >= sentences.length ? t("common.seeResults") : `${t("common.next")} →`}
          </button>
        </div>
      )}
    </GameShell>
  );
}

/* ─── 9. Prompt Engineer ─── */
const PROMPT_ROUNDS = [
  { task: "Get a recipe for pasta", bad: "Give me pasta", good: "Give me a simple pasta recipe with ingredients list and step-by-step instructions for 2 servings", why: "Specific prompts with constraints (servings, format) get better results." },
  { task: "Debug Python code", bad: "Fix my code", good: "My Python function raises TypeError on line 12 when passing a list. Here's the code: [code]. What's wrong and how do I fix it?", why: "Including the error, location, and code gives AI context to help effectively." },
  { task: "Write a professional email", bad: "Write an email", good: "Write a concise professional email declining a meeting invitation due to a scheduling conflict, maintaining a positive tone", why: "Specifying tone, purpose, and constraints produces more usable output." },
  { task: "Explain a concept", bad: "Explain neural networks", good: "Explain how neural networks work to a 10-year-old using a simple analogy. Keep it under 100 words.", why: "Defining the audience and length constraint tailors the explanation perfectly." },
  { task: "Generate test data", bad: "Make some test data", good: "Generate 5 JSON objects representing users with fields: id (UUID), name, email, age (18-65), and createdAt (ISO date in 2024)", why: "Specifying format, count, field types, and constraints yields usable data." },
];

export function PromptEngineer() {
  const t = useTranslations("playground");
  const [rounds, setRounds] = useState<typeof PROMPT_ROUNDS>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<"good" | "bad" | null>(null);
  const [options, setOptions] = useState<{ label: string; type: "good" | "bad" }[]>([]);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setRounds([...PROMPT_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 4));
    setCurrent(0); setScore(0); setSelected(null); setDone(false);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    if (rounds.length > 0 && current < rounds.length) {
      const r = rounds[current];
      const opts = Math.random() > 0.5
        ? [{ label: r.good, type: "good" as const }, { label: r.bad, type: "bad" as const }]
        : [{ label: r.bad, type: "bad" as const }, { label: r.good, type: "good" as const }];
      setOptions(opts);
    }
  }, [current, rounds]);

  const handleSelect = (type: "good" | "bad") => {
    if (selected) return;
    setSelected(type);
    if (type === "good") setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= rounds.length) setDone(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 2500);
  };

  if (!rounds.length) return null;

  if (done) {
    return <GameOverScreen emoji={score === rounds.length ? "🧙" : score >= 2 ? "📝" : "💡"} stat={`${score}/${rounds.length}`} label={t("common.promptScore")} onReplay={reset} />;
  }

  return (
    <GameShell title={t("games.promptEngineer.title")} icon="🧙">
      <StatusBar left={`${t("common.round")} ${current + 1}/${rounds.length}`} right={`${t("common.score")}: ${score}`} />
      <div className="text-center p-4 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] mb-1">{t("games.promptEngineer.task")}:</p>
        <p className="font-semibold text-base">{rounds[current].task}</p>
      </div>
      <p className="text-center text-sm text-[var(--color-text-muted)]">{t("games.promptEngineer.instruction")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleSelect(opt.type)} disabled={!!selected}
            className={`min-h-[48px] p-5 rounded-xl border-2 text-sm text-left transition-all leading-relaxed ${
              selected && opt.type === "good" ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20" :
              selected === opt.type && opt.type === "bad" ? "border-red-500 bg-red-500/10" :
              !selected ? "border-[var(--color-border)] hover:border-indigo-400 hover:shadow-md active:scale-[0.99]" : "border-[var(--color-border)] opacity-50"
            }`}>
            <span className="italic">&ldquo;{opt.label}&rdquo;</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-sm text-[var(--color-text-muted)]">
          💡 {rounds[current].why}
        </div>
      )}
    </GameShell>
  );
}

/* ─── 10. Jargon Buster ─── */
const JARGON_QUESTIONS = [
  { term: "Hallucination", definition: "When an AI generates false information confidently", correct: true },
  { term: "Overfitting", definition: "When a model performs too well on new data", correct: false },
  { term: "Transformer", definition: "The architecture behind GPT and BERT", correct: true },
  { term: "Epoch", definition: "One complete pass through the training dataset", correct: true },
  { term: "Gradient Descent", definition: "A method to increase the error in a model", correct: false },
  { term: "Token", definition: "A small piece of text that LLMs process", correct: true },
  { term: "Reinforcement Learning", definition: "Learning by memorising the entire dataset", correct: false },
  { term: "Inference", definition: "Using a trained model to make predictions", correct: true },
  { term: "Embedding", definition: "Converting text into numerical vectors", correct: true },
  { term: "Backpropagation", definition: "Running a model in reverse to delete data", correct: false },
  { term: "Fine-tuning", definition: "Training a pre-trained model on specific data", correct: true },
  { term: "Latent Space", definition: "The physical storage location of AI models", correct: false },
];

export function JargonBuster() {
  const t = useTranslations("playground");
  const [questions, setQuestions] = useState<typeof JARGON_QUESTIONS>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const reset = useCallback(() => {
    setQuestions([...JARGON_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8));
    setCurrent(0); setScore(0); setAnswered(null); setDone(false); setTimeLeft(10);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    if (done || answered !== null || !questions.length) return;
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, done, answered, questions.length]);

  const handleAnswer = useCallback((userSays: boolean | null) => {
    if (answered !== null) return;
    clearInterval(timerRef.current);
    const q = questions[current];
    if (!q) return;
    const correct = userSays === q.correct;
    if (correct) setScore(s => s + 1);
    setAnswered(correct);
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true);
      else { setCurrent(c => c + 1); setAnswered(null); }
    }, 1200);
  }, [answered, current, questions]);

  if (!questions.length) return null;

  if (done) {
    return <GameOverScreen emoji={score >= 7 ? "🏆" : score >= 5 ? "📖" : "🔍"} stat={`${score}/${questions.length}`} label={t("common.jargonBusted")} onReplay={reset} />;
  }

  const q = questions[current];
  return (
    <GameShell title={t("games.jargonBuster.title")} icon="📖">
      <StatusBar left={`${current + 1}/${questions.length}`} right={`${t("common.score")}: ${score}`} />
      {/* Timer bar */}
      <div className="h-2 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"}`} style={{ width: `${timeLeft * 10}%` }} />
      </div>
      <div className="text-center text-sm font-mono font-bold">
        <span className={timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-[var(--color-text-muted)]"}>{timeLeft}s</span>
      </div>
      <div className="text-center p-6 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">{t("games.jargonBuster.term")}</p>
        <p className="text-2xl sm:text-3xl font-bold mb-3">{q.term}</p>
        <p className="text-sm text-[var(--color-text-muted)]">&ldquo;{q.definition}&rdquo;</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => handleAnswer(true)} disabled={answered !== null}
          className={`min-h-[56px] p-4 rounded-xl border-2 font-bold text-lg transition-all ${
            answered !== null ? (q.correct ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-[var(--color-border)] opacity-40")
            : "border-[var(--color-border)] hover:border-emerald-500 hover:bg-emerald-500/5 active:scale-[0.97]"
          }`}>
          ✅ {t("games.jargonBuster.true")}
        </button>
        <button onClick={() => handleAnswer(false)} disabled={answered !== null}
          className={`min-h-[56px] p-4 rounded-xl border-2 font-bold text-lg transition-all ${
            answered !== null ? (!q.correct ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-[var(--color-border)] opacity-40")
            : "border-[var(--color-border)] hover:border-red-500 hover:bg-red-500/5 active:scale-[0.97]"
          }`}>
          ❌ {t("games.jargonBuster.false")}
        </button>
      </div>
      {answered !== null && (
        <p className={`text-center text-sm font-semibold ${answered ? "text-emerald-400" : "text-red-400"}`}>
          {answered ? `${t("common.correct")} ✨` : `${t("common.wrong")}`}
        </p>
      )}
    </GameShell>
  );
}

/* ─── Game Registry ─── */
export const ALL_GAMES = [
  { id: "emoji-decoder", name: "Emoji Decoder", desc: "Guess AI concepts from emojis", icon: "🧩", component: EmojiDecoder },
  { id: "binary-translator", name: "Binary Translator", desc: "Decode binary to text", icon: "💾", component: BinaryTranslator },
  { id: "speed-typer", name: "Speed Typer", desc: "Type AI terms fast", icon: "⚡", component: SpeedTyper },
  { id: "pattern-matcher", name: "Odd One Out", desc: "Spot what doesn't belong", icon: "🔍", component: PatternMatcher },
  { id: "memory-match", name: "Memory Match", desc: "Match terms with definitions", icon: "🃏", component: MemoryMatch },
  { id: "ai-timeline", name: "AI Timeline", desc: "Sort milestones chronologically", icon: "📅", component: AITimeline },
  { id: "bias-detective", name: "Bias Detective", desc: "Spot AI bias in scenarios", icon: "🕵️", component: BiasDetective },
  { id: "token-counter", name: "Token Counter", desc: "Guess how LLMs tokenise text", icon: "🔢", component: TokenCounter },
  { id: "prompt-engineer", name: "Prompt Engineer", desc: "Pick the better prompt", icon: "🧙", component: PromptEngineer },
  { id: "jargon-buster", name: "Jargon Buster", desc: "True or false on AI terms", icon: "📖", component: JargonBuster },
];
