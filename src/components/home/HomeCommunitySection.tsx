"use client";

import { ScrollReveal } from "@ai-educademy/ai-ui-library";
import { Github, Star } from "lucide-react";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";

interface HomeCommunitySectionProps {
  headline: string;
  subtitle: string;
  openSourceText: string;
}

export default function HomeCommunitySection({
  headline,
  subtitle,
  openSourceText,
}: HomeCommunitySectionProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
      <ScrollReveal animation="fade-up">
        <h2 className="text-3xl sm:text-5xl font-black mb-4 text-gradient-animated">
          {headline}
        </h2>
        <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Newsletter signup - larger, centered */}
        <div className="max-w-md mx-auto mb-8">
          <NewsletterSignup />
        </div>

        {/* GitHub star button with glow */}
        <a
          href="https://github.com/ai-educademy/ai-platform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300"
        >
          <Github size={18} />
          <Star size={14} className="text-amber-400" />
          {openSourceText}
        </a>
      </ScrollReveal>
    </div>
  );
}
