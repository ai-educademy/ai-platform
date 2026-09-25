"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

interface PaywallProps {
  programSlug: string;
  programTitle: string;
  programColor: string;
  lessonTitle: string;
  locale: string;
}

export function Paywall({
  programTitle,
  programColor,
  lessonTitle,
  locale,
}: PaywallProps) {
  const t = useTranslations("paywall");
  const tPreview = useTranslations("lessonPreview");
  const { data: session } = useSession();
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="lesson-paywall relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-12 text-center">
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${programColor}, transparent)`,
        }}
      />

      <div className="relative z-10">
        {/* Lock icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
          <svg
            className="h-8 w-8 text-[var(--color-primary)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-balance">
          {tPreview("lockedTitle", { lessonTitle })}
        </h2>

        <p className="text-[var(--color-text-muted)] mb-2 text-lg">
          <span className="font-semibold" style={{ color: programColor }}>
            {lessonTitle}
          </span>{" "}
          {t("isPartOf")} <span className="font-semibold">{programTitle}</span>
        </p>

        <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
          {tPreview("lockedDescription", { lessonTitle, programTitle })}
        </p>

        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto text-sm">
          {(["allPrograms", "progressSync", "certificates"] as const).map(
            (feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 justify-center"
              >
                <svg
                  className="h-4 w-4 text-green-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t(`features.${feature}`)}</span>
              </div>
            ),
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`${basePath}/pricing`}
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold text-base hover:opacity-90 transition-opacity"
          >
            {t("upgradeCta")}
          </Link>
          {!session && (
            <Link
              href={`${basePath}/signin`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-[var(--color-border)] text-[var(--color-text)] font-medium text-base hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              {t("signInCta")}
            </Link>
          )}
        </div>

        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          {t("guarantee")}
        </p>
      </div>
    </div>
  );
}
