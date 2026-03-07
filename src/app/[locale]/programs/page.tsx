import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { getProgramsByTrack } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { ScrollReveal } from "@ai-educademy/ai-ui-library";
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

  const allPrograms = [...aiLearning, ...craftEngineering];
  const firstLessonSlugs: Record<string, string | undefined> = {};
  for (const p of allPrograms) {
    if (p.status === "active") {
      const lessons = getLessons(p.slug, locale);
      firstLessonSlugs[p.slug] = lessons[0]?.slug;
    }
  }

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
                    <span className="flex flex-col items-center">
                      <span>{p.icon}</span>
                      <span className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{t(`tileLabel.${p.slug}`)}</span>
                    </span>
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
                    <span className="flex flex-col items-center">
                      <span>{p.icon}</span>
                      <span className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{t(`tileLabel.${p.slug}`)}</span>
                    </span>
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
          <div className="flex items-center gap-3 mb-10">
            <span className="text-3xl">🌳</span>
            <div>
              <h2 className="text-2xl font-bold">{t("trackAI")}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{t("trackAITagline")}</p>
            </div>
          </div>
        </ScrollReveal>
        <div className="space-y-6">
          {aiLearning.map((program, idx) => {
            const lessons = program.status === "active" ? getLessons(program.slug, locale) : [];
            return (
              <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 80}>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/2">
                    <ProgramCard program={program} basePath={basePath} levelLabels={levelLabels} t={t} firstLessonSlug={firstLessonSlugs[program.slug]} />
                  </div>
                  {lessons.length > 0 && (
                    <div className="lg:w-1/2 flex items-center">
                      <div className="relative w-full py-4 pl-4">
                        {lessons.map((lesson, li) => (
                          <Link
                            key={lesson.slug}
                            href={`${basePath}/programs/${program.slug}/lessons/${lesson.slug}`}
                            className="block relative transition-all duration-300 hover:-translate-y-1 hover:z-20"
                            style={{
                              marginTop: li === 0 ? 0 : -12,
                              zIndex: lessons.length - li,
                            }}
                          >
                            <div
                              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-5 py-4 shadow-md hover:shadow-xl transition-shadow"
                              style={{ borderLeftColor: program.color, borderLeftWidth: 3 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-lg shrink-0">{lesson.icon || "📄"}</span>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold truncate">{lesson.title}</h4>
                                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{lesson.description}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)] shrink-0 ml-2">{lesson.duration}m</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
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
          <p className="text-sm text-[var(--color-text-muted)] mb-10 ml-12">{t("trackCraftBrand")}</p>
        </ScrollReveal>
        <div className="space-y-6">
          {craftEngineering.map((program, idx) => {
            const lessons = program.status === "active" ? getLessons(program.slug, locale) : [];
            return (
              <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 80}>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/2">
                    <ProgramCard program={program} basePath={basePath} levelLabels={levelLabels} t={t} firstLessonSlug={firstLessonSlugs[program.slug]} />
                  </div>
                  {lessons.length > 0 && (
                    <div className="lg:w-1/2 flex items-center">
                      <div className="relative w-full py-4 pl-4">
                        {lessons.map((lesson, li) => (
                          <Link
                            key={lesson.slug}
                            href={`${basePath}/programs/${program.slug}/lessons/${lesson.slug}`}
                            className="block relative transition-all duration-300 hover:-translate-y-1 hover:z-20"
                            style={{
                              marginTop: li === 0 ? 0 : -12,
                              zIndex: lessons.length - li,
                            }}
                          >
                            <div
                              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-5 py-4 shadow-md hover:shadow-xl transition-shadow"
                              style={{ borderLeftColor: program.color, borderLeftWidth: 3 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-lg shrink-0">{lesson.icon || "📄"}</span>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold truncate">{lesson.title}</h4>
                                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{lesson.description}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)] shrink-0 ml-2">{lesson.duration}m</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
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
  firstLessonSlug,
}: {
  program: ProgramMeta;
  basePath: string;
  levelLabels: Record<number, string>;
  t: (key: string) => string;
  firstLessonSlug?: string;
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

  const programHref = firstLessonSlug
    ? `${basePath}/programs/${program.slug}/lessons/${firstLessonSlug}`
    : `${basePath}/programs/${program.slug}`;

  return isActive ? (
    <Link href={programHref} className="block h-full">{card}</Link>
  ) : (
    <ComingSoonProgramCard title={program.title}>
      {card}
    </ComingSoonProgramCard>
  );
}
