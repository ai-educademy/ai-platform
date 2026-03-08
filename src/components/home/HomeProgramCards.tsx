"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ClickableCard } from "@/components/ui/ClickableCard";
import { ComingSoonCard } from "@/components/ui/ComingSoon";

/* ── Types ── */
interface ProgramInfo {
  slug: string;
  icon: string;
  title: string;
  color: string;
  active: boolean;
  level: number;
}

interface TrackCardProps {
  trackIcon: string;
  trackTitle: string;
  trackDesc: string;
  programs: ProgramInfo[];
  programTitles: Record<string, string>;
  firstLessonSlugs: Record<string, string | undefined>;
  lessonNames: Record<string, string[]>;
  basePath: string;
  href: string;
  delay?: number;
}

interface HighlightCard {
  icon: string;
  value: string;
  label: string;
  desc: string;
}

interface HomeProgramCardsProps {
  sectionTitle: string;
  sectionSubtitle: string;
  trackAI: TrackCardProps;
  trackCraft: TrackCardProps;
  highlights: HighlightCard[];
}

/* ── Animation config ── */
const spring = { type: "spring" as const, stiffness: 300, damping: 25 };
const ease = [0.25, 0.4, 0.25, 1] as const;

/* ── Inline spotlight hook ── */
function useCardSpotlight() {
  const [pos, setPos] = useState({ x: 0, y: 0, hovering: false });
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      hovering: true,
    });
  }, []);
  const onMouseLeave = useCallback(
    () => setPos((p) => ({ ...p, hovering: false })),
    [],
  );
  return { pos, onMouseMove, onMouseLeave };
}

/* ── Bento Track Card with Visual Timeline ── */
function BentoTrackCard({
  data,
  reduced,
  className,
}: {
  data: TrackCardProps;
  reduced: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const { pos, onMouseMove, onMouseLeave } = useCardSpotlight();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rotateX: -y * 3, rotateY: x * 3 });
      onMouseMove(e);
    },
    [reduced, onMouseMove],
  );

  const handleLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    onMouseLeave();
  }, [onMouseLeave]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease }}
    >
      <ClickableCard href={data.href} className="block h-full" ariaLabel={data.trackTitle}>
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 sm:p-8 h-full group"
          animate={tilt}
          transition={spring}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          style={{
            transformStyle: "preserve-3d",
            perspective: 1000,
            willChange: "transform",
          }}
          whileHover={
            reduced
              ? {}
              : {
                  boxShadow: "var(--shadow-lg)",
                  borderColor: "var(--color-primary)",
                }
          }
        >
          {/* Spotlight gradient overlay */}
          <div
            className="spotlight-overlay rounded-2xl"
            style={{
              background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, var(--color-primary-glow), transparent 70%)`,
              opacity: pos.hovering ? 1 : 0,
            }}
          />

          {/* Gradient border shimmer on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none animated-border-shimmer"
            style={{
              padding: "1.5px",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            }}
          />

          <div className="relative z-10">
            {/* Track header */}
            <div className="flex items-center gap-3 mb-2">
              <motion.span
                className="text-3xl"
                whileHover={
                  reduced
                    ? {}
                    : {
                        scale: 1.2,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 12,
                        },
                      }
                }
              >
                {data.trackIcon}
              </motion.span>
              <div>
                <h3 className="text-xl font-bold">{data.trackTitle}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {data.programs.length} programs
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
              {data.trackDesc}
            </p>

            {/* Visual Timeline of Programs */}
            <div className="relative">
              {/* Connecting gradient line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-25" />

              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {data.programs.map((program, idx) => {
                  const title = (
                    data.programTitles[program.slug] || ""
                  ).replace("AI ", "");
                  const href = data.firstLessonSlugs[program.slug]
                    ? `${data.basePath}/programs/${program.slug}/lessons/${data.firstLessonSlugs[program.slug]}`
                    : `${data.basePath}/programs/${program.slug}`;

                  return (
                    <motion.div
                      key={program.slug}
                      className="relative z-10"
                      initial={reduced ? {} : { opacity: 0, y: 12 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        delay: 0.3 + idx * 0.1,
                        duration: 0.4,
                        ease,
                      }}
                    >
                      {program.active ? (
                        <Link
                          href={href}
                          className="group/node flex flex-col items-center text-center p-1.5 sm:p-2 rounded-xl hover:bg-[var(--color-bg-section)] transition-all duration-200"
                        >
                          {/* Program node */}
                          <motion.div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1.5 border-2 transition-all duration-300 group-hover/node:shadow-md"
                            style={{
                              borderColor: program.color,
                              backgroundColor: `${program.color}12`,
                            }}
                            whileHover={
                              reduced ? {} : { scale: 1.15, transition: spring }
                            }
                          >
                            {program.icon}
                          </motion.div>
                          <span className="text-[9px] sm:text-xs font-semibold leading-tight group-hover/node:text-[var(--color-primary)] transition-colors line-clamp-2">
                            {title}
                          </span>
                          {/* Level dots */}
                          <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <div
                                key={j}
                                className="w-1 h-1 rounded-full transition-colors"
                                style={{
                                  backgroundColor:
                                    j < program.level
                                      ? program.color
                                      : "var(--color-border)",
                                }}
                              />
                            ))}
                          </div>
                        </Link>
                      ) : (
                        <ComingSoonCard
                          icon={program.icon}
                          label={title}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </ClickableCard>
    </motion.div>
  );
}

/* ── Bento Highlight Stat Card ── */
function BentoHighlightCard({
  highlight,
  index,
  reduced,
}: {
  highlight: HighlightCard;
  index: number;
  reduced: boolean;
}) {
  const { pos, onMouseMove, onMouseLeave } = useCardSpotlight();

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 group flex flex-col items-center justify-center text-center min-h-[180px]"
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
      whileHover={
        reduced
          ? {}
          : { y: -4, borderColor: "var(--color-primary)", transition: spring }
      }
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ willChange: "transform" }}
    >
      {/* Spotlight */}
      <div
        className="spotlight-overlay rounded-2xl"
        style={{
          background: `radial-gradient(200px circle at ${pos.x}px ${pos.y}px, var(--color-primary-glow), transparent 70%)`,
          opacity: pos.hovering ? 1 : 0,
        }}
      />
      <div className="relative z-10">
        <motion.span
          className="text-3xl mb-2 block"
          whileHover={
            reduced
              ? {}
              : {
                  scale: 1.2,
                  rotate: 8,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 12,
                  },
                }
          }
        >
          {highlight.icon}
        </motion.span>
        <div className="text-2xl font-black text-gradient mb-1">
          {highlight.value}
        </div>
        <h4 className="text-sm font-bold mb-1">{highlight.label}</h4>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {highlight.desc}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Full-width Accent Banner Card ── */
function BentoAccentCard({
  highlight,
  reduced,
}: {
  highlight: HighlightCard;
  reduced: boolean;
}) {
  const { pos, onMouseMove, onMouseLeave } = useCardSpotlight();

  return (
    <motion.div
      className="md:col-span-3 relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-purple-500/5 p-6 group"
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: 0.2, ease }}
      whileHover={reduced ? {} : { y: -2, transition: spring }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Spotlight */}
      <div
        className="spotlight-overlay rounded-2xl"
        style={{
          background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, var(--color-primary-glow), transparent 70%)`,
          opacity: pos.hovering ? 1 : 0,
        }}
      />
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
        <motion.span
          className="text-3xl"
          whileHover={
            reduced
              ? {}
              : {
                  scale: 1.2,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 12,
                  },
                }
          }
        >
          {highlight.icon}
        </motion.span>
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
          <span className="text-xl font-black text-gradient">
            {highlight.value}
          </span>
          <span className="hidden sm:inline text-[var(--color-border)]">·</span>
          <span className="font-semibold">{highlight.label}</span>
          <span className="hidden sm:inline text-[var(--color-border)]">·</span>
          <span className="text-sm text-[var(--color-text-muted)]">
            {highlight.desc}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function HomeProgramCards({
  sectionTitle,
  sectionSubtitle,
  trackAI,
  trackCraft,
  highlights,
}: HomeProgramCardsProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();
  const reduced = !!prefersReduced;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section header with animated gradient text */}
      <motion.div
        ref={headerRef}
        className="text-center mb-16"
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease }}
      >
        <h2 className="text-3xl sm:text-5xl font-black mb-4 text-gradient-animated">
          {sectionTitle}
        </h2>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          {sectionSubtitle}
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {/* Row 1: AI Track (span 2) + Highlight */}
        <BentoTrackCard
          data={trackAI}
          reduced={reduced}
          className="md:col-span-2"
        />
        {highlights[0] && (
          <BentoHighlightCard
            highlight={highlights[0]}
            index={0}
            reduced={reduced}
          />
        )}

        {/* Row 2: Highlight + Craft Track (span 2) */}
        {highlights[1] && (
          <BentoHighlightCard
            highlight={highlights[1]}
            index={1}
            reduced={reduced}
          />
        )}
        <BentoTrackCard
          data={trackCraft}
          reduced={reduced}
          className="md:col-span-2"
        />

        {/* Row 3: Full-width accent banner */}
        {highlights[2] && (
          <BentoAccentCard highlight={highlights[2]} reduced={reduced} />
        )}
      </div>
    </div>
  );
}
