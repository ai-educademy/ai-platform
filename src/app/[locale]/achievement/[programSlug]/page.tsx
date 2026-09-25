import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProgram } from "@/lib/programs";
import { BASE_URL, createSeoMetadata, getAchievementSeo } from "@/lib/seo";

const PROGRAM_ICONS: Record<string, string> = {
  "ai-seeds": "🌱",
  "ai-sprouts": "🌿",
  "ai-branches": "🌳",
  "ai-canopy": "🏕️",
  "ai-forest": "🌲",
  "ai-sketch": "✏️",
  "ai-chisel": "🪨",
  "ai-craft": "⚒️",
  "ai-polish": "💎",
  "ai-masterpiece": "🏆",
  "ai-launchpad": "🚀",
  "ai-behavioral": "🎭",
  "ai-technical": "💻",
  "ai-ml-interview": "🧠",
  "ai-offer": "🎯",
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
  searchParams: Promise<{ user?: string }>;
}): Promise<Metadata> {
  const { locale, programSlug } = await params;
  const { user } = await searchParams;
  const tp = await getTranslations("programs");

  const program = getProgram(programSlug);
  const programName = program ? tp(`${programSlug}.title`) : programSlug;
  const userName = user || "A Learner";

  const seo = getAchievementSeo(locale, programName);
  const ogImage = `${BASE_URL}/api/share-card?program=${encodeURIComponent(programSlug)}&user=${encodeURIComponent(userName)}`;

  return createSeoMetadata({
    locale,
    path: `/achievement/${programSlug}`,
    ...seo,
    imageUrl: ogImage,
    imageAlt: `${programName} achievement`,
    robots: { index: false, follow: false },
  });
}

export default async function AchievementPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
  searchParams: Promise<{ user?: string }>;
}) {
  const { locale, programSlug } = await params;
  const { user } = await searchParams;
  const t = await getTranslations("achievement");
  const tp = await getTranslations("programs");

  const program = getProgram(programSlug);
  const programName = program ? tp(`${programSlug}.title`) : programSlug;
  const userName = user || "A Learner";
  const icon = PROGRAM_ICONS[programSlug] || "🎓";
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        {/* Achievement card */}
        <div className="relative p-8 sm:p-10 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl overflow-hidden">
          {/* Gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />

          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 text-sm font-semibold text-indigo-400 mb-6">
              ✅ {t("verifiedCompletion")}
            </div>

            {/* Icon */}
            <div className="text-7xl mb-4">{icon}</div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient">
              {t("heading")}
            </h1>

            {/* Program name */}
            <p className="text-xl sm:text-2xl font-bold mb-4">{programName}</p>

            {/* Completed by */}
            <p className="text-[var(--color-text-muted)] mb-6">
              {t("completedBy")}{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {userName}
              </span>
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent mb-6" />

            {/* CTA */}
            <Link
              href={`${basePath}/programs`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
            >
              {t("cta")} →
            </Link>

            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {t("ctaSubtitle")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
