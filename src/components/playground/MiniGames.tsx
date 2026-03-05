"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   10 AI-Themed Mini Games — mobile-friendly, touch-optimised
   ═══════════════════════════════════════════════════════════════ */

/* ─── 1. Emoji Decoder: Guess the AI concept from emojis ─── */
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
  const [puzzles, setPuzzles] = useState<typeof EMOJI_PUZZLES>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const shuffled = [...EMOJI_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 6);
    setPuzzles(shuffled);
  }, []);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === puzzles[current].answer;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= puzzles.length) {
        setGameOver(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 1200);
  };

  if (!puzzles.length) return null;

  if (gameOver) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">{score >= 5 ? "🏆" : score >= 3 ? "👏" : "🎯"}</div>
        <p className="text-3xl font-bold">{score}/{puzzles.length}</p>
        <p className="text-sm text-[var(--color-text-muted)]">AI concepts decoded</p>
        <button onClick={() => { setGameOver(false); setCurrent(0); setScore(0); setSelected(null); setPuzzles([...EMOJI_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 6)); }} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">
          Play Again
        </button>
      </div>
    );
  }

  const puzzle = puzzles[current];
  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>Round {current + 1}/{puzzles.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="text-center py-6">
        <div className="text-6xl mb-4">{puzzle.emojis}</div>
        <p className="text-[var(--color-text-muted)]">What AI concept do these emojis represent?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {puzzle.options.map(opt => (
          <button key={opt} onClick={() => handleSelect(opt)} disabled={!!selected}
            className={`p-4 rounded-xl border-2 font-medium text-left transition-all ${
              selected === opt
                ? opt === puzzle.answer ? "border-green-500 bg-green-500/10 text-green-500" : "border-red-500 bg-red-500/10 text-red-500"
                : selected && opt === puzzle.answer ? "border-green-500 bg-green-500/10" : "border-[var(--color-border)] hover:border-indigo-400 active:scale-[0.98]"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── 2. Binary Translator: Convert binary to text ─── */
const BINARY_WORDS = [
  { binary: "01001000 01001001", answer: "HI" },
  { binary: "01000001 01001001", answer: "AI" },
  { binary: "01000010 01001111 01010100", answer: "BOT" },
  { binary: "01000011 01001111 01000100 01000101", answer: "CODE" },
  { binary: "01000100 01000001 01010100 01000001", answer: "DATA" },
  { binary: "01001110 01000101 01010100", answer: "NET" },
];

export function BinaryTranslator() {
  const [words] = useState(() => [...BINARY_WORDS].sort(() => Math.random() - 0.5).slice(0, 4));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const correct = input.trim().toUpperCase() === words[current].answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= words.length) setGameOver(true);
      else { setCurrent(c => c + 1); setInput(""); setFeedback(null); }
    }, 1000);
  };

  if (gameOver) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">{score === words.length ? "🤖" : "💻"}</div>
        <p className="text-3xl font-bold">{score}/{words.length}</p>
        <p className="text-sm text-[var(--color-text-muted)]">Binary decoded like a machine</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>Word {current + 1}/{words.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="text-center py-4">
        <p className="text-xs text-[var(--color-text-muted)] mb-2">Hint: Each 8-digit group = one letter (A=65, B=66...)</p>
        <div className="font-mono text-2xl sm:text-3xl tracking-wider p-4 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)]">{words[current].binary}</div>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Type the word..." maxLength={10}
          className={`flex-1 px-4 py-3 rounded-xl border-2 bg-[var(--color-bg)] text-lg font-mono uppercase tracking-widest text-center transition-colors ${feedback === "correct" ? "border-green-500" : feedback === "wrong" ? "border-red-500" : "border-[var(--color-border)]"}`} />
        <button onClick={handleSubmit} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Go</button>
      </div>
    </div>
  );
}

/* ─── 3. Speed Typer: Type AI terms as fast as possible ─── */
const AI_TERMS = ["machine learning", "neural network", "deep learning", "natural language", "computer vision", "reinforcement", "classification", "regression", "transformer", "attention", "gradient descent", "backpropagation", "convolutional", "generative ai", "large language model"];

export function SpeedTyper() {
  const [terms] = useState(() => [...AI_TERMS].sort(() => Math.random() - 0.5).slice(0, 8));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (val: string) => {
    if (!started) { setStarted(true); setStartTime(Date.now()); }
    setInput(val);
    if (val.toLowerCase() === terms[current]) {
      const elapsed = Date.now() - startTime;
      setTimes(t => [...t, elapsed]);
      if (current + 1 >= terms.length) { setGameOver(true); }
      else { setCurrent(c => c + 1); setInput(""); setStartTime(Date.now()); }
    }
  };

  useEffect(() => { inputRef.current?.focus(); }, [current]);

  if (gameOver) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length / 1000;
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">⚡</div>
        <p className="text-3xl font-bold">{avg.toFixed(1)}s avg</p>
        <p className="text-sm text-[var(--color-text-muted)]">per term · {terms.length} terms typed</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  const term = terms[current];
  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>Term {current + 1}/{terms.length}</span>
        <span>{times.length > 0 ? `Last: ${(times[times.length - 1] / 1000).toFixed(1)}s` : "Ready..."}</span>
      </div>
      <div className="text-center py-4">
        <div className="text-3xl sm:text-4xl font-mono font-bold tracking-wide">
          {term.split("").map((ch, i) => (
            <span key={i} className={i < input.length ? (input[i] === ch ? "text-green-500" : "text-red-500") : "text-[var(--color-text-muted)]"}>{ch}</span>
          ))}
        </div>
      </div>
      <input ref={inputRef} value={input} onChange={e => handleInput(e.target.value)} placeholder="Start typing..." autoFocus
        className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-lg font-mono text-center" />
    </div>
  );
}

/* ─── 4. Pattern Matcher: Find the odd one out ─── */
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
  const [rounds] = useState(() => [...PATTERN_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 6));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

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
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">{score >= 5 ? "🧠" : score >= 3 ? "🎯" : "💡"}</div>
        <p className="text-3xl font-bold">{score}/{rounds.length}</p>
        <p className="text-sm text-[var(--color-text-muted)]">patterns spotted</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  const round = rounds[current];
  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>Round {current + 1}/{rounds.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="text-center py-2">
        <p className="text-lg font-semibold mb-1">Find the odd one out</p>
        <p className="text-sm text-[var(--color-text-muted)]">{round.hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {round.items.map(item => (
          <button key={item} onClick={() => handleSelect(item)} disabled={!!selected}
            className={`p-5 rounded-xl border-2 text-lg font-bold text-center transition-all ${
              selected === item
                ? item === round.odd ? "border-green-500 bg-green-500/10 text-green-500" : "border-red-500 bg-red-500/10 text-red-500"
                : selected && item === round.odd ? "border-green-500 bg-green-500/10 text-green-500" : "border-[var(--color-border)] hover:border-indigo-400 active:scale-[0.97]"
            }`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── 5. Memory Match: Match AI terms with definitions ─── */
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
  const [pairs] = useState(() => [...MEMORY_PAIRS].sort(() => Math.random() - 0.5).slice(0, 5));
  const [cards, setCards] = useState<{ id: number; text: string; pairId: number; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);

  useEffect(() => {
    const c: typeof cards = [];
    pairs.forEach((p, i) => {
      c.push({ id: i * 2, text: p.term, pairId: i, flipped: false, matched: false });
      c.push({ id: i * 2 + 1, text: p.def, pairId: i, flipped: false, matched: false });
    });
    setCards(c.sort(() => Math.random() - 0.5));
  }, [pairs]);

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
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">🎉</div>
        <p className="text-3xl font-bold">{moves} moves</p>
        <p className="text-sm text-[var(--color-text-muted)]">All {pairs.length} pairs matched</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>{matched}/{pairs.length} pairs</span>
        <span>{moves} moves</span>
      </div>
      <p className="text-center text-sm text-[var(--color-text-muted)]">Match each AI term with its definition</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {cards.map(card => (
          <button key={card.id} onClick={() => handleFlip(card.id)}
            className={`aspect-square sm:aspect-auto sm:p-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all flex items-center justify-center text-center ${
              card.matched ? "border-green-500 bg-green-500/10 text-green-600" :
              card.flipped ? "border-indigo-500 bg-indigo-500/10" :
              "border-[var(--color-border)] bg-[var(--color-bg-section)] hover:border-indigo-400 active:scale-[0.97]"
            }`}>
            {card.flipped || card.matched ? card.text : "?"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── 6. AI Timeline: Put AI milestones in chronological order ─── */
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
  const [events] = useState(() => [...TIMELINE_EVENTS].sort(() => Math.random() - 0.5).slice(0, 5));
  const [order, setOrder] = useState<typeof events>([]);
  const [remaining, setRemaining] = useState<typeof events>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => { setRemaining([...events].sort(() => Math.random() - 0.5)); }, [events]);

  const handlePick = (event: typeof events[0]) => {
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

  if (result) {
    const sorted = [...events].sort((a, b) => a.year - b.year);
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">{result === "correct" ? "🏆" : "📚"}</div>
        <p className="text-xl font-bold">{result === "correct" ? "Perfect order!" : "Not quite — here's the correct timeline:"}</p>
        <div className="space-y-2 max-w-sm mx-auto text-left">
          {sorted.map(e => (
            <div key={e.year} className="flex gap-3 items-center text-sm">
              <span className="font-mono font-bold text-indigo-500 w-12">{e.year}</span>
              <span>{e.event}</span>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-[var(--color-text-muted)]">Tap events in chronological order (earliest first)</p>
      {order.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-semibold">Your order:</p>
          {order.map((e, i) => (
            <div key={e.year} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-sm">
              <span className="text-indigo-500 font-bold">{i + 1}.</span> {e.event}
            </div>
          ))}
          <button onClick={handleUndo} className="text-xs text-red-400 hover:text-red-300 mt-1">↩ Undo last</button>
        </div>
      )}
      {remaining.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {remaining.map(e => (
            <button key={e.year} onClick={() => handlePick(e)}
              className="p-3 rounded-xl border-2 border-[var(--color-border)] text-sm font-medium hover:border-indigo-400 active:scale-[0.98] transition-all text-left">
              {e.event}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={handleCheck} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:brightness-110 transition-all">
          Check My Order
        </button>
      )}
    </div>
  );
}

/* ─── 7. Bias Detective: Spot the bias in AI scenarios ─── */
const BIAS_SCENARIOS = [
  { scenario: "A hiring AI trained only on tech company data from Silicon Valley is used to screen candidates globally.", bias: "Geographic & cultural bias", explanation: "The model learned patterns from one region and may penalise candidates from different backgrounds." },
  { scenario: "A facial recognition system achieves 99% accuracy on light-skinned faces but only 65% on dark-skinned faces.", bias: "Racial bias in training data", explanation: "The training dataset was not diverse, leading to unequal performance across skin tones." },
  { scenario: "A loan approval AI denies more applications from certain postcodes, which correlate with minority neighbourhoods.", bias: "Proxy discrimination", explanation: "Even without using race directly, the postcode acts as a proxy for racial demographics." },
  { scenario: "An AI writing assistant always suggests male pronouns when writing about engineers and female pronouns for nurses.", bias: "Gender stereotyping", explanation: "The model learned gendered associations from biased text data reflecting societal stereotypes." },
  { scenario: "A medical AI performs well for common diseases but fails for rare conditions that mostly affect elderly patients.", bias: "Age-related data imbalance", explanation: "Rare conditions in underrepresented demographics get fewer training examples." },
  { scenario: "An AI-powered news feed only shows users content that confirms their existing beliefs.", bias: "Confirmation bias amplification", explanation: "The recommendation algorithm optimises for engagement, creating filter bubbles." },
];

export function BiasDetective() {
  const [scenarios] = useState(() => [...BIAS_SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 4));
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">🕵️</div>
        <p className="text-xl font-bold">Great detective work!</p>
        <p className="text-sm text-[var(--color-text-muted)]">You reviewed {scenarios.length} bias scenarios. Understanding bias is the first step to building fairer AI.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  const s = scenarios[current];
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>Case {current + 1}/{scenarios.length}</span>
        <span>🕵️ Bias Detective</span>
      </div>
      <div className="p-5 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)]">
        <p className="text-sm leading-relaxed">{s.scenario}</p>
      </div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:brightness-110 transition-all">
          Reveal the Bias
        </button>
      ) : (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="font-bold text-amber-500 text-sm mb-1">{s.bias}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{s.explanation}</p>
          </div>
          <button onClick={() => { if (current + 1 >= scenarios.length) setDone(true); else { setCurrent(c => c + 1); setRevealed(false); } }}
            className="w-full py-3 border-2 border-[var(--color-border)] rounded-xl font-semibold hover:border-indigo-400 transition-all">
            {current + 1 >= scenarios.length ? "Finish" : "Next Case →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 8. Token Counter: Guess how many tokens a sentence has ─── */
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
  const [sentences] = useState(() => [...TOKEN_SENTENCES].sort(() => Math.random() - 0.5).slice(0, 5));
  const [current, setCurrent] = useState(0);
  const [guess, setGuess] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [totalDiff, setTotalDiff] = useState(0);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTotalDiff(d => d + Math.abs(guess - sentences[current].tokens));
  };

  const handleNext = () => {
    if (current + 1 >= sentences.length) setDone(true);
    else { setCurrent(c => c + 1); setGuess(5); setSubmitted(false); }
  };

  if (done) {
    const avgDiff = (totalDiff / sentences.length).toFixed(1);
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">{Number(avgDiff) <= 1 ? "🎯" : Number(avgDiff) <= 2 ? "👍" : "📝"}</div>
        <p className="text-3xl font-bold">{avgDiff} avg diff</p>
        <p className="text-sm text-[var(--color-text-muted)]">Average distance from actual token count</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  const s = sentences[current];
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>Sentence {current + 1}/{sentences.length}</span>
      </div>
      <div className="p-5 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)] text-center">
        <p className="text-lg font-medium">&ldquo;{s.text}&rdquo;</p>
      </div>
      {!submitted ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-[var(--color-text-muted)]">How many tokens does an LLM see?</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setGuess(g => Math.max(1, g - 1))} className="w-10 h-10 rounded-full border-2 border-[var(--color-border)] font-bold text-lg hover:border-indigo-400 transition-colors">-</button>
            <span className="text-4xl font-bold w-16 text-center">{guess}</span>
            <button onClick={() => setGuess(g => g + 1)} className="w-10 h-10 rounded-full border-2 border-[var(--color-border)] font-bold text-lg hover:border-indigo-400 transition-colors">+</button>
          </div>
          <button onClick={handleSubmit} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:brightness-110 transition-all">Lock In</button>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <p className="text-sm">Actual: <span className="text-2xl font-bold text-indigo-500">{s.tokens}</span> tokens · Your guess: <span className="text-2xl font-bold">{guess}</span></p>
          <p className={`text-sm font-semibold ${guess === s.tokens ? "text-green-500" : Math.abs(guess - s.tokens) <= 1 ? "text-amber-500" : "text-red-400"}`}>
            {guess === s.tokens ? "Exact! 🎯" : Math.abs(guess - s.tokens) <= 1 ? "So close!" : `Off by ${Math.abs(guess - s.tokens)}`}
          </p>
          <button onClick={handleNext} className="w-full py-3 border-2 border-[var(--color-border)] rounded-xl font-semibold hover:border-indigo-400 transition-all">
            {current + 1 >= sentences.length ? "See Results" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 9. Prompt Engineer: Pick the better prompt ─── */
const PROMPT_ROUNDS = [
  { task: "Get a recipe for pasta", bad: "Give me pasta", good: "Give me a simple pasta recipe with ingredients list and step-by-step instructions for 2 servings", why: "Specific prompts with constraints (servings, format) get better results." },
  { task: "Debug Python code", bad: "Fix my code", good: "My Python function raises TypeError on line 12 when passing a list. Here's the code: [code]. What's wrong and how do I fix it?", why: "Including the error, location, and code gives AI context to help effectively." },
  { task: "Write a professional email", bad: "Write an email", good: "Write a concise professional email declining a meeting invitation due to a scheduling conflict, maintaining a positive tone", why: "Specifying tone, purpose, and constraints produces more usable output." },
  { task: "Explain a concept", bad: "Explain neural networks", good: "Explain how neural networks work to a 10-year-old using a simple analogy. Keep it under 100 words.", why: "Defining the audience and length constraint tailors the explanation perfectly." },
  { task: "Generate test data", bad: "Make some test data", good: "Generate 5 JSON objects representing users with fields: id (UUID), name, email, age (18-65), and createdAt (ISO date in 2024)", why: "Specifying format, count, field types, and constraints yields usable data." },
];

export function PromptEngineer() {
  const [rounds] = useState(() => [...PROMPT_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 4));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<"good" | "bad" | null>(null);
  const [options, setOptions] = useState<{ label: string; type: "good" | "bad" }[]>([]);
  const [done, setDone] = useState(false);

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
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">{score === rounds.length ? "🧙" : score >= 2 ? "📝" : "💡"}</div>
        <p className="text-3xl font-bold">{score}/{rounds.length}</p>
        <p className="text-sm text-[var(--color-text-muted)]">prompt engineering score</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>Round {current + 1}/{rounds.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="text-center p-3 rounded-lg bg-[var(--color-bg-section)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">Task:</p>
        <p className="font-semibold">{rounds[current].task}</p>
      </div>
      <p className="text-center text-sm text-[var(--color-text-muted)]">Which prompt would work better?</p>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleSelect(opt.type)} disabled={!!selected}
            className={`w-full p-4 rounded-xl border-2 text-sm text-left transition-all leading-relaxed ${
              selected && opt.type === "good" ? "border-green-500 bg-green-500/10" :
              selected === opt.type && opt.type === "bad" ? "border-red-500 bg-red-500/10" :
              !selected ? "border-[var(--color-border)] hover:border-indigo-400 active:scale-[0.99]" : "border-[var(--color-border)] opacity-60"
            }`}>
            &ldquo;{opt.label}&rdquo;
          </button>
        ))}
      </div>
      {selected && (
        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-sm text-[var(--color-text-muted)]">
          💡 {rounds[current].why}
        </div>
      )}
    </div>
  );
}

/* ─── 10. AI Jargon Buster: Rapid-fire true/false on AI definitions ─── */
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
  const [questions] = useState(() => [...JARGON_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (done || answered !== null) return;
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, done, answered]);

  const handleAnswer = useCallback((userSays: boolean | null) => {
    if (answered !== null) return;
    clearInterval(timerRef.current);
    const q = questions[current];
    const correct = userSays === q.correct;
    if (correct) setScore(s => s + 1);
    setAnswered(correct);
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true);
      else { setCurrent(c => c + 1); setAnswered(null); }
    }, 1200);
  }, [answered, current, questions]);

  if (done) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">{score >= 7 ? "🏆" : score >= 5 ? "📖" : "🔍"}</div>
        <p className="text-3xl font-bold">{score}/{questions.length}</p>
        <p className="text-sm text-[var(--color-text-muted)]">jargon busted</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all">Play Again</button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>{current + 1}/{questions.length}</span>
        <span className={`font-mono font-bold ${timeLeft <= 3 ? "text-red-500" : ""}`}>{timeLeft}s</span>
        <span>Score: {score}</span>
      </div>
      <div className="h-1 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000" style={{ width: `${timeLeft * 10}%` }} />
      </div>
      <div className="text-center p-5 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Term</p>
        <p className="text-2xl font-bold mb-3">{q.term}</p>
        <p className="text-sm text-[var(--color-text-muted)]">&ldquo;{q.definition}&rdquo;</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleAnswer(true)} disabled={answered !== null}
          className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${answered !== null ? (q.correct ? "border-green-500 bg-green-500/10 text-green-500" : "border-[var(--color-border)] opacity-50") : "border-[var(--color-border)] hover:border-green-500 hover:bg-green-500/5 active:scale-[0.97]"}`}>
          ✅ True
        </button>
        <button onClick={() => handleAnswer(false)} disabled={answered !== null}
          className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${answered !== null ? (!q.correct ? "border-green-500 bg-green-500/10 text-green-500" : "border-[var(--color-border)] opacity-50") : "border-[var(--color-border)] hover:border-red-500 hover:bg-red-500/5 active:scale-[0.97]"}`}>
          ❌ False
        </button>
      </div>
      {answered !== null && (
        <p className={`text-center text-sm font-semibold ${answered ? "text-green-500" : "text-red-400"}`}>
          {answered ? "Correct! ✨" : "Not quite!"}
        </p>
      )}
    </div>
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
