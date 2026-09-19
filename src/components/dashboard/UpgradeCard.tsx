"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles, Check } from "lucide-react";
import { PLAN_PRICE_LABELS } from "@/lib/pricing";

/**
 * The upgrade offer on the dashboard.
 *
 * The dashboard previously showed every signed-in person the billing portal
 * button, which for somebody without a subscription opens nothing and reports
 * "no subscription". So the one screen a learner returns to every day spent
 * its only commercial slot on a dead control, and offered no way to buy. This
 * takes that slot for anyone who is not yet Pro.
 *
 * Reuses the paywall copy, which is already translated into all 11 locales.
 */
export function UpgradeCard() {
  const t = useTranslations("paywall");
  const tp = useTranslations("pricing");
  const locale = useLocale();
  const basePath = locale === "en" ? "" : `/${locale}`;

  const features = [
    t("features.allPrograms"),
    t("features.progressSync"),
    t("features.certificates"),
  ];

  return (
    <div className="rounded-xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-violet-500/[0.07] to-indigo-500/[0.07] p-5">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
        <h3 className="text-base font-semibold">{t("upgradeCta")}</h3>
      </div>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">{t("description")}</p>

      <ul className="mb-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`${basePath}/pricing`}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      >
        {t("upgradeCta")}
        <span className="font-semibold opacity-90">
          {PLAN_PRICE_LABELS.monthly}/{tp("monthly.period")}
        </span>
      </Link>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t("guarantee")}</p>
    </div>
  );
}
