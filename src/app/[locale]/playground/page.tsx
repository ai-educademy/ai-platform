"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";
import { useState, useCallback, useRef } from "react";

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
  const [activeTab, setActiveTab] = useState<"sentiment" | "neural" | "sorting" | "tokenizer">("sentiment");

  const tabs = [
    { id: "sentiment" as const, label: "Sentiment Analysis", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
    )},
    { id: "neural" as const, label: "Neural Network", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" d="M12 2v4m0 12v4m-7.07-2.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" /></svg>
    )},
    { id: "sorting" as const, label: "Sorting Algorithms", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
    )},
    { id: "tokenizer" as const, label: "Tokenizer", icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
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

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)] mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-[var(--color-bg-card)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <ScrollReveal animation="fade-up">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 md:p-8">
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
