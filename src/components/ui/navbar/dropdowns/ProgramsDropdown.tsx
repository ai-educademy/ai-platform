"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { AI_PATH, CRAFT_PATH, CAREER_READY_PATH } from "../navData";
import { ProgramItem } from "./ProgramItem";

export function ProgramsDropdownContent({ basePath, t }: { basePath: string; t: (key: string) => string }) {
  const tP = useTranslations("programs");
  return (
    <div className="w-[min(780px,calc(100vw-2rem))] p-4">
      <div className="grid grid-cols-3 gap-4">
        {/* AI Foundations */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <span className="text-sm">🌳</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t("aiFoundationsPath")}
            </h3>
          </div>
          <div className="space-y-0.5">
            {AI_PATH.map((p) => (
              <ProgramItem key={p.slug} slug={p.slug} icon={p.icon} basePath={basePath} t={(k: string) => tP(k)} />
            ))}
          </div>
        </div>
        {/* AI Mastery */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <span className="text-sm">🔨</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t("aiMasteryPath")}
            </h3>
          </div>
          <div className="space-y-0.5">
            {CRAFT_PATH.map((p) => (
              <ProgramItem key={p.slug} slug={p.slug} icon={p.icon} basePath={basePath} t={(k: string) => tP(k)} />
            ))}
          </div>
        </div>
        {/* Career Ready */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <span className="text-sm">🚀</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t("careerReadyPath")}
            </h3>
          </div>
          <div className="space-y-0.5">
            {CAREER_READY_PATH.map((p) => (
              <ProgramItem key={p.slug} slug={p.slug} icon={p.icon} basePath={basePath} t={(k: string) => tP(k)} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50 px-3">
        <Link
          href={`${basePath}/programs`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
         
        >
          {t("viewAllPrograms")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
