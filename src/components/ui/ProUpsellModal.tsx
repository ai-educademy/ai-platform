"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles, Check, X, ArrowRight } from "lucide-react";
import { locales } from "@/i18n/locales";
import {
  getPlanPriceLabels,
  resolvePricingCurrency,
  PRICING_TRIAL_DAYS,
} from "@/lib/pricing";

interface ProUpsellModalProps {
  /**
   * Called whenever the modal is dismissed, by the close button, the Escape
   * key, a click on the backdrop, or following the call to action. The flag
   * reports whether the viewer ticked "do not show again", so a dismissal by
   * any route still honours the preference.
   */
  onClose: (dontShowAgain: boolean) => void;
}

/**
 * A one-time promotion of the paid plan.
 *
 * Only ever rendered for signed-out or free viewers (the gate lives in the lazy
 * wrapper), so it never nags a subscriber. Closable four ways on purpose: the
 * cross, Escape, a click outside, and the call to action. Focus is trapped
 * while open and restored to wherever it was on close, and body scroll is
 * locked so the page behind does not move.
 */
export function ProUpsellModal({ onClose }: ProUpsellModalProps) {
  const t = useTranslations("proUpsell");
  const tPricing = useTranslations("pricing");
  const locale = useLocale();
  const headingId = useId();
  const descId = useId();

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Kept in a ref so the keydown handler always closes with the latest choice
  // without needing to re-bind the listener every time the checkbox changes.
  const dontShowAgainRef = useRef(dontShowAgain);
  dontShowAgainRef.current = dontShowAgain;

  const basePath = (locales as readonly string[]).includes(locale)
    ? locale === "en"
      ? ""
      : `/${locale}`
    : "";

  const monthlyPrice = getPlanPriceLabels(
    resolvePricingCurrency(locale),
  ).monthly;

  const benefits = [
    tPricing("pro.f1"),
    tPricing("pro.f2"),
    tPricing("pro.f3"),
    tPricing("pro.f4"),
    tPricing("pro.f5"),
    tPricing("pro.f6"),
  ];

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(dontShowAgainRef.current);
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    // Focus the dialog itself first so a screen reader announces the heading,
    // rather than jumping straight onto the call to action.
    requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
    // onClose is stable (memoised by the caller); intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pro-upsell-fade"
      onClick={() => onClose(dontShowAgain)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="pro-upsell-pop relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl outline-none"
      >
        <button
          type="button"
          onClick={() => onClose(dontShowAgain)}
          aria-label={t("closeLabel")}
          className="absolute end-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-section)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Header band: the one place the accent runs full-bleed. */}
        <div
          className="px-7 pb-6 pt-8 sm:px-9"
          style={{
            background:
              "radial-gradient(120% 140% at 50% 0%, var(--color-primary-glow) 0%, transparent 70%)",
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("badge")}
          </span>

          <h2
            id={headingId}
            className="mt-4 text-2xl font-extrabold leading-tight text-[var(--color-text)] sm:text-3xl"
          >
            {t("headingLead")}{" "}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-transparent">
              {t("headingHighlight")}
            </span>
          </h2>

          <p
            id={descId}
            className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)]"
          >
            {t("subheading")}
          </p>
        </div>

        <div className="px-7 sm:px-9">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-sm text-[var(--color-text)]"
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: "var(--color-primary-glow)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-7 pb-7 pt-6 sm:px-9">
          <p className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text)]">
              {t("trialLead", { days: PRICING_TRIAL_DAYS })}
            </span>{" "}
            {t("trialThen", { price: monthlyPrice })}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`${basePath}/pricing`}
              onClick={() => onClose(dontShowAgain)}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              {t("cta")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <button
              type="button"
              onClick={() => onClose(dontShowAgain)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              {t("dismiss")}
            </button>
          </div>

          {/* Present but deliberately quiet: small, muted, below the fold of the
              call to action so it never competes with it. */}
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-muted)]/80">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />
            {t("dontShowAgain")}
          </label>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

export default ProUpsellModal;
