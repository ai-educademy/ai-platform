"use client";

import { useProgress } from "@/hooks/useProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function LessonProgressBadge({ slug }: { slug: string }) {
  const { isCompleted } = useProgress();
  const noMotion = useReducedMotion();

  if (!isCompleted(slug)) return null;

  return (
    <span
      className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-bold shrink-0"
      style={noMotion ? undefined : { animation: "scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      ✓
    </span>
  );
}
