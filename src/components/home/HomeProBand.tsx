"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useShouldPromptUpgrade } from "@/hooks/useProStatus";

interface HomeProBandProps {
  badge: string;
  heading: string;
  price: string;
  period: string;
  saveNote: string;
  ctaText: string;
  ctaHref: string;
  compareText: string;
}

/**
 * A single compact band offering the paid plan.
 *
 * Deliberately one row rather than a full pricing table: the pricing page
 * already carries the detail, and the home page does not need to repeat it.
 *
 * Hidden from anyone who already pays. The check runs on the client because
 * the home page is statically rendered, and reading the session on the server
 * to decide would make the whole page dynamic for every visitor. It also has
 * to be a fresh read rather than the session role, which is baked into the JWT
 * at sign-in and so goes stale the moment someone subscribes.
 */
export default function HomeProBand({
  badge,
  heading,
  price,
  period,
  saveNote,
  ctaText,
  ctaHref,
  compareText,
}: HomeProBandProps) {
  const showUpgrade = useShouldPromptUpgrade();

  if (!showUpgrade) return null;

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6 sm:px-8 sm:py-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {badge}
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold">{heading}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              <span className="text-base font-semibold text-[var(--color-text)]">
                {price}
              </span>
              <span aria-hidden="true">{period}</span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              {saveNote}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href={ctaHref}
              className="text-sm font-medium text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-text)]"
            >
              {compareText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
