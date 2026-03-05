import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
}) {
  const { locale, programSlug } = await params;
  const program = getProgram(programSlug);
  if (!program) notFound();

  const t = await getTranslations();
  const lessons = getLessons(programSlug, locale);
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      {/* Program header */}
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: `${program.color}20`, color: program.color }}
          >
            {program.icon} Level {program.level}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{program.title}</h1>
          <p className="text-xl text-[var(--color-text-muted)] mb-2">{program.subtitle}</p>
          <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">{program.description}</p>
        </div>
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal animation="fade-up" delay={100}>
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="text-center p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="text-2xl font-bold" style={{ color: program.color }}>{lessons.length}</div>
            <div className="text-xs text-[var(--color-text-muted)]">Lessons</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="text-2xl font-bold" style={{ color: program.color }}>~{program.estimatedHours}h</div>
            <div className="text-xs text-[var(--color-text-muted)]">Duration</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="text-2xl font-bold" style={{ color: program.color }}>{program.level}/5</div>
            <div className="text-xs text-[var(--color-text-muted)]">Level</div>
          </div>
        </div>
      </ScrollReveal>

      {/* What you'll learn */}
      <ScrollReveal animation="fade-up" delay={150}>
        <div className="mb-12 p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h2 className="text-lg font-bold mb-4">🎯 What You&apos;ll Learn</h2>
          <ul className="space-y-2">
            {program.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                <span className="text-green-500 mt-0.5">✓</span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </ScrollReveal>

      {/* Prerequisites */}
      <ScrollReveal animation="fade-up" delay={200}>
        <div className="mb-12 p-4 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
          <p className="text-sm">
            <span className="font-semibold">Prerequisites:</span>{" "}
            <span className="text-[var(--color-text-muted)]">{program.prerequisites}</span>
          </p>
        </div>
      </ScrollReveal>

      {/* Lessons */}
      <ScrollReveal animation="fade-up" delay={250}>
        <h2 className="text-2xl font-bold mb-6">📚 Lessons</h2>
      </ScrollReveal>

      {lessons.length > 0 ? (
        <div className="space-y-4 mb-8">
          {lessons.map((lesson, idx) => (
            <ScrollReveal key={lesson.slug} animation="fade-up" delay={300 + idx * 80}>
              <Link
                href={`${basePath}/programs/${programSlug}/lessons/${lesson.slug}`}
                className="block card-hover card-glow"
              >
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: `${program.color}20`, color: program.color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span>{lesson.icon}</span>
                      <h3 className="font-bold">{lesson.title}</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">⏱️ {lesson.duration}m</span>
                    <span className="text-[var(--color-text-muted)]">→</span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal animation="fade-in">
          <div className="text-center py-12 rounded-2xl bg-[var(--color-bg-card)] border border-dashed border-[var(--color-border)]">
            <div className="text-4xl mb-3">🚧</div>
            <p className="font-semibold mb-1">Lessons Coming Soon</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              We&apos;re crafting these lessons with care. Check back soon!
            </p>
          </div>
        </ScrollReveal>
      )}

      {/* CTA */}
      {lessons.length > 0 && (
        <ScrollReveal animation="scale-in" delay={400}>
          <div className="text-center">
            <Link
              href={`${basePath}/programs/${programSlug}/lessons/${lessons[0].slug}`}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold"
            >
              Start First Lesson →
            </Link>
          </div>
        </ScrollReveal>
      )}

      {/* Back to programs */}
      <div className="mt-12 text-center">
        <Link
          href={`${basePath}/programs`}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          ← Back to All Programs
        </Link>
      </div>
    </div>
  );
}
