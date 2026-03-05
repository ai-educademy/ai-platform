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
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <FloatingParticles />
        <div className="absolute inset-0 bg-mesh" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
              {t("hero.badge")}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <span className="block">{t("hero.title")}</span>
              <span className="block gradient-text-animated">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "300ms" }}>
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <Link
                href={`${basePath}/programs/ai-seeds/lessons/what-is-ai`}
                className="btn-primary px-8 py-4 bg-[var(--color-primary)] text-white rounded-2xl text-lg font-semibold shadow-lg shadow-[var(--color-primary)]/25"
              >
                {t("hero.cta")} →
              </Link>
              <Link
                href={`${basePath}/playground`}
                className="px-8 py-4 border-2 border-[var(--color-border)] rounded-2xl text-lg font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all hover:shadow-md"
              >
                🎮 {t("hero.ctaSecondary")}
              </Link>
            </div>

            {/* Hero Illustration */}
            <div className="my-12 max-w-2xl mx-auto animate-scale-in" style={{ animationDelay: "500ms" }}>
              <div className="rounded-3xl overflow-hidden bg-white shadow-lg">
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto stagger-children">
              {[
                { value: "5", label: t("hero.languages"), icon: "🌍" },
                { value: "10+", label: t("hero.lessons"), icon: "📚" },
                { value: t("hero.freeValue"), label: t("hero.cost"), icon: "💝" },
                { value: "100%", label: t("hero.openSource"), icon: "🔓" },
              ].map((stat) => (
                <div key={stat.label} className="text-center glass-card p-4 animate-fade-up">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{stat.label}</div>
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
      <section className="py-20 md:py-28 bg-[var(--color-bg-card)]">
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
              <div className="rounded-2xl overflow-hidden bg-white border border-[var(--color-border)]">
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
                { icon: "🌱", key: "beginner" },
                { icon: "🧪", key: "interactive" },
                { icon: "🗣️", key: "multilingual" },
                { icon: "💝", key: "free" },
                { icon: "👥", key: "community" },
                { icon: "🌍", key: "practical" },
              ].map((feature) => (
                <div
                  key={feature.key}
                  className="card-hover card-glow p-8 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] animate-fade-up"
                >
                  <div className="text-4xl mb-4 animate-float-slow">{feature.icon}</div>
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
              { slug: "ai-seeds", icon: "🌱", title: "AI Seeds", desc: "Start from zero", color: "#34D399", active: true, level: 1 },
              { slug: "ai-sprouts", icon: "🌿", title: "AI Sprouts", desc: "Build foundations", color: "#60A5FA", active: false, level: 2 },
              { slug: "ai-branches", icon: "🌳", title: "AI Branches", desc: "Apply in practice", color: "#F59E0B", active: false, level: 3 },
              { slug: "ai-canopy", icon: "🏕️", title: "AI Canopy", desc: "Go deep", color: "#8B5CF6", active: false, level: 4 },
              { slug: "ai-forest", icon: "🌲", title: "AI Forest", desc: "Master AI", color: "#EF4444", active: false, level: 5 },
            ].map((program, idx) => (
              <ScrollReveal key={program.slug} animation="fade-up" delay={idx * 80}>
                {program.active ? (
                  <Link href={`${basePath}/programs/${program.slug}`} className="block h-full">
                    <div className="h-full p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] card-hover card-glow text-center">
                      <div className="text-3xl mb-2">{program.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{program.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mb-3">{program.desc}</p>
                      <span className="text-xs font-semibold" style={{ color: program.color }}>Start →</span>
                    </div>
                  </Link>
                ) : (
                  <div className="h-full p-5 rounded-2xl bg-[var(--color-bg-card)]/50 border border-dashed border-[var(--color-border)] text-center opacity-60">
                    <div className="text-3xl mb-2">{program.icon}</div>
                    <h3 className="font-bold text-sm mb-1">{program.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{program.desc}</p>
                    <span className="text-xs text-[var(--color-text-muted)]">🔒 Coming Soon</span>
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
                View All Programs →
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
              <div className="rounded-2xl overflow-hidden bg-white border border-[var(--color-border)]">
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
              { num: "1", key: "step1", color: "bg-blue-500" },
              { num: "2", key: "step2", color: "bg-purple-500" },
              { num: "3", key: "step3", color: "bg-emerald-500" },
              { num: "4", key: "step4", color: "bg-amber-500" },
            ].map((step, idx) => (
              <ScrollReveal key={step.key} animation="slide-left" delay={idx * 100}>
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 ${step.color} text-white rounded-full flex items-center justify-center text-lg font-bold shrink-0 shadow-md`}
                    >
                      {step.num}
                    </div>
                    {idx < 3 && (
                      <div className="w-0.5 h-16 bg-[var(--color-border)]" />
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
      <section className="py-20 md:py-28 bg-[var(--color-bg-card)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal animation="scale-in">
            <div className="mb-6">
              <div className="w-28 h-28 rounded-full mx-auto overflow-hidden border-4 border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 animate-float-slow">
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
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="text-3xl font-bold mb-4">{t("founder.title")}</h2>
            <p className="text-lg text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto mb-8">
              {t("founder.description")}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href={`${basePath}/about`}
                className="btn-primary px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium"
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
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-muted)] mb-8">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`${basePath}/programs/ai-seeds/lessons/what-is-ai`}
                className="btn-primary px-8 py-4 bg-[var(--color-primary)] text-white rounded-2xl text-lg font-semibold shadow-lg shadow-[var(--color-primary)]/25"
              >
                {t("cta.button")} →
              </Link>
              <a
                href="https://github.com/open-ai-school/ai-seeds"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-[var(--color-border)] rounded-2xl text-lg font-semibold hover:border-[var(--color-primary)] transition-all hover:shadow-md"
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
