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

  const aiLearningPrograms = [
    { slug: "ai-seeds", icon: "🌱", title: "AI Seeds", color: "#34D399", active: true, level: 1 },
    { slug: "ai-sprouts", icon: "🌿", title: "AI Sprouts", color: "#60A5FA", active: false, level: 2 },
    { slug: "ai-branches", icon: "🌳", title: "AI Branches", color: "#F59E0B", active: false, level: 3 },
    { slug: "ai-canopy", icon: "🏕️", title: "AI Canopy", color: "#8B5CF6", active: false, level: 4 },
    { slug: "ai-forest", icon: "🌲", title: "AI Forest", color: "#EF4444", active: false, level: 5 },
  ];

  const craftPrograms = [
    { slug: "ai-sketch", icon: "✏️", title: "AI Sketch", color: "#F97316", active: true, level: 1, desc: "DSA Fundamentals" },
    { slug: "ai-chisel", icon: "🪨", title: "AI Chisel", color: "#06B6D4", active: true, level: 2, desc: "Intermediate Patterns" },
    { slug: "ai-craft", icon: "⚒️", title: "AI Craft", color: "#8B5CF6", active: true, level: 3, desc: "System Design" },
    { slug: "ai-polish", icon: "💎", title: "AI Polish", color: "#EC4899", active: true, level: 4, desc: "Behavioral" },
    { slug: "ai-masterpiece", icon: "🏆", title: "AI Masterpiece", color: "#EAB308", active: false, level: 5, desc: "Capstone" },
  ];

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

      {/* Programs Section — Two Tracks */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t("programs.title")}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {t("programs.subtitle")}
              </p>
            </div>
          </ScrollReveal>

          {/* Two track cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* AI Learning Path */}
            <ScrollReveal animation="fade-up">
              <div className="gradient-border rounded-2xl h-full">
                <div className="bg-[var(--color-bg-card)] rounded-2xl p-8 h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🌳</span>
                    <h3 className="text-xl font-bold">{tp("trackAI")}</h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-6">{tp("trackAIHome")}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {aiLearningPrograms.map((program) => (
                      program.active ? (
                        <Link key={program.slug} href={`${basePath}/programs/${program.slug}`} className="block">
                          <div className="text-center p-3 rounded-xl border border-[var(--color-border)] card-hover" style={{ borderLeftColor: program.color, borderLeftWidth: 3 }}>
                            <div className="text-2xl mb-1">{program.icon}</div>
                            <div className="text-[10px] font-bold truncate">{program.title.replace("AI ", "")}</div>
                          </div>
                        </Link>
                      ) : (
                        <div key={program.slug} className="text-center p-3 rounded-xl border border-dashed border-[var(--color-border)] opacity-40">
                          <div className="text-2xl mb-1">{program.icon}</div>
                          <div className="text-[10px] font-bold truncate">{program.title.replace("AI ", "")}</div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Craft Engineering */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="gradient-border rounded-2xl h-full">
                <div className="bg-[var(--color-bg-card)] rounded-2xl p-8 h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🔨</span>
                    <h3 className="text-xl font-bold">{tp("trackCraft")}</h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-6">{tp("trackCraftHome")}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {craftPrograms.map((program) => (
                      program.active ? (
                        <Link key={program.slug} href={`${basePath}/programs/${program.slug}`} className="block">
                          <div className="text-center p-3 rounded-xl border border-[var(--color-border)] card-hover" style={{ borderLeftColor: program.color, borderLeftWidth: 3 }}>
                            <div className="text-2xl mb-1">{program.icon}</div>
                            <div className="text-[10px] font-bold truncate">{program.title.replace("AI ", "")}</div>
                          </div>
                        </Link>
                      ) : (
                        <div key={program.slug} className="text-center p-3 rounded-xl border border-dashed border-[var(--color-border)] opacity-40">
                          <div className="text-2xl mb-1">{program.icon}</div>
                          <div className="text-[10px] font-bold truncate">{program.title.replace("AI ", "")}</div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="text-center">
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

      {/* Founder */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <ScrollReveal animation="scale-in">
            <div className="gradient-border rounded-3xl overflow-hidden">
              <div className="bg-[var(--color-bg-card)] p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  {/* Photo */}
                  <div className="shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-xl animate-pulse-glow" />
                      <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-[var(--color-primary)]/30 shadow-2xl">
                        <Image
                          src="/images/founder.jpg"
                          alt="Ramesh Reddy Adutla — Founder of Open AI School"
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                          priority
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">Ramesh Reddy Adutla</h3>
                    <p className="text-[var(--color-primary)] font-semibold mb-4">{t("founder.role")}</p>
                    <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 text-lg">
                      {t("founder.description")}
                    </p>

                    {/* Social links */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      {[
                        { label: "GitHub", href: "https://github.com/rameshreddy-adutla", icon: "🐙" },
                        { label: "LinkedIn", href: "https://linkedin.com/in/rameshreddy-adutla", icon: "💼" },
                        { label: "Dev.to", href: "https://dev.to/rameshreddy-adutla", icon: "📝" },
                        { label: "Buy me a coffee", href: "https://buymeacoffee.com/rameshreddyadutla", icon: "☕" },
                      ].map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-section)] border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all hover:shadow-md"
                        >
                          <span>{link.icon}</span> {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="mt-8 pt-8 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { value: "Decade+", label: t("founder.statYears") },
                    { value: "3", label: t("founder.statCountries") },
                    { value: "5", label: t("founder.statLanguages") },
                    { value: "100%", label: t("founder.statFree") },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-xl font-bold text-gradient">{stat.value}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="text-center mt-8">
              <Link
                href={`${basePath}/about`}
                className="text-[var(--color-primary)] font-semibold hover:underline"
              >
                {t("founder.cta")} →
              </Link>
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
