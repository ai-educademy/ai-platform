"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useInView } from "@/hooks/useInView";

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
}

/* ── Staggered word animation ── */
function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const prefersReduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
      <span className={className}>
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="inline-block mr-[0.3em]"
            style={
              prefersReduced
                ? {}
                : {
                    animation: `fadeInUp 0.4s cubic-bezier(0.25,0.4,0.25,1) ${0.3 + i * 0.08}s both`,
                  }
            }
          >
            {word}
          </span>
        ))}
      </span>
    </>
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
}: HomeHeroProps) {
  const [ref, isInView] = useInView({ margin: "-40px" });
  const noMotion = useReducedMotion();

  const ease = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <div ref={ref} className="text-center max-w-4xl mx-auto">
      {/* Logo - scale-in + subtle float */}
      <div
        style={{
          opacity: noMotion || isInView ? 1 : 0,
          transform: noMotion || isInView ? "none" : "scale(0.8)",
          transition: noMotion
            ? "none"
            : `opacity 0.5s ${ease} 0.1s, transform 0.5s ${ease} 0.1s`,
        }}
      >
        <div
          style={{
            animation: noMotion ? "none" : "float 3s ease-in-out infinite",
          }}
        >
          <Image
            src="/images/logo.png"
            alt="AI Educademy"
            width={80}
            height={80}
            className="mx-auto mb-8 rounded-2xl shadow-lg ring-1 ring-[var(--color-border)]"
            priority
          />
        </div>
      </div>

      {/* Title - each word fades up with stagger */}
      <h1
        className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6"
        style={{
          opacity: noMotion || isInView ? 1 : 0,
          transition: noMotion ? "none" : `opacity 0.3s ${ease} 0.2s`,
        }}
      >
        <AnimatedWords text={title} className="block" />
        <span className="block text-gradient-animated">{titleHighlight}</span>
      </h1>

      {/* Subtitle - visible immediately for LCP, animate transform only */}
      <p
        className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8 leading-relaxed"
        style={{
          transform: noMotion || isInView ? "none" : "translateY(10px)",
          transition: noMotion
            ? "none"
            : "transform 0.4s cubic-bezier(0.25,0.4,0.25,1) 0.3s",
        }}
      >
        {subtitle}
      </p>

      {/* CTAs - premium gradient buttons */}
      <div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        style={{
          opacity: noMotion || isInView ? 1 : 0,
          transform: noMotion || isInView ? "none" : "translateY(16px)",
          transition: noMotion
            ? "none"
            : `opacity 0.5s cubic-bezier(0.25,0.4,0.25,1) 0.9s, transform 0.5s cubic-bezier(0.25,0.4,0.25,1) 0.9s`,
        }}
      >
        {/* Primary CTA - shimmer sweep */}
        <div
          className={
            noMotion
              ? ""
              : "hover:scale-[1.04] active:scale-[0.97] transition-transform"
          }
        >
          <Link
            href={ctaHref}
            className="relative overflow-hidden inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:shadow-2xl transition-shadow duration-300"
          >
            <span className="relative z-10">{ctaText} →</span>
            <span className="absolute inset-0 shimmer-sweep pointer-events-none" />
          </Link>
        </div>

        {/* Secondary CTA - gradient border on hover */}
        <div
          className={
            noMotion
              ? ""
              : "hover:scale-[1.04] active:scale-[0.97] transition-transform"
          }
        >
          <Link
            href={ctaSecondaryHref}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold border-2 border-[var(--color-border)] hover:border-indigo-500 hover:text-indigo-500 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
          >
            {ctaSecondaryText}
          </Link>
        </div>
      </div>

      {/* Stats row - animated counters with subtle card treatment */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        style={{
          opacity: noMotion || isInView ? 1 : 0,
          transform: noMotion || isInView ? "none" : "translateY(12px)",
          transition: noMotion
            ? "none"
            : `opacity 0.5s cubic-bezier(0.25,0.4,0.25,1) 1.1s, transform 0.5s cubic-bezier(0.25,0.4,0.25,1) 1.1s`,
        }}
      >
        {[statPrograms, statLessons, statLanguages].map((stat, i) => (
          <span
            key={i}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 backdrop-blur-sm text-sm text-[var(--color-text-muted)] tracking-wide ${
              noMotion
                ? ""
                : "hover:scale-[1.05] hover:border-[var(--color-primary)] transition-[transform,border-color]"
            }`}
          >
            <AnimatedStat text={stat} inView={isInView} />
          </span>
        ))}
      </div>
    </div>
  );
}
