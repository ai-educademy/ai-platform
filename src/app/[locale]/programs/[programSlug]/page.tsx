import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = "https://aieducademy.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
}): Promise<Metadata> {
  const { locale, programSlug } = await params;
  const program = getProgram(programSlug);
  if (!program) return {};

  const tP = await getTranslations({ locale, namespace: "programs" });
  const title = tP(`${programSlug}.title`);
  const description = tP(`${programSlug}.description`);
  const canonicalUrl = `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/programs/${programSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | AI Educademy`,
      description,
      type: "website",
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

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
}) {
  const { locale, programSlug } = await params;
  const program = getProgram(programSlug);
  if (!program) notFound();

  const t = await getTranslations("programDetail");
  const tP = await getTranslations("programs");
  const tLT = await getTranslations("lessonTitles");
  const lessons = getLessons(programSlug, locale);
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28">
      <CourseJsonLd
        locale={locale}
        name={tP(`${programSlug}.title`)}
        description={tP(`${programSlug}.description`)}
        slug={programSlug}
        level={program.level}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}${basePath}` },
          { name: tP("pageTitle"), url: `${BASE_URL}${basePath}/programs` },
          { name: tP(`${programSlug}.title`), url: `${BASE_URL}${basePath}/programs/${programSlug}` },
        ]}
      />
      {/* Program header */}
      <AnimatedSection animation="fade-up">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: `${program.color}20`, color: program.color }}
          >
            {program.icon} {t("level")} {program.level}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight text-gradient">{tP(`${programSlug}.title`)}</h1>
          <p className="text-xl text-[var(--color-text-muted)] mb-2 leading-relaxed">{tP(`${programSlug}.subtitle`)}</p>
          <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">{tP(`${programSlug}.description`)}</p>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection animation="fade-up" delay={100}>
        <div className="grid grid-cols-3 gap-4 mb-14">
          {[
            { value: lessons.length, label: t("lessons") },
            { value: `~${program.estimatedHours}h`, label: t("duration") },
            { value: `${program.level}/5`, label: t("level") },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-300 hover:shadow-md hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5">
              <div className="text-2xl font-bold" style={{ color: program.color }}>{stat.value}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* What you'll learn */}
      <AnimatedSection animation="fade-up" delay={150}>
        <div className="mb-14 p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h2 className="text-lg font-bold mb-4">🎯 {t("whatYouLearn")}</h2>
          <ul className="space-y-2">
            {((tP.raw(`${programSlug}.outcomes`) as string[]) || []).map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                <span className="text-green-500 mt-0.5">✓</span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>

      {/* Prerequisites */}
      <AnimatedSection animation="fade-up" delay={200}>
        <div className="mb-14 p-4 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
          <p className="text-sm">
            <span className="font-semibold">{t("prerequisites")}:</span>{" "}
            <span className="text-[var(--color-text-muted)]">{tP(`${programSlug}.prerequisites`)}</span>
          </p>
        </div>
      </AnimatedSection>

      {/* Lessons */}
      <AnimatedSection animation="fade-up" delay={250}>
        <h2 className="text-2xl font-bold mb-6">📚 {t("lessonsHeader")}</h2>
      </AnimatedSection>

      {lessons.length > 0 ? (
        <div className="space-y-4 mb-8">
          {lessons.map((lesson, idx) => (
            <AnimatedSection key={lesson.slug} animation="fade-up" delay={300 + idx * 80}>
              <Link
                href={`${basePath}/programs/${programSlug}/lessons/${lesson.slug}`}
                className="block group"
              >
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${program.color}20`, color: program.color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span>{lesson.icon}</span>
                      <h3 className="font-bold line-clamp-2 leading-relaxed">{tLT(lesson.slug)}</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">⏱️ {lesson.duration}m</span>
                    <span className="text-[var(--color-text-muted)] transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <AnimatedSection animation="fade-in">
          <div className="text-center py-12 rounded-2xl bg-[var(--color-bg-card)] border border-dashed border-[var(--color-border)]">
            <div className="text-4xl mb-3">🚧</div>
            <p className="font-semibold mb-1">{t("comingSoon")}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t("comingSoonDesc")}
            </p>
          </div>
        </AnimatedSection>
      )}

      {/* CTA */}
      {lessons.length > 0 && (
        <AnimatedSection animation="scale-in" delay={400}>
          <div className="text-center">
            <Link
              href={`${basePath}/programs/${programSlug}/lessons/${lessons[0].slug}`}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
            >
              {t("startFirst")} →
            </Link>
          </div>
        </AnimatedSection>
      )}

      {/* Back to programs */}
      <div className="mt-14 text-center">
        <Link
          href={`${basePath}/programs`}
          className="group text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <span className="transition-transform duration-200 inline-block group-hover:-translate-x-0.5">←</span> {t("backToAll")}
        </Link>
      </div>
    </div>
  );
}
