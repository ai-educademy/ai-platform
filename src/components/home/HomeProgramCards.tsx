"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ── Inline spotlight hook (throttled to avoid per-pixel reflows) ── */
function useCardSpotlight() {
  const [pos, setPos] = useState({ x: 0, y: 0, hovering: false });
  const lastMoveTime = useRef(0);
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastMoveTime.current < 32) return;
    lastMoveTime.current = now;
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
  const [ref, isInView] = useInView<HTMLDivElement>({ margin: "-60px" });
  const { pos, onMouseMove, onMouseLeave } = useCardSpotlight();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const lastTiltTime = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const now = Date.now();
      if (now - lastTiltTime.current < 32) return;
      lastTiltTime.current = now;
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
    <div
      ref={ref}
      className={`${className ?? ""} transition-all duration-[600ms] ${
        isInView || reduced
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionTimingFunction: EASE }}
    >
      <ClickableCard href={data.href} className="block h-full" ariaLabel={data.trackTitle}>
        <div
          className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 sm:p-8 h-full group ${
            !reduced
              ? "hover:[box-shadow:var(--shadow-lg)] hover:border-[var(--color-primary)]"
              : ""
          }`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transition: `transform 0.3s ${EASE}, box-shadow 0.3s ${EASE}, border-color 0.3s ${EASE}`,
            transformStyle: "preserve-3d",
            perspective: 1000,
            willChange: "transform",
          }}
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
              <span
                className={`text-3xl inline-block ${
                  !reduced
                    ? "hover:scale-[1.2] transition-transform duration-300"
                    : ""
                }`}
                style={{ transitionTimingFunction: EASE }}
              >
                {data.trackIcon}
              </span>
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
                    <div
                      key={program.slug}
                      className={`relative z-10 transition-all ${
                        isInView || reduced
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3"
                      }`}
                      style={{
                        transitionDuration: "0.4s",
                        transitionDelay: `${0.3 + idx * 0.1}s`,
                        transitionTimingFunction: EASE,
                      }}
                    >
                      {program.active ? (
                        <Link
                          href={href}
                          className="group/node flex flex-col items-center text-center p-1.5 sm:p-2 rounded-xl hover:bg-[var(--color-bg-section)] transition-all duration-200"
                        >
                          {/* Program node */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1.5 border-2 transition-all duration-300 group-hover/node:shadow-md ${
                              !reduced ? "hover:scale-[1.15]" : ""
                            }`}
                            style={{
                              borderColor: program.color,
                              backgroundColor: `${program.color}12`,
                              transitionTimingFunction: EASE,
                            }}
                          >
                            {program.icon}
                          </div>
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </ClickableCard>
    </div>
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
  const [cardRef, cardInView] = useInView<HTMLDivElement>({ margin: "-40px" });

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 group flex flex-col items-center justify-center text-center min-h-[180px] transition-all duration-500 ${
        cardInView || reduced
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95"
      } ${
        !reduced
          ? "hover:-translate-y-1 hover:border-[var(--color-primary)]"
          : ""
      }`}
      style={{
        transitionDelay: `${index * 0.1}s`,
        transitionTimingFunction: EASE,
        willChange: "transform",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
        <span
          className={`text-3xl mb-2 block ${
            !reduced
              ? "hover:scale-[1.2] hover:rotate-[8deg] transition-transform duration-300"
              : ""
          }`}
          style={{ transitionTimingFunction: EASE }}
        >
          {highlight.icon}
        </span>
        <div className="text-2xl font-black text-gradient mb-1">
          {highlight.value}
        </div>
        <h4 className="text-sm font-bold mb-1">{highlight.label}</h4>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {highlight.desc}
        </p>
      </div>
    </div>
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
  const [cardRef, cardInView] = useInView<HTMLDivElement>({ margin: "-40px" });

  return (
    <div
      ref={cardRef}
      className={`md:col-span-3 relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-purple-500/5 p-6 group transition-all duration-500 ${
        cardInView || reduced
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      } ${!reduced ? "hover:-translate-y-0.5" : ""}`}
      style={{
        transitionDelay: "0.2s",
        transitionTimingFunction: EASE,
      }}
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
        <span
          className={`text-3xl inline-block ${
            !reduced
              ? "hover:scale-[1.2] transition-transform duration-300"
              : ""
          }`}
          style={{ transitionTimingFunction: EASE }}
        >
          {highlight.icon}
        </span>
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
    </div>
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
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ margin: "-40px" });
  const reduced = useReducedMotion();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section header with animated gradient text */}
      <div
        ref={headerRef}
        className={`text-center mb-10 transition-all duration-500 ${
          headerInView || reduced
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
        style={{ transitionTimingFunction: EASE }}
      >
        <h2 className="text-3xl sm:text-5xl font-black mb-4 text-gradient-animated">
          {sectionTitle}
        </h2>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          {sectionSubtitle}
        </p>
      </div>

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
