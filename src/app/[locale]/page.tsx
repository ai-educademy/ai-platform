import { getTranslations } from "next-intl/server";
import { getPrograms, getProgramsByTrack } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { routing } from "@/i18n/routing";
import HeroBackground from "@/components/home/HeroBackgroundLazy";
import HomeHero from "@/components/home/HomeHero";
import HomeTrustBar from "@/components/home/HomeTrustBar";
import {
  HomeProgramCardsLazy as HomeProgramCards,
  HomeCommunitySectionLazy as HomeCommunitySection,
  HomeContinueLearningLazy as HomeContinueLearning,
  HomeHowItWorksLazy as HomeHowItWorks,
  HomeLabPreviewLazy as HomeLabPreview,
  HomeProjectsLazy as HomeProjects,
  HomeTestimonialsLazy as HomeTestimonials,
  HomeFinalCTALazy as HomeFinalCTA,
} from "@/components/home/HomeDynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const tP = await getTranslations("programs");
  const tc = await getTranslations("community");
  const tf = await getTranslations("features");
  const tLT = await getTranslations("lessonTitles");
  const tTB = await getTranslations("trustBar");
  const tHIW = await getTranslations("howItWorks");
  const tLP = await getTranslations("labPreview");
  const tPR = await getTranslations("projects");
  const tTS = await getTranslations("testimonials");
  const tFC = await getTranslations("finalCta");
  const basePath = locale === "en" ? "" : `/${locale}`;

  const aiLearningPrograms = getProgramsByTrack("ai-learning").map((p) => ({
    slug: p.slug,
    icon: p.icon,
    title: tP(`${p.slug}.title`),
    color: p.color,
    active: true,
    level: p.level,
  }));

  const craftPrograms = getProgramsByTrack("craft-engineering").map((p) => ({
    slug: p.slug,
    icon: p.icon,
    title: tP(`${p.slug}.title`),
    color: p.color,
    active: true,
    level: p.level,
    desc: tP(`${p.slug}.subtitle`),
  }));

  const careerPrograms = getProgramsByTrack("career-ready").map((p) => ({
    slug: p.slug,
    icon: p.icon,
    title: tP(`${p.slug}.title`),
    color: p.color,
    active: true,
    level: p.level,
    desc: tP(`${p.slug}.subtitle`),
  }));

  // Resolve first lesson slugs for direct navigation
  const allHomePrograms = [...aiLearningPrograms, ...craftPrograms, ...careerPrograms];
  const firstLessonSlugs: Record<string, string | undefined> = {};
  const lessonNames: Record<string, string[]> = {};
  for (const p of allHomePrograms) {
    if (p.active) {
      const lessons = getLessons(p.slug, locale);
      firstLessonSlugs[p.slug] = lessons[0]?.slug;
      lessonNames[p.slug] = lessons.map((l) => tLT(l.slug));
    }
  }

  // Build program title map for client components
  const programTitles: Record<string, string> = {};
  for (const p of allHomePrograms) {
    programTitles[p.slug] = tP(`${p.slug}.title`);
  }

  // Build lesson counts per program for continue learning
  const lessonCounts: Record<string, number> = {};
  for (const p of allHomePrograms) {
    if (p.active) {
      lessonCounts[p.slug] = getLessons(p.slug, locale).length;
    }
  }

  // Compute platform-wide stats from actual data
  const allPrograms = getPrograms();
  const totalPrograms = allPrograms.length;
  const totalLessons = allPrograms.reduce(
    (sum, p) => sum + getLessons(p.slug, locale).length,
    0
  );
  const totalLanguages = routing.locales.length;

  const trustBarItems = [
    { icon: "📚", value: String(totalLessons), label: tTB("lessons") },
    { icon: "🎯", value: String(totalPrograms), label: tTB("programs") },
    { icon: "🌍", value: String(totalLanguages), label: tTB("languages") },
    { icon: "💎", value: "100%", label: tTB("openSource") },
  ];

  return (
    <>

      {/* Section 1: Hero */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center">
        <HeroBackground />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-[2]">
          <HomeHero
            title={t("hero.title")}
            titleHighlight={t("hero.titleHighlight")}
            subtitle={t("hero.subtitle")}
            ctaText={t("hero.cta")}
            ctaHref={`${basePath}/programs`}
            ctaSecondaryText={t("hero.ctaSecondary")}
            ctaSecondaryHref={`${basePath}/lab`}
            basePath={basePath}
            totalLessons={totalLessons}
            statPrograms={t("hero.statPrograms")}
            statLessons={t("hero.statLessons", { count: totalLessons })}
            statLanguages={t("hero.statLanguages")}
          />
        </div>
      </section>

      {/* Section 2: Trust Bar */}
      <HomeTrustBar items={trustBarItems} />

      {/* Section 3: Continue Learning (client-only, signed-in users) */}
      <HomeContinueLearning
        basePath={basePath}
        programTitles={programTitles}
        lessonCounts={lessonCounts}
      />

      {/* Section 4: How It Works */}
      <HomeHowItWorks
        title={tHIW("title")}
        subtitle={tHIW("subtitle")}
        steps={[
          { title: tHIW("step1Title"), description: tHIW("step1Desc") },
          { title: tHIW("step2Title"), description: tHIW("step2Desc") },
          { title: tHIW("step3Title"), description: tHIW("step3Desc") },
        ]}
      />

      {/* Section 5: Programs Bento Grid */}
      <section className="py-12 sm:py-16">
        <HomeProgramCards
          sectionTitle={t("programs.title")}
          sectionSubtitle={t("programs.subtitle")}
          highlights={[
            {
              icon: "📚",
              value: String(totalLessons),
              label: tf("lessonsTitle"),
              desc: tf("lessonsDesc"),
            },
            {
              icon: "🌍",
              value: String(totalLanguages),
              label: tf("languagesTitle"),
              desc: tf("languagesDesc"),
            },
            {
              icon: "🎯",
              value: String(totalPrograms),
              label: tf("programsTitle"),
              desc: tf("programsDesc"),
            },
          ]}
          trackAI={{
            trackIcon: "🌳",
            trackTitle: tP("track.ai-learning.title"),
            trackDesc: tP("track.ai-learning.desc"),
            programs: aiLearningPrograms,
            programTitles,
            firstLessonSlugs,
            lessonNames,
            basePath,
            href: `${basePath}/programs#ai-learning`,
          }}
          trackCraft={{
            trackIcon: "🔨",
            trackTitle: tP("track.craft-engineering.title"),
            trackDesc: tP("track.craft-engineering.desc"),
            programs: craftPrograms,
            programTitles,
            firstLessonSlugs,
            lessonNames,
            basePath,
            href: `${basePath}/programs#craft-engineering`,
          }}
          trackCareer={{
            trackIcon: "🚀",
            trackTitle: tP("track.career-ready.title"),
            trackDesc: tP("track.career-ready.desc"),
            programs: careerPrograms,
            programTitles,
            firstLessonSlugs,
            lessonNames,
            basePath,
            href: `${basePath}/programs#career-ready`,
          }}
        />
      </section>

      {/* Section 6: Interactive Lab Preview */}
      <HomeLabPreview
        title={tLP("title")}
        subtitle={tLP("subtitle")}
        ctaText={tLP("ctaText")}
        ctaHref={`${basePath}/lab`}
        experiments={[
          { name: tLP("neuralPlayground"), description: tLP("neuralPlaygroundDesc") },
          { name: tLP("aiOrHuman"), description: tLP("aiOrHumanDesc") },
          { name: tLP("promptEngineering"), description: tLP("promptEngineeringDesc") },
          { name: tLP("imageGeneration"), description: tLP("imageGenerationDesc") },
          { name: tLP("sentimentAnalysis"), description: tLP("sentimentAnalysisDesc") },
          { name: tLP("aiChat"), description: tLP("aiChatDesc") },
          { name: tLP("ethicsScenarios"), description: tLP("ethicsScenariosDesc") },
        ]}
      />

      {/* Section 7: What You'll Build */}
      <HomeProjects
        title={tPR("title")}
        subtitle={tPR("subtitle")}
        projects={[
          {
            title: tPR("chatbot"),
            description: tPR("chatbotDesc"),
            tags: tPR("chatbotTags").split(","),
            difficulty: tPR("chatbotDifficulty"),
          },
          {
            title: tPR("classifier"),
            description: tPR("classifierDesc"),
            tags: tPR("classifierTags").split(","),
            difficulty: tPR("classifierDifficulty"),
          },
          {
            title: tPR("recommender"),
            description: tPR("recommenderDesc"),
            tags: tPR("recommenderTags").split(","),
            difficulty: tPR("recommenderDifficulty"),
          },
          {
            title: tPR("agent"),
            description: tPR("agentDesc"),
            tags: tPR("agentTags").split(","),
            difficulty: tPR("agentDifficulty"),
          },
        ]}
      />

      {/* Section 8: Platform Highlights / Testimonials */}
      <HomeTestimonials
        title={tTS("title")}
        stats={{
          programs: tTS("programs"),
          programsSub: tTS("programsSub"),
          languages: tTS("languages"),
          languagesSub: tTS("languagesSub"),
          openSource: tTS("openSource"),
          openSourceSub: tTS("openSourceSub"),
        }}
        quote={tTS("quote")}
      />

      {/* Section 9: Newsletter & Community */}
      <section className="py-12 sm:py-16 relative overflow-hidden bg-gradient-mesh-cta">
        <div className="absolute inset-0 noise-texture pointer-events-none" />
        <HomeCommunitySection
          headline={tc("headline")}
          subtitle={tc("subtitle")}
          openSourceText={tc("openSource")}
          newsletterTitle={tc("newsletterTitle")}
          githubTitle={tc("githubTitle")}
        />
      </section>

      {/* Section 10: Final CTA */}
      <HomeFinalCTA
        headline={tFC("headline")}
        subtitle={tFC("subtitle")}
        primaryText={tFC("primaryText")}
        primaryHref={`${basePath}/programs`}
        secondaryText={tFC("secondaryText")}
        secondaryHref={`${basePath}/journey`}
      />
    </>
  );
}
