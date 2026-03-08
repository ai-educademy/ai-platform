"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { motion } from "framer-motion";

export default function OfflinePage() {
  const t = useTranslations("pwa");
  const locale = useLocale();

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-[var(--color-bg)]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rounded-full bg-[var(--color-bg-card)] p-6 mb-6">
        <WifiOff className="h-12 w-12 text-[var(--color-text-muted)]" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-3 text-[var(--color-text)]">
        {t("offline")}
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-md mb-8">
        {t("offlineMessage")}
      </p>
      <Link
        href={`/${locale}`}
        className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
      >
        {t("goHome")}
      </Link>
    </motion.div>
  );
}
