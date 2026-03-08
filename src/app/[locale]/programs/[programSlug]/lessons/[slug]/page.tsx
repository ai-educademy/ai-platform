import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getLesson, getLessons } from "@/lib/lessons";
import { getProgram, getProgramsByTrack } from "@/lib/programs";
import { LessonRenderer } from "@/components/lessons/LessonRenderer";
import { LessonComplete } from "@/components/lessons/LessonComplete";
import { LessonFeedback } from "@/components/lessons/LessonFeedback";

export default async function ProgramLessonPage({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string; slug: string }>;
}) {
  const { locale, programSlug, slug } = await params;
  const program = getProgram(programSlug);
  if (!program) notFound();

  const t = await getTranslations("lessons");
  const tPT = await getTranslations("programTitles");
  const tLT = await getTranslations("lessonTitles");
  const tP = await getTranslations("programs");
  const lesson = getLesson(programSlug, locale, slug);

  if (!lesson) {
    notFound();
  }

  const allLessons = getLessons(programSlug, locale);
  const currentIdx = allLessons.findIndex((l) => l.slug === slug);
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const basePath = locale === "en" ? "" : `/${locale}`;
  const programPath = `${basePath}/programs/${programSlug}`;

  // Build lesson counts for all programs in this track (for confetti)
  const trackPrograms = getProgramsByTrack(program.track);
  const trackLessonCounts: Record<string, number> = {};
  for (const tp of trackPrograms) {
    trackLessonCounts[tp.slug] = getLessons(tp.slug, locale).length;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link href={`${basePath}/programs`} className="hover:text-[var(--color-primary)] transition-colors">
          {tP("pageTitle")}
        </Link>
        <span className="mx-2">›</span>
        <Link href={programPath} className="hover:text-[var(--color-primary)] transition-colors">
          {program.icon} {tPT(programSlug)}
        </Link>
        <span className="mx-2">›</span>
        <Link href={`${programPath}/lessons`} className="hover:text-[var(--color-primary)] transition-colors">
          {t("breadcrumbLessons")}
        </Link>
        <span className="mx-2">›</span>
        <span>{tLT(slug)}</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{lesson.icon}</span>
          <div>
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${program.color}20`, color: program.color }}
            >
              {tPT(programSlug)} • {t(`difficulty.${lesson.difficulty}`)}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] ml-2">
              ⏱️ {lesson.duration} {t("duration")}
            </span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{tLT(slug)}</h1>
      </div>

      {/* Content */}
      <div className="lesson-content">
        <LessonRenderer content={lesson.content} />
      </div>

      {/* Mark as Complete + Navigation */}
      <LessonComplete
        slug={`${programSlug}/${slug}`}
        programSlug={programSlug}
        totalLessons={allLessons.length}
        currentIndex={currentIdx}
        nextSlug={next?.slug}
        nextTitle={next ? tLT(next.slug) : undefined}
        prevSlug={prev?.slug}
        prevTitle={prev ? tLT(prev.slug) : undefined}
        basePath={`${programPath}/lessons`}
        programPath={programPath}
        programTitle={tPT(programSlug)}
        programTrack={program.track}
        programLevel={program.level}
        trackLessonCounts={trackLessonCounts}
      />

      {/* Lesson Feedback */}
      <LessonFeedback lessonSlug={slug} programSlug={programSlug} locale={locale} />
    </div>
  );
}
