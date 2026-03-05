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
    lessons: [
      { slug: "what-is-ai", icon: "🤖", duration: 10 },
      { slug: "how-machines-learn", icon: "🧠", duration: 12 },
      { slug: "your-first-ai-model", icon: "🎨", duration: 15 },
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      {/* Header */}
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-12">
          {isSignedIn && (
            <div className="text-5xl mb-4">{profile?.avatar}</div>
          )}
          <h1 className="text-4xl font-bold mb-2">
            {isSignedIn ? t("titleUser", { name: profile?.name ?? "" }) : t("title")}
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* Overall Progress */}
      <ScrollReveal animation="scale-in">
        <div className="mb-12 p-8 rounded-3xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t("overallProgress")}</h2>
            <span className="text-3xl font-bold gradient-text-animated">{percentage}%</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--color-border)] overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-[var(--color-accent)] transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
            <span>{t("lessonsCompleted", { completed: totalCompleted, total: totalLessons })}</span>
            <span>{t("remaining", { count: totalLessons - totalCompleted })}</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Per-program sections */}
      {PROGRAMS.map((program, pIdx) => {
        const progData = getProgram(program.slug);
        const progCompleted = progData.completed.length;
        const progTotal = program.lessons.length;
        const progPct = progTotal > 0 ? Math.round((progCompleted / progTotal) * 100) : 0;

        return (
          <div key={program.slug} className="mb-12">
            <ScrollReveal animation="fade-up" delay={pIdx * 100}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{program.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold">{program.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progPct}%`, backgroundColor: program.color }}
                      />
                    </div>
                    <span className="text-sm font-medium shrink-0" style={{ color: program.color }}>
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
                          : "bg-[var(--color-bg-card)] border-[var(--color-border)]"
                      }`}>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: done ? `${program.color}20` : "var(--color-bg-card)" }}
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

      {/* Achievements */}
      <ScrollReveal animation="fade-up">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🏅 {t("achievements")}</h2>
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
                  ? "bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/5 border-amber-200 dark:border-amber-800/30"
                  : "bg-[var(--color-bg-card)] border-[var(--color-border)] opacity-40 grayscale"
              }`}>
                <div className={`text-4xl mb-3 ${unlocked ? "animate-float-slow" : ""}`}>{achievement.icon}</div>
                <h3 className="font-bold mb-1">{t(achievement.titleKey as any)}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{t(achievement.descKey as any)}</p>
                {unlocked && (
                  <span className="inline-block mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">✨ {t("unlocked")}</span>
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
