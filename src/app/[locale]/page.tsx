import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { CourseProgress } from "@open-ai-school/ai-ui-library";
import { WelcomeBanner } from "@open-ai-school/ai-ui-library";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";
import { FloatingParticles } from "@open-ai-school/ai-ui-library";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const tp = await getTranslations("homePrograms");
  const basePath = locale === "en" ? "" : `/${locale}`;

  const programDescKeys: Record<string, string> = {
    "ai-seeds": "startFromZero",
    "ai-sprouts": "buildFoundations",
    "ai-branches": "applyInPractice",
    "ai-canopy": "goDeep",
    "ai-forest": "masterAI",
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <FloatingParticles />
        <div className="absolute inset-0 bg-grid" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold mb-8 shadow-lg shadow-indigo-500/30 animate-fade-up" style={{ animationDelay: "100ms" }}>
              {t("hero.badge")}
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <span className="block">{t("hero.title")}</span>
              <span className="block text-gradient">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: "300ms" }}>
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <Link
                href={`${basePath}/programs/ai-seeds/lessons/what-is-ai`}
                className="btn-primary px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all"
              >
                {t("hero.cta")} →
              </Link>
              <Link
                href={`${basePath}/playground`}
                className="px-10 py-4 border-2 border-[var(--color-border)] rounded-2xl text-lg font-bold hover:border-indigo-500 hover:text-indigo-500 transition-all hover:shadow-lg backdrop-blur-sm"
              >
                🎮 {t("hero.ctaSecondary")}
              </Link>
            </div>

            {/* Hero Illustration */}
            <div className="my-12 max-w-2xl mx-auto animate-scale-in" style={{ animationDelay: "500ms" }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[2rem] blur-2xl" />
                <div className="relative rounded-3xl overflow-hidden bg-[var(--color-bg-card)] shadow-2xl shadow-indigo-500/10 ring-1 ring-white/10">
                  <Image
                    src="/images/hero/hero-brain.svg"
                    alt="AI learning illustration with neural network and brain"
                    width={800}
                    height={400}
                    className="w-full h-auto animate-float-slow"
                    unoptimized
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto stagger-children">
              {[
                { value: "5", label: t("hero.languages"), icon: "🌍" },
                { value: "10+", label: t("hero.lessons"), icon: "📚" },
                { value: t("hero.freeValue"), label: t("hero.cost"), icon: "💝" },
                { value: "100%", label: t("hero.openSource"), icon: "🔓" },
              ].map((stat) => (
                <div key={stat.label} className="text-center gradient-border rounded-2xl p-4 bg-[var(--color-bg-card)] animate-fade-up">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                  <div className="text-xs font-medium text-[var(--color-text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Progress tracker (shows only when user has started) */}
            <CourseProgress totalLessons={3} basePath={basePath} />
            <WelcomeBanner basePath={basePath} />
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-[var(--color-bg-section)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t("features.title")}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>
          </ScrollReveal>

          {/* Features illustration */}
          <ScrollReveal animation="scale-in">
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="rounded-2xl overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <Image
                  src="/images/hero/features.svg"
                  alt="Platform features: 5 languages, 100% free, hands-on projects, beginner friendly"
                  width={720}
                  height={200}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" stagger>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "🌱", key: "beginner", gradient: "from-emerald-500 to-green-600" },
                { icon: "🧪", key: "interactive", gradient: "from-blue-500 to-cyan-600" },
                { icon: "🗣️", key: "multilingual", gradient: "from-violet-500 to-purple-600" },
                { icon: "💝", key: "free", gradient: "from-pink-500 to-rose-600" },
                { icon: "👥", key: "community", gradient: "from-amber-500 to-orange-600" },
                { icon: "🌍", key: "practical", gradient: "from-indigo-500 to-blue-600" },
              ].map((feature) => (
                <div
                  key={feature.key}
                  className="group card-hover p-8 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:gradient-border transition-all animate-fade-up"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Programs Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-6">
                🌱 → 🌿 → 🌳 → 🏕️ → 🌲
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t("programs.title")}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {t("programs.subtitle")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-5xl mx-auto">
            {[
              { slug: "ai-seeds", icon: "🌱", title: "AI Seeds", color: "#34D399", active: true, level: 1 },
              { slug: "ai-sprouts", icon: "🌿", title: "AI Sprouts", color: "#60A5FA", active: false, level: 2 },
              { slug: "ai-branches", icon: "🌳", title: "AI Branches", color: "#F59E0B", active: false, level: 3 },
              { slug: "ai-canopy", icon: "🏕️", title: "AI Canopy", color: "#8B5CF6", active: false, level: 4 },
              { slug: "ai-forest", icon: "🌲", title: "AI Forest", color: "#EF4444", active: false, level: 5 },
            ].map((program, idx) => (
              <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 80}>
                {program.active ? (
                  <Link href={`${basePath}/programs/${program.slug}`} className="block h-full">
                    <div
                      className="h-full p-5 rounded-2xl bg-[var(--color-bg-card)] border-l-4 border border-[var(--color-border)] card-hover text-center hover:shadow-xl hover:shadow-black/5 transition-all"
                      style={{ borderLeftColor: program.color }}
                    >
                      <div className="text-3xl mb-2">{program.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{program.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mb-3">{tp(programDescKeys[program.slug])}</p>
                      <span className="text-xs font-semibold" style={{ color: program.color }}>{tp("start")} →</span>
                    </div>
                  </Link>
                ) : (
                  <div className="relative h-full p-5 rounded-2xl bg-[var(--color-bg-card)]/50 border border-dashed border-[var(--color-border)] text-center opacity-50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-bg)]/40 pointer-events-none" />
                    <div className="relative">
                      <div className="text-3xl mb-2">{program.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{program.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mb-3">{tp(programDescKeys[program.slug])}</p>
                      <span className="text-xs text-[var(--color-text-muted)]">🔒 {tp("comingSoon")}</span>
                    </div>
                  </div>
                )}
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="fade-up" delay={500}>
            <div className="text-center mt-10">
              <Link
                href={`${basePath}/programs`}
                className="text-[var(--color-primary)] font-semibold hover:underline"
              >
                {tp("viewAll")} →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <hr className="section-divider" />
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t("journey.title")}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)]">
                {t("journey.subtitle")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scale-in">
            <div className="max-w-3xl mx-auto mb-12">
              <div className="rounded-2xl overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <Image
                  src="/images/hero/learning-path.svg"
                  alt="Your learning journey from What is AI to building your own AI"
                  width={720}
                  height={160}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            </div>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-0">
            {[
              { num: "1", key: "step1", gradient: "from-indigo-500 to-blue-600" },
              { num: "2", key: "step2", gradient: "from-purple-500 to-violet-600" },
              { num: "3", key: "step3", gradient: "from-emerald-500 to-teal-600" },
              { num: "4", key: "step4", gradient: "from-amber-500 to-orange-600" },
            ].map((step, idx) => (
              <ScrollReveal key={step.key} animation="slide-left" delay={idx * 100}>
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${step.gradient} text-white rounded-full flex items-center justify-center text-lg font-bold shrink-0 shadow-lg`}
                    >
                      {step.num}
                    </div>
                    {idx < 3 && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-indigo-500/40 to-transparent" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-xl font-bold mb-2">
                      {t(`journey.${step.key}.title`)}
                    </h3>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      {t(`journey.${step.key}.description`)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Founder Preview */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[var(--color-bg-card)] to-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal animation="scale-in">
            <div className="mb-6">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-float-slow opacity-60 blur-md" />
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-[var(--color-primary)]/30 shadow-xl shadow-[var(--color-primary)]/20">
                  <Image
                    src="/images/hero/founder-avatar.svg"
                    alt="Ramesh Reddy Adutla"
                    width={112}
                    height={112}
                    className="w-full h-full"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="text-3xl font-bold mb-4">{t("founder.title")}</h2>
            <p className="text-lg text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto mb-8">
              {t("founder.description")}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href={`${basePath}/about`}
                className="btn-primary px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
              >
                {t("founder.cta")}
              </Link>
              <a
                href="https://github.com/rameshreddy-adutla"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-[var(--color-border)] rounded-xl font-medium hover:border-[var(--color-primary)] transition-all hover:shadow-md"
              >
                GitHub ↗
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Final CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              {t("cta.title")}
            </h2>
            <p className="text-lg text-indigo-100/80 mb-8">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`${basePath}/programs/ai-seeds/lessons/what-is-ai`}
                className="btn-primary px-10 py-4 bg-white text-indigo-700 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                {t("cta.button")} →
              </Link>
              <a
                href="https://github.com/open-ai-school/ai-seeds"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 border-2 border-white/30 rounded-2xl text-lg font-bold text-white hover:bg-white/10 hover:border-white/60 transition-all backdrop-blur-sm"
              >
                ⭐ {t("cta.github")}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
