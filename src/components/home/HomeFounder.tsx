"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

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

/* ── Animation ── */
const ease = [0.25, 0.4, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease },
  }),
};

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

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto px-4 sm:px-6 relative">
      {/* Section header */}
      <motion.div
        className="text-center mb-10"
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
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-2 ring-[var(--color-border)] mb-4">
              <Image
                src={avatarSrc}
                alt={name}
                width={256}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <h3 className="text-lg font-bold text-center">{name}</h3>
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-4">{role}</p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
                  aria-label={link.label}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={link.iconPath} />
                  </svg>
                </a>
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

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-3 gap-4 mb-8"
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-[var(--color-bg-section)]">
                  <div className="text-xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
              >
                {ctaText} <span aria-hidden>→</span>
              </Link>
              <a
                href={coffeeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              >
                ☕ {coffeeText}
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
