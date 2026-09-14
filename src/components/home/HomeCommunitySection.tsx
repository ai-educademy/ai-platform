"use client";

import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Star, Globe } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons/GithubIcon";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import GitHubStatsWidget from "@/components/home/GitHubStatsWidget";

interface HomeCommunitySectionProps {
  headline: string;
  subtitle: string;
  openSourceText: string;
  newsletterTitle?: string;
  githubTitle?: string;
}

export default function HomeCommunitySection({
  headline,
  subtitle,
  openSourceText,
  newsletterTitle,
  githubTitle,
}: HomeCommunitySectionProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
      {/* Header */}
      <div
        className="text-center mb-10"
        style={{
          opacity: inView || reduced ? 1 : 0,
          transform: inView || reduced ? "translateY(0)" : "translateY(30px)",
          transition: reduced ? "none" : "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <h2 className="text-3xl sm:text-5xl font-black mb-4 text-gradient-animated">
          {headline}
        </h2>
        <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Newsletter */}
        <div
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] backdrop-blur-sm p-8 hover-lift transition-all duration-300"
          style={{
            opacity: inView || reduced ? 1 : 0,
            transform: inView || reduced ? "translateX(0)" : "translateX(-20px)",
            transition: reduced ? "none" : "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 200ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) 200ms",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Globe size={20} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              {newsletterTitle ?? "Join 11 languages of learners"}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Get the latest lessons, tips, and updates delivered to your inbox.
          </p>
          <NewsletterSignup />
        </div>

        {/* Right: GitHub */}
        <div
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] backdrop-blur-sm p-8 hover-lift transition-all duration-300 flex flex-col"
          style={{
            opacity: inView || reduced ? 1 : 0,
            transform: inView || reduced ? "translateX(0)" : "translateX(20px)",
            transition: reduced ? "none" : "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 300ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) 300ms",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <GithubIcon size={20} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              {githubTitle ?? "Open Source & Transparent"}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Every line of code is open. Star us, fork us, or contribute.
          </p>

          <div className="mb-6">
            <GitHubStatsWidget />
          </div>

          <a
            href="https://github.com/ai-educademy/ai-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300 self-start"
          >
            <Star size={14} className="text-amber-400" />
            {openSourceText}
          </a>
        </div>
      </div>

      {/* Floating emojis (reduced-motion safe) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden motion-safe-only" aria-hidden="true">
        {["🧠", "🚀", "💡", "🌍"].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-lg opacity-10 animate-float-slow"
            style={{
              left: `${10 + i * 22}%`,
              top: `${15 + (i % 2) * 60}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${7 + i}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
