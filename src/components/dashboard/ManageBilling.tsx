"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export function ManageBilling() {
  const t = useTranslations("billing");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });

      if (!res.ok) {
        setError(res.status === 404 ? t("noSubscription") : t("error"));
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-section)] p-5">
      <h3 className="text-base font-semibold mb-1">{t("title")}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        {t("description")}
      </p>

      <button
        onClick={openPortal}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? t("opening") : t("manage")}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
