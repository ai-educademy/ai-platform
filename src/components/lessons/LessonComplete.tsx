"use client";

import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

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

const PROGRAM_SEQUENCE: Record<string, { slug: string; title: string; icon: string }[]> = {
  "ai-learning": [
    { slug: "ai-seeds", title: "AI Seeds", icon: "🌱" },
    { slug: "ai-sprouts", title: "AI Sprouts", icon: "🌿" },
    { slug: "ai-branches", title: "AI Branches", icon: "🌳" },
    { slug: "ai-canopy", title: "AI Canopy", icon: "🏕️" },
    { slug: "ai-forest", title: "AI Forest", icon: "🌲" },
  ],
  "craft-engineering": [
    { slug: "ai-sketch", title: "AI Sketch", icon: "✏️" },
    { slug: "ai-chisel", title: "AI Chisel", icon: "🪨" },
    { slug: "ai-craft", title: "AI Craft", icon: "⚒️" },
    { slug: "ai-polish", title: "AI Polish", icon: "💎" },
    { slug: "ai-masterpiece", title: "AI Masterpiece", icon: "🏆" },
  ],
};

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

    const colours = ["#6366f1", "#f43f5e", "#fbbf24", "#10b981", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      w: number; h: number; colour: string; rot: number; vr: number;
      gravity: number; opacity: number;
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

function CelebrationModal({ trackName, onClose }: { trackName: string; onClose: () => void }) {
  const t = useTranslations("lessons");
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 max-w-md w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
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
          className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:brightness-110 transition-all"
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
  programTitle,
  programTrack,
  programLevel,
  trackLessonCounts,
}: LessonCompleteProps) {
  const { isCompleted, markComplete, getProgram, allData } = useProgress(programSlug);
  const tL = useTranslations("lessons");
  const tPT = useTranslations("programTitles");
  const [justCompleted, setJustCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const confettiTriggered = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
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
      if (total === 0) return false; // skip — no lessons means not trackable
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
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-complete when user scrolls to the bottom (Intersection Observer)
  const handleAutoComplete = useCallback(() => {
    if (!completed && !justCompleted) {
      markComplete(slug);
      setJustCompleted(true);
    }
  }, [completed, justCompleted, markComplete, slug]);

  // Check track completion whenever progress data changes
  useEffect(() => {
    if (justCompleted) {
      checkTrackCompletion();
    }
  }, [justCompleted, allData, checkTrackCompletion]);

  useEffect(() => {
    const el = endRef.current;
    if (!el || completed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleAutoComplete();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [completed, handleAutoComplete]);

  // Determine next program when at last lesson
  const nextProgram = (() => {
    if (nextSlug) return null;
    const seq = PROGRAM_SEQUENCE[programTrack];
    if (!seq) return null;
    const idx = seq.findIndex((p) => p.slug === programSlug);
    if (idx < 0 || idx >= seq.length - 1) return null;
    return seq[idx + 1];
  })();

  return (
    <>
      {/* Confetti celebration for track completion */}
      {showConfetti && <ConfettiOverlay onDone={() => setShowConfetti(false)} />}
      {showCelebration && (
        <CelebrationModal
          trackName={programTrack === "ai-learning" ? tL("trackAI") : tL("trackCraft")}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* Scroll progress bar (fixed at top) */}
      <div
        className="lesson-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="mt-12 space-y-6" ref={endRef}>
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
          <span>
            {tL("lessonOf", { current: currentIndex + 1, total: totalLessons })}
          </span>
          <span>
            {tL("completedOf", { completed: progCompleted, total: totalLessons })}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(progCompleted / totalLessons) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-4">
          {prevSlug ? (
            <Link
              href={`${basePath}/${prevSlug}`}
              className="group flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors min-w-0"
            >
              <span className="shrink-0 group-hover:-translate-x-1 transition-transform">←</span>
              <span className="truncate">{prevTitle}</span>
            </Link>
          ) : (
            <Link
              href={programPath}
              className="group flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span className="shrink-0 group-hover:-translate-x-1 transition-transform">←</span>
              <span>{tL("backToProgram")}</span>
            </Link>
          )}
          {nextSlug ? (
            <Link
              href={`${basePath}/${nextSlug}`}
              className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:brightness-110 transition-all min-w-0"
            >
              <span className="truncate">{nextTitle}</span>
              <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : nextProgram ? (
            <Link
              href={programPath.replace(/\/[^/]+$/, `/${nextProgram.slug}`)}
              className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <span>{nextProgram.icon} {tPT(nextProgram.slug)}</span>
              <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : (
            <Link
              href={programPath.replace(/\/[^/]+$/, "")}
              className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <span>{tL("allPrograms")}</span>
              <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
