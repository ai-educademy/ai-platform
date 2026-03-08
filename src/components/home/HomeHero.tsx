"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

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

const ease = [0.25, 0.4, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease },
  }),
};

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

  return (
    <div ref={ref} className="text-center max-w-3xl mx-auto">
      {/* Title */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <span className="block">{title}</span>
        <span className="block text-gradient">{titleHighlight}</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto mb-10 leading-relaxed"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {subtitle}
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary-glow)] hover:brightness-110 transition-all"
        >
          {ctaText} <span aria-hidden>→</span>
        </Link>
        <Link
          href={ctaSecondaryHref}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
        >
          {ctaSecondaryText}
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.p
        className="text-sm text-[var(--color-text-muted)] tracking-wide"
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <span className="font-semibold text-[var(--color-text)]">{statPrograms}</span>
        {" · "}
        <span className="font-semibold text-[var(--color-text)]">{statLessons}</span>
        {" · "}
        <span className="font-semibold text-[var(--color-text)]">{statLanguages}</span>
        {" · "}
        <span className="font-semibold text-[var(--color-text)]">{statFree}</span>
      </motion.p>
    </div>
  );
}
