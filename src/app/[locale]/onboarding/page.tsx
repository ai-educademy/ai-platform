"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Compass,
} from "lucide-react";

/* ─── Types ─── */

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

type Goal =
  | "understand"
  | "build"
  | "interviews"
  | "work"
  | "creative";

interface Recommendation {
  program: string;
  track: string;
  trackLabel: string;
  icon: string;
  color: string;
}

/* ─── Constants ─── */

const TOTAL_STEPS = 4;

const EXPERIENCE_OPTIONS: {
  id: ExperienceLevel;
  emoji: string;
  key: string;
}[] = [
  { id: "beginner", emoji: "🌱", key: "beginner" },
  { id: "intermediate", emoji: "🔧", key: "intermediate" },
  { id: "advanced", emoji: "🚀", key: "advanced" },
];

const GOAL_OPTIONS: { id: Goal; emoji: string; key: string }[] = [
  { id: "understand", emoji: "🧠", key: "understand" },
  { id: "build", emoji: "💻", key: "build" },
  { id: "interviews", emoji: "🎯", key: "interviews" },
  { id: "work", emoji: "📊", key: "work" },
  { id: "creative", emoji: "🎨", key: "creative" },
];

function getRecommendation(
  level: ExperienceLevel | null,
  goals: Goal[],
): Recommendation {
  if (goals.includes("interviews")) {
    return {
      program: "ai-launchpad",
      track: "career-ready",
      trackLabel: "Career Ready",
      icon: "🚀",
      color: "#EF4444",
    };
  }

  if (
    (level === "intermediate" || level === "advanced") &&
    goals.includes("build")
  ) {
    return {
      program: "ai-sketch",
      track: "craft-engineering",
      trackLabel: "Craft Engineering",
      icon: "✏️",
      color: "#F97316",
    };
  }

  return {
    program: "ai-seeds",
    track: "ai-learning",
    trackLabel: "AI Learning",
    icon: "🌱",
    color: "#34D399",
  };
}

/* ─── Step Progress ─── */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-2 rounded-full transition-all duration-500 ease-out"
          style={{
            width: i === current ? "2rem" : "0.5rem",
            backgroundColor:
              i < current
                ? "var(--color-primary)"
                : i === current
                  ? "var(--color-primary)"
                  : "var(--color-border)",
            opacity: i <= current ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Selection Card ─── */

function SelectionCard({
  emoji,
  title,
  description,
  selected,
  onClick,
}: {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-5 transition-all duration-300 ease-out cursor-pointer border-2"
      style={{
        background: selected
          ? "var(--color-glass)"
          : "var(--color-bg-card)",
        borderColor: selected
          ? "var(--color-primary)"
          : "var(--color-border)",
        boxShadow: selected
          ? "0 0 20px rgba(91, 94, 240, 0.15), 0 0 60px rgba(91, 94, 240, 0.05)"
          : "none",
        backdropFilter: selected ? "blur(24px) saturate(200%)" : "none",
        transform: selected ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-text)]">{title}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {description}
          </p>
        </div>
        <div
          className="ml-auto flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center"
          style={{
            borderColor: selected
              ? "var(--color-primary)"
              : "var(--color-border)",
            backgroundColor: selected ? "var(--color-primary)" : "transparent",
          }}
        >
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Step Components ─── */

function WelcomeStep({ name }: { name: string }) {
  const t = useTranslations("onboarding");
  return (
    <div className="text-center space-y-6">
      <div
        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-2"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
        {t("welcome.title", { name: name || t("welcome.defaultName") })}
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto">
        {t("welcome.subtitle")}
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-4">
        {["🧠", "💻", "🎯"].map((emoji) => (
          <span
            key={emoji}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: "var(--color-glass)",
              border: "1px solid var(--color-border)",
              backdropFilter: "blur(24px)",
            }}
          >
            {emoji}{" "}
            {emoji === "🧠"
              ? t("welcome.tagLearn")
              : emoji === "💻"
                ? t("welcome.tagBuild")
                : t("welcome.tagGrow")}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExperienceStep({
  selected,
  onSelect,
}: {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
}) {
  const t = useTranslations("onboarding");
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          {t("experience.title")}
        </h2>
        <p className="text-[var(--color-text-muted)]">
          {t("experience.subtitle")}
        </p>
      </div>
      <div className="space-y-3 max-w-lg mx-auto">
        {EXPERIENCE_OPTIONS.map((opt) => (
          <SelectionCard
            key={opt.id}
            emoji={opt.emoji}
            title={t(`experience.${opt.key}.title`)}
            description={t(`experience.${opt.key}.description`)}
            selected={selected === opt.id}
            onClick={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </div>
  );
}

function GoalsStep({
  selected,
  onToggle,
}: {
  selected: Goal[];
  onToggle: (goal: Goal) => void;
}) {
  const t = useTranslations("onboarding");
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          {t("goals.title")}
        </h2>
        <p className="text-[var(--color-text-muted)]">
          {t("goals.subtitle")}
        </p>
      </div>
      <div className="space-y-3 max-w-lg mx-auto">
        {GOAL_OPTIONS.map((opt) => (
          <SelectionCard
            key={opt.id}
            emoji={opt.emoji}
            title={t(`goals.${opt.key}.title`)}
            description={t(`goals.${opt.key}.description`)}
            selected={selected.includes(opt.id)}
            onClick={() => onToggle(opt.id)}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationStep({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();

  const programSlug = recommendation.program;
  const programHref = `/${locale === "en" ? "" : `${locale}/`}programs/${programSlug}`;

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          {t("recommendation.title")}
        </h2>
        <p className="text-[var(--color-text-muted)]">
          {t("recommendation.subtitle")}
        </p>
      </div>

      <div
        className="max-w-sm mx-auto rounded-3xl p-6 text-left space-y-4"
        style={{
          background: "var(--color-glass)",
          border: "2px solid var(--color-primary)",
          backdropFilter: "blur(24px) saturate(200%)",
          boxShadow:
            "0 0 20px rgba(91, 94, 240, 0.15), 0 0 60px rgba(91, 94, 240, 0.05)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{recommendation.icon}</span>
          <div>
            <p className="font-bold text-lg text-[var(--color-text)]">
              {t(`recommendation.programs.${programSlug}.name`)}
            </p>
            <p
              className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1"
              style={{
                background: `${recommendation.color}20`,
                color: recommendation.color,
              }}
            >
              {recommendation.trackLabel}
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t(`recommendation.programs.${programSlug}.description`)}
        </p>

        <button
          type="button"
          onClick={() => router.push(programHref)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 cursor-pointer hover:opacity-90"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          {t("recommendation.cta")}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/${locale === "en" ? "" : `${locale}/`}programs/ai-seeds`)}
        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
      >
        <Compass className="w-4 h-4" />
        {t("recommendation.exploreAll")}
      </button>
    </div>
  );
}

/* ─── Main Wizard ─── */

export default function OnboardingPage() {
  const { data: session } = useSession();
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  const userName = session?.user?.name?.split(" ")[0] ?? "";

  const recommendation = getRecommendation(experience, goals);

  const canNext =
    step === 0 ||
    (step === 1 && experience !== null) ||
    (step === 2 && goals.length > 0) ||
    step === 3;

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection("forward");
      setStep((s) => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection("back");
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    router.push(locale === "en" ? "/" : `/${locale}`);
  }, [router, locale]);

  const toggleGoal = useCallback((goal: Goal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-4 py-8 sm:py-12">
      {/* Header with progress */}
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            {t("skip")}
          </button>
          <StepIndicator current={step} total={TOTAL_STEPS} />
          <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* Step content with slide transition */}
      <div className="w-full max-w-lg flex-1 flex items-center justify-center py-8">
        <div
          key={step}
          className="w-full"
          style={{
            animation:
              direction === "forward"
                ? "onboarding-slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) both"
                : "onboarding-slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {step === 0 && <WelcomeStep name={userName} />}
          {step === 1 && (
            <ExperienceStep selected={experience} onSelect={setExperience} />
          )}
          {step === 2 && <GoalsStep selected={goals} onToggle={toggleGoal} />}
          {step === 3 && (
            <RecommendationStep recommendation={recommendation} />
          )}
        </div>
      </div>

      {/* Navigation */}
      {step < 3 && (
        <div className="w-full max-w-lg flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            {t("back")}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="flex items-center gap-1 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canNext
                ? "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))"
                : "var(--color-border)",
              boxShadow: canNext ? "var(--shadow-glow)" : "none",
            }}
          >
            {step === 0 ? t("getStarted") : t("next")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
