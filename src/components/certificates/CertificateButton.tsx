"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface CertificateButtonProps {
  programSlug: string;
  totalLessons: number;
  completedLessons: number;
  isSignedIn: boolean;
  isPremiumUser?: boolean;
  isFree?: boolean;
  locale?: string;
  programName?: string;
  userName?: string;
  userId?: string;
}

export function CertificateButton({
  programSlug,
  totalLessons,
  completedLessons,
  isSignedIn,
  isPremiumUser = false,
  isFree = false,
  locale = "en",
  programName,
  userName,
  userId,
}: CertificateButtonProps) {
  const t = useTranslations("certificates");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const basePath = locale === "en" ? "" : `/${locale}`;
  const certificateUrl = `https://aieducademy.org${basePath}/achievement/${programSlug}?user=${encodeURIComponent(userName ?? "A Learner")}${userId ? `&uid=${encodeURIComponent(userId)}` : ""}`;
  const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
  linkedInUrl.searchParams.set("startTask", "CERTIFICATION_NAME");
  linkedInUrl.searchParams.set(
    "name",
    `${programName ?? programSlug} Certificate of Completion`,
  );
  linkedInUrl.searchParams.set("organizationName", "AI Educademy");
  linkedInUrl.searchParams.set("issueYear", String(new Date().getFullYear()));
  linkedInUrl.searchParams.set("issueMonth", String(new Date().getMonth() + 1));
  linkedInUrl.searchParams.set("certUrl", certificateUrl);
  linkedInUrl.searchParams.set(
    "certId",
    `${programSlug}-${userId ?? "preview"}`,
  );

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
  const canGetCertificate = isPremiumUser || isFree;

  async function handleDownload() {
    if (!canGetCertificate) {
      router.push(`${basePath}/pricing`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/certificates?programSlug=${encodeURIComponent(programSlug)}`,
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
      // Silently handle. The user sees the button revert to default state.
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-center p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
      {isComplete ? (
        canGetCertificate ? (
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
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <a
                href={certificateUrl}
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                {t("shareCertificate")}
              </a>
              <a
                href={linkedInUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                {t("addToLinkedIn")}
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium mb-3">🎉 {t("completed")}</p>
            <button
              onClick={() => router.push(`${basePath}/pricing`)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-r from-indigo-500 to-violet-600"
            >
              🏆 {t("upgradeToCertificate")}
            </button>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              {t("premiumOnly")}
            </p>
          </>
        )
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          📚 {t("progress", { remaining })}
        </p>
      )}
    </div>
  );
}
