import { useTranslations } from "next-intl";
import Image from "next/image";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";

export default function AboutPage() {
  const t = useTranslations("about");

  const timeline = [
    { year: "2011", key: "timeline2011" },
    { year: "2014", key: "timeline2014" },
    { year: "2017", key: "timeline2017" },
    { year: "2019", key: "timeline2019" },
    { year: "2020", key: "timeline2020" },
    { year: "2021", key: "timeline2021" },
    { year: "2024", key: "timeline2024" },
    { year: "2025", key: "timeline2025" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      {/* Header */}
      <ScrollReveal animation="scale-in">
        <div className="text-center mb-16">
          <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 animate-float-slow">
            <Image
              src="/images/hero/founder-avatar.svg"
              alt="Ramesh Reddy Adutla — Founder of Open AI School"
              width={128}
              height={128}
              className="w-full h-full"
              unoptimized
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">Ramesh Reddy Adutla</h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            {t("subtitle")}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {t("locations")}
          </p>
        </div>
      </ScrollReveal>

      {/* Mission */}
      <ScrollReveal animation="fade-up">
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🎯 {t("mission")}
          </h2>
          <p className="text-lg leading-relaxed text-[var(--color-text-muted)] p-6 rounded-2xl glass-card">
            {t("missionText")}
          </p>
        </section>
      </ScrollReveal>

      {/* Story */}
      <ScrollReveal animation="fade-up">
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📖 {t("story")}
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
            <p>{t("storyText1")}</p>
            <p>{t("storyText2")}</p>
            <p className="p-6 rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 border border-[var(--color-primary)]/20 italic">
              {t("storyText3")}
            </p>
            <p>{t("storyText4")}</p>
          </div>
        </section>
      </ScrollReveal>

      {/* Values */}
      <section className="mb-16">
        <ScrollReveal animation="fade-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            💎 {t("values")}
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-6">
          {["value1", "value2", "value3", "value4"].map((key, i) => (
            <ScrollReveal key={key} animation="fade-up" delay={i * 100}>
              <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] card-hover card-glow h-full">
                <div className="text-2xl mb-3">
                  {["🌐", "🤝", "💡", "🔓"][i]}
                </div>
                <h3 className="font-bold text-lg mb-2">{t(`${key}.title`)}</h3>
                <p className="text-[var(--color-text-muted)]">
                  {t(`${key}.description`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <hr className="section-divider mb-16" />

      {/* Timeline */}
      <section className="mb-16">
        <ScrollReveal animation="fade-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🗺️ {t("timeline")}
          </h2>
        </ScrollReveal>
        <div className="space-y-0">
          {timeline.map((item, idx) => (
            <ScrollReveal key={item.year} animation="slide-left" delay={idx * 60}>
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] shrink-0 mt-2 animate-pulse-glow" />
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-[var(--color-border)]" />
                  )}
                </div>
                <div className="pb-6">
                  <span className="text-sm font-bold text-[var(--color-primary)]">
                    {item.year}
                  </span>
                  <p className="text-[var(--color-text-muted)]">{t(item.key)}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <hr className="section-divider mb-16" />

      {/* Connect */}
      <ScrollReveal animation="fade-up">
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔗 {t("connect")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: t("github"), href: "https://github.com/rameshreddy-adutla", icon: "🐙" },
              { label: t("linkedin"), href: "https://linkedin.com/in/rameshreddy-adutla", icon: "💼" },
              { label: t("devto"), href: "https://dev.to/rameshreddy-adutla", icon: "📝" },
              { label: t("sponsor"), href: "https://buymeacoffee.com/rameshreddyadutla", icon: "☕" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-card)] transition-all card-hover card-glow"
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
