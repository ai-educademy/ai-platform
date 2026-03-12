"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { LAB_EXPERIMENTS } from "../navData";

export function LabDropdownContent({ basePath, t }: { basePath: string; t: (key: string) => string }) {
  const tl = useTranslations("lab");
  const labTitles: Record<string, string> = {
    "neural-playground": tl("navNeural"),
    "ai-or-human": tl("navAiOrHuman"),
    "prompt-lab": tl("navPromptLab"),
    "image-gen": tl("navImageGen"),
    "sentiment": tl("navSentiment"),
    "chatbot": tl("navChatbot"),
    "ethics-sim": tl("navEthics"),
  };
  return (
    <div className="w-[320px] p-4">
      <div className="flex items-center justify-between px-3 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t("lab")}
        </h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {t("experimentsLoaded")}
        </span>
      </div>
      <div className="space-y-0.5">
        {LAB_EXPERIMENTS.map((exp) => (
          <Link
            key={exp.slug}
            href={`${basePath}/lab`}
            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
           
          >
            <span className="text-base shrink-0">{exp.icon}</span>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {labTitles[exp.slug]}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50 px-3 space-y-2">
        <Link
          href={`${basePath}/mock-interview`}
          className="flex items-center gap-3 py-2 px-0 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
        >
          <span className="text-base shrink-0">🎯</span>
          <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
            {t("mockInterview")}
          </span>
        </Link>
        <Link
          href={`${basePath}/lab`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
         
        >
          {t("enterLab")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
