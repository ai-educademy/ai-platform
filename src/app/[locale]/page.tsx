import { getTranslations } from "next-intl/server";
import { getProgramsByTrack } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import HeroBackground from "@/components/home/HeroBackgroundLazy";
import HomeHero from "@/components/home/HomeHero";
import {
  HomeProgramCardsLazy as HomeProgramCards,
  HomeFounderLazy as HomeFounder,
  HomeCommunitySectionLazy as HomeCommunitySection,
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

  // Resolve first lesson slugs for direct navigation
  const allHomePrograms = [...aiLearningPrograms, ...craftPrograms];
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

  // Social link SVG paths for founder section
  const socialLinks = [
    {
      label: "GitHub",
      href: "https://github.com/rameshreddy-adutla",
      iconPath: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/rameshreddy-adutla",
      iconPath: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      label: "Dev.to",
      href: "https://dev.to/rameshreddy-adutla",
      iconPath: "M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.2-.16.29-.45.29-.84v-2.22c0-.39-.1-.67-.29-.84zM0 2.11v19.78A2.11 2.11 0 0 0 2.11 24h19.78A2.11 2.11 0 0 0 24 21.89V2.11A2.11 2.11 0 0 0 21.89 0H2.11A2.11 2.11 0 0 0 0 2.11zm9.48 8.56c0 1.1-.47 2.28-1.92 2.28H5.12V7.05h2.48c1.4 0 1.88 1.18 1.88 2.28v1.34zm3.47 2.28h-2.64V7.05h2.64v1.29h-1.29v1.54h1.24v1.29h-1.24v1.54h1.29v1.24zm3.97-3.57c0-.2-.07-.36-.2-.47s-.3-.17-.51-.17h-.56v4.03h.56c.21 0 .38-.06.51-.17.13-.12.2-.28.2-.47V9.38z",
    },
  ];

  return (
    <>

      {/* Hero Section */}
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
            totalLessons={3}
            statPrograms={t("hero.statPrograms")}
            statLessons={t("hero.statLessons")}
            statLanguages={t("hero.statLanguages")}
          />
        </div>
      </section>

      {/* Programs Section - Bento Grid */}
      <section className="py-12 sm:py-16">
        <HomeProgramCards
          sectionTitle={t("programs.title")}
          sectionSubtitle={t("programs.subtitle")}
          highlights={[
            {
              icon: "📚",
              value: "100+",
              label: tf("lessonsTitle"),
              desc: tf("lessonsDesc"),
            },
            {
              icon: "🌍",
              value: "5",
              label: tf("languagesTitle"),
              desc: tf("languagesDesc"),
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
        />
      </section>

      {/* Brains Behind the Idea */}
      <section className="py-12 sm:py-16 relative overflow-hidden bg-[var(--color-bg-section)]">
        {/* Noise texture for section depth */}
        <div className="absolute inset-0 noise-texture pointer-events-none" />
        <HomeFounder
          brainsTitle={t("founder.brainsTitle")}
          name="Ramesh Reddy Adutla"
          role={t("founder.role")}
          description={t("founder.description")}
          stats={[
            { value: "15+", label: t("founder.statYears") },
            { value: "10", label: t("founder.statLanguages") },
            { value: "3", label: t("founder.statContinents") },
          ]}
          ctaText={t("founder.cta")}
          ctaHref={`${basePath}/about`}
          coffeeText={t("founder.buyCoffee")}
          coffeeHref="https://buymeacoffee.com/rameshreddyadutla"
          socialLinks={socialLinks}
          lightbulbSrc="/images/lightbulb.svg"
          avatarSrc="https://avatars.githubusercontent.com/u/134313151?v=4"
        />
      </section>

      {/* Community CTA - Full-width gradient section */}
      <section className="py-12 sm:py-16 relative overflow-hidden bg-gradient-mesh-cta">
        <div className="absolute inset-0 noise-texture pointer-events-none" />
        <HomeCommunitySection
          headline={tc("headline")}
          subtitle={tc("subtitle")}
          openSourceText={tc("openSource")}
        />
      </section>
    </>
  );
}
