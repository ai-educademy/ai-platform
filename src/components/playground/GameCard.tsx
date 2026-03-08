"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  index = 0,
}: {
  game: GameMeta;
  onPlay: (game: GameMeta) => void;
  index?: number;
}) {
  const t = useTranslations("lab.hub");
  const tp = useTranslations("lab.playground");
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    setBestScore(getPersonalBest(game.id));
  }, [game.id]);

  const diff = DIFFICULTY_CONFIG[game.difficulty];

  return (
    <motion.button
      onClick={() => onPlay(game)}
      className={`group relative flex flex-col text-left p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-colors duration-300 active:scale-[0.98] ${BORDER_COLORS[game.category]}`}
      initial={noMotion ? undefined : { opacity: 0, scale: 0.92, y: 16 }}
      whileInView={noMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={noMotion ? undefined : { delay: index * 0.08, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={noMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      whileTap={noMotion ? undefined : { scale: 0.97 }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[game.category]} opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon + difficulty */}
        <div className="flex items-start justify-between mb-3">
          <motion.div
            className="text-4xl"
            whileHover={noMotion ? undefined : { scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {game.icon}
          </motion.div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diff.color}`}>
            {t(diff.label)}
          </span>
        </div>

        {/* Title + description */}
        <h3 className="font-bold text-sm mb-1 group-hover:text-[var(--color-primary)] group-active:text-[var(--color-primary)] transition-colors">
          {tp(game.name as Parameters<typeof tp>[0])}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-3 flex-1">
          {tp(game.desc as Parameters<typeof tp>[0])}
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
    </motion.button>
  );
}
