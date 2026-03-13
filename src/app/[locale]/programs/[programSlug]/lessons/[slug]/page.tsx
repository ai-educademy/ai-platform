import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLesson, getLessons } from "@/lib/lessons";
import { getProgram, getPrograms, getProgramsByTrack } from "@/lib/programs";
import { LessonRenderer } from "@/components/lessons/LessonRenderer";
import { LessonComplete } from "@/components/lessons/LessonComplete";
import { LessonFeedback } from "@/components/lessons/LessonFeedback";
import { ListenButton } from "@/components/ui/ListenButton";
import { BreadcrumbJsonLd, LearningResourceJsonLd } from "@/components/seo/JsonLd";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo";
import { requiresPremium } from "@/lib/content-access";
import { auth } from "@/auth";
import { getUserPlan, canAccessPremium } from "@/lib/subscription";
import { Paywall } from "@/components/lessons/Paywall";
import { LessonComments } from "@/components/lessons/LessonComments";
import { BookmarkButton } from "@/components/lessons/BookmarkButton";
import { db } from "@/lib/db";
import { lessonBookmarks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const BASE_URL = "https://aieducademy.org";

export const dynamicParams = false;

export function generateStaticParams() {
  const programs = getPrograms();
  return routing.locales.flatMap((locale) =>
    programs.flatMap((p) => {
      const lessons = getLessons(p.slug, "en");
      return lessons
        .filter((l) => l.published)
        .map((l) => ({ locale, programSlug: p.slug, slug: l.slug }));
    })
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, programSlug, slug } = await params;
  const program = getProgram(programSlug);
  if (!program) return { robots: { index: false, follow: false } };

  const lesson = getLesson(programSlug, locale, slug);
  if (!lesson) return { robots: { index: false, follow: false } };

  const tP = await getTranslations({ locale, namespace: "programs" });
  const tLT = await getTranslations({ locale, namespace: "lessonTitles" });
  const lessonTitle = tLT(slug);
  const programTitle = tP(`${programSlug}.title`);
  const title = `${lessonTitle} - ${programTitle}`;
  const description = lesson.description;
  const canonicalUrl = `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/programs/${programSlug}/lessons/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      ...buildAlternates(`/programs/${programSlug}/lessons/${slug}`),
    },
    openGraph: {
      title: `${title} | AI Educademy`,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: "AI Educademy",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AI Educademy`,
      description,
    },
  };
}

export default async function ProgramLessonPage({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string; slug: string }>;
}) {
  const { locale, programSlug, slug } = await params;
  const program = getProgram(programSlug);
  if (!program) notFound();

  const t = await getTranslations("lessons");
  const tP = await getTranslations("programs");
   const tLT = await getTranslations("lessonTitles");
  const lesson = getLesson(programSlug, locale, slug);

  if (!lesson) {
    notFound();
  }

  // Content gating: check if this lesson requires premium access
  const isPremium = requiresPremium(programSlug, lesson.order);
  let hasAccess = !isPremium;

  // Always fetch session for bookmark status
  const session = await auth();
  let isBookmarked = false;

  if (session?.user?.id) {
    if (isPremium) {
      const plan = await getUserPlan(session.user.id);
      hasAccess = canAccessPremium(plan);
    }

    // Check bookmark status
    if (db) {
      const [bookmark] = await db
        .select({ id: lessonBookmarks.id })
        .from(lessonBookmarks)
        .where(
          and(
            eq(lessonBookmarks.userId, session.user.id),
            eq(lessonBookmarks.programSlug, programSlug),
            eq(lessonBookmarks.lessonSlug, slug)
          )
        );
      isBookmarked = !!bookmark;
    }
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
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}${basePath}` },
          { name: tP("pageTitle"), url: `${BASE_URL}${basePath}/programs` },
          { name: tP(`${programSlug}.title`), url: `${BASE_URL}${programPath}` },
          { name: tLT(slug), url: `${BASE_URL}${programPath}/lessons/${slug}` },
        ]}
      />
      <LearningResourceJsonLd
        name={tLT(slug)}
        description={lesson.description}
        educationalLevel={lesson.difficulty}
        duration={lesson.duration}
        locale={locale}
        courseName={tP(`${programSlug}.title`)}
      />
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link href={`${basePath}/programs`} className="hover:text-[var(--color-primary)] transition-colors">
          {tP("pageTitle")}
        </Link>
        <span className="mx-2">›</span>
        <Link href={programPath} className="hover:text-[var(--color-primary)] transition-colors">
          {program.icon} {tP(`${programSlug}.title`)}
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
              {tP(`${programSlug}.title`)} • {t(`difficulty.${lesson.difficulty}`)}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] ml-2">
              ⏱️ {lesson.duration} {t("duration")}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight flex-1">{tLT(slug)}</h1>
          {session?.user?.id && (
            <BookmarkButton
              programSlug={programSlug}
              lessonSlug={slug}
              initialBookmarked={isBookmarked}
            />
          )}
        </div>
        <div className="mt-4">
          <ListenButton locale={locale} />
        </div>
      </div>

      {/* Content — gated for premium lessons */}
      {hasAccess ? (
        <>
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
            programTitle={tP(`${programSlug}.title`)}
            programTrack={program.track}
            programLevel={program.level}
            trackLessonCounts={trackLessonCounts}
          />

          {/* Lesson Feedback */}
          <LessonFeedback lessonSlug={slug} programSlug={programSlug} locale={locale} />

          {/* Discussion / Comments */}
          <LessonComments lessonSlug={slug} programSlug={programSlug} />

          {/* Suggest an Edit */}
          <div className="mt-12 pt-8 border-t border-[var(--color-border)] text-center">
            <a
              href={`https://github.com/ai-educademy/ai-platform/edit/main/content/programs/${programSlug}/lessons/${locale}/${slug}.mdx`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {t("suggestEdit")}
            </a>
          </div>
        </>
      ) : (
        <Paywall
          programSlug={programSlug}
          programTitle={tP(`${programSlug}.title`)}
          programColor={program.color}
          lessonTitle={tLT(slug)}
          locale={locale}
        />
      )}
    </div>
  );
}
