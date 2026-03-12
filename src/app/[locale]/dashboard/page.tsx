"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useSession } from "next-auth/react";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { Certificate } from "@/components/dashboard/Certificate";
import { ReferralWidget } from "@/components/dashboard/ReferralWidget";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnimatedProgressBar } from "@/components/ui/MotionWrappers";
import { locales } from "@/i18n/request";
import { Flame, ArrowRight, Trophy } from "lucide-react";
import type { DynamicTranslate } from "@/lib/i18n-utils";

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
      { slug: "your-first-ai-experiment", icon: "🎨", duration: 15 },
    ],
  },
  {
    slug: "ai-sprouts",
    icon: "🌿",
    title: "AI Sprouts",
    color: "#60A5FA",
    track: "ai-learning",
    lessons: [
      { slug: "algorithms-explained", icon: "🧮", duration: 30 },
      { slug: "datasets-and-data", icon: "📊", duration: 25 },
      { slug: "neural-networks-intro", icon: "🧠", duration: 35 },
    ],
  },
  {
    slug: "ai-branches",
    icon: "🌳",
    title: "AI Branches",
    color: "#F59E0B",
    track: "ai-learning",
    lessons: [
      { slug: "ai-in-healthcare", icon: "🏥", duration: 30 },
      { slug: "natural-language-processing", icon: "💬", duration: 35 },
      { slug: "computer-vision", icon: "👁️", duration: 35 },
    ],
  },
  {
    slug: "ai-canopy",
    icon: "🏕️",
    title: "AI Canopy",
    color: "#8B5CF6",
    track: "ai-learning",
    lessons: [
      { slug: "deep-neural-networks", icon: "🔬", duration: 40 },
      { slug: "large-language-models", icon: "📝", duration: 45 },
      { slug: "prompt-engineering", icon: "✨", duration: 40 },
    ],
  },
  {
    slug: "ai-forest",
    icon: "🌲",
    title: "AI Forest",
    color: "#EF4444",
    track: "ai-learning",
    lessons: [
      { slug: "building-ai-products", icon: "🚀", duration: 45 },
      { slug: "future-of-ai", icon: "🔮", duration: 45 },
      { slug: "open-source-ai", icon: "🌐", duration: 40 },
    ],
  },
  {
    slug: "ai-sketch",
    icon: "✏️",
    title: "AI Sketch",
    color: "#F97316",
    track: "craft-engineering",
    lessons: [
      { slug: "arrays-and-hashmaps", icon: "📊", duration: 15 },
      { slug: "strings-and-text", icon: "🔤", duration: 15 },
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
      { slug: "trees-and-binary-search", icon: "🌲", duration: 25 },
      { slug: "monotonic-stack-and-queue", icon: "📚", duration: 20 },
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
      { slug: "communicating-technical-ideas", icon: "💬", duration: 20 },
      { slug: "ai-era-leadership", icon: "🧭", duration: 20 },
    ],
  },
  {
    slug: "ai-masterpiece",
    icon: "🏆",
    title: "AI Masterpiece",
    color: "#EAB308",
    track: "craft-engineering",
    lessons: [
      { slug: "design-twitter-ai-feed", icon: "🐦", duration: 30 },
      { slug: "engineering-portfolio", icon: "💼", duration: 25 },
      { slug: "full-mock-interview", icon: "🎯", duration: 60 },
    ],
  },
];


function MotionReveal({
  children,
  animation = "fade-up",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  animation?: "fade-up" | "scale-in";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const noMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "-60px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (noMotion) return <div className={className}>{children}</div>;

  const variants: Record<string, string> = {
    "fade-up": "translateY(24px)",
    "scale-in": "scale(0.92)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : variants[animation],
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const td = t as unknown as DynamicTranslate;
  const ta = useTranslations("auth");
  const tl = useTranslations("lessonTitles");
  const tld = tl as unknown as DynamicTranslate;
  const tp = useTranslations("programs");
  const tpd = tp as unknown as DynamicTranslate;
  const { totalCompleted, getProgram, isCompleted, reset } = useProgress();
  const { currentStreak, longestStreak } = useStreak();
  const { data: session } = useSession();
  const { profile, isSignedIn: isGuestSignedIn } = useGuestProfile();
  const router = useRouter();
  const isSignedIn = !!session?.user || isGuestSignedIn;
  const userRole = (session?.user as { role?: string })?.role ?? "free";
  const isPremiumUser = userRole === "pro" || userRole === "admin";
  const [certProgram, setCertProgram] = useState<string | null>(null);
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  const totalLessons = PROGRAMS.reduce((sum, p) => sum + p.lessons.length, 0);
  const validTotalCompleted = PROGRAMS.reduce((sum, p) => {
    const progData = getProgram(p.slug);
    const validSlugs = new Set(p.lessons.map((l) => l.slug));
    return sum + progData.completed.filter((s) => validSlugs.has(s)).length;
  }, 0);
  const percentage = totalLessons > 0 ? Math.min(Math.round((validTotalCompleted / totalLessons) * 100), 100) : 0;

  // Find first incomplete lesson for "Continue Learning"
  const nextLesson = (() => {
    for (const program of PROGRAMS) {
      for (const lesson of program.lessons) {
        if (!isCompleted(`${program.slug}/${lesson.slug}`)) {
          return { program, lesson };
        }
      }
    }
    return null;
  })();

  // Certificate modal data
  const certProgramData = certProgram ? PROGRAMS.find((p) => p.slug === certProgram) : null;
  const certCompletionDate = (() => {
    if (!certProgramData) return "";
    const progData = getProgram(certProgramData.slug);
    const dates = certProgramData.lessons
      .map((l) => progData.timestamps[l.slug])
      .filter(Boolean)
      .sort();
    const last = dates[dates.length - 1];
    return last ? new Date(last).toLocaleDateString() : new Date().toLocaleDateString();
  })();

  // Auth gate - prompt to sign in
  if (!isSignedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <MotionReveal animation="scale-in">
          <div className="text-7xl mb-6 animate-float-slow">🔒</div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">{t("title")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto mb-10 leading-relaxed">
            {ta("signInPrompt")}
          </p>
          <Link
            href={`${basePath}/signin`}
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all"
          >
            {ta("signIn")} →
          </Link>
        </MotionReveal>
      </div>
    );
  }

  // Empty state - when user hasn't started any lessons
  if (totalCompleted === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <MotionReveal animation="scale-in">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
            <div className="relative text-8xl animate-float-slow">🚀</div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">{t("emptyTitle")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto mb-6 leading-relaxed">
            {t("emptySubtitle")}
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-10">
            {[
              { icon: "📚", label: t("emptyLearn") },
              { icon: "🧪", label: t("emptyPractice") },
              { icon: "🏆", label: t("emptyEarn") },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-semibold text-[var(--color-text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
          <Link
            href={`${basePath}/programs/ai-seeds/lessons/what-is-ai`}
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all"
          >
            {t("emptyStart")} →
          </Link>
        </MotionReveal>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-0">
      {/* Certificate Modal */}
      {certProgramData && (
        <Certificate
          programName={tpd(`${certProgramData.slug}.title`)}
          programIcon={certProgramData.icon}
          userName={session?.user?.name || profile?.name || t("defaultUser")}
          completionDate={certCompletionDate}
          onClose={() => setCertProgram(null)}
        />
      )}

      {/* Header */}
      <MotionReveal animation="fade-up">
        <div className="text-center mb-12">
          {isSignedIn && (
            <div className="text-5xl mb-4">{profile?.avatar}</div>
          )}
          <h1 className="text-4xl font-bold mb-2 text-gradient">
            {isSignedIn ? t("titleUser", { name: session?.user?.name || profile?.name || "" }) : t("title")}
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </MotionReveal>

      {/* Continue Learning */}
      <MotionReveal animation="fade-up">
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <ArrowRight size={20} className="text-indigo-500" />
            {t("continueLearning")}
          </h2>
          {nextLesson ? (
            <Link
              href={`${basePath}/programs/${nextLesson.program.slug}/lessons/${nextLesson.lesson.slug}`}
              className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] card-hover transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${nextLesson.program.color}20` }}
              >
                {nextLesson.lesson.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{nextLesson.program.icon} {tpd(`${nextLesson.program.slug}.title`)}</p>
                <h3 className="font-bold text-sm truncate">{tld(nextLesson.lesson.slug)}</h3>
                <span className="text-xs text-[var(--color-text-muted)]">⏱️ {nextLesson.lesson.duration} {t("min")}</span>
              </div>
              <span className="shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold">
                {t("continueLesson")} →
              </span>
            </Link>
          ) : (
            <p className="text-center text-lg font-semibold py-4">{t("allComplete")}</p>
          )}
        </div>
      </MotionReveal>

      {/* Streak */}
      {(currentStreak > 0 || longestStreak > 0) && (
        <MotionReveal animation="scale-in">
          <div className="mb-8 flex items-center justify-center gap-6 p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Flame size={22} className="text-orange-500" />
              <span className="font-bold">{t("currentStreak")}:</span>
              <span className="text-xl font-bold text-gradient">{currentStreak} {t("days")}</span>
            </div>
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <span className="font-bold">{t("longestStreak")}:</span>
              <span className="text-xl font-bold text-gradient">{longestStreak} {t("days")}</span>
            </div>
          </div>
        </MotionReveal>
      )}

      {/* Overall Progress */}
      <MotionReveal animation="scale-in">
        <div className="mb-12 p-8 rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] gradient-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t("overallProgress")}</h2>
            <span className="text-3xl font-bold text-gradient">{percentage}%</span>
          </div>
          <AnimatedProgressBar percentage={percentage} className="h-3 rounded-full bg-[var(--color-bg-section)] overflow-hidden mb-4" />
          <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
            <span>{t("lessonsCompleted", { completed: validTotalCompleted, total: totalLessons })}</span>
            <span>{t("remaining", { count: totalLessons - validTotalCompleted })}</span>
          </div>
        </div>
      </MotionReveal>

      {/* Per-program sections - grouped by track */}
      {["ai-learning", "craft-engineering"].map((track) => {
        const trackPrograms = PROGRAMS.filter((p) => p.track === track);
        if (trackPrograms.length === 0) return null;
        return (
          <div key={track} className="mb-8">
            <MotionReveal animation="fade-up">
              <div className="flex items-center gap-2 mb-6 mt-4">
                <span className="text-2xl">{track === "ai-learning" ? "🌳" : "🔨"}</span>
                <h2 className="text-lg font-bold text-[var(--color-text-muted)]">
                  {track === "ai-learning" ? t("trackAI") : t("trackCraft")}
                </h2>
              </div>
            </MotionReveal>
            {trackPrograms.map((program, pIdx) => {
        const progData = getProgram(program.slug);
        const validSlugs = new Set(program.lessons.map((l) => l.slug));
        const progCompleted = progData.completed.filter((s) => validSlugs.has(s)).length;
        const progTotal = program.lessons.length;
        const progPct = progTotal > 0 ? Math.min(Math.round((progCompleted / progTotal) * 100), 100) : 0;

        return (
          <div key={program.slug} className="mb-12">
            <MotionReveal animation="fade-up" delay={pIdx * 100}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{program.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold">{tpd(`${program.slug}.title`)}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <AnimatedProgressBar
                      percentage={progPct}
                      className="flex-1 h-3 rounded-full bg-[var(--color-bg-section)] overflow-hidden"
                    />
                    <span className="text-2xl font-bold text-[var(--color-primary)] shrink-0">
                      {progPct}%
                    </span>
                  </div>
                  {progCompleted >= progTotal && (
                    <button
                      onClick={() => isPremiumUser ? setCertProgram(program.slug) : router.push(`${basePath}/pricing`)}
                      className={`mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg text-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer ${
                        isPremiumUser
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                          : "bg-gradient-to-r from-indigo-500 to-violet-600"
                      }`}
                    >
                      <Trophy size={14} />
                      {isPremiumUser ? t("viewCertificate") : t("upgradeCertificate")}
                    </button>
                  )}
                </div>
              </div>
            </MotionReveal>

            <div className="space-y-3">
              {program.lessons.map((lesson, idx) => {
                const done = isCompleted(`${program.slug}/${lesson.slug}`);
                return (
                  <MotionReveal key={lesson.slug} animation="fade-up" delay={pIdx * 100 + idx * 60}>
                    <Link
                      href={`${basePath}/programs/${program.slug}/lessons/${lesson.slug}`}
                      className="block group"
                    >
                      <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                        done
                          ? "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20"
                          : "bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:shadow-md hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5"
                      }`}>
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-110`}
                          style={{ backgroundColor: done ? `${program.color}20` : "var(--color-bg-section)" }}
                        >
                          {lesson.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate">{tld(lesson.slug)}</h3>
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
                  </MotionReveal>
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
      <MotionReveal animation="fade-up">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gradient">🏅 {t("achievements")}</h2>
      </MotionReveal>
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { id: "first-lesson", icon: "🌱", titleKey: "firstStep", descKey: "firstStepDesc", threshold: 1 },
          { id: "half-way", icon: "⚡", titleKey: "halfWay", descKey: "halfWayDesc", threshold: 2 },
          { id: "all-done", icon: "🏆", titleKey: "aiGraduate", descKey: "aiGraduateDesc", threshold: 3 },
        ].map((achievement, idx) => {
          const unlocked = totalCompleted >= achievement.threshold;
          return (
            <MotionReveal key={achievement.id} animation="scale-in" delay={idx * 100}>
              <div className={`text-center p-6 rounded-2xl border transition-all ${
                unlocked
                  ? "bg-[var(--color-bg-card)] border-[var(--color-border)] gradient-border glow-sm"
                  : "bg-[var(--color-bg-section)] border-[var(--color-border)] opacity-40 grayscale"
              }`}>
                <div className={`text-5xl mb-3 ${unlocked ? "animate-float-slow" : ""}`}>{achievement.icon}</div>
                <h3 className="font-bold mb-1">{td(achievement.titleKey)}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{td(achievement.descKey)}</p>
                {unlocked && (
                  <span className="inline-block mt-3 text-xs font-semibold text-gradient">✨ {t("unlocked")}</span>
                )}
              </div>
            </MotionReveal>
          );
        })}
      </div>

      {/* Referral */}
      {session?.user?.id && (
        <div className="mb-12">
          <ReferralWidget />
        </div>
      )}

      {/* Actions */}
      <MotionReveal animation="fade-up">
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
      </MotionReveal>
    </div>
  );
}
