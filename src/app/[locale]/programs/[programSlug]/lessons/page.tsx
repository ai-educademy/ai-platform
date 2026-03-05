import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProgram } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { LessonProgressBadge } from "@/components/lessons/LessonProgressBadge";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";

export default async function ProgramLessonsPage({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
}) {
  const { locale, programSlug } = await params;
  const program = getProgram(programSlug);
  if (!program) notFound();

  const t = await getTranslations("lessons");
  const lessons = getLessons(programSlug, locale);
  const basePath = locale === "en" ? "" : `/${locale}`;

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  const lessonImages: Record<string, string> = {
    "what-is-ai": "/images/lessons/what-is-ai.svg",
    "how-machines-learn": "/images/lessons/how-machines-learn.svg",
    "your-first-ai-model": "/images/lessons/your-first-ai-model.svg",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link href={`${basePath}/programs`} className="hover:text-[var(--color-primary)] transition-colors">
          Programs
        </Link>
        <span className="mx-2">›</span>
        <Link href={`${basePath}/programs/${programSlug}`} className="hover:text-[var(--color-primary)] transition-colors">
          {program.title}
        </Link>
        <span className="mx-2">›</span>
        <span>Lessons</span>
      </div>

      <ScrollReveal animation="fade-up">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${program.color}20`, color: program.color }}
          >
            {program.icon} {program.title}
          </div>
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
        {lessons.map((lesson, idx) => (
          <ScrollReveal key={lesson.slug} animation="fade-up" delay={idx * 80}>
            <Link
              href={`${basePath}/programs/${programSlug}/lessons/${lesson.slug}`}
              className="block card-hover card-glow"
            >
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                {lessonImages[lesson.slug] && (
                  <div className="hidden sm:block w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-[var(--color-border)] bg-white">
                    <Image
                      src={lessonImages[lesson.slug]}
                      alt={lesson.title}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="w-12 h-12 sm:hidden rounded-xl flex items-center justify-center text-xl font-bold shrink-0" style={{ backgroundColor: `${program.color}20`, color: program.color }}>
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{lesson.icon}</span>
                    <h2 className="text-lg font-bold">{lesson.title}</h2>
                    <LessonProgressBadge slug={`${programSlug}/${lesson.slug}`} />
                  </div>
                  <p className="text-[var(--color-text-muted)] text-sm mb-3">
                    {lesson.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-medium ${difficultyColors[lesson.difficulty]}`}>
                      {t(`difficulty.${lesson.difficulty}`)}
                    </span>
                    <span className="text-[var(--color-text-muted)]">
                      ⏱️ {lesson.duration} {t("duration")}
                    </span>
                  </div>
                </div>

                <div className="text-[var(--color-text-muted)] text-xl shrink-0 self-center">→</div>
              </div>
            </Link>
          </ScrollReveal>
        ))}

        {lessons.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-[var(--color-bg-card)] border border-dashed border-[var(--color-border)]">
            <div className="text-4xl mb-3">🚧</div>
            <p className="font-semibold mb-1">Lessons Coming Soon</p>
            <p className="text-sm text-[var(--color-text-muted)]">Check back soon!</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href={`${basePath}/programs/${programSlug}`}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          ← Back to {program.title}
        </Link>
      </div>
    </div>
  );
}
