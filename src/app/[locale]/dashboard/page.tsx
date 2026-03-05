"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useProgress } from "@/hooks/useProgress";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";
import { locales } from "@/i18n/request";

const PROGRAMS = [
  {
    slug: "ai-seeds",
    icon: "🌱",
    title: "AI Seeds",
    color: "#34D399",
    track: "ai-learning",
    lessons: [
      { slug: "what-is-ai", icon: "🤖", duration: 10 },
      { slug: "how-machines-learn", icon: "🧠", duration: 12 },
      { slug: "your-first-ai-model", icon: "🎨", duration: 15 },
    ],
  },
  {
    slug: "ai-sketch",
    icon: "✏️",
    title: "AI Sketch",
    color: "#F97316",
    track: "craft-engineering",
    lessons: [
      { slug: "arrays-and-hashing", icon: "📊", duration: 15 },
      { slug: "strings-and-patterns", icon: "🔤", duration: 15 },
      { slug: "sorting-and-searching", icon: "🔍", duration: 15 },
    ],
  },
  {
    slug: "ai-chisel",
    icon: "🪨",
    title: "AI Chisel",
    color: "#06B6D4",
    track: "craft-engineering",
    lessons: [
      { slug: "two-pointers-and-sliding-window", icon: "👆", duration: 20 },
      { slug: "trees-and-graph-traversal", icon: "🌲", duration: 25 },
      { slug: "stacks-queues-monotonic", icon: "📚", duration: 20 },
    ],
  },
  {
    slug: "ai-craft",
    icon: "⚒️",
    title: "AI Craft",
    color: "#8B5CF6",
    track: "craft-engineering",
    lessons: [
      { slug: "design-url-shortener", icon: "🔗", duration: 25 },
      { slug: "design-rate-limiter", icon: "⚡", duration: 25 },
      { slug: "design-recommendation-engine", icon: "🎯", duration: 30 },
    ],
  },
  {
    slug: "ai-polish",
    icon: "💎",
    title: "AI Polish",
    color: "#EC4899",
    track: "craft-engineering",
    lessons: [
      { slug: "star-framework", icon: "⭐", duration: 15 },
      { slug: "system-design-communication", icon: "💬", duration: 20 },
      { slug: "ai-era-leadership", icon: "🧭", duration: 20 },
    ],
  },
];

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tl = useTranslations("lessonTitles");
  const { totalCompleted, getProgram, isCompleted, reset } = useProgress();
  const { profile, isSignedIn } = useGuestProfile();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  const totalLessons = PROGRAMS.reduce((sum, p) => sum + p.lessons.length, 0);
  const percentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Empty state — when user hasn't started any lessons
  if (totalCompleted === 0 && !isSignedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <ScrollReveal animation="scale-in">
          <div className="text-7xl mb-6 animate-float-slow">🚀</div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">{t("emptyTitle")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto mb-10 leading-relaxed">
            {t("emptySubtitle")}
          </p>
          <Link
            href={`${basePath}/programs/ai-seeds/lessons/what-is-ai`}
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all"
          >
            {t("emptyStart")} →
          </Link>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-0">
      {/* Header */}
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-12">
          {isSignedIn && (
            <div className="text-5xl mb-4">{profile?.avatar}</div>
          )}
          <h1 className="text-4xl font-bold mb-2 text-gradient">
            {isSignedIn ? t("titleUser", { name: profile?.name ?? "" }) : t("title")}
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* Overall Progress */}
      <ScrollReveal animation="scale-in">
        <div className="mb-12 p-8 rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] gradient-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t("overallProgress")}</h2>
            <span className="text-3xl font-bold text-gradient">{percentage}%</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--color-bg-section)] overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
            <span>{t("lessonsCompleted", { completed: totalCompleted, total: totalLessons })}</span>
            <span>{t("remaining", { count: totalLessons - totalCompleted })}</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Per-program sections — grouped by track */}
      {["ai-learning", "craft-engineering"].map((track) => {
        const trackPrograms = PROGRAMS.filter((p) => p.track === track);
        if (trackPrograms.length === 0) return null;
        return (
          <div key={track} className="mb-8">
            <ScrollReveal animation="fade-up">
              <div className="flex items-center gap-2 mb-6 mt-4">
                <span className="text-2xl">{track === "ai-learning" ? "🌳" : "🔨"}</span>
                <h2 className="text-lg font-bold text-[var(--color-text-muted)]">
                  {track === "ai-learning" ? t("trackAI") : t("trackCraft")}
                </h2>
              </div>
            </ScrollReveal>
            {trackPrograms.map((program, pIdx) => {
        const progData = getProgram(program.slug);
        const progCompleted = progData.completed.length;
        const progTotal = program.lessons.length;
        const progPct = progTotal > 0 ? Math.round((progCompleted / progTotal) * 100) : 0;

        return (
          <div key={program.slug} className="mb-12">
            <ScrollReveal animation="fade-up" delay={pIdx * 100}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{program.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold">{program.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-3 rounded-full bg-[var(--color-bg-section)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                        style={{ width: `${progPct}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-[var(--color-primary)] shrink-0">
                      {progPct}%
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {program.lessons.map((lesson, idx) => {
                const done = isCompleted(`${program.slug}/${lesson.slug}`);
                return (
                  <ScrollReveal key={lesson.slug} animation="fade-up" delay={pIdx * 100 + idx * 60}>
                    <Link
                      href={`${basePath}/programs/${program.slug}/lessons/${lesson.slug}`}
                      className="block card-hover"
                    >
                      <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        done
                          ? "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20"
                          : "bg-[var(--color-bg-card)] border-[var(--color-border)] card-hover"
                      }`}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: done ? `${program.color}20` : "var(--color-bg-section)" }}
                        >
                          {lesson.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate">{tl(lesson.slug as any)}</h3>
                          <span className="text-xs text-[var(--color-text-muted)]">⏱️ {lesson.duration} {t("min")}</span>
                        </div>
                        <div className="shrink-0">
                          {done ? (
                            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm" style={{ backgroundColor: program.color }}>
                              ✓
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] text-sm">
                              →
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        );
      })}
          </div>
        );
      })}

      {/* Achievements */}
      <ScrollReveal animation="fade-up">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gradient">🏅 {t("achievements")}</h2>
      </ScrollReveal>
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { id: "first-lesson", icon: "🌱", titleKey: "firstStep", descKey: "firstStepDesc", threshold: 1 },
          { id: "half-way", icon: "⚡", titleKey: "halfWay", descKey: "halfWayDesc", threshold: 2 },
          { id: "all-done", icon: "🏆", titleKey: "aiGraduate", descKey: "aiGraduateDesc", threshold: 3 },
        ].map((achievement, idx) => {
          const unlocked = totalCompleted >= achievement.threshold;
          return (
            <ScrollReveal key={achievement.id} animation="scale-in" delay={idx * 100}>
              <div className={`text-center p-6 rounded-2xl border transition-all ${
                unlocked
                  ? "bg-[var(--color-bg-card)] border-[var(--color-border)] gradient-border glow-sm"
                  : "bg-[var(--color-bg-section)] border-[var(--color-border)] opacity-40 grayscale"
              }`}>
                <div className={`text-5xl mb-3 ${unlocked ? "animate-float-slow" : ""}`}>{achievement.icon}</div>
                <h3 className="font-bold mb-1">{t(achievement.titleKey as any)}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{t(achievement.descKey as any)}</p>
                {unlocked && (
                  <span className="inline-block mt-3 text-xs font-semibold text-gradient">✨ {t("unlocked")}</span>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Actions */}
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`${basePath}/programs`}
            className="btn-primary px-8 py-4 bg-[var(--color-primary)] text-white rounded-2xl text-lg font-semibold shadow-lg shadow-[var(--color-primary)]/25"
          >
            {t("browsePrograms")} →
          </Link>
          {totalCompleted > 0 && (
            <button
              onClick={reset}
              className="px-6 py-3 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-500 transition-all cursor-pointer"
            >
              {t("resetProgress")}
            </button>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
