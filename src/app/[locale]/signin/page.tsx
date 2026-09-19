"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BrandMark } from "@/components/ui/BrandMark";
import Link from "next/link";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function SignInPage() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const error = params.get("error");
  const verified = params.get("verified");
  const reset = params.get("reset");
  const noMotion = useReducedMotion();

  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credError, setCredError] = useState("");

  const handleOAuth = (provider: string) => {
    setLoading(provider);
    signIn(provider, { callbackUrl });
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");
    setLoading("credentials");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setCredError(t("errorCredentials"));
        setLoading(null);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setCredError(t("errorGeneric"));
      setLoading(null);
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
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
              {t("signIn")}
            </h1>
            <p
              className="text-sm text-[var(--color-text-muted)]"
              style={noMotion ? undefined : { animation: `fade-in 0.5s ease ${400}ms both` }}
            >
              {t("signInPrompt")}
            </p>
          </div>

          {verified && (
            <div
              id="signin-verified-status"
              role="status"
              className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-600 text-center"
              style={{ animation: `fade-up 0.3s ${EASE} both` }}
            >
              {t("emailVerified")}
            </div>
          )}

          {reset && (
            <div
              id="signin-reset-status"
              role="status"
              className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-600 text-center"
              style={{ animation: `fade-up 0.3s ${EASE} both` }}
            >
              {t("passwordResetSuccess")}
            </div>
          )}

          {error && (
            <div
              id="signin-auth-error"
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 text-center"
              style={{ animation: `fade-up 0.3s ${EASE} both` }}
            >
              {error === "OAuthAccountNotLinked"
                ? t("errorOAuth")
                : error === "CredentialsSignin"
                  ? t("errorCredentials")
                  : t("errorGeneric")}
            </div>
          )}

          {credError && (
            <div
              id="signin-credentials-error"
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 text-center"
              style={{ animation: `fade-up 0.3s ${EASE} both` }}
            >
              {credError}
            </div>
          )}

          {/* Email/Password form */}
          <form
            onSubmit={handleCredentials}
            className="space-y-3 mb-5"
            style={anim(450)}
            aria-describedby={credError ? "signin-credentials-error" : undefined}
          >
            <div>
              <label htmlFor="signin-email" className="sr-only">
                {t("email")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                aria-invalid={credError ? true : undefined}
                aria-describedby={credError ? "signin-credentials-error" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="sr-only">
                {t("password")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                required
                aria-invalid={credError ? true : undefined}
                aria-describedby={credError ? "signin-credentials-error" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading !== null}
              className="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-medium text-sm disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20 hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]"
            >
              {loading === "credentials" ? t("signingIn") : t("signIn")}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5" style={anim(480)}>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">{t("orContinueWith")}</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <div className="space-y-3" style={anim(500)}>
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] font-medium text-sm disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/5 hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading === "google" ? "..." : t("continueWithGoogle")}
            </button>

            <button
              onClick={() => handleOAuth("github")}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] font-medium text-sm disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/5 hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {loading === "github" ? "..." : t("continueWithGithub")}
            </button>
          </div>

          <p
            className="text-center text-sm text-[var(--color-text-muted)] mt-5"
            style={noMotion ? undefined : { animation: `fade-in 0.5s ease 700ms both` }}
          >
            {t("noAccount")}{" "}
            <Link
              href="/signup"
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
