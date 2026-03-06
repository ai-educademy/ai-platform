"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function ShareButton() {
  const tc = useTranslations("community");

  return (
    <button
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.share) {
          navigator.share({
            title: "Open AI School",
            text: "Free AI education for everyone",
            url: "https://openaischool.vercel.app",
          });
        } else {
          navigator.clipboard?.writeText("https://openaischool.vercel.app");
        }
      }}
      className="w-full flex items-center gap-4 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] card-hover text-left cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
        <Share2 size={20} className="text-violet-500" />
      </div>
      <div>
        <h4 className="text-sm font-bold">{tc("share")}</h4>
        <p className="text-xs text-[var(--color-text-muted)]">{tc("shareDesc")}</p>
      </div>
    </button>
  );
}
