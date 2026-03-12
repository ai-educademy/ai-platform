"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CertificateButtonProps {
  programSlug: string;
  totalLessons: number;
  completedLessons: number;
  isSignedIn: boolean;
}

export function CertificateButton({
  programSlug,
  totalLessons,
  completedLessons,
  isSignedIn,
}: CertificateButtonProps) {
  const t = useTranslations("certificates");
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) {
    return (
      <div className="text-center p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-text-muted)]">
          🔒 {t("notSignedIn")}
        </p>
      </div>
    );
  }

  const isComplete = completedLessons >= totalLessons && totalLessons > 0;
  const remaining = totalLessons - completedLessons;

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/certificates?programSlug=${encodeURIComponent(programSlug)}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to generate certificate");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${programSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently handle — user sees the button revert to default state
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-center p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
      {isComplete ? (
        <>
          <p className="text-sm font-medium mb-3">🎉 {t("completed")}</p>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>📜 {t("download")}</>
            )}
          </button>
        </>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          📚 {t("progress", { remaining })}
        </p>
      )}
    </div>
  );
}
