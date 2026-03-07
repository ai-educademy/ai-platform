"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

const BORDER_GRADIENTS: Record<GameCategory, string> = {
  knowledge: "hover:border-violet-500/50",
  quick: "hover:border-cyan-500/50",
  ethics: "hover:border-amber-500/50",
  creative: "hover:border-pink-500/50",
};

function getPersonalBest(gameId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(`playground_best_${gameId}`);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
}

export function savePersonalBest(gameId: string, score: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getPersonalBest(gameId);
    if (current === null || score > current) {
      localStorage.setItem(`playground_best_${gameId}`, String(score));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function GameCard({
  game,
  onPlay,
}: {
  game: GameMeta;
  onPlay: (game: GameMeta) => void;
}) {
  const t = useTranslations("lab.hub");
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    setBestScore(getPersonalBest(game.id));
  }, [game.id]);

  const diff = DIFFICULTY_CONFIG[game.difficulty];

  return (
    <button
      onClick={() => onPlay(game)}
      className={`group relative flex flex-col text-left p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 active:scale-[0.98] ${BORDER_GRADIENTS[game.category]}`}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[game.category]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon + difficulty */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
            {game.icon}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diff.color}`}>
            {t(diff.label)}
          </span>
        </div>

        {/* Title + description */}
        <h3 className="font-bold text-sm mb-1 group-hover:text-[var(--color-primary)] transition-colors">
          {game.name}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-3 flex-1">
          {game.desc}
        </p>

        {/* Footer: time + score */}
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
