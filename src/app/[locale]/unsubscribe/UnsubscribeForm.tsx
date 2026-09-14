"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Confirmation step for unsubscribing.
 *
 * The button issues the POST. Doing the opt-out on page load would mean any
 * mail client or link scanner that fetches the URL unsubscribes the reader
 * without them ever clicking.
 */
export function UnsubscribeForm({ token }: { token: string }) {
  const t = useTranslations("unsubscribe");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function confirm() {
    setState("sending");
    try {
      const res = await fetch("/api/marketing/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-section)] px-5 py-4">
        <p className="text-sm leading-6 text-[var(--color-text)]">{t("done")}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{t("doneDetail")}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm leading-6 text-[var(--color-text-muted)]">{t("body")}</p>
      <button
        onClick={confirm}
        disabled={state === "sending"}
        className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
      >
        {state === "sending" ? t("working") : t("confirm")}
      </button>
      {state === "error" && (
        <p className="mt-3 text-xs text-red-500">{t("error")}</p>
      )}
    </div>
  );
}
