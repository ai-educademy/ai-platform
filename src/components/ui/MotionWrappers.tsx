"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ─── AnimatedSection ─── */
type Animation = "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right";

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  once?: boolean;
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const animationVariants: Record<
  Animation,
  { hidden: Record<string, number>; visible: Record<string, number> }
> = {
  "fade-up": { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
  "fade-in": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
};

export function AnimatedSection({
  children,
  animation = "fade-up",
  delay = 0,
  className,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variant = animationVariants[animation];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={variant.hidden}
      animate={isInView ? variant.visible : variant.hidden}
      transition={{ duration: 0.6, delay: delay / 1000, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ─── AnimatedProgressBar ─── */
interface AnimatedProgressBarProps {
  percentage: number;
  className?: string;
  barClassName?: string;
  delay?: number;
}

export function AnimatedProgressBar({
  percentage,
  className = "h-3 rounded-full bg-[var(--color-bg-section)] overflow-hidden",
  barClassName = "h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500",
  delay = 0,
}: AnimatedProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div ref={ref} className={className}>
      <motion.div
        className={barClassName}
        initial={{ width: prefersReducedMotion ? `${percentage}%` : "0%" }}
        animate={isInView ? { width: `${percentage}%` } : {}}
        transition={{ duration: 1.2, delay: delay / 1000, ease }}
      />
    </div>
  );
}
