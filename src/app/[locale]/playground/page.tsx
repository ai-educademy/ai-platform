"use client";

import { useTranslations } from "next-intl";
import { DrawingRecogniser } from "@/components/playground/DrawingRecogniser";
import { ScrollReveal } from "@open-ai-school/ai-ui-library";

export default function PlaygroundPage() {
  const t = useTranslations("playground");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <div className="text-5xl mb-4 animate-float-slow">🎮</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">{t("title")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* Drawing Recogniser */}
      <ScrollReveal animation="scale-in">
        <section className="mb-16 bg-[var(--color-bg-section)] rounded-3xl p-1">
          <div className="gradient-border">
            <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 card-hover">
              <div className="text-4xl mb-4">🎨</div>
              <h2 className="text-xl font-bold mb-2">
                {t("imageClassifier.title")}
              </h2>
              <p className="text-[var(--color-text-muted)] mb-8">
                {t("imageClassifier.description")}
              </p>
              <DrawingRecogniser />
              <details className="mt-6">
                <summary className="cursor-pointer text-[var(--color-primary)] font-medium hover:underline">
                  {t("imageClassifier.howItWorks")}
                </summary>
                <p className="mt-3 text-[var(--color-text-muted)] leading-relaxed p-4 rounded-xl bg-[var(--color-bg)]">
                  {t("imageClassifier.explanation")}
                </p>
              </details>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Sentiment Detector - Placeholder */}
      <ScrollReveal animation="fade-up" delay={100}>
        <section className="mb-16">
          <div className="gradient-border">
            <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 card-hover opacity-75">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-bold mb-2">
                {t("sentiment.title")}
              </h2>
              <p className="text-[var(--color-text-muted)] mb-4">
                {t("sentiment.description")}
              </p>
              <div className="p-6 rounded-xl bg-[var(--color-bg)] text-center text-[var(--color-text-muted)]">
                🚧 {t("sentiment.comingSoon")}{" "}
                <a
                  href="https://github.com/open-ai-school/ai-seeds/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {t("sentiment.contribute")} →
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* More coming soon */}
      <ScrollReveal animation="fade-up" delay={200}>
        <div className="text-center gradient-border">
          <div className="bg-[var(--color-bg-card)] rounded-2xl p-8 card-hover">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-bold mb-2">More Experiments Coming</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              Image classifier, chatbot builder, recommendation engine — all running in your browser.
            </p>
            <a
              href="https://github.com/open-ai-school/ai-seeds/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl px-5 py-2.5 font-semibold shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/40"
            >
              ⭐ Help us build them →
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
