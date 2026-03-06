import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { CourseProgress } from "@open-ai-school/ai-ui-library";
import { WelcomeBanner } from "@open-ai-school/ai-ui-library";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";
import { ComingSoonCard } from "@/components/ui/ComingSoon";
import { FloatingParticles } from "@open-ai-school/ai-ui-library";
import { getProgramsByTrack } from "@/lib/programs";
import { MessageCircle, Star, Mail } from "lucide-react";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const tp = await getTranslations("homePrograms");
  const tc = await getTranslations("community");
  const basePath = locale === "en" ? "" : `/${locale}`;

  const programDescKeys: Record<string, string> = {
    "ai-seeds": "startFromZero",
    "ai-sprouts": "buildFoundations",
    "ai-branches": "applyInPractice",
    "ai-canopy": "goDeep",
    "ai-forest": "masterAI",
  };

  const aiLearningPrograms = getProgramsByTrack("ai-learning").map((p) => ({
    slug: p.slug,
    icon: p.icon,
    title: p.title,
    color: p.color,
    active: p.status === "active",
    level: p.level,
  }));

  const craftPrograms = getProgramsByTrack("craft-engineering").map((p) => ({
    slug: p.slug,
    icon: p.icon,
    title: p.title,
    color: p.color,
    active: p.status === "active",
    level: p.level,
    desc: p.subtitle,
  }));

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center">
        <FloatingParticles />
        <div className="absolute inset-0 bg-grid" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
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
            <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: "300ms" }}>
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
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
                {t("hero.ctaSecondary")} →
              </Link>
            </div>

            {/* Progress tracker (shows only when user has started) */}
            <CourseProgress totalLessons={3} basePath={basePath} />
            <WelcomeBanner basePath={basePath} />
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Programs Section — Two Tracks */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t("programs.title")}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {t("programs.subtitle")}
              </p>
            </div>
          </ScrollReveal>

          {/* Two track cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
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
                        <ComingSoonCard key={program.slug} icon={program.icon} label={program.title.replace("AI ", "")} />
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
                        <ComingSoonCard key={program.slug} icon={program.icon} label={program.title.replace("AI ", "")} />
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

      {/* Interactive Preview */}
      <section className="py-12 md:py-16 bg-[var(--color-bg-section)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-text-muted)]">{t("journey.title")}</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">{t("journey.subtitle")}</h2>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scale-in">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden shadow-xl">
              <div className="grid md:grid-cols-2">
                {/* Left — Preview content */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-semibold w-fit mb-6">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t("hero.ctaSecondary")}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t("journey.step1.title")}</h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">{t("journey.step1.description")}</p>
                  <div className="space-y-3">
                    {[
                      { icon: "🎮", text: t("journey.step2.title") },
                      { icon: "📊", text: t("journey.step3.title") },
                      { icon: "🧠", text: t("journey.step4.title") },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 text-sm">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[var(--color-text)]">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — CTA card with gradient */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-10 flex flex-col items-center justify-center text-center text-white">
                  <div className="absolute inset-0 bg-grid opacity-10" />
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">AI Playground</h3>
                    <p className="text-indigo-100/80 text-sm mb-6 max-w-xs mx-auto">
                      Sentiment analysis, neural networks, sorting visualisers, and the AI or Human? guessing game.
                    </p>
                    <Link
                      href={`${basePath}/playground`}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                      {t("hero.ctaSecondary")} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Meet the Founder */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-10">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4">Meet the Founder</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gradient">The Person Behind the Platform</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="scale-in">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-section)] border border-[var(--color-border)] shadow-2xl">
              <div className="grid md:grid-cols-[300px_1fr] items-stretch">
                {/* Photo column */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-10 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-5">
                    <div className="absolute -inset-3 rounded-full bg-white/20 blur-xl animate-pulse" />
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl">
                      <Image
                        src="https://avatars.githubusercontent.com/u/134313151?v=4"
                        alt="Ramesh Reddy Adutla — Founder of Open AI School"
                        width={512}
                        height={512}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Ramesh Reddy Adutla</h3>
                  <p className="text-indigo-200 text-sm font-medium mb-5">{t("founder.role")}</p>
                  <div className="flex items-center gap-3">
                    {[
                      { label: "GitHub", href: "https://github.com/rameshreddy-adutla", icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      )},
                      { label: "LinkedIn", href: "https://linkedin.com/in/rameshreddy-adutla", icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      )},
                      { label: "Dev.to", href: "https://dev.to/rameshreddy-adutla", icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.2-.16.29-.45.29-.84v-2.22c0-.39-.1-.67-.29-.84zM0 2.11v19.78A2.11 2.11 0 0 0 2.11 24h19.78A2.11 2.11 0 0 0 24 21.89V2.11A2.11 2.11 0 0 0 21.89 0H2.11A2.11 2.11 0 0 0 0 2.11zm9.48 8.56c0 1.1-.47 2.28-1.92 2.28H5.12V7.05h2.48c1.4 0 1.88 1.18 1.88 2.28v1.34zm3.47 2.28h-2.64V7.05h2.64v1.29h-1.29v1.54h1.24v1.29h-1.24v1.54h1.29v1.24zm3.97-3.57c0-.2-.07-.36-.2-.47s-.3-.17-.51-.17h-.56v4.03h.56c.21 0 .38-.06.51-.17.13-.12.2-.28.2-.47V9.38z"/></svg>
                      )},
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
                        aria-label={link.label}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Content column */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <p className="text-[var(--color-text-muted)] leading-relaxed text-[17px] mb-6">
                    {t("founder.description")}
                  </p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                      { value: "10+", label: "Years in Tech" },
                      { value: "150+", label: "Free Lessons" },
                      { value: "5", label: "Languages" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-3 rounded-xl bg-[var(--color-bg-section)]">
                        <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      href={`${basePath}/about`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
                    >
                      {t("founder.cta")} →
                    </Link>
                    <a
                      href="https://buymeacoffee.com/rameshreddyadutla"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                    >
                      ☕ Buy me a coffee
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Community Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {tc("title")}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {tc("subtitle")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Discussions */}
            <ScrollReveal animation="fade-up">
              <a
                href="https://github.com/orgs/open-ai-school/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] card-hover h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                  <MessageCircle size={24} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{tc("discussions")}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {tc("discussionsDesc")}
                </p>
              </a>
            </ScrollReveal>

            {/* Star on GitHub */}
            <ScrollReveal animation="fade-up" delay={100}>
              <a
                href="https://github.com/open-ai-school/ai-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] card-hover h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center mb-4">
                  <Star size={24} className="text-[var(--color-secondary)]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{tc("star")}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {tc("starDesc")}
                </p>
              </a>
            </ScrollReveal>

            {/* Newsletter */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
                  <Mail size={24} className="text-[var(--color-accent)]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{tc("updates")}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  {tc("updatesDesc")}
                </p>
                <NewsletterSignup />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Final CTA */}
      <section className="py-12 md:py-16 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
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
