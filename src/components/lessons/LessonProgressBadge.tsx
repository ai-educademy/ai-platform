"use client";

import { useProgress } from "@/hooks/useProgress";
import { motion, useReducedMotion } from "framer-motion";

export function LessonProgressBadge({ slug }: { slug: string }) {
  const { isCompleted } = useProgress();
  const prefersReduced = useReducedMotion();

  if (!isCompleted(slug)) return null;

  return (
    <motion.span
      className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-bold shrink-0"
      initial={prefersReduced ? undefined : { scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      ✓
    </motion.span>
  );
}
