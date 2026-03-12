import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getProgramsByTrack } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { getTracks } from "@/lib/tracks";
import ProgramsShowcase from "@/components/programs/ProgramsShowcase";
import type { TrackData, ProgramData } from "@/components/programs/ProgramsShowcase";
import { CourseListJsonLd } from "@/components/seo/JsonLd";
import { buildAlternates } from "@/lib/seo";
import { isFreeProgram } from "@/lib/content-access";

const BASE_URL = "https://aieducademy.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "programs" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: {
      canonical: `${BASE_URL}${locale === "en" ? "" : `/${locale}`}/programs`,
      ...buildAlternates("/programs"),
    },
    openGraph: {
      title: `${t("pageTitle")} | AI Educademy`,
      description: t("pageDescription"),
    },
  };
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("programs");
  const tLT = await getTranslations("lessonTitles");
  const tracks = getTracks();
  const basePath = locale === "en" ? "" : `/${locale}`;

  const trackData: TrackData[] = tracks.map((track) => ({
    slug: track.slug,
    icon: track.icon,
    title: t(`track.${track.slug}.title`),
    desc: t(`track.${track.slug}.desc`),
    tagline: t(`track.${track.slug}.tagline`),
    brand: t(`track.${track.slug}.brand`),
  }));

  const programsByTrack: Record<string, ProgramData[]> = {};
  for (const track of tracks) {
    const progs = getProgramsByTrack(track.slug);
    programsByTrack[track.slug] = progs.map((p) => {
      const lessons = getLessons(p.slug, locale);
      return {
        slug: p.slug,
        icon: p.icon,
        title: t(`${p.slug}.title`),
        subtitle: t(`${p.slug}.subtitle`),
        description: t(`${p.slug}.description`),
        color: p.color,
        level: p.level,
        hasLessons: lessons.length > 0,
        estimatedHours: p.estimatedHours,
        topics: (t.raw(`${p.slug}.topics`) as string[]) || [],
        lessonCount: lessons.length,
        firstLessonSlug: lessons[0]?.slug,
        isPremium: !isFreeProgram(p.slug),
        lessons: lessons.map((l) => ({
          slug: l.slug,
          title: tLT(l.slug),
          icon: l.icon ?? "📄",
          duration: l.duration,
        })),
      };
    });
  }

  const levelLabels: Record<string, string> = {
    "1": t("levelLabels.1"),
    "2": t("levelLabels.2"),
    "3": t("levelLabels.3"),
    "4": t("levelLabels.4"),
    "5": t("levelLabels.5"),
  };

  const allCourses = Object.values(programsByTrack)
    .flat()
    .map((p) => ({
      name: p.title,
      description: p.description,
      slug: p.slug,
      level: p.level,
    }));

  return (
    <>
    <CourseListJsonLd courses={allCourses} locale={locale} />
    <ProgramsShowcase
      tracks={trackData}
      programsByTrack={programsByTrack}
      basePath={basePath}
      t={{
        title: t("title"),
        subtitle: t("subtitle"),
        startLearning: t("startLearning"),
        comingSoon: t("comingSoon"),
        hours: t("hours"),
        level: t("level"),
        viewAll: t("viewAll"),
        levelLabels,
        statsTracksLabel: t("statsTracksLabel"),
        statsProgramsLabel: t("statsProgramsLabel"),
        statsLessonsLabel: t("statsLessonsLabel"),
        lessonsCount: t("lessonsCount"),
        moreLessons: t("moreLessons"),
        showLess: t("showLess"),
        searchPlaceholder: t("searchPlaceholder"),
        noResults: t("noResults"),
        allTracks: t("allTracks"),
        free: t("free"),
        pro: t("pro"),
      }}
    />
    </>
  );
}
