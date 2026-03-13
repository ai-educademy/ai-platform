"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, Lock, CheckCircle2, LogIn, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import programsData from "@data/programs.json";

/* ─── Types ─── */

interface ProgramMeta {
  level: number;
  color: string;
  icon: string;
  track: string;
  estimatedHours: number;
}

interface ProgressEntry {
  lessonSlug: string;
  programSlug: string;
  locale: string;
  completedAt: string;
}

type NodeStatus = "completed" | "current" | "available" | "locked";

interface TrackConfig {
  slug: string;
  labelKey: string;
  emoji: string;
  gradient: string;
  glowColor: string;
  programs: string[];
}

/* ─── Track definitions ─── */

const TRACKS: TrackConfig[] = [
  {
    slug: "ai-learning",
    labelKey: "trackAI",
    emoji: "🌱",
    gradient: "from-emerald-500 to-green-400",
    glowColor: "rgba(52, 211, 153, 0.3)",
    programs: ["ai-seeds", "ai-sprouts", "ai-branches", "ai-canopy", "ai-forest"],
  },
  {
    slug: "craft-engineering",
    labelKey: "trackCraft",
    emoji: "✏️",
    gradient: "from-purple-500 to-violet-400",
    glowColor: "rgba(139, 92, 246, 0.3)",
    programs: ["ai-sketch", "ai-chisel", "ai-craft", "ai-polish", "ai-masterpiece"],
  },
  {
    slug: "career-ready",
    labelKey: "trackCareer",
    emoji: "🚀",
    gradient: "from-amber-500 to-yellow-400",
    glowColor: "rgba(245, 158, 11, 0.3)",
    programs: ["ai-launchpad", "ai-behavioral", "ai-technical", "ai-ml-interview", "ai-offer"],
  },
];

const TRACK_COLORS: Record<string, { node: string; line: string; bg: string }> = {
  "ai-learning": { node: "#34D399", line: "#34D399", bg: "rgba(52, 211, 153, 0.08)" },
  "craft-engineering": { node: "#8B5CF6", line: "#8B5CF6", bg: "rgba(139, 92, 246, 0.08)" },
  "career-ready": { node: "#F59E0B", line: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" },
};

const programs = programsData.programs as Record<string, ProgramMeta>;

/* ─── Helpers ─── */

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const locales = ["en", "fr", "nl", "hi", "te", "es", "pt", "de", "ja", "zh", "ar"];
  return locales.includes(segments[0]) ? segments[0] : "en";
}

function useInView(margin = "-40px") {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setIsInView(true); obs.disconnect(); }
      },
      { rootMargin: margin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);
  return { ref, isInView };
}

/* ─── SVG Track Path (desktop: horizontal, mobile: vertical) ─── */

function TrackPath({
  track,
  programSlugs,
  nodeStatuses,
  progressMap,
  basePath,
  t,
  tp,
  noMotion,
  isInView,
  delay,
}: {
  track: TrackConfig;
  programSlugs: string[];
  nodeStatuses: Map<string, NodeStatus>;
  progressMap: Map<string, number>;
  basePath: string;
  t: ReturnType<typeof useTranslations>;
  tp: ReturnType<typeof useTranslations>;
  noMotion: boolean;
  isInView: boolean;
  delay: number;
}) {
  const router = useRouter();
  const colors = TRACK_COLORS[track.slug];
  const nodeCount = programSlugs.length;

  // Desktop: SVG horizontal path
  const svgWidth = 900;
  const svgHeight = 160;
  const nodeSpacing = svgWidth / (nodeCount + 1);
  const nodeY = svgHeight / 2;

  // Points for desktop
  const desktopPoints = programSlugs.map((_, i) => ({
    x: nodeSpacing * (i + 1),
    y: nodeY,
  }));

  // Mobile: vertical layout
  const mSvgWidth = 80;
  const mNodeSpacing = 100;
  const mSvgHeight = mNodeSpacing * nodeCount + 40;
  const mobilePoints = programSlugs.map((_, i) => ({
    x: mSvgWidth / 2,
    y: mNodeSpacing * i + 50,
  }));

  const handleNodeClick = useCallback(
    (slug: string) => {
      router.push(`${basePath}/programs/${slug}`);
    },
    [router, basePath],
  );

  // Determine program name from translations
  const getProgramName = (slug: string) => {
    try {
      return tp(`${slug}.title`);
    } catch {
      return slug.replace(/^ai-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const renderConnection = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    slug1: string,
    slug2: string,
    index: number,
    isDesktop: boolean,
  ) => {
    const s1 = nodeStatuses.get(slug1) ?? "available";
    const s2 = nodeStatuses.get(slug2) ?? "available";
    const isCompleted = s1 === "completed";
    const id = `grad-${track.slug}-${index}-${isDesktop ? "d" : "m"}`;

    return (
      <g key={`conn-${index}`}>
        {isCompleted && (
          <defs>
            <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.line} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.line} stopOpacity={0.4} />
            </linearGradient>
          </defs>
        )}
        <line
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={isCompleted ? `url(#${id})` : colors.line}
          strokeWidth={isCompleted ? 3 : 2}
          strokeDasharray={isCompleted ? "none" : "6 4"}
          strokeOpacity={isCompleted ? 0.8 : 0.25}
          strokeLinecap="round"
          style={
            !noMotion && isInView
              ? {
                  strokeDashoffset: 0,
                  transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay + index * 120}ms`,
                }
              : undefined
          }
        />
      </g>
    );
  };

  const renderNode = (
    point: { x: number; y: number },
    slug: string,
    index: number,
    isDesktop: boolean,
  ) => {
    const meta = programs[slug];
    if (!meta) return null;
    const status = nodeStatuses.get(slug) ?? "available";
    const progress = progressMap.get(slug) ?? 0;
    const isCurrent = status === "current";
    const isCompleted = status === "completed";
    const isLocked = status === "locked";
    const nodeR = isDesktop ? 28 : 24;

    return (
      <g
        key={slug}
        style={{
          cursor: isLocked ? "not-allowed" : "pointer",
          opacity: !noMotion && isInView ? 1 : noMotion ? 1 : 0,
          transform:
            !noMotion && isInView
              ? "translateY(0)"
              : noMotion
                ? "none"
                : "translateY(12px)",
          transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay + index * 150}ms`,
        }}
        onClick={() => !isLocked && handleNodeClick(slug)}
        role="button"
        tabIndex={isLocked ? -1 : 0}
        aria-label={`${getProgramName(slug)} - ${t(status === "completed" ? "completed" : status === "current" ? "current" : status === "locked" ? "locked" : "level")} ${meta.level}`}
        onKeyDown={(e) => {
          if (!isLocked && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleNodeClick(slug);
          }
        }}
      >
        {/* Glow ring for current node */}
        {isCurrent && !noMotion && (
          <circle
            cx={point.x}
            cy={point.y}
            r={nodeR + 8}
            fill="none"
            stroke={colors.node}
            strokeWidth={2}
            opacity={0.4}
          >
            <animate
              attributeName="r"
              values={`${nodeR + 6};${nodeR + 14};${nodeR + 6}`}
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.1;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Background circle */}
        <circle
          cx={point.x}
          cy={point.y}
          r={nodeR}
          fill={isLocked ? "var(--color-bg-card)" : "var(--color-glass)"}
          stroke={isCompleted ? colors.node : isLocked ? "var(--color-border)" : colors.node}
          strokeWidth={isCompleted ? 2.5 : isCurrent ? 2.5 : 1.5}
          opacity={isLocked ? 0.5 : 1}
          style={{ filter: isCurrent ? `drop-shadow(0 0 8px ${colors.node})` : undefined }}
        />

        {/* Progress arc for partially completed */}
        {!isCompleted && !isLocked && progress > 0 && (
          <circle
            cx={point.x}
            cy={point.y}
            r={nodeR - 2}
            fill="none"
            stroke={colors.node}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * 2 * Math.PI * (nodeR - 2)} ${2 * Math.PI * (nodeR - 2)}`}
            transform={`rotate(-90 ${point.x} ${point.y})`}
            opacity={0.6}
          />
        )}

        {/* Icon */}
        <text
          x={point.x}
          y={point.y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isDesktop ? 20 : 18}
          style={{ pointerEvents: "none" }}
          opacity={isLocked ? 0.4 : 1}
        >
          {meta.icon}
        </text>

        {/* Completed sparkle */}
        {isCompleted && (
          <>
            <circle
              cx={point.x + nodeR - 4}
              cy={point.y - nodeR + 4}
              r={9}
              fill={colors.node}
            />
            <text
              x={point.x + nodeR - 4}
              y={point.y - nodeR + 5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fill="white"
              style={{ pointerEvents: "none" }}
            >
              ✓
            </text>
          </>
        )}

        {/* Lock icon for locked nodes */}
        {isLocked && (
          <>
            <circle
              cx={point.x + nodeR - 4}
              cy={point.y - nodeR + 4}
              r={8}
              fill="var(--color-border)"
            />
            <text
              x={point.x + nodeR - 4}
              y={point.y - nodeR + 5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8}
              fill="var(--color-text-muted)"
              style={{ pointerEvents: "none" }}
            >
              🔒
            </text>
          </>
        )}

        {/* Label below node (desktop) or beside (mobile) */}
        {isDesktop ? (
          <>
            <text
              x={point.x}
              y={point.y + nodeR + 16}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill={isLocked ? "var(--color-text-muted)" : "var(--color-text)"}
              style={{ pointerEvents: "none" }}
            >
              {getProgramName(slug)}
            </text>
            <text
              x={point.x}
              y={point.y + nodeR + 30}
              textAnchor="middle"
              fontSize={9}
              fill="var(--color-text-muted)"
              style={{ pointerEvents: "none" }}
            >
              {t("level")} {meta.level}
            </text>
          </>
        ) : (
          <>
            <text
              x={point.x + nodeR + 12}
              y={point.y - 4}
              textAnchor="start"
              fontSize={12}
              fontWeight={600}
              fill={isLocked ? "var(--color-text-muted)" : "var(--color-text)"}
              style={{ pointerEvents: "none" }}
            >
              {getProgramName(slug)}
            </text>
            <text
              x={point.x + nodeR + 12}
              y={point.y + 12}
              textAnchor="start"
              fontSize={10}
              fill="var(--color-text-muted)"
              style={{ pointerEvents: "none" }}
            >
              {t("level")} {meta.level}
              {progress > 0 && !isCompleted ? ` · ${progress}%` : ""}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="w-full">
      {/* Desktop SVG */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight + 40}`}
        className="hidden md:block w-full h-auto"
        role="img"
        aria-label={`${t(track.labelKey)} track map`}
      >
        {desktopPoints.map(
          (p, i) => i < nodeCount - 1 && renderConnection(p, desktopPoints[i + 1], programSlugs[i], programSlugs[i + 1], i, true),
        )}
        {desktopPoints.map((p, i) => renderNode(p, programSlugs[i], i, true))}
      </svg>

      {/* Mobile SVG */}
      <svg
        viewBox={`0 0 ${mSvgWidth + 180} ${mSvgHeight}`}
        className="block md:hidden w-full h-auto"
        role="img"
        aria-label={`${t(track.labelKey)} track map`}
      >
        {mobilePoints.map(
          (p, i) => i < nodeCount - 1 && renderConnection(p, mobilePoints[i + 1], programSlugs[i], programSlugs[i + 1], i, false),
        )}
        {mobilePoints.map((p, i) => renderNode(p, programSlugs[i], i, false))}
      </svg>
    </div>
  );
}

/* ─── Overall Progress Bar ─── */

function OverallProgress({
  completed,
  total,
  t,
  noMotion,
}: {
  completed: number;
  total: number;
  t: ReturnType<typeof useTranslations>;
  noMotion: boolean;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl p-5 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {t("overallProgress")}
        </span>
        <span className="text-xs font-medium text-[var(--color-text-muted)]">
          {completed} / {total}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full animate-progress-shimmer"
          style={{
            width: noMotion ? `${pct}%` : undefined,
            background: "linear-gradient(90deg, var(--color-primary), #8b5cf6, var(--color-primary))",
            backgroundSize: "200% 100%",
            transition: noMotion ? "none" : "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
            ...(noMotion ? {} : { width: `${pct}%` }),
          }}
        />
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-1.5 text-center">
        {pct}% {t("completed")}
      </p>
    </div>
  );
}

/* ─── Main Page Component ─── */

export default function JourneyPage() {
  const t = useTranslations("journey");
  const tp = useTranslations("programs");
  const { data: session } = useSession();
  const pathname = usePathname();
  const noMotion = useReducedMotion();

  const locale = getLocaleFromPath(pathname);
  const basePath = locale === "en" ? "" : `/${locale}`;

  const [progressData, setProgressData] = useState<Map<string, ProgressEntry[]>>(new Map());
  const [loading, setLoading] = useState(false);

  const heroView = useInView();
  const progressView = useInView();
  const trackViews = [useInView("-20px"), useInView("-20px"), useInView("-20px")];

  const isSignedIn = !!session?.user;

  // Fetch progress for each program when signed in
  useEffect(() => {
    if (!isSignedIn) return;
    setLoading(true);

    const allSlugs = TRACKS.flatMap((tr) => tr.programs);
    Promise.all(
      allSlugs.map((slug) =>
        fetch(`/api/progress?program=${slug}`)
          .then((r) => (r.ok ? r.json() : { progress: [] }))
          .then((data) => [slug, data.progress ?? []] as [string, ProgressEntry[]])
          .catch(() => [slug, []] as [string, ProgressEntry[]]),
      ),
    ).then((results) => {
      const map = new Map<string, ProgressEntry[]>();
      for (const [slug, entries] of results) map.set(slug, entries);
      setProgressData(map);
      setLoading(false);
    });
  }, [isSignedIn]);

  // Compute node statuses and progress percentages
  const { nodeStatuses, progressMap, completedCount } = (() => {
    const statuses = new Map<string, NodeStatus>();
    const pMap = new Map<string, number>();
    let completed = 0;

    for (const track of TRACKS) {
      let foundIncomplete = false;
      for (const slug of track.programs) {
        const entries = progressData.get(slug) ?? [];
        // Estimate: if has any progress entries, treat as having some completion
        const progressPct = entries.length > 0 ? Math.min(100, entries.length * 20) : 0;
        pMap.set(slug, progressPct);

        if (!isSignedIn) {
          statuses.set(slug, "available");
        } else if (progressPct >= 100) {
          statuses.set(slug, "completed");
          completed++;
        } else if (!foundIncomplete) {
          statuses.set(slug, "current");
          foundIncomplete = true;
        } else {
          statuses.set(slug, "locked");
        }
      }
      // If all are complete in this track, no "current" was set
      if (!foundIncomplete && isSignedIn) {
        // All done for this track
      }
    }

    return { nodeStatuses: statuses, progressMap: pMap, completedCount: completed };
  })();

  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  const fadeUp = (inView: boolean, delay = 0, y = 24) =>
    noMotion
      ? undefined
      : {
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : `translateY(${y}px)`,
          transition: `opacity 0.6s ${EASE} ${delay}ms, transform 0.6s ${EASE} ${delay}ms`,
        };

  return (
    <section className="min-h-screen py-12 sm:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* ─── Hero ─── */}
        <div ref={heroView.ref} className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient mb-4"
            style={fadeUp(heroView.isInView, 0, 30)}
          >
            {t("title")}
          </h1>
          <p
            className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-xl mx-auto"
            style={fadeUp(heroView.isInView, 120)}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* ─── Overall Progress ─── */}
        <div ref={progressView.ref} className="mb-14" style={fadeUp(progressView.isInView, 0)}>
          {isSignedIn ? (
            <OverallProgress
              completed={completedCount}
              total={15}
              t={t}
              noMotion={noMotion}
            />
          ) : (
            <div className="glass-card rounded-2xl p-5 max-w-md mx-auto text-center">
              <LogIn className="w-5 h-5 mx-auto mb-2 text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                {t("signInPrompt")}
              </p>
              <a
                href={`${basePath}/signin`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full text-white transition-all hover:scale-[1.04] active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
                  boxShadow: "0 2px 8px var(--color-primary-glow)",
                }}
              >
                {t("startJourney")}
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* ─── Track Lanes ─── */}
        {TRACKS.map((track, trackIdx) => {
          const colors = TRACK_COLORS[track.slug];
          const tv = trackViews[trackIdx];
          return (
            <div
              key={track.slug}
              ref={tv.ref}
              className="mb-10 md:mb-14"
              style={fadeUp(tv.isInView, 0)}
            >
              {/* Track header */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-lg"
                  style={{ backgroundColor: colors.bg, border: `1px solid ${colors.node}30` }}
                >
                  {track.emoji}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
                  {t(track.labelKey)}
                </h2>
                <div
                  className="hidden sm:block flex-1 h-px ml-2"
                  style={{
                    background: `linear-gradient(to right, ${colors.node}40, transparent)`,
                  }}
                />
              </div>

              {/* Track path */}
              <div
                className="rounded-2xl p-3 sm:p-4 overflow-hidden"
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.node}15`,
                }}
              >
                <TrackPath
                  track={track}
                  programSlugs={track.programs}
                  nodeStatuses={nodeStatuses}
                  progressMap={progressMap}
                  basePath={basePath}
                  t={t}
                  tp={tp}
                  noMotion={noMotion}
                  isInView={tv.isInView}
                  delay={200}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
