"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ── Animated counter for founder stats ── */
function FounderStatCounter({
  value,
  label,
  inView,
  reduced,
}: {
  value: string;
  label: string;
  inView: boolean;
  reduced: boolean;
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
    <div
      className="text-center p-4 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:-translate-y-0.5 transition-all"
      style={{ transitionDuration: "300ms", transitionTimingFunction: EASE }}
    >
      <div className="text-2xl font-black text-gradient">
        {isNumeric ? `${count}${suffix}` : value}
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">
        {label}
      </div>
    </div>
  );
}

/* ── Fade-up style helper ── */
function fadeUpStyle(
  isInView: boolean,
  reduced: boolean,
  delayIndex: number,
): React.CSSProperties {
  if (reduced) return {};
  return {
    opacity: isInView ? 1 : 0,
    transform: isInView ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.5s ${EASE} ${delayIndex * 0.1}s, transform 0.5s ${EASE} ${delayIndex * 0.1}s`,
  };
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
  const [sectionRef, isInView] = useInView<HTMLDivElement>({ margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto px-4 sm:px-6 relative">
      {/* Section header */}
      <div className="text-center mb-12" style={fadeUpStyle(isInView, reduced, 0)}>
        <h2 className="text-3xl sm:text-5xl font-black text-gradient-animated">
          {brainsTitle}
        </h2>
      </div>

      {/* Glass morphism card with animated gradient border */}
      <div style={fadeUpStyle(isInView, reduced, 1)}>
        {/* Animated gradient border wrapper */}
        <div className="rounded-2xl p-px animated-border-shimmer">
          <div className="rounded-2xl glass-premium overflow-hidden bg-[var(--color-bg-card)]">
            <div className="grid md:grid-cols-[260px_1fr] items-stretch">
              {/* Avatar column */}
              <div className="flex flex-col items-center justify-center p-8 md:p-10 relative overflow-hidden">
                {/* Subtle gradient background for avatar area */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Founder avatar */}
                  <div
                    className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden ring-2 ring-[var(--color-primary-glow)] mb-5 shadow-lg"
                    style={
                      reduced
                        ? {}
                        : {
                            opacity: isInView ? 1 : 0,
                            transform: isInView ? "scale(1)" : "scale(0.85)",
                            transition: `opacity 0.5s ${EASE} 0.2s, transform 0.5s ${EASE} 0.2s`,
                          }
                    }
                  >
                    <Image
                      src={avatarSrc}
                      alt={name}
                      width={256}
                      height={256}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>

                  <h3
                    className="text-lg font-bold text-center"
                    style={
                      reduced
                        ? {}
                        : {
                            opacity: isInView ? 1 : 0,
                            transform: isInView ? "translateY(0)" : "translateY(8px)",
                            transition: `opacity 0.4s ${EASE} 0.4s, transform 0.4s ${EASE} 0.4s`,
                          }
                    }
                  >
                    {name}
                  </h3>

                  <p
                    className="text-sm text-[var(--color-text-muted)] text-center mb-5"
                    style={
                      reduced
                        ? {}
                        : {
                            opacity: isInView ? 1 : 0,
                            transition: `opacity 0.4s ${EASE} 0.5s`,
                          }
                    }
                  >
                    {role}
                  </p>

                  {/* Social links with CSS hover */}
                  <div className="flex items-center gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-md hover:scale-115 hover:-translate-y-0.5 active:scale-95 transition-all"
                        style={{ transitionDuration: "200ms", transitionTimingFunction: EASE }}
                        aria-label={link.label}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={link.iconPath} />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content column */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <p
                  className="text-[var(--color-text-muted)] leading-relaxed mb-8 text-base"
                  style={fadeUpStyle(isInView, reduced, 2)}
                >
                  {description}
                </p>

                {/* Stats row - animated counters with better cards */}
                <div
                  className="grid grid-cols-3 gap-3 mb-8"
                  style={fadeUpStyle(isInView, reduced, 3)}
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
                </div>

                {/* CTAs - premium button treatment */}
                <div
                  className="flex flex-wrap items-center gap-3"
                  style={fadeUpStyle(isInView, reduced, 4)}
                >
                  <div className="hover:scale-115 hover:-translate-y-0.5 active:scale-95 transition-all" style={{ transitionTimingFunction: EASE }}>
                    <Link
                      href={ctaHref}
                      className="relative overflow-hidden inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow duration-300"
                    >
                      <span className="relative z-10">{ctaText} →</span>
                      <span className="absolute inset-0 shimmer-sweep pointer-events-none" />
                    </Link>
                  </div>
                  <div className="hover:scale-115 hover:-translate-y-0.5 active:scale-95 transition-all" style={{ transitionTimingFunction: EASE }}>
                    <a
                      href={coffeeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-7 py-3 border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-300"
                    >
                      ☕ {coffeeText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
