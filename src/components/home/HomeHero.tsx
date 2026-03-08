"use client";

import { useRef } from "react";
import Image from "next/image";
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
    <div ref={ref} className="text-center max-w-4xl mx-auto">
      {/* Logo */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <Image
          src="https://avatars.githubusercontent.com/u/265648179?v=4"
          alt="AI Educademy"
          width={80}
          height={80}
          className="mx-auto mb-6 rounded-2xl shadow-lg"
          unoptimized
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <span className="block">{title}</span>
        <span className="block text-gradient">{titleHighlight}</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {subtitle}
      </motion.p>

      {/* CTAs — vibrant gradient buttons */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={ctaHref}
            className="relative overflow-hidden inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
          >
            <span className="relative z-10">{ctaText} →</span>
            <span className="absolute inset-0 shimmer-sweep pointer-events-none" />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={ctaSecondaryHref}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold border-2 border-[var(--color-border)] hover:border-indigo-500 hover:text-indigo-500 backdrop-blur-sm hover:shadow-lg transition-all"
          >
            {ctaSecondaryText}
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats row */}
      <motion.p
        className="text-sm text-[var(--color-text-muted)] tracking-wide"
        custom={4}
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
