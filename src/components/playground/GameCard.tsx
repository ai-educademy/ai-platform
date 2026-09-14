"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type GameDifficulty = "easy" | "medium" | "hard";
export type GameCategory = "knowledge" | "quick" | "ethics" | "creative";

export interface GameMeta {
  id: string;
  name: string;
  desc: string;
  icon: string;
  component: React.ComponentType;
  difficulty: GameDifficulty;
  estimatedMinutes: number;
  category: GameCategory;
}

const DIFFICULTY_CONFIG = {
  easy: { label: "difficultyEasy", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  medium: { label: "difficultyMedium", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  hard: { label: "difficultyHard", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const CATEGORY_GRADIENTS: Record<GameCategory, string> = {
  knowledge: "from-violet-500/20 via-violet-500/10 to-transparent",
  quick: "from-cyan-500/20 via-cyan-500/10 to-transparent",
  ethics: "from-amber-500/20 via-amber-500/10 to-transparent",
  creative: "from-pink-500/20 via-pink-500/10 to-transparent",
};

const BORDER_COLORS: Record<GameCategory, string> = {
  knowledge: "hover:border-violet-500/50 active:border-violet-500/50",
  quick: "hover:border-cyan-500/50 active:border-cyan-500/50",
  ethics: "hover:border-amber-500/50 active:border-amber-500/50",
  creative: "hover:border-pink-500/50 active:border-pink-500/50",
};

function getPersonalBest(gameId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(`playground_best_${gameId}`);
    return val ? Number(val) : null;
  } catch { return null; }
}

/** Save to localStorage and optionally sync to DB (fire-and-forget). Returns true if new best. */
export function savePersonalBest(gameId: string, score: number, syncToDb = false): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getPersonalBest(gameId);
    if (current === null || score > current) {
      localStorage.setItem(`playground_best_${gameId}`, String(score));
      if (syncToDb) {
        fetch("/api/playground-scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, score }),
        }).catch(() => {});
      }
      return true;
    }
    // Even if not a new local best, sync to DB in case DB is behind
    if (syncToDb && current !== null) {
      fetch("/api/playground-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, score }),
      }).catch(() => {});
    }
    return false;
  } catch { return false; }
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function GameCard({
  game,
  onPlay,
  index = 0,
}: {
  game: GameMeta;
  onPlay: (game: GameMeta) => void;
  index?: number;
}) {
  const t = useTranslations("lab.hub");
  const tp = useTranslations("lab.playground");
  const { status: sessionStatus } = useSession();
  const noMotion = useReducedMotion();
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  // Load best score: localStorage first, then merge with DB for signed-in users
  useEffect(() => {
    const localBest = getPersonalBest(game.id);
    setBestScore(localBest);

    // Don't fetch from DB while session is loading or for guests
    if (sessionStatus !== "authenticated") return;

    fetch(`/api/playground-scores?gameId=${encodeURIComponent(game.id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { score: { bestScore: number } | null } | null) => {
        const dbBest = data?.score?.bestScore ?? null;

        if (dbBest !== null && (localBest === null || dbBest > localBest)) {
          // DB has higher score — update localStorage
          localStorage.setItem(`playground_best_${game.id}`, String(dbBest));
          setBestScore(dbBest);
        } else if (dbBest === null && localBest !== null) {
          // Migrate localStorage to DB (first sign-in)
          fetch("/api/playground-scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId: game.id, score: localBest }),
          }).catch(() => {});
        }
      })
      .catch(() => { /* API failed, localStorage is fine */ });
  }, [game.id, sessionStatus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: "-30px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const diff = DIFFICULTY_CONFIG[game.difficulty];

  return (
    <button
      ref={ref}
      onClick={() => onPlay(game)}
      className={`group relative flex flex-col text-left p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all duration-300 active:scale-[0.98] hover:-translate-y-1 ${BORDER_COLORS[game.category]}`}
      style={noMotion ? undefined : {
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "scale(0.92) translateY(16px)",
        transition: `opacity 0.5s ${EASE} ${index * 80}ms, transform 0.5s ${EASE} ${index * 80}ms`,
      }}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[game.category]} opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl transition-transform duration-300 group-hover:scale-115 group-hover:rotate-[5deg]">
            {game.icon}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diff.color}`}>
            {t(diff.label)}
          </span>
        </div>

        <h3 className="font-bold text-sm mb-1 group-hover:text-[var(--color-primary)] group-active:text-[var(--color-primary)] transition-colors">
          {tp(game.name as Parameters<typeof tp>[0])}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-3 flex-1">
          {tp(game.desc as Parameters<typeof tp>[0])}
        </p>

        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("estimatedTime", { time: game.estimatedMinutes })}
          </span>
          {bestScore !== null && (
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              ⭐ {t("personalBest", { score: bestScore })}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
