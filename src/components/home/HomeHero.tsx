"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ── Types ── */
interface HomeHeroProps {
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
  basePath: string;
  totalLessons: number;
  statPrograms: string;
  statLessons: string;
  statLanguages: string;
  statFree: string;
}

/* ── Spring config ── */
const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

/* ── Staggered word animation ── */
function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const prefersReduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.3em]"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Animated stat counter ── */
function AnimatedStat({ text, inView }: { text: string; inView: boolean }) {
  const prefersReduced = useReducedMotion();
  const match = text.match(/^(\d+)(\+?)(.*)$/);
  const numericValue = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? `${match[2]}${match[3]}` : text;
  const isNumeric = !!match;
  const [count, setCount] = useState(0);

  const animate = useCallback(() => {
    if (!isNumeric || prefersReduced) {
      setCount(numericValue);
      return;
    }
    const duration = 1200;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isNumeric, numericValue, prefersReduced]);

  useEffect(() => {
    if (inView) animate();
  }, [inView, animate]);

  if (!isNumeric) {
    return <span className="font-semibold text-[var(--color-text)]">{text}</span>;
  }

  return (
    <span className="font-semibold text-[var(--color-text)]">
      {count}{suffix}
    </span>
  );
}

/* ── Main Component ── */
export default function HomeHero({
  title,
  titleHighlight,
  subtitle,
  ctaText,
  ctaHref,
  ctaSecondaryText,
  ctaSecondaryHref,
  statPrograms,
  statLessons,
  statLanguages,
  statFree,
}: HomeHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  const noMotion = { opacity: 1, y: 0, scale: 1 };

  return (
    <div ref={ref} className="text-center max-w-4xl mx-auto">
      {/* Logo - scale-in with spring + subtle float */}
      <motion.div
        initial={prefersReduced ? noMotion : { opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={prefersReduced ? { duration: 0 } : { ...spring, delay: 0.1 }}
      >
        <motion.div
          animate={prefersReduced ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="https://avatars.githubusercontent.com/u/265648179?v=4"
            alt="AI Educademy"
            width={80}
            height={80}
            className="mx-auto mb-8 rounded-2xl shadow-lg ring-1 ring-[var(--color-border)]"
            unoptimized
          />
        </motion.div>
      </motion.div>

      {/* Title - each word fades up with stagger */}
      <motion.h1
        className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6"
        initial={prefersReduced ? noMotion : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <AnimatedWords text={title} className="block" />
        <span className="block text-gradient-animated">{titleHighlight}</span>
      </motion.h1>

      {/* Subtitle - fade up after title */}
      <motion.p
        className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8 leading-relaxed"
        initial={prefersReduced ? noMotion : { opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {subtitle}
      </motion.p>

      {/* CTAs - premium gradient buttons */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        initial={prefersReduced ? noMotion : { opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Primary CTA - shimmer sweep */}
        <motion.div
          whileHover={prefersReduced ? {} : { scale: 1.04 }}
          whileTap={prefersReduced ? {} : { scale: 0.97 }}
          transition={spring}
        >
          <Link
            href={ctaHref}
            className="relative overflow-hidden inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:shadow-2xl transition-shadow duration-300"
          >
            <span className="relative z-10">{ctaText} →</span>
            <span className="absolute inset-0 shimmer-sweep pointer-events-none" />
          </Link>
        </motion.div>

        {/* Secondary CTA - gradient border on hover */}
        <motion.div
          whileHover={prefersReduced ? {} : { scale: 1.04 }}
          whileTap={prefersReduced ? {} : { scale: 0.97 }}
          transition={spring}
        >
          <Link
            href={ctaSecondaryHref}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold border-2 border-[var(--color-border)] hover:border-indigo-500 hover:text-indigo-500 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
          >
            {ctaSecondaryText}
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats row - animated counters with subtle card treatment */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        initial={prefersReduced ? noMotion : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 1.1, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {[statPrograms, statLessons, statLanguages, statFree].map((stat, i) => (
          <motion.span
            key={i}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 backdrop-blur-sm text-sm text-[var(--color-text-muted)] tracking-wide"
            whileHover={prefersReduced ? {} : { scale: 1.05, borderColor: "var(--color-primary)" }}
            transition={spring}
          >
            <AnimatedStat text={stat} inView={isInView} />
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
