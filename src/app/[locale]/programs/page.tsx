import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { getPrograms } from "@/lib/programs";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("programs");
  const programs = getPrograms();
  const basePath = locale === "en" ? "" : `/${locale}`;

  const levelLabels: Record<number, string> = {
    1: t("levelLabels.1"),
    2: t("levelLabels.2"),
    3: t("levelLabels.3"),
    4: t("levelLabels.4"),
    5: t("levelLabels.5"),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 bg-grid">
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

      {/* Growth metaphor visual */}
      <ScrollReveal animation="scale-in">
        <div className="flex items-center justify-center gap-2 mb-16 text-4xl">
          {programs.map((p, i) => (
            <div key={p.slug} className="flex items-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl">{p.icon}</span>
                <span className="text-[10px] md:text-xs mt-1 text-[var(--color-text-muted)] font-medium">
                  L{p.level}
                </span>
              </div>
              {i < programs.length - 1 && (
                <span className="mx-2 md:mx-4 text-[var(--color-text-muted)] text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((program, idx) => {
          const isActive = program.status === "active";
          return (
            <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 100}>
              {isActive ? (
                <Link href={`${basePath}/programs/${program.slug}`} className="block h-full">
                  <ProgramCardContent program={program} levelLabels={levelLabels} isActive t={t} />
                </Link>
              ) : (
                <ProgramCardContent program={program} levelLabels={levelLabels} isActive={false} t={t} />
              )}
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}

function ProgramCardContent({
  program,
  levelLabels,
  isActive,
  t,
}: {
  program: { slug: string; level: number; color: string; icon: string; title: string; subtitle: string; description: string; status: string; estimatedHours: number; topics: string[] };
  levelLabels: Record<number, string>;
  isActive: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className={isActive ? "gradient-border card-hover" : ""}>
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
            <h2 className="text-xl font-bold truncate">{program.title}</h2>
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
            <span key={topic} className="inline-block mr-2 mb-1">
              • {topic}
            </span>
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
}
