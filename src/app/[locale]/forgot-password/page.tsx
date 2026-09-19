"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BrandMark } from "@/components/ui/BrandMark";
import Link from "next/link";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const noMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(t("emailRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("errorGeneric"));
        return;
      }

      setSuccess(t("resetLinkSent"));
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const anim = (delay: number) =>
    noMotion
      ? undefined
      : {
          opacity: 1,
          transform: "none",
          animation: `fade-up 0.6s ${EASE} ${delay}ms both`,
        };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[var(--color-primary)] opacity-[0.06] blur-[80px] pointer-events-none" />

      <div
        className="w-full max-w-sm relative"
        style={noMotion ? undefined : { animation: `scale-in 0.6s ${EASE} both` }}
      >
        <div className="glass rounded-3xl p-8 border border-[var(--color-glass-border)] shadow-lg">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-5" style={anim(200)}>
              <BrandMark size="lg" />
            </div>
            <h1
              className="text-2xl font-bold mb-1.5 text-gradient"
              style={anim(300)}
            >
              {t("forgotPasswordTitle")}
            </h1>
            <p
              className="text-sm text-[var(--color-text-muted)]"
              style={noMotion ? undefined : { animation: `fade-in 0.5s ease 400ms both` }}
            >
              {t("forgotPasswordPrompt")}
            </p>
          </div>

          {error && (
            <div id="forgot-password-error" role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          {success && (
            <div id="forgot-password-success" role="status" className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-600 text-center">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-3"
            style={anim(500)}
            aria-describedby={error ? "forgot-password-error" : success ? "forgot-password-success" : undefined}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
                {t("email")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "forgot-password-error" : success ? "forgot-password-success" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-medium text-sm disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20 hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]"
            >
              {loading ? t("sending") : t("sendResetLink")}
            </button>
          </form>

          <p
            className="text-center text-sm text-[var(--color-text-muted)] mt-5"
            style={noMotion ? undefined : { animation: `fade-in 0.5s ease 700ms both` }}
          >
            <Link
              href="/signin"
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              {t("backToSignIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
