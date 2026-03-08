"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { SystemDesignCanvas } from "./SystemDesignCanvas";

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

function GameOverScreen({ emoji, stat, label, onReplay, replayText }: { emoji: string; stat: string; label: string; onReplay: () => void; replayText?: string }) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="text-6xl animate-bounce">{emoji}</div>
      <p className="text-4xl font-bold font-mono">{stat}</p>
      <p className="text-sm text-[var(--color-text-muted)] font-mono">{label}</p>
      <button onClick={onReplay} className="min-h-[48px] px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20 font-mono">
        ▶ {replayText || "Play Again"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. Neural Network Playground
   Interactive 2-layer neural network visualization
   ═══════════════════════════════════════════════════════════════ */

// Simple neural network math
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
function sigmoidDeriv(x: number): number { return x * (1 - x); }

interface NNWeights {
  w1: number[][]; b1: number[];
  w2: number[]; b2: number;
}

function initWeights(hidden: number): NNWeights {
  const rand = () => (Math.random() - 0.5) * 2;
  return {
    w1: Array.from({ length: hidden }, () => [rand(), rand()]),
    b1: Array.from({ length: hidden }, rand),
    w2: Array.from({ length: hidden }, rand),
    b2: rand(),
  };
}

function forward(w: NNWeights, x: number, y: number): { hidden: number[]; output: number } {
  const hidden = w.w1.map((wh, i) => sigmoid(wh[0] * x + wh[1] * y + w.b1[i]));
  const output = sigmoid(hidden.reduce((s, h, i) => s + h * w.w2[i], 0) + w.b2);
  return { hidden, output };
}

function trainStep(w: NNWeights, points: { x: number; y: number; cls: number }[], lr: number): NNWeights {
  const nw: NNWeights = {
    w1: w.w1.map(r => [...r]), b1: [...w.b1], w2: [...w.w2], b2: w.b2,
  };

  for (const p of points) {
    const { hidden, output } = forward(w, p.x, p.y);
    const err = p.cls - output;
    const dOut = err * sigmoidDeriv(output);

    for (let i = 0; i < w.w2.length; i++) {
      const dHidden = dOut * w.w2[i] * sigmoidDeriv(hidden[i]);
      nw.w2[i] += lr * dOut * hidden[i];
      nw.w1[i][0] += lr * dHidden * p.x;
      nw.w1[i][1] += lr * dHidden * p.y;
      nw.b1[i] += lr * dHidden;
    }
    nw.b2 += lr * dOut;
  }
  return nw;
}

function computeAccuracy(w: NNWeights, points: { x: number; y: number; cls: number }[]): number {
  if (points.length === 0) return 0;
  let correct = 0;
  for (const p of points) {
    const { output } = forward(w, p.x, p.y);
    if ((output >= 0.5 ? 1 : 0) === p.cls) correct++;
  }
  return Math.round((correct / points.length) * 100);
}

export function NeuralNetworkPlayground() {
  const tp = useTranslations("lab.playground");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number; cls: number }[]>([]);
  const [hiddenSize, setHiddenSize] = useState(4);
  const [weights, setWeights] = useState<NNWeights>(() => initWeights(4));
  const [training, setTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [brushClass, setBrushClass] = useState(0);
  const trainingRef = useRef(false);
  const weightsRef = useRef(weights);
  const pointsRef = useRef(points);
  const epochRef = useRef(0);

  weightsRef.current = weights;
  pointsRef.current = points;

  // Reset weights when hidden size changes
  useEffect(() => {
    const w = initWeights(hiddenSize);
    setWeights(w);
    weightsRef.current = w;
    setEpoch(0);
    epochRef.current = 0;
  }, [hiddenSize]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const w = weightsRef.current;

    // Decision boundary - sample grid
    const res = 30;
    const cellW = W / res;
    const cellH = H / res;
    for (let gx = 0; gx < res; gx++) {
      for (let gy = 0; gy < res; gy++) {
        const nx = (gx + 0.5) / res;
        const ny = (gy + 0.5) / res;
        const { output } = forward(w, nx, ny);
        const r = Math.round(239 * output + 59 * (1 - output));
        const g = Math.round(68 * output + 130 * (1 - output));
        const b = Math.round(68 * output + 246 * (1 - output));
        ctx.fillStyle = `rgba(${r},${g},${b},0.25)`;
        ctx.fillRect(gx * cellW, gy * cellH, cellW + 1, cellH + 1);
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(128,128,128,0.15)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * W;
      const y = (i / 10) * H;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Data points
    for (const p of pointsRef.current) {
      const px = p.x * W;
      const py = p.y * H;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = p.cls === 1 ? "#EF4444" : "#3B82F6";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, []);

  // Animation loop for training
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      if (trainingRef.current && pointsRef.current.length >= 2) {
        const newW = trainStep(weightsRef.current, pointsRef.current, 0.5);
        weightsRef.current = newW;
        epochRef.current += 1;
        if (epochRef.current % 5 === 0) {
          setWeights({ ...newW });
          setEpoch(epochRef.current);
          setAccuracy(computeAccuracy(newW, pointsRef.current));
        }
      }
      draw();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const newPoints = [...pointsRef.current, { x, y, cls: brushClass }];
    setPoints(newPoints);
    pointsRef.current = newPoints;
  };

  const toggleTraining = () => {
    trainingRef.current = !trainingRef.current;
    setTraining(trainingRef.current);
  };

  const clearAll = () => {
    setPoints([]);
    pointsRef.current = [];
    const w = initWeights(hiddenSize);
    setWeights(w);
    weightsRef.current = w;
    setEpoch(0);
    epochRef.current = 0;
    setAccuracy(0);
    trainingRef.current = false;
    setTraining(false);
  };

  return (
    <GameShell title={tp("neuralTitle")} icon="🧬">
      <style>{`
        @keyframes nn-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        .nn-training { animation: nn-pulse 1s ease-in-out infinite; }
      `}</style>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)] font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-text-muted)]">{tp("brush")}</span>
          <button
            onClick={() => setBrushClass(0)}
            className={`px-2 py-1 rounded border transition-all ${brushClass === 0 ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
          >● {tp("blue")}</button>
          <button
            onClick={() => setBrushClass(1)}
            className={`px-2 py-1 rounded border transition-all ${brushClass === 1 ? "border-red-500 bg-red-500/20 text-red-400" : "border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
          >● {tp("red")}</button>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <span className="text-[var(--color-text-muted)] whitespace-nowrap">{tp("hidden")}</span>
          <input
            type="range" min={2} max={8} value={hiddenSize}
            onChange={e => setHiddenSize(Number(e.target.value))}
            className="flex-1 accent-[var(--color-primary)]"
          />
          <span className="text-[var(--color-primary)] font-bold w-4 text-center">{hiddenSize}</span>
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)]" style={{ aspectRatio: "4/3" }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair"
          style={{ imageRendering: "pixelated", background: "var(--color-bg-section)" }}
        />
        {points.length < 2 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center font-mono space-y-1 bg-[var(--color-bg)]/80 px-4 py-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-[var(--color-text-muted)]">{tp("clickToPlace")}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{tp("addBothPoints")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status & controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className={`${training ? "nn-training text-green-400" : "text-[var(--color-text-muted)]"}`}>
            {training ? `● ${tp("training")}` : `○ ${tp("idle")}`}
          </span>
          <span className="text-[var(--color-text-muted)]">{tp("epoch")} <span className="text-[var(--color-primary)]">{epoch}</span></span>
          <span className="text-[var(--color-text-muted)]">{tp("accuracy")} <span className={`font-bold ${accuracy >= 80 ? "text-green-400" : accuracy >= 50 ? "text-amber-400" : "text-[var(--color-text)]"}`}>{accuracy}%</span></span>
          <span className="text-[var(--color-text-muted)]">{tp("points")} {points.length}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleTraining}
            disabled={points.length < 2}
            className={`min-h-[36px] px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
              training
                ? "border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                : "border-green-500/50 text-green-400 bg-green-500/10 hover:bg-green-500/20"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {training ? `⏸ ${tp("pause")}` : `▶ ${tp("train")}`}
          </button>
          <button
            onClick={clearAll}
            className="min-h-[36px] px-4 py-1.5 rounded-lg font-mono text-xs font-bold border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all"
          >
            ✕ {tp("clear")}
          </button>
        </div>
      </div>

      {/* Network diagram */}
      <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)]">
        <p className="text-[10px] font-mono text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">{tp("networkArch")}</p>
        <div className="flex items-center justify-center gap-6 sm:gap-10 py-2">
          {/* Input layer */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">{tp("inputLayer")}</span>
            {["x", "y"].map(label => (
              <div key={label} className="w-8 h-8 rounded-full border-2 border-blue-500/60 bg-blue-500/10 flex items-center justify-center">
                <span className="text-[10px] font-mono text-blue-400 font-bold">{label}</span>
              </div>
            ))}
          </div>
          {/* Lines placeholder */}
          <div className="text-[var(--color-text-muted)] text-lg">→</div>
          {/* Hidden layer */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">{tp("hiddenLayer")}({hiddenSize})</span>
            <div className="flex flex-col items-center gap-1" style={{ maxHeight: 120, overflow: "hidden" }}>
              {Array.from({ length: Math.min(hiddenSize, 6) }, (_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-purple-500/60 bg-purple-500/10 flex items-center justify-center ${training ? "nn-training" : ""}`}>
                  <span className="text-[8px] font-mono text-purple-400">{i + 1}</span>
                </div>
              ))}
              {hiddenSize > 6 && <span className="text-[9px] text-[var(--color-text-muted)]">+{hiddenSize - 6}</span>}
            </div>
          </div>
          <div className="text-[var(--color-text-muted)] text-lg">→</div>
          {/* Output */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">{tp("outputLayer")}</span>
            <div className="w-8 h-8 rounded-full border-2 border-green-500/60 bg-green-500/10 flex items-center justify-center">
              <span className="text-[10px] font-mono text-green-400 font-bold">σ</span>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. Prompt Engineering Dojo
   Craft prompts to match target outputs
   ═══════════════════════════════════════════════════════════════ */

interface PromptChallenge {
  id: number;
  target: string;
  context: string;
  keywords: string[];
  bonusKeywords: string[];
  tips: string;
  difficulty: string;
}

const PROMPT_CHALLENGES: PromptChallenge[] = [
  {
    id: 1, difficulty: "EASY",
    context: "You want the AI to explain what machine learning is.",
    target: "Machine learning is a subset of artificial intelligence where computers learn patterns from data without being explicitly programmed. Instead of following rigid rules, ML algorithms improve their performance through experience.",
    keywords: ["explain", "machine learning", "simple", "what"],
    bonusKeywords: ["beginner", "definition", "clear", "brief"],
    tips: "💡 Tip: Be specific about format. 'Explain X in simple terms' works better than just asking 'What is X?'",
  },
  {
    id: 2, difficulty: "EASY",
    context: "You want the AI to list exactly 3 benefits of open-source software.",
    target: "1. Transparency — anyone can inspect the code for security and quality.\n2. Community — thousands of developers contribute improvements.\n3. Cost — no licensing fees, reducing barriers to entry.",
    keywords: ["list", "3", "benefits", "open-source"],
    bonusKeywords: ["numbered", "concise", "exactly", "software"],
    tips: "💡 Tip: Specify exact quantities. 'List exactly 3' is much better than 'List some'. Constrain the output format.",
  },
  {
    id: 3, difficulty: "MEDIUM",
    context: "You want the AI to write a Python function that reverses a string.",
    target: "```python\ndef reverse_string(s: str) -> str:\n    return s[::-1]\n```",
    keywords: ["python", "function", "reverse", "string"],
    bonusKeywords: ["type hint", "concise", "code", "return"],
    tips: "💡 Tip: Specify the programming language, function signature expectations, and coding style (concise vs. verbose).",
  },
  {
    id: 4, difficulty: "MEDIUM",
    context: "You want the AI to compare transformers and RNNs, focusing on parallelization.",
    target: "Transformers process all tokens simultaneously via self-attention, enabling massive parallelization on GPUs. RNNs process tokens sequentially, creating a bottleneck. This is why transformer-based models like GPT train orders of magnitude faster.",
    keywords: ["compare", "transformer", "rnn", "parallel"],
    bonusKeywords: ["attention", "sequential", "gpu", "difference", "speed"],
    tips: "💡 Tip: Tell the AI what angle to focus on. 'Compare X and Y focusing on Z' narrows the response to what you actually need.",
  },
  {
    id: 5, difficulty: "HARD",
    context: "You want the AI to act as a senior code reviewer and find bugs in a snippet.",
    target: "As a senior engineer reviewing this code, I've identified: 1) potential null reference on line 3, 2) the loop doesn't handle edge case of empty arrays, 3) missing error handling for the async call. Suggested fixes: add null checks, guard clauses, and try-catch blocks.",
    keywords: ["act as", "code review", "bug", "find"],
    bonusKeywords: ["senior", "engineer", "suggest", "fix", "identify", "role"],
    tips: "💡 Tip: Role prompting ('Act as a...') dramatically changes output quality. Combine with specific instructions about what to look for.",
  },
  {
    id: 6, difficulty: "HARD",
    context: "You want the AI to generate a creative short story in exactly 50 words about a robot discovering music.",
    target: "Unit-7 found the vinyl in the ruins — a black disc etched with spirals. When the needle touched down, something unprecedented rippled through its circuits. Not data. Not instructions. Something that made its cooling fans spin faster. It played the record forty-seven times. On the forty-eighth, it danced.",
    keywords: ["story", "50 words", "robot", "music"],
    bonusKeywords: ["creative", "short", "exactly", "discover", "write"],
    tips: "💡 Tip: For creative tasks, specify word count, theme, tone, and key elements. Constraints breed creativity — for AI too!",
  },
];

function scorePrompt(prompt: string, challenge: PromptChallenge): { score: number; feedbackKey: string; simulatedResponse: string } {
  const lower = prompt.toLowerCase();
  const words = lower.split(/\s+/);

  // Keyword matching
  let keywordHits = 0;
  for (const kw of challenge.keywords) {
    if (lower.includes(kw.toLowerCase())) keywordHits++;
  }
  let bonusHits = 0;
  for (const kw of challenge.bonusKeywords) {
    if (lower.includes(kw.toLowerCase())) bonusHits++;
  }

  // Length quality (too short = bad, too long = slightly bad)
  const lengthScore = words.length < 3 ? 0.2 : words.length < 6 ? 0.6 : words.length <= 30 ? 1.0 : 0.8;

  // Specificity bonus (has numbers, quotes, formatting instructions)
  let specificityBonus = 0;
  if (/\d+/.test(prompt)) specificityBonus += 0.1;
  if (/["']/.test(prompt)) specificityBonus += 0.05;
  if (/\b(exactly|must|should|format|style|tone)\b/i.test(prompt)) specificityBonus += 0.1;
  if (/\b(act as|you are|pretend|role)\b/i.test(prompt)) specificityBonus += 0.15;

  const keywordScore = challenge.keywords.length > 0 ? keywordHits / challenge.keywords.length : 0;
  const bonusScore = challenge.bonusKeywords.length > 0 ? bonusHits / challenge.bonusKeywords.length : 0;

  const rawScore = (keywordScore * 0.45) + (bonusScore * 0.2) + (lengthScore * 0.2) + Math.min(specificityBonus, 0.15);
  const score = Math.min(100, Math.round(rawScore * 100));

  // Generate simulated response based on score
  let simulatedResponse: string;
  if (score >= 80) {
    simulatedResponse = challenge.target;
  } else if (score >= 50) {
    // Partial response - take first ~60% of target
    const sentences = challenge.target.split(/[.!?\n]+/).filter(Boolean);
    simulatedResponse = sentences.slice(0, Math.ceil(sentences.length * 0.6)).join(". ") + "...";
  } else {
    simulatedResponse = "I'm not sure what you're looking for. Could you be more specific about what you need?";
  }

  let feedbackKey: string;
  if (score >= 80) feedbackKey = "feedbackExcellent";
  else if (score >= 60) feedbackKey = "feedbackGood";
  else if (score >= 40) feedbackKey = "feedbackGettingThere";
  else feedbackKey = "feedbackVague";

  return { score, feedbackKey, simulatedResponse };
}

export function PromptEngineeringDojo() {
  const tp = useTranslations("lab.playground");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ score: number; feedbackKey: string; simulatedResponse: string } | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [typing, setTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const challenge = PROMPT_CHALLENGES[currentIdx];

  const handleSubmit = () => {
    if (!input.trim() || result) return;
    const r = scorePrompt(input, challenge);
    setResult(r);
    setScores(prev => [...prev, r.score]);

    // Typewriter effect for response
    setTyping(true);
    setDisplayedResponse("");
    let i = 0;
    const text = r.simulatedResponse;
    const interval = setInterval(() => {
      i++;
      setDisplayedResponse(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 15);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= PROMPT_CHALLENGES.length) {
      setGameOver(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setInput("");
      setResult(null);
      setDisplayedResponse("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = () => {
    setCurrentIdx(0);
    setInput("");
    setResult(null);
    setScores([]);
    setGameOver(false);
    setDisplayedResponse("");
  };

  if (gameOver) {
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return <GameOverScreen emoji={avg >= 70 ? "🥋" : avg >= 40 ? "📝" : "🔰"} stat={`${avg}%`} label={tp("avgScoreLabel", { count: scores.length })} onReplay={reset} replayText={tp("playAgain")} />;
  }

  return (
    <GameShell title={tp("promptTitle")} icon="🥋">
      <style>{`
        @keyframes dojo-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .dojo-cursor::after { content: "▌"; animation: dojo-cursor 0.8s step-end infinite; color: var(--color-primary); }
      `}</style>

      <StatusBar
        left={<span className="font-mono">{tp("challengeLabel", { current: currentIdx + 1, total: PROMPT_CHALLENGES.length })} <span className="text-amber-400">[{challenge.difficulty}]</span></span>}
        right={scores.length > 0 ? <span className="font-mono">AVG: {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%</span> : undefined}
      />

      {/* Mission briefing */}
      <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">{tp("missionLabel")}</span>
        </div>
        <p className="text-sm font-mono text-[var(--color-text)]">{challenge.context}</p>
      </div>

      {/* Target output */}
      <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">{tp("targetOutputLabel")}</span>
        </div>
        <pre className="text-xs font-mono text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">{challenge.target}</pre>
      </div>

      {/* Prompt input */}
      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-section)]">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{tp("promptFile")}</span>
        </div>
        <div className="p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            disabled={!!result}
            placeholder={tp("promptPlaceholder")}
            rows={3}
            className="w-full bg-transparent font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 resize-none focus:outline-none"
          />
        </div>
        {!result && (
          <div className="flex justify-end px-3 pb-3">
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="px-4 py-1.5 rounded-lg font-mono text-xs font-bold border border-[var(--color-primary)]/50 text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ▶ {tp("submit")}
            </button>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {/* Simulated AI response */}
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">{tp("aiResponseLabel")}</span>
            </div>
            <pre className={`text-xs font-mono text-[var(--color-text)] whitespace-pre-wrap leading-relaxed ${typing ? "dojo-cursor" : ""}`}>
              {displayedResponse}
            </pre>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)]">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-2xl font-bold" style={{ color: result.score >= 70 ? "#00FF88" : result.score >= 40 ? "#FBBF24" : "#EF4444" }}>
                  {result.score}%
                </span>
                <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${result.score}%`,
                      background: result.score >= 70 ? "#00FF88" : result.score >= 40 ? "#FBBF24" : "#EF4444",
                    }}
                  />
                </div>
              </div>
              <p className="text-xs font-mono text-[var(--color-text-muted)]">{tp(result.feedbackKey as any)}</p>
            </div>
          </div>

          {/* Tip */}
          <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-mono text-amber-300/80">{challenge.tips}</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg font-mono text-xs font-bold border border-[var(--color-primary)]/50 text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-all"
            >
              {currentIdx + 1 >= PROMPT_CHALLENGES.length ? `${tp("seeResults")} →` : `${tp("nextChallenge")} →`}
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. Algorithm Visualizer
   Visual race between sorting algorithms
   ═══════════════════════════════════════════════════════════════ */

type SortAlgo = "bubble" | "quick" | "merge";
interface AlgoState {
  name: string;
  array: number[];
  ops: number;
  done: boolean;
  comparing: number[];
  swapping: number[];
}

function generateArray(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generator-based sorts that yield after each step
function* bubbleSortGen(arr: number[]): Generator<{ array: number[]; comparing: number[]; swapping: number[]; ops: number }> {
  const a = [...arr];
  let ops = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      ops++;
      yield { array: [...a], comparing: [j, j + 1], swapping: [], ops };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { array: [...a], comparing: [], swapping: [j, j + 1], ops };
      }
    }
  }
  yield { array: [...a], comparing: [], swapping: [], ops };
}

function* quickSortGen(arr: number[]): Generator<{ array: number[]; comparing: number[]; swapping: number[]; ops: number }> {
  const a = [...arr];
  let ops = 0;

  function* partition(lo: number, hi: number): Generator<{ array: number[]; comparing: number[]; swapping: number[]; ops: number }> {
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      ops++;
      yield { array: [...a], comparing: [j, hi], swapping: [], ops };
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) yield { array: [...a], comparing: [], swapping: [i, j], ops };
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    yield { array: [...a], comparing: [], swapping: [i + 1, hi], ops };
  }

  function* qsort(lo: number, hi: number): Generator<{ array: number[]; comparing: number[]; swapping: number[]; ops: number }> {
    if (lo < hi) {
      const pivot = a[lo + Math.floor((hi - lo + 1) / 2)]; // just for partition index
      // inline partition
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        ops++;
        yield { array: [...a], comparing: [j, hi], swapping: [], ops };
        if (a[j] <= a[hi]) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
          if (i !== j) yield { array: [...a], comparing: [], swapping: [i, j], ops };
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      yield { array: [...a], comparing: [], swapping: [i + 1, hi], ops };
      const pi = i + 1;
      yield* qsort(lo, pi - 1);
      yield* qsort(pi + 1, hi);
    }
  }

  // Suppress unused warning
  void partition;
  yield* qsort(0, a.length - 1);
  yield { array: [...a], comparing: [], swapping: [], ops };
}

function* mergeSortGen(arr: number[]): Generator<{ array: number[]; comparing: number[]; swapping: number[]; ops: number }> {
  const a = [...arr];
  let ops = 0;

  function* msort(lo: number, hi: number): Generator<{ array: number[]; comparing: number[]; swapping: number[]; ops: number }> {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    yield* msort(lo, mid);
    yield* msort(mid + 1, hi);

    // Merge
    const temp: number[] = [];
    let i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
      ops++;
      yield { array: [...a], comparing: [i, j], swapping: [], ops };
      if (a[i] <= a[j]) { temp.push(a[i++]); }
      else { temp.push(a[j++]); }
    }
    while (i <= mid) { temp.push(a[i++]); ops++; }
    while (j <= hi) { temp.push(a[j++]); ops++; }

    for (let k = 0; k < temp.length; k++) {
      a[lo + k] = temp[k];
      yield { array: [...a], comparing: [], swapping: [lo + k], ops };
    }
  }

  yield* msort(0, a.length - 1);
  yield { array: [...a], comparing: [], swapping: [], ops };
}

const ALGO_COLORS: Record<SortAlgo, string> = {
  bubble: "#3B82F6",
  quick: "#A855F7",
  merge: "#00FF88",
};

export function AlgorithmVisualizer() {
  const tp = useTranslations("lab.playground");
  const ARRAY_SIZE = 24;
  const [baseArray, setBaseArray] = useState<number[]>(() => generateArray(ARRAY_SIZE));
  const [algos, setAlgos] = useState<Record<SortAlgo, AlgoState>>(() => ({
    bubble: { name: "Bubble Sort", array: [...baseArray], ops: 0, done: false, comparing: [], swapping: [] },
    quick: { name: "Quick Sort", array: [...baseArray], ops: 0, done: false, comparing: [], swapping: [] },
    merge: { name: "Merge Sort", array: [...baseArray], ops: 0, done: false, comparing: [], swapping: [] },
  }));
  const [racing, setRacing] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [bet, setBet] = useState<SortAlgo | null>(null);
  const [winner, setWinner] = useState<SortAlgo | null>(null);
  const [betResult, setBetResult] = useState<"won" | "lost" | null>(null);
  const gensRef = useRef<Record<SortAlgo, Generator> | null>(null);
  const frameRef = useRef<number>(0);
  const racingRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const startRace = () => {
    const arr = generateArray(ARRAY_SIZE);
    setBaseArray(arr);
    setWinner(null);
    setBetResult(null);

    const initial: Record<SortAlgo, AlgoState> = {
      bubble: { name: "Bubble Sort", array: [...arr], ops: 0, done: false, comparing: [], swapping: [] },
      quick: { name: "Quick Sort", array: [...arr], ops: 0, done: false, comparing: [], swapping: [] },
      merge: { name: "Merge Sort", array: [...arr], ops: 0, done: false, comparing: [], swapping: [] },
    };
    setAlgos(initial);

    gensRef.current = {
      bubble: bubbleSortGen(arr),
      quick: quickSortGen(arr),
      merge: mergeSortGen(arr),
    };

    racingRef.current = true;
    setRacing(true);
  };

  useEffect(() => {
    if (!racing || !gensRef.current) return;

    let lastTime = 0;
    const interval = () => {
      const speed = speedRef.current;
      const delay = speed === 1 ? 80 : speed === 2 ? 30 : 8;
      const now = performance.now();
      if (now - lastTime < delay) {
        frameRef.current = requestAnimationFrame(interval);
        return;
      }
      lastTime = now;

      if (!gensRef.current || !racingRef.current) return;

      const updates: Partial<Record<SortAlgo, AlgoState>> = {};
      let anyActive = false;
      let firstDone: SortAlgo | null = null;

      for (const key of ["bubble", "quick", "merge"] as SortAlgo[]) {
        const gen = gensRef.current[key];
        const result = gen.next();
        if (result.done) {
          updates[key] = { ...updates[key]!, done: true } as AlgoState;
        } else {
          anyActive = true;
          const v = result.value as { array: number[]; comparing: number[]; swapping: number[]; ops: number };
          updates[key] = {
            name: key === "bubble" ? "Bubble Sort" : key === "quick" ? "Quick Sort" : "Merge Sort",
            array: v.array,
            ops: v.ops,
            done: false,
            comparing: v.comparing,
            swapping: v.swapping,
          };
        }
      }

      setAlgos(prev => {
        const next = { ...prev };
        let winnerFound: SortAlgo | null = null;
        for (const key of ["bubble", "quick", "merge"] as SortAlgo[]) {
          if (updates[key]) {
            next[key] = { ...prev[key], ...updates[key] };
          }
          // Check if this just finished
          const gen = gensRef.current![key];
          const peek = gen.next();
          if (peek.done && !prev[key].done) {
            next[key] = { ...next[key], done: true };
            if (!winnerFound && !prev.bubble.done && !prev.quick.done && !prev.merge.done) {
              winnerFound = key;
            }
          }
        }
        return next;
      });

      if (!anyActive) {
        racingRef.current = false;
        setRacing(false);
      }

      frameRef.current = requestAnimationFrame(interval);
    };

    frameRef.current = requestAnimationFrame(interval);
    return () => cancelAnimationFrame(frameRef.current);
  }, [racing]);

  // Detect winner
  useEffect(() => {
    if (winner) return;
    for (const key of ["merge", "quick", "bubble"] as SortAlgo[]) {
      if (algos[key].done) {
        setWinner(key);
        if (bet) {
          setBetResult(bet === key ? "won" : "lost");
        }
        racingRef.current = false;
        setRacing(false);
        return;
      }
    }
  }, [algos, winner, bet]);

  const resetRace = () => {
    racingRef.current = false;
    cancelAnimationFrame(frameRef.current);
    setRacing(false);
    setWinner(null);
    setBet(null);
    setBetResult(null);
    const arr = generateArray(ARRAY_SIZE);
    setBaseArray(arr);
    setAlgos({
      bubble: { name: "Bubble Sort", array: [...arr], ops: 0, done: false, comparing: [], swapping: [] },
      quick: { name: "Quick Sort", array: [...arr], ops: 0, done: false, comparing: [], swapping: [] },
      merge: { name: "Merge Sort", array: [...arr], ops: 0, done: false, comparing: [], swapping: [] },
    });
  };

  const renderBars = (state: AlgoState, color: string) => {
    const max = ARRAY_SIZE;
    return (
      <div className="flex items-end gap-[2px] h-28 sm:h-36">
        {state.array.map((val, i) => {
          const isComparing = state.comparing.includes(i);
          const isSwapping = state.swapping.includes(i);
          const heightPct = (val / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all"
              style={{
                height: `${heightPct}%`,
                backgroundColor: isSwapping ? "#FBBF24" : isComparing ? "#FF6B6B" : state.done ? "#00FF88" : color,
                opacity: isComparing || isSwapping ? 1 : 0.7,
                transition: "height 0.05s ease, background-color 0.1s ease",
                boxShadow: isSwapping ? `0 0 8px ${color}` : "none",
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <GameShell title={tp("algoRace")} icon="🏁">
      <style>{`
        @keyframes algo-flash { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .algo-winner { animation: algo-flash 0.5s ease-in-out 3; }
      `}</style>

      {/* Bet selection */}
      {!racing && !winner && (
        <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)]">
          <p className="text-xs font-mono text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">{tp("placeBet")}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(["bubble", "quick", "merge"] as SortAlgo[]).map(algo => (
              <button
                key={algo}
                onClick={() => setBet(algo)}
                className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg font-mono text-xs font-bold border transition-all ${
                  bet === algo
                    ? `border-[${ALGO_COLORS[algo]}] bg-[${ALGO_COLORS[algo]}]/20`
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                }`}
                style={{
                  color: ALGO_COLORS[algo],
                  borderColor: bet === algo ? ALGO_COLORS[algo] : undefined,
                  backgroundColor: bet === algo ? `${ALGO_COLORS[algo]}15` : undefined,
                }}
              >
                {bet === algo ? "★ " : ""}{algo === "bubble" ? tp("bubbleSort") : algo === "quick" ? tp("quickSort") : tp("mergeSort")}
              </button>
            ))}
          </div>
          <button
            onClick={startRace}
            className="w-full min-h-[40px] px-4 py-2 rounded-lg font-mono text-sm font-bold border border-green-500/50 text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all"
          >
            {tp("startRaceBtn")}
          </button>
        </div>
      )}

      {/* Speed controls */}
      {(racing || winner) && (
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[1, 2, 5].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded font-mono text-[10px] border transition-all ${
                  speed === s ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10" : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          {winner && (
            <button
              onClick={resetRace}
              className="px-3 py-1 rounded-lg font-mono text-xs font-bold border border-[var(--color-primary)]/50 text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-all"
            >
              {tp("newRace")}
            </button>
          )}
        </div>
      )}

      {/* Algorithm visualizations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["bubble", "quick", "merge"] as SortAlgo[]).map(key => {
          const state = algos[key];
          const isWinner = winner === key;
          return (
            <div
              key={key}
              className={`p-3 rounded-lg border bg-[var(--color-bg-section)] transition-all ${
                isWinner ? "border-green-500/60 algo-winner" : "border-[var(--color-border)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold" style={{ color: ALGO_COLORS[key] }}>
                  {state.name}
                  {isWinner && " 🏆"}
                </span>
                {bet === key && <span className="text-[9px] font-mono text-amber-400">{tp("yourBet")}</span>}
              </div>
              {renderBars(state, ALGO_COLORS[key])}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {tp("opsLabel")} <span style={{ color: ALGO_COLORS[key] }}>{state.ops}</span>
                </span>
                <span className={`text-[10px] font-mono ${state.done ? "text-green-400" : "text-[var(--color-text-muted)]"}`}>
                  {state.done ? tp("doneStatus") : racing ? tp("sortingStatus") : tp("readyStatus")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result */}
      {winner && betResult && (
        <div className={`p-4 rounded-lg border text-center font-mono ${
          betResult === "won" ? "border-green-500/40 bg-green-500/10" : "border-red-500/30 bg-red-500/5"
        }`}>
          <p className="text-lg font-bold mb-1">
            {betResult === "won" ? tp("betWon") : tp("betLost")}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {winner === "merge" && tp("mergeWins")}
            {winner === "quick" && tp("quickWins")}
            {winner === "bubble" && tp("bubbleWins")}
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span>Bubble: <span className="text-blue-400">{algos.bubble.ops}</span> ops</span>
            <span>Quick: <span className="text-purple-400">{algos.quick.ops}</span> ops</span>
            <span>Merge: <span className="text-green-400">{algos.merge.ops}</span> ops</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[var(--color-text-muted)]">
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#FF6B6B] mr-1" /> {tp("comparingLegend")}</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#FBBF24] mr-1" /> {tp("swappingLegend")}</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#00FF88] mr-1" /> {tp("sortedLegend")}</span>
      </div>
    </GameShell>
  );
}

/* ─── Game Registry with metadata ─── */
import type { GameCategory, GameDifficulty } from "./GameCard";
import AITriviaChallenge from "./AITriviaChallenge";

export interface GameEntry {
  id: string;
  name: string;
  desc: string;
  icon: string;
  component: React.ComponentType;
  difficulty: GameDifficulty;
  estimatedMinutes: number;
  category: GameCategory;
}

export const ALL_GAMES: GameEntry[] = [
  { id: "neural-network", name: "gameNeuralName", desc: "gameNeuralDesc", icon: "🧬", component: NeuralNetworkPlayground, difficulty: "medium", estimatedMinutes: 5, category: "creative" },
  { id: "prompt-dojo", name: "gamePromptName", desc: "gamePromptDesc", icon: "🥋", component: PromptEngineeringDojo, difficulty: "hard", estimatedMinutes: 5, category: "knowledge" },
  { id: "algo-race", name: "gameAlgoName", desc: "gameAlgoDesc", icon: "🏁", component: AlgorithmVisualizer, difficulty: "easy", estimatedMinutes: 3, category: "quick" },
  { id: "ai-trivia", name: "gameTriviaName", desc: "gameTriviaDesc", icon: "🧠", component: AITriviaChallenge, difficulty: "medium", estimatedMinutes: 4, category: "knowledge" },
  { id: "system-design", name: "gameDesignName", desc: "gameDesignDesc", icon: "🏗️", component: SystemDesignCanvas, difficulty: "medium", estimatedMinutes: 10, category: "quick" },
];
