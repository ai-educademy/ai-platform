"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCountry } from "@/hooks/useCountry";
import {
  TOOLS,
  TOOL_CATEGORIES,
  resolveOfferUrl,
  sortForRegion,
  type ToolCategory,
} from "@/lib/tools";
import { AffiliateLink } from "./AffiliateLink";

type Filter = ToolCategory | "all";

function useCountryName(country: string | null, locale: string): string | null {
  return useMemo(() => {
    if (!country) return null;
    try {
      return (
        new Intl.DisplayNames([locale], { type: "region" }).of(country) ?? null
      );
    } catch {
      return country;
    }
  }, [country, locale]);
}

/**
 * The interactive tools directory.
 *
 * Client-rendered so it can read the visitor's country (via the geo cookie) and
 * order offers by region without making the page dynamic. Category filtering is
 * local state; the grid itself is plain, comparison-friendly cards.
 */
export function ToolsDirectory() {
  const t = useTranslations("tools");
  const locale = useLocale();
  const { country, region } = useCountry();
  const countryName = useCountryName(country, locale);
  const [filter, setFilter] = useState<Filter>("all");

  const ordered = useMemo(() => sortForRegion(TOOLS, region), [region]);
  const visible = useMemo(
    () => (filter === "all" ? ordered : ordered.filter((x) => x.category === filter)),
    [ordered, filter],
  );

  const filters: Filter[] = ["all", ...TOOL_CATEGORIES];

  return (
    <div>
      {countryName && (
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          {t("regionNote", { country: countryName })}
        </p>
      )}

      <div
        role="tablist"
        aria-label={t("filterLabel")}
        className="mb-8 flex flex-wrap gap-2"
      >
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                active
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg-section)] text-[var(--color-text)] hover:bg-[var(--color-primary)]/10"
              }`}
            >
              {f === "all" ? t("all") : t(`categories.${f}`)}
            </button>
          );
        })}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((tool) => (
          <li key={tool.id}>
            <AffiliateLink
              href={resolveOfferUrl(tool, region)}
              showIcon={false}
              aria-label={t("visitAria", { name: tool.name })}
              className="group flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-bg-section)] text-2xl"
                  aria-hidden="true"
                >
                  {tool.icon}
                </span>
                {tool.badge && (
                  <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {tool.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[var(--color-text)]">
                {tool.name}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {tool.blurb}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
                {t("visit")}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </AffiliateLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToolsDirectory;
