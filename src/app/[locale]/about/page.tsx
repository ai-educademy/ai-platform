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
          <div className="relative w-36 h-36 mx-auto mb-6">
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-xl animate-pulse-glow" />
            <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-[var(--color-primary)]/20 shadow-2xl">
              <Image
                src="/images/founder.jpg"
                alt="Ramesh Reddy Adutla — Founder of Open AI School"
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">Ramesh Reddy Adutla</h1>
          <p className="text-lg text-[var(--color-primary)] font-semibold">
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
          <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto p-6 rounded-2xl glass-card">
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
              <div className="gradient-border h-full">
                <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 card-hover card-glow h-full">
                  <div className="text-3xl mb-3">
                    {["🌐", "🤝", "💡", "🔓"][i]}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(`${key}.title`)}</h3>
                  <p className="text-[var(--color-text-muted)]">
                    {t(`${key}.description`)}
                  </p>
                </div>
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
                  <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20 shrink-0 mt-2" />
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-indigo-500 via-violet-500 to-fuchsia-500" />
                  )}
                </div>
                <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)] card-hover mb-2">
                  <span className="text-sm font-bold text-gradient">
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
                className="gradient-border"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-bg-card)] card-hover">
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-bold">{link.label}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
