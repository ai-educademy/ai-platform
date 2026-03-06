import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { getProgramsByTrack } from "@/lib/programs";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";
import { ComingSoonProgramCard } from "@/components/ui/ComingSoon";
import type { ProgramMeta } from "@/lib/programs";

const BASE_URL = "https://aieducademy.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "programs" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/programs`,
    },
    openGraph: {
      title: `${t("pageTitle")} | AI Educademy`,
      description: t("pageDescription"),
    },
  };
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("programs");
  const aiLearning = getProgramsByTrack("ai-learning");
  const craftEngineering = getProgramsByTrack("craft-engineering");
  const basePath = locale === "en" ? "" : `/${locale}`;

  const levelLabels: Record<number, string> = {
    1: t("levelLabels.1"),
    2: t("levelLabels.2"),
    3: t("levelLabels.3"),
    4: t("levelLabels.4"),
    5: t("levelLabels.5"),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-6">
            🎓 {t("badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">{t("title")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* Two track overview cards */}
      <ScrollReveal animation="scale-in">
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <div className="gradient-border rounded-2xl">
            <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌳</span>
                <div>
                  <h2 className="text-xl font-bold">{t("trackAI")}</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">{t("trackAIDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-2xl">
                {aiLearning.map((p, i) => (
                  <span key={p.slug} className="flex items-center">
                    <span>{p.icon}</span>
                    {i < aiLearning.length - 1 && <span className="mx-1 text-sm text-[var(--color-text-muted)]">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="gradient-border rounded-2xl">
            <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔨</span>
                <div>
                  <h2 className="text-xl font-bold">{t("trackCraft")}</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">{t("trackCraftDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-2xl">
                {craftEngineering.map((p, i) => (
                  <span key={p.slug} className="flex items-center">
                    <span>{p.icon}</span>
                    {i < craftEngineering.length - 1 && <span className="mx-1 text-sm text-[var(--color-text-muted)]">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Understanding AI Section */}
      <section className="mb-20">
        <ScrollReveal animation="fade-up">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🌳</span>
            <div>
              <h2 className="text-2xl font-bold">{t("trackAI")}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{t("trackAITagline")}</p>
            </div>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiLearning.map((program, idx) => (
            <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 80}>
              <ProgramCard program={program} basePath={basePath} levelLabels={levelLabels} t={t} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Code & Algorithms Section */}
      <section>
        <ScrollReveal animation="fade-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔨</span>
            <div>
              <h2 className="text-2xl font-bold">{t("trackCraft")}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{t("trackCraftTagline")}</p>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-8 ml-12">{t("trackCraftBrand")}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {craftEngineering.map((program, idx) => (
            <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 80}>
              <ProgramCard program={program} basePath={basePath} levelLabels={levelLabels} t={t} />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProgramCard({
  program,
  basePath,
  levelLabels,
  t,
}: {
  program: ProgramMeta;
  basePath: string;
  levelLabels: Record<number, string>;
  t: (key: string) => string;
}) {
  const isActive = program.status === "active";

  const card = (
    <div className={isActive ? "gradient-border card-hover h-full" : "h-full"}>
      <div
        className={`h-full rounded-2xl p-8 transition-all duration-300 ${
          isActive
            ? "bg-[var(--color-bg-card)] cursor-pointer"
            : "bg-[var(--color-bg-card)]/50 border border-dashed border-[var(--color-border)] opacity-60"
        }`}
        style={isActive ? { borderLeft: `4px solid ${program.color}` } : undefined}
      >
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${program.color}15` }}
          >
            {program.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold truncate">{program.title}</h3>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{program.subtitle}</p>
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] mb-5 line-clamp-3 leading-relaxed">
          {program.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap"
            style={{ backgroundColor: `${program.color}18`, color: program.color }}
          >
            {t("level")} {program.level} — {levelLabels[program.level]}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium dark:bg-gray-800 dark:text-gray-400 whitespace-nowrap">
            ⏱️ ~{program.estimatedHours}{t("hours")}
          </span>
        </div>

        <div className="text-xs text-[var(--color-text-muted)]">
          {program.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="inline-block mr-2 mb-1">• {topic}</span>
          ))}
        </div>

        {!isActive && (
          <div className="mt-5 text-center">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)]">
              🔒 {t("comingSoon")}
            </span>
          </div>
        )}

        {isActive && (
          <div className="mt-6 flex justify-start">
            <span className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:bg-[var(--color-primary-hover)] transition-colors">
              {t("startLearning")} <span aria-hidden="true">→</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return isActive ? (
    <Link href={`${basePath}/programs/${program.slug}`} className="block h-full">{card}</Link>
  ) : (
    <ComingSoonProgramCard title={program.title}>
      {card}
    </ComingSoonProgramCard>
  );
}
