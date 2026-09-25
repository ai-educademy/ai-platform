"use client";

import { useProgress } from "@/hooks/useProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useQuizContext } from "./QuizContext";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import programsData from "@data/programs.json";
import { ReferralWidget } from "@/components/dashboard/ReferralWidget";

interface LessonCompleteProps {
  slug: string; // "programSlug/lessonSlug"
  programSlug: string;
  totalLessons: number;
  currentIndex: number;
  nextSlug?: string;
  nextTitle?: string;
  prevSlug?: string;
  prevTitle?: string;
  basePath: string;
  programPath: string;
  programTitle: string;
  programTrack: string;
  programLevel: number;
  /** Total lessons per program in this track: { "ai-seeds": 3, "ai-sprouts": 3, ... } */
  trackLessonCounts?: Record<string, number>;
}

// Build PROGRAM_SEQUENCE from registry
const PROGRAM_SEQUENCE: Record<string, { slug: string; icon: string }[]> = {};
for (const track of programsData.tracks) {
  PROGRAM_SEQUENCE[track.slug] = track.programs.map((slug) => {
    const p = programsData.programs[slug as keyof typeof programsData.programs];
    return { slug, icon: p?.icon ?? "📚" };
  });
}

/* ── Canvas Confetti ── */
function ConfettiOverlay({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colours = [
      "#6366f1",
      "#f43f5e",
      "#fbbf24",
      "#10b981",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
      "#ec4899",
    ];
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      w: number;
      h: number;
      colour: string;
      rot: number;
      vr: number;
      gravity: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        colour: colours[Math.floor(Math.random() * colours.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        gravity: 0.05 + Math.random() * 0.05,
        opacity: 1,
      });
    }

    let frame = 0;
    let raf: number;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      for (const p of particles) {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (frame > 120) p.opacity = Math.max(0, p.opacity - 0.01);
        if (p.opacity <= 0 || p.y > canvas.height + 50) continue;
        alive++;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive > 0 && frame < 300) {
        raf = requestAnimationFrame(animate);
      } else {
        onDone();
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

function CelebrationModal({
  trackName,
  onClose,
}: {
  trackName: string;
  onClose: () => void;
}) {
  const t = useTranslations("lessons");
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ animation: "fade-in 0.3s ease both" }}
      onClick={onClose}
    >
      <div
        className="relative mx-4 max-w-md w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center shadow-2xl"
        style={{ animation: "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-6xl mb-4"
          style={{
            animation: "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) 150ms both",
          }}
        >
          🎉
        </div>
        <h2
          className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent mb-2"
          style={{
            animation: "fade-up 0.4s cubic-bezier(0.22,1,0.36,1) 250ms both",
          }}
        >
          {t("trackComplete")}
        </h2>
        <p className="text-[var(--color-text-muted)] mb-1">
          {t("trackCompleteDesc")}
        </p>
        <p className="text-lg font-semibold text-[var(--color-primary)] mb-6">
          {trackName}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:brightness-110 hover:scale-[1.04] active:scale-[0.96] transition-transform min-h-[44px]"
        >
          {t("trackCompleteDismiss")}
        </button>
      </div>
    </div>
  );
}

export function LessonComplete({
  slug,
  programSlug,
  totalLessons,
  currentIndex,
  nextSlug,
  nextTitle,
  prevSlug,
  prevTitle,
  basePath,
  programPath,
  programTitle: _programTitle,
  programTrack,
  programLevel: _programLevel,
  trackLessonCounts,
}: LessonCompleteProps) {
  const { isCompleted, markComplete, getProgram, allData } =
    useProgress(programSlug);
  const { allQuizzesPassed, totalQuizzes, passedQuizzes } = useQuizContext();
  const tL = useTranslations("lessons");
  const tP = useTranslations("programs");
  const locale = useLocale();
  const noMotion = useReducedMotion();
  const [justCompleted, setJustCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const confettiTriggered = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const completed = isCompleted(slug);

  const progData = getProgram(programSlug);
  const progCompleted = progData.completed.length;

  // Check if entire track is complete after marking this lesson
  const checkTrackCompletion = useCallback(() => {
    if (confettiTriggered.current) return;
    const seq = PROGRAM_SEQUENCE[programTrack];
    if (!seq || !trackLessonCounts) return;

    const allComplete = seq.every((prog) => {
      const total = trackLessonCounts[prog.slug] || 0;
      if (total === 0) return false; // skip - no lessons means not trackable
      const progProgress = allData[prog.slug];
      if (!progProgress) return false;
      return progProgress.completed.length >= total;
    });

    if (allComplete) {
      confettiTriggered.current = true;
      setShowConfetti(true);
      setShowCelebration(true);
    }
  }, [programTrack, trackLessonCounts, allData]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(
          Math.min(100, Math.round((scrollTop / docHeight) * 100)),
        );
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Explicit completion handler — gated by quiz state
  const handleComplete = useCallback(() => {
    if (!allQuizzesPassed || completed || justCompleted) return;
    // The locale has to be passed explicitly. markComplete defaults it to
    // "en" when omitted, which silently recorded every completion as English
    // regardless of the language the lesson was actually read in.
    markComplete(slug, locale);
    setJustCompleted(true);
  }, [allQuizzesPassed, completed, justCompleted, markComplete, slug, locale]);

  // Check track completion whenever progress data changes
  useEffect(() => {
    if (justCompleted) {
      checkTrackCompletion();
    }
  }, [justCompleted, allData, checkTrackCompletion]);

  // IntersectionObserver for fade-up animation on the main section
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-40px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Determine next program when at last lesson
  const nextProgram = (() => {
    if (nextSlug) return null;
    const seq = PROGRAM_SEQUENCE[programTrack];
    if (!seq) return null;
    const idx = seq.findIndex((p) => p.slug === programSlug);
    if (idx < 0 || idx >= seq.length - 1) return null;
    return seq[idx + 1];
  })();

  const sectionStyle: React.CSSProperties = noMotion
    ? {}
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      };

  const progressWidth = `${(progCompleted / totalLessons) * 100}%`;
  const progressStyle: React.CSSProperties = noMotion
    ? { width: progressWidth }
    : {
        width: inView ? progressWidth : "0%",
        transition: "width 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s",
      };

  return (
    <>
      {/* Confetti celebration for track completion */}
      {showConfetti && (
        <ConfettiOverlay onDone={() => setShowConfetti(false)} />
      )}
      {showCelebration && (
        <CelebrationModal
          trackName={
            programTrack === "ai-learning" ? tL("trackAI") : tL("trackCraft")
          }
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* Scroll progress bar (fixed at top) */}
      <div
        className="lesson-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="mt-12 space-y-6" ref={endRef} style={sectionStyle}>
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
          <span>
            {tL("lessonOf", { current: currentIndex + 1, total: totalLessons })}
          </span>
          <span>
            {tL("progressPercent", {
              percent:
                totalLessons > 0
                  ? Math.round((progCompleted / totalLessons) * 100)
                  : 0,
            })}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={progressStyle} />
        </div>

        {/* Completion gate */}
        <div className="py-5 space-y-3">
          {completed || justCompleted ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="text-xl">🎉</span>
                {tL("lessonCompleted")}
              </div>
              <ReferralWidget context="lesson" />
            </div>
          ) : (
            <>
              {totalQuizzes > 0 && (
                <div className="space-y-1">
                  {allQuizzesPassed ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                      <span>✅</span>
                      {tL("allQuizzesPassed")}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                        <span>📝</span>
                        {tL("quizRequired")}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {tL("quizProgress", {
                          passed: passedQuizzes,
                          total: totalQuizzes,
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={handleComplete}
                disabled={!allQuizzesPassed}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                  allQuizzesPassed
                    ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20 hover:brightness-110 hover:scale-[1.03] active:scale-[0.97]"
                    : "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-60"
                }`}
              >
                {allQuizzesPassed
                  ? `${tL("completeLesson")} ✓`
                  : tL("completeLesson")}
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {prevSlug ? (
            <Link
              href={`${basePath}/${prevSlug}`}
              className="group flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] active:text-[var(--color-primary)] transition-colors min-w-0 min-h-[44px] px-2"
            >
              <span className="shrink-0 group-hover:-translate-x-1 transition-transform">
                ←
              </span>
              <span className="line-clamp-1">{prevTitle}</span>
            </Link>
          ) : (
            <Link
              href={programPath}
              className="group flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] active:text-[var(--color-primary)] transition-colors min-h-[44px] px-2"
            >
              <span className="shrink-0 group-hover:-translate-x-1 transition-transform">
                ←
              </span>
              <span>{tL("backToProgram")}</span>
            </Link>
          )}
          {nextSlug ? (
            <div className="hover:scale-[1.03] active:scale-[0.97] transition-transform">
              <Link
                href={`${basePath}/${nextSlug}`}
                className="group flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:brightness-110 active:brightness-90 transition-all min-w-0 min-h-[44px] shadow-lg shadow-[var(--color-primary)]/20"
              >
                <span className="line-clamp-1">
                  {tL("continueToLesson", {
                    title: nextTitle ?? tL("nextLesson"),
                  })}
                </span>
                <span className="shrink-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          ) : nextProgram ? (
            <div className="hover:scale-[1.03] active:scale-[0.97] transition-transform">
              <Link
                href={programPath.replace(/\/[^/]+$/, `/${nextProgram.slug}`)}
                className="group flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg active:brightness-90 transition-all min-h-[44px] shadow-lg shadow-indigo-600/20"
              >
                <span>
                  {nextProgram.icon} {tP(`${nextProgram.slug}.title`)}
                </span>
                <span className="shrink-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          ) : (
            <div className="hover:scale-[1.03] active:scale-[0.97] transition-transform">
              <Link
                href={programPath.replace(/\/[^/]+$/, "")}
                className="group flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg active:brightness-90 transition-all min-h-[44px] shadow-lg shadow-indigo-600/20"
              >
                <span>{tL("allPrograms")}</span>
                <span className="shrink-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
