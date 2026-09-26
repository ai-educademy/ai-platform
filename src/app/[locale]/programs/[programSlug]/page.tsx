import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getProgram, getPrograms } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import {
  CourseJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd,
} from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/programs/FaqAccordion";
import { RelatedArticles } from "@/components/programs/RelatedArticles";
import { ExperimentCta } from "@/components/programs/ExperimentCta";
import { routing } from "@/i18n/routing";
import { BASE_URL, createSeoMetadata, getProgramSeo } from "@/lib/seo";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { CertificateButton } from "@/components/certificates/CertificateButton";
import { isFreeProgram, requiresPremium } from "@/lib/content-access";
import { canAccessPremium, getUserPlan } from "@/lib/subscription";

export const dynamicParams = false;

export function generateStaticParams() {
  const programs = getPrograms();
  return routing.locales.flatMap((locale) =>
    programs.map((p) => ({ locale, programSlug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
}): Promise<Metadata> {
  const { locale, programSlug } = await params;
  setRequestLocale(locale);
  const program = getProgram(programSlug);
  if (!program) notFound();

  const tP = await getTranslations({ locale, namespace: "programs" });
  const programName = tP(`${programSlug}.title`);
  const seo = getProgramSeo(locale, programSlug, programName);

  return createSeoMetadata({
    locale,
    path: `/programs/${programSlug}`,
    ...seo,
  });
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
}) {
  const { locale, programSlug } = await params;
  setRequestLocale(locale);
  const program = getProgram(programSlug);
  if (!program) notFound();

  const t = await getTranslations("programDetail");
  const tP = await getTranslations("programs");
  const tLT = await getTranslations("lessonTitles");
  const tPaywall = await getTranslations("paywall");
  const lessons = getLessons(programSlug, locale);
  const basePath = locale === "en" ? "" : `/${locale}`;

  // Extract FAQ items for this program
  const faqItems = (() => {
    try {
      return t.raw(`faq.${programSlug}`) as { q: string; a: string }[];
    } catch {
      return [];
    }
  })();

  // Fetch certificate progress and entitlement
  const session = await auth();
  let completedLessons = 0;
  let isPremiumUser = false;
  if (session?.user?.id && db) {
    // Entitlement comes from getUserPlan rather than a raw users.role read,
    // so a subscriber whose role column has drifted out of sync with Stripe
    // is not shown locks on content they are paying for.
    const [completed, plan] = await Promise.all([
      db
        .select({ lessonSlug: lessonProgress.lessonSlug })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, session.user.id),
            eq(lessonProgress.programSlug, programSlug),
          ),
        ),
      getUserPlan(session.user.id),
    ]);
    const completedSlugs = new Set(completed.map((c) => c.lessonSlug));
    completedLessons = lessons.filter((l) => completedSlugs.has(l.slug)).length;
    isPremiumUser = canAccessPremium(plan);
  }

  const lockedCount = isPremiumUser
    ? 0
    : lessons.filter((_, idx) => requiresPremium(programSlug, idx + 1)).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28">
      <CourseJsonLd
        locale={locale}
        name={tP(`${programSlug}.title`)}
        description={tP(`${programSlug}.description`)}
        slug={programSlug}
        level={program.level}
        estimatedHours={program.estimatedHours}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}${basePath}` },
          { name: tP("pageTitle"), url: `${BASE_URL}${basePath}/programs` },
          {
            name: tP(`${programSlug}.title`),
            url: `${BASE_URL}${basePath}/programs/${programSlug}`,
          },
        ]}
      />
      {/* Program header */}
      <AnimatedSection animation="fade-up">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: `${program.color}20`,
              color: program.color,
            }}
          >
            {program.icon} {t("level")} {program.level}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight text-gradient">
            {tP(`${programSlug}.title`)}
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] mb-2 leading-relaxed">
            {tP(`${programSlug}.subtitle`)}
          </p>
          <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
            {tP(`${programSlug}.description`)}
          </p>
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
            <div
              key={stat.label}
              className="text-center p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-300 hover:shadow-md hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5"
            >
              <div
                className="text-2xl font-bold"
                style={{ color: program.color }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* What you'll learn */}
      <AnimatedSection animation="fade-up" delay={150}>
        <div className="mb-14 p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h2 className="text-lg font-bold mb-4">🎯 {t("whatYouLearn")}</h2>
          <ul className="space-y-2">
            {((tP.raw(`${programSlug}.outcomes`) as string[]) || []).map(
              (outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
                >
                  <span className="text-green-500 mt-0.5">✓</span>
                  {outcome}
                </li>
              ),
            )}
          </ul>
        </div>
      </AnimatedSection>

      {/* Prerequisites */}
      <AnimatedSection animation="fade-up" delay={200}>
        <div className="mb-14 p-4 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
          <p className="text-sm">
            <span className="font-semibold">{t("prerequisites")}:</span>{" "}
            <span className="text-[var(--color-text-muted)]">
              {tP(`${programSlug}.prerequisites`)}
            </span>
          </p>
        </div>
      </AnimatedSection>

      {/* Who Is This For? */}
      <AnimatedSection animation="fade-up" delay={220}>
        <div
          className="mb-14 p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          style={{
            background: "var(--color-glass)",
            backdropFilter: "saturate(200%) blur(24px)",
            WebkitBackdropFilter: "saturate(200%) blur(24px)",
          }}
        >
          <h2 className="text-lg font-bold mb-3">👤 {t("whoIsThisFor")}</h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {tP(`${programSlug}.audience`)}
          </p>
        </div>
      </AnimatedSection>

      {/* Topics Covered */}
      <AnimatedSection animation="fade-up" delay={240}>
        <div className="mb-14 p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h2 className="text-lg font-bold mb-4">🏷️ {t("topicsCovered")}</h2>
          <div className="flex flex-wrap gap-2">
            {((tP.raw(`${programSlug}.topics`) as string[]) || []).map(
              (topic) => (
                <span
                  key={topic}
                  className="inline-block px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${program.color}15`,
                    color: program.color,
                    border: `1px solid ${program.color}30`,
                  }}
                >
                  {topic}
                </span>
              ),
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Experiment CTA */}
      <AnimatedSection animation="fade-up" delay={250}>
        <ExperimentCta
          programSlug={programSlug}
          basePath={basePath}
          label={t("tryExperiments")}
          description={t("tryExperimentsDesc")}
          promptLabel={t("tryPromptLab")}
          promptDescription={t("tryPromptLabDesc")}
        />
      </AnimatedSection>

      {/* Lessons */}
      <AnimatedSection animation="fade-up" delay={260}>
        <h2 className="text-2xl font-bold mb-6">📚 {t("lessonsHeader")}</h2>
      </AnimatedSection>

      {lessons.length > 0 ? (
        <div className="space-y-4 mb-8">
          {lessons.map((lesson, idx) => {
            const locked =
              !isPremiumUser && requiresPremium(programSlug, idx + 1);
            return (
              <AnimatedSection
                key={lesson.slug}
                animation="fade-up"
                delay={300 + idx * 80}
              >
                <Link
                  href={`${basePath}/programs/${programSlug}/lessons/${lesson.slug}`}
                  className="block group"
                >
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${program.color}20`,
                        color: program.color,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span>{lesson.icon}</span>
                        <h3 className="font-bold line-clamp-2 leading-relaxed">
                          {tLT(lesson.slug)}
                        </h3>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">
                        {lesson.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {locked && (
                        /* Stating the lock up front. Previously every lesson
                         looked open and the paywall only appeared after the
                         click, which reads as a bait and switch. */
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                          <Lock className="h-3 w-3" aria-hidden="true" />
                          {tP("pro")}
                        </span>
                      )}
                      <span className="text-xs text-[var(--color-text-muted)]">
                        ⏱️ {lesson.duration}m
                      </span>
                      <span className="text-[var(--color-text-muted)] transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
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

      {/* Related Articles */}
      <AnimatedSection animation="fade-up" delay={350}>
        <RelatedArticles
          programSlug={programSlug}
          basePath={basePath}
          label={t("relatedArticles")}
        />
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection animation="fade-up" delay={380}>
        {faqItems.length > 0 && (
          <div className="mb-14">
            <h2 className="text-2xl font-bold mb-6">❓ {t("faqTitle")}</h2>
            <FaqAccordion items={faqItems} programColor={program.color} />
          </div>
        )}
      </AnimatedSection>

      <FAQJsonLd
        questions={faqItems.map((f) => ({ question: f.q, answer: f.a }))}
      />

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

      {/* The upgrade offer. This page is where somebody decides whether the
          programme is worth paying for, and until now it was the one
          high-intent surface with no way to buy. */}
      {lockedCount > 0 && (
        <AnimatedSection animation="fade-up" delay={420}>
          <div className="mt-10 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              <Lock className="h-3 w-3" aria-hidden="true" />
              {lockedCount} · {tP("pro")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[var(--color-text)]">
              {tPaywall("title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-text-muted)]">
              {tPaywall("description")}
            </p>
            <Link
              href={`${basePath}/pricing`}
              className="btn-primary mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
            >
              {tPaywall("upgradeCta")} →
            </Link>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              {tPaywall("guarantee")}
            </p>
          </div>
        </AnimatedSection>
      )}

      {/* Certificate */}
      {lessons.length > 0 && (
        <AnimatedSection animation="fade-up" delay={500}>
          <div className="mt-10">
            <CertificateButton
              programSlug={programSlug}
              totalLessons={lessons.length}
              completedLessons={completedLessons}
              isSignedIn={!!session?.user}
              isPremiumUser={isPremiumUser}
              isFree={isFreeProgram(programSlug)}
              locale={locale}
              programName={tP(`${programSlug}.title`)}
              userName={session?.user?.name ?? undefined}
              userId={session?.user?.id}
            />
          </div>
        </AnimatedSection>
      )}

      {/* Back to programs */}
      <div className="mt-14 text-center">
        <Link
          href={`${basePath}/programs`}
          className="group text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <span className="transition-transform duration-200 inline-block group-hover:-translate-x-0.5">
            ←
          </span>{" "}
          {t("backToAll")}
        </Link>
      </div>
    </div>
  );
}
