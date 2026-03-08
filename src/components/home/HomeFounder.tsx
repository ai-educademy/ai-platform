"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ── Types ── */
interface SocialLink {
  label: string;
  href: string;
  iconPath: string;
}

interface FounderStat {
  value: string;
  label: string;
}

interface HomeFounderProps {
  brainsTitle: string;
  name: string;
  role: string;
  description: string;
  stats: FounderStat[];
  ctaText: string;
  ctaHref: string;
  coffeeText: string;
  coffeeHref: string;
  socialLinks: SocialLink[];
  lightbulbSrc: string;
  avatarSrc: string;
}

/* ── Animation config ── */
const ease = [0.25, 0.4, 0.25, 1] as const;
const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease },
  }),
};

/* ── Animated counter for founder stats ── */
function FounderStatCounter({ value, label, inView, reduced }: {
  value: string; label: string; inView: boolean; reduced: boolean;
}) {
  const match = value.match(/^(\d+)(\+?)$/);
  const numericValue = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";
  const isNumeric = !!match;
  const [count, setCount] = useState(0);

  const animate = useCallback(() => {
    if (!isNumeric || reduced) {
      setCount(numericValue);
      return;
    }
    const duration = 1000;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isNumeric, numericValue, reduced]);

  useEffect(() => {
    if (inView) animate();
  }, [inView, animate]);

  return (
    <div className="text-center p-3 rounded-lg bg-[var(--color-bg-section)]">
      <div className="text-xl font-bold text-gradient">
        {isNumeric ? `${count}${suffix}` : value}
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</div>
    </div>
  );
}

/* ── Main Component ── */
export default function HomeFounder({
  brainsTitle,
  name,
  role,
  description,
  stats,
  ctaText,
  ctaHref,
  coffeeText,
  coffeeHref,
  socialLinks,
  avatarSrc,
}: HomeFounderProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();
  const reduced = !!prefersReduced;

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto px-4 sm:px-6 relative">
      {/* Section header */}
      <motion.div
        className="text-center mb-12"
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <h2 className="text-3xl sm:text-4xl font-bold">{brainsTitle}</h2>
      </motion.div>

      {/* Card */}
      <motion.div
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="grid md:grid-cols-[240px_1fr] items-stretch">
          {/* Avatar column */}
          <div className="flex flex-col items-center justify-center p-8 bg-[var(--color-bg-section)]">
            <motion.div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-2 ring-[var(--color-primary-glow)] pulse-ring mb-4"
              initial={reduced ? {} : { scale: 0.9, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={reduced ? { duration: 0 } : { ...spring, delay: 0.2 }}
            >
              <Image
                src={avatarSrc}
                alt={name}
                width={256}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            </motion.div>
            <motion.h3
              className="text-lg font-bold text-center"
              initial={reduced ? {} : { opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4, ease }}
            >
              {name}
            </motion.h3>
            <motion.p
              className="text-sm text-[var(--color-text-muted)] text-center mb-4"
              initial={reduced ? {} : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5, ease }}
            >
              {role}
            </motion.p>

            {/* Social links with spring hover */}
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
                  aria-label={link.label}
                  whileHover={reduced ? {} : { scale: 1.15 }}
                  whileTap={reduced ? {} : { scale: 0.95 }}
                  transition={spring}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={link.iconPath} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Content column */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <motion.p
              className="text-[var(--color-text-muted)] leading-relaxed mb-6"
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {description}
            </motion.p>

            {/* Stats row — animated counters */}
            <motion.div
              className="grid grid-cols-3 gap-4 mb-8"
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {stats.map((stat) => (
                <FounderStatCounter
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  inView={isInView}
                  reduced={reduced}
                />
              ))}
            </motion.div>

            {/* CTAs — premium button treatment */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <motion.div
                whileHover={reduced ? {} : { scale: 1.04 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                transition={spring}
              >
                <Link
                  href={ctaHref}
                  className="relative overflow-hidden inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow duration-300"
                >
                  <span className="relative z-10">{ctaText} →</span>
                  <span className="absolute inset-0 shimmer-sweep pointer-events-none" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={reduced ? {} : { scale: 1.04 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                transition={spring}
              >
                <a
                  href={coffeeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-300"
                >
                  ☕ {coffeeText}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
