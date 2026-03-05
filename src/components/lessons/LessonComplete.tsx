"use client";

import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { useState, useEffect } from "react";

interface LessonCompleteProps {
  slug: string;
  totalLessons: number;
  currentIndex: number;
  nextSlug?: string;
  nextTitle?: string;
  prevSlug?: string;
  prevTitle?: string;
  basePath: string;
  programPath: string;
  programTitle: string;
}

export function LessonComplete({
  slug,
  totalLessons,
  currentIndex,
  nextSlug,
  nextTitle,
  prevSlug,
  prevTitle,
  basePath,
  programPath,
  programTitle,
}: LessonCompleteProps) {
  const { isCompleted, markComplete, completedCount } = useProgress();
  const [justCompleted, setJustCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const completed = isCompleted(slug);
  const allDone = completedCount === totalLessons || (completedCount === totalLessons - 1 && justCompleted);

  const handleComplete = () => {
    markComplete(slug);
    setJustCompleted(true);
    if (completedCount + 1 === totalLessons) {
      setShowConfetti(true);
    }
  };

  // Auto-hide confetti after 4s
  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  return (
    <div className="mt-12 space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <span>
          Lesson {currentIndex + 1} of {totalLessons}
        </span>
        <span>
          {completed ? completedCount : completedCount} of {totalLessons}{" "}
          completed
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${((completed ? completedCount : completedCount) / totalLessons) * 100}%` }}
        />
      </div>

      {/* Complete button or completion state */}
      <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] relative overflow-hidden">
        {/* Confetti animation overlay */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1.5 + Math.random() * 1.5}s`,
                  fontSize: `${12 + Math.random() * 12}px`,
                  color: ['#F97316', '#06B6D4', '#8B5CF6', '#EC4899', '#EAB308', '#34D399', '#6366F1'][i % 7],
                }}
              >
                {['✦', '●', '■', '▲', '★', '◆'][i % 6]}
              </span>
            ))}
          </div>
        )}

        {completed ? (
          <div className="text-center space-y-4 relative z-20">
            <div className={`flex items-center justify-center gap-3 text-[var(--color-accent)] ${justCompleted ? 'animate-bounce-once' : ''}`}>
              <span className="text-2xl font-bold">
                {justCompleted ? "🎉 Lesson completed!" : "✅ Completed"}
              </span>
            </div>

            {allDone && (
              <div className={`space-y-3 ${justCompleted ? 'animate-fade-in-up' : ''}`}>
                <div className="text-5xl animate-float-slow">🏆</div>
                <p className="text-xl font-bold text-gradient">
                  Congratulations!
                </p>
                <p className="text-[var(--color-text-muted)]">
                  You&apos;ve completed all {totalLessons} lessons in <strong>{programTitle}</strong>!
                </p>
                <Link
                  href={programPath}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
                >
                  Back to {programTitle} →
                </Link>
              </div>
            )}

            {!allDone && nextSlug && (
              <Link
                href={`${basePath}/${nextSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:brightness-110 transition-all"
              >
                Next: {nextTitle} →
              </Link>
            )}
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="w-full px-6 py-4 bg-[var(--color-accent)] text-white rounded-xl font-semibold text-lg hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer"
          >
            ✅ Mark as Complete
          </button>
        )}
      </div>

      {/* Back / Next Navigation */}
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
            <span className="truncate">{nextTitle}</span>
            <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ) : (
          <Link
            href={programPath}
            className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <span>All lessons</span>
            <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
