"use client";

import { useTranslations } from "next-intl";

export function ComingSoonCard({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  const t = useTranslations("ui");
  return (
    <div
      className="text-center p-3 rounded-xl border border-dashed border-[var(--color-border)] opacity-60 hover:opacity-80 hover:border-indigo-400 transition-all w-full"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-[10px] font-bold truncate">{label}</div>
      <div className="text-[8px] text-[var(--color-text-muted)]">{t("comingSoon")}</div>
    </div>
  );
}

export function ComingSoonProgramCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("ui");
  return (
    <div
      className="block h-full text-left w-full hover:opacity-80 transition-opacity"
    >
      {children}
    </div>
  );
}
