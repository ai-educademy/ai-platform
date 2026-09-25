"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function EmailVerificationBanner() {
  const { data: session } = useSession();
  const t = useTranslations("auth");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const email = session?.user?.email;
  if (!email || session.user.emailVerified !== false) return null;

  const basePath = locale === "en" ? "" : `/${locale}`;
  const verifyHref = `${basePath}/verify-email?email=${encodeURIComponent(email)}`;

  const resend = async () => {
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto mt-3 max-w-6xl px-3 sm:px-4" aria-label={t("verifyBannerTitle")}>
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-[var(--color-text)] shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{t("verifyBannerTitle")}</p>
            <p className="text-[var(--color-text-muted)]">{t("verifyBannerBody")}</p>
            {status === "sent" && (
              <p className="mt-1 text-emerald-600 dark:text-emerald-400">{t("verifyBannerSent")}</p>
            )}
            {status === "error" && (
              <p className="mt-1 text-red-500">{t("verifyBannerError")}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={resend}
              disabled={status === "sending"}
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50"
            >
              {status === "sending" ? t("verifyBannerSending") : t("verifyBannerSend")}
            </button>
            <Link
              href={verifyHref}
              className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              {t("verifyBannerOpen")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
