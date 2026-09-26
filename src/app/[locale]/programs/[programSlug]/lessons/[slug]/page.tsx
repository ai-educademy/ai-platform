import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  buildLessonPreview,
  getLesson,
  getLessons,
  type Lesson,
} from "@/lib/lessons";
import { getProgram, getPrograms, getProgramsByTrack } from "@/lib/programs";
import { LessonRenderer } from "@/components/lessons/LessonRenderer";
import { LessonComplete } from "@/components/lessons/LessonComplete";
import { QuizProvider } from "@/components/lessons/QuizContext";
import { LessonFeedback } from "@/components/lessons/LessonFeedback";
import { ListenButton } from "@/components/ui/ListenButton";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { routing } from "@/i18n/routing";
import { BASE_URL, createSeoMetadata } from "@/components/seo/metadata";
import { requiresPremium } from "@/lib/content-access";
import { auth } from "@/auth";
import { getUserPlan, canAccessPremium } from "@/lib/subscription";
import { Paywall } from "@/components/lessons/Paywall";
import { LessonComments } from "@/components/lessons/LessonComments";
import { BookmarkButton } from "@/components/lessons/BookmarkButton";
import { db, isDbConfigured } from "@/lib/db";
import { lessonBookmarks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ContentLanguageNotice } from "@/components/lessons/ContentLanguageNotice";
import { trackEvent } from "@/lib/funnel";

export const dynamicParams = false;

function lessonSeoDescription(
  summary: string,
  lessonTitle: string,
  programTitle: string,
): string {
  const base = summary.trim();
  const expanded =
    base.length >= 120 ? base : `${base} ${programTitle}: ${lessonTitle}.`;
  if (expanded.length <= 160) return expanded;
  const truncated = expanded.slice(0, 157);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 120 ? lastSpace : 157).trim()}...`;
}

function LessonStructuredData({
  lesson,
  lessonTitle,
  programTitle,
  locale,
  url,
  isPremium,
}: {
  lesson: Lesson;
  lessonTitle: string;
  programTitle: string;
  locale: string;
  url: string;
  isPremium: boolean;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Article", "LearningResource"],
    name: lessonTitle,
    headline: lessonTitle,
    description: lesson.description,
    educationalLevel: lesson.difficulty,
    timeRequired: `PT${lesson.duration}M`,
    inLanguage: lesson.contentLocale || locale,
    url,
    isAccessibleForFree: !isPremium,
    isPartOf: {
      "@type": "Course",
      name: programTitle,
      provider: {
        "@type": "Organization",
        name: "AI Educademy",
        url: BASE_URL,
      },
    },
    ...(isPremium
      ? {
          hasPart: {
            "@type": "WebPageElement",
            isAccessibleForFree: false,
            cssSelector: ".lesson-paywall",
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function generateStaticParams() {
  const programs = getPrograms();
  return routing.locales.flatMap((locale) =>
    programs.flatMap((p) => {
      const lessons = getLessons(p.slug, "en");
      return lessons
        .filter((l) => l.published)
        .map((l) => ({ locale, programSlug: p.slug, slug: l.slug }));
    }),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, programSlug, slug } = await params;
  setRequestLocale(locale);
  const program = getProgram(programSlug);
  if (!program) notFound();

  const lesson = getLesson(programSlug, locale, slug);
  if (!lesson) notFound();

  const tP = await getTranslations({ locale, namespace: "programs" });
  const tLT = await getTranslations({ locale, namespace: "lessonTitles" });
  const lessonTitle = lesson.title || tLT(slug);
  const programTitle = tP(`${programSlug}.title`);
  const title = `${lessonTitle} - ${programTitle}`;
  const description = lessonSeoDescription(
    lesson.description,
    lessonTitle,
    programTitle,
  );

  return createSeoMetadata({
    locale,
    path: `/programs/${programSlug}/lessons/${slug}`,
    title,
    description,
    type: "article",
  });
}

export default async function ProgramLessonPage({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string; slug: string }>;
}) {
  const { locale, programSlug, slug } = await params;
  setRequestLocale(locale);
  const program = getProgram(programSlug);
  if (!program) notFound();

  const t = await getTranslations("lessons");
  const tP = await getTranslations("programs");
  const tLT = await getTranslations("lessonTitles");
  const tPreview = await getTranslations("lessonPreview");
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
    if (isDbConfigured) {
      const [bookmark] = await db
        .select({ id: lessonBookmarks.id })
        .from(lessonBookmarks)
        .where(
          and(
            eq(lessonBookmarks.userId, session.user.id),
            eq(lessonBookmarks.programSlug, programSlug),
            eq(lessonBookmarks.lessonSlug, slug),
          ),
        );
      isBookmarked = !!bookmark;
    }
  }

  const allLessons = getLessons(programSlug, locale);
  const currentIdx = allLessons.findIndex((l) => l.slug === slug);
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next =
    currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const basePath = locale === "en" ? "" : `/${locale}`;
  const programPath = `${basePath}/programs/${programSlug}`;
  const lessonTitle = lesson.title || tLT(slug);
  const programTitle = tP(`${programSlug}.title`);
  const lessonUrl = `${BASE_URL}${programPath}/lessons/${slug}`;
  const preview = buildLessonPreview(lesson);
  trackEvent("lesson_viewed", { userId: session?.user?.id, locale, path: `${programPath}/lessons/${slug}`, programSlug, lessonSlug: slug, plan: isPremium ? "gated" : "free" });
  if (!hasAccess) trackEvent("paywall_viewed", { userId: session?.user?.id, locale, path: `${programPath}/lessons/${slug}`, programSlug, lessonSlug: slug, plan: "gated" });

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
          { name: programTitle, url: `${BASE_URL}${programPath}` },
          { name: lessonTitle, url: lessonUrl },
        ]}
      />
      <LessonStructuredData
        lesson={lesson}
        lessonTitle={lessonTitle}
        programTitle={programTitle}
        locale={locale}
        url={lessonUrl}
        isPremium={isPremium}
      />
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link
          href={`${basePath}/programs`}
          className="hover:text-[var(--color-primary)] transition-colors"
        >
          {tP("pageTitle")}
        </Link>
        <span className="mx-2">›</span>
        <Link
          href={programPath}
          className="hover:text-[var(--color-primary)] transition-colors"
        >
          {program.icon} {programTitle}
        </Link>
        <span className="mx-2">›</span>
        <Link
          href={`${programPath}/lessons`}
          className="hover:text-[var(--color-primary)] transition-colors"
        >
          {t("breadcrumbLessons")}
        </Link>
        <span className="mx-2">›</span>
        <span>{lessonTitle}</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{lesson.icon}</span>
          <div>
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${program.color}20`,
                color: program.color,
              }}
            >
              {programTitle} • {t(`difficulty.${lesson.difficulty}`)}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] ml-2">
              ⏱️ {lesson.duration} {t("duration")}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight flex-1">
            {lessonTitle}
          </h1>
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

      {/* Content is gated for premium lessons */}
      {hasAccess ? (
        <>
          <QuizProvider>
            {lesson.isFallback && (
              <ContentLanguageNotice
                requestedLocale={locale}
                variant="fallback"
              />
            )}
            {lesson.machineTranslated && (
              <ContentLanguageNotice
                requestedLocale={locale}
                variant="machine"
              />
            )}
            {/* lang must describe the body text, not the page shell, so screen
                readers switch voice instead of reading English in e.g. Japanese. */}
            <div className="lesson-content" lang={lesson.contentLocale}>
              <LessonRenderer content={lesson.content} />
            </div>

            {/* Mark as Complete + Navigation */}
            <LessonComplete
              slug={`${programSlug}/${slug}`}
              programSlug={programSlug}
              totalLessons={allLessons.length}
              currentIndex={currentIdx}
              nextSlug={next?.slug}
              nextTitle={next?.title}
              prevSlug={prev?.slug}
              prevTitle={prev?.title}
              basePath={`${programPath}/lessons`}
              programPath={programPath}
              programTitle={programTitle}
              programTrack={program.track}
              programLevel={program.level}
              trackLessonCounts={trackLessonCounts}
            />
          </QuizProvider>

          {/* Lesson Feedback */}
          <LessonFeedback
            lessonSlug={slug}
            programSlug={programSlug}
            locale={locale}
          />

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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t("suggestEdit")}
            </a>
          </div>
        </>
      ) : (
        <div className="space-y-10">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-[var(--color-primary)] mb-2">
                {tPreview("previewLabel")}
              </p>
              <p className="text-lg text-[var(--color-text-muted)]">
                {lesson.description}
              </p>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl bg-[var(--color-surface)] p-4">
                <dt className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  {tPreview("programmeLabel")}
                </dt>
                <dd className="font-semibold mt-1">{programTitle}</dd>
              </div>
              <div className="rounded-xl bg-[var(--color-surface)] p-4">
                <dt className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  {tPreview("levelLabel")}
                </dt>
                <dd className="font-semibold mt-1">
                  {t(`difficulty.${lesson.difficulty}`)}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--color-surface)] p-4">
                <dt className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  {tPreview("readingTimeLabel")}
                </dt>
                <dd className="font-semibold mt-1">
                  {lesson.duration} {t("duration")}
                </dd>
              </div>
            </dl>

            {preview.objectives.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">
                  {tPreview("objectivesTitle")}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  {tPreview("objectivesLead")}
                </p>
                <ul className="grid gap-2 text-[var(--color-text)]">
                  {preview.objectives.map((objective) => (
                    <li key={objective} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="text-[var(--color-primary)]"
                      >
                        ✓
                      </span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.outline.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">
                  {tPreview("outlineTitle")}
                </h2>
                <ol className="space-y-2">
                  {preview.outline.map((heading) => (
                    <li
                      key={`${heading.level}-${heading.title}`}
                      className={
                        heading.level === 3
                          ? "ml-5 text-sm text-[var(--color-text-muted)]"
                          : "font-medium"
                      }
                    >
                      {heading.title}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {preview.introExcerpt && (
              <div>
                <h2 className="text-xl font-bold mb-3">
                  {tPreview("introTitle")}
                </h2>
                <p className="text-[var(--color-text)] leading-8">
                  {preview.introExcerpt}
                </p>
              </div>
            )}
          </section>

          <Paywall
            programSlug={programSlug}
            programTitle={programTitle}
            programColor={program.color}
            lessonTitle={lessonTitle}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
