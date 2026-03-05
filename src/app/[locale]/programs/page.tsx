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
    1: "Beginner",
    2: "Foundation",
    3: "Applied",
    4: "Advanced",
    5: "Expert",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-6">
            🎓 {t("badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program, idx) => {
          const isActive = program.status === "active";
          return (
            <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 100}>
              {isActive ? (
                <Link href={`${basePath}/programs/${program.slug}`} className="block h-full">
                  <ProgramCardContent program={program} levelLabels={levelLabels} isActive />
                </Link>
              ) : (
                <ProgramCardContent program={program} levelLabels={levelLabels} isActive={false} />
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
}: {
  program: { slug: string; level: number; color: string; icon: string; title: string; subtitle: string; description: string; status: string; estimatedHours: number; topics: string[] };
  levelLabels: Record<number, string>;
  isActive: boolean;
}) {
  return (
    <div
      className={`h-full rounded-2xl border p-6 transition-all duration-300 ${
        isActive
          ? "bg-[var(--color-bg-card)] border-[var(--color-border)] card-hover card-glow cursor-pointer"
          : "bg-[var(--color-bg-card)]/50 border-dashed border-[var(--color-border)] opacity-60"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${program.color}20` }}
        >
          {program.icon}
        </div>
        <div>
          <h2 className="text-lg font-bold">{program.title}</h2>
          <p className="text-xs text-[var(--color-text-muted)]">{program.subtitle}</p>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-3">
        {program.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: `${program.color}20`, color: program.color }}
        >
          Level {program.level} — {levelLabels[program.level]}
        </span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium dark:bg-gray-800 dark:text-gray-400">
          ⏱️ ~{program.estimatedHours}h
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
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)]">
            🔒 Coming Soon
          </span>
        </div>
      )}

      {isActive && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: program.color }}>
            Start Learning →
          </span>
        </div>
      )}
    </div>
  );
}
