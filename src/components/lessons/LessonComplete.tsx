"use client";

import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

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
}: LessonCompleteProps) {
  const { isCompleted, markComplete, getProgram } = useProgress(programSlug);
  const [justCompleted, setJustCompleted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const completed = isCompleted(slug);

  const progData = getProgram(programSlug);
  const progCompleted = progData.completed.length;

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
      {/* Scroll progress bar (fixed at top) */}
      <div
        className="lesson-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="mt-12 space-y-6" ref={endRef}>
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
          <span>
            Lesson {currentIndex + 1} of {totalLessons}
          </span>
          <span>
            {progCompleted} of {totalLessons} completed
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
              <span>Back to program</span>
            </Link>
          )}
          {nextSlug ? (
            <Link
              href={`${basePath}/${nextSlug}`}
              className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:brightness-110 transition-all min-w-0"
            >
              <span className="truncate">Next Lesson: {nextTitle}</span>
              <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : nextProgram ? (
            <Link
              href={programPath.replace(/\/[^/]+$/, `/${nextProgram.slug}`)}
              className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <span>Next: {nextProgram.icon} {nextProgram.title}</span>
              <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : (
            <Link
              href={programPath.replace(/\/[^/]+$/, "")}
              className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <span>All Programs</span>
              <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
