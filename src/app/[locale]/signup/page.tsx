"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BrandMark } from "@/components/ui/BrandMark";
import Link from "next/link";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export default function SignUpPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const noMotion = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const basePath = locale === "en" ? "" : `/${locale}`;
  const onboardingUrl = `${basePath}/onboarding`;

  const validate = (): string | null => {
    if (name.trim().length < 2) return t("nameMinLengthTwo");
    if (name.trim().length > 50) return t("nameMaxLength");
    if (!EMAIL_RE.test(email.trim())) return t("emailInvalid");
    if (!PASSWORD_RE.test(password)) return t("passwordRequirements");
    if (password.length < 8) return t("passwordMinLength");
    if (password !== confirmPassword) return t("passwordsDoNotMatch");
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("errorGeneric"));
        return;
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: onboardingUrl,
      });

      if (result?.error) {
        router.push(
          `${basePath}/signin?callbackUrl=${encodeURIComponent(onboardingUrl)}`,
        );
        return;
      }

      router.push(onboardingUrl);
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
    <div className="min-h-[80vh] w-full max-w-[100vw] flex items-center justify-start sm:justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[var(--color-primary)] opacity-[0.06] blur-[80px] pointer-events-none" />

      <div
        className="w-full sm:max-w-sm relative"
        style={{
          maxWidth: "min(24rem, calc(100vw - 2rem))",
          ...(noMotion ? {} : { animation: `scale-in 0.6s ${EASE} both` }),
        }}
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
              {t("signUpTitle")}
            </h1>
            <p
              className="text-sm text-[var(--color-text-muted)]"
              style={
                noMotion
                  ? undefined
                  : { animation: `fade-in 0.5s ease 400ms both` }
              }
            >
              {t("signUpPrompt")}
            </p>
          </div>

          {error && (
            <div
              id="signup-error"
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 text-center"
              style={{ animation: `fade-up 0.3s ${EASE} both` }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setOauthLoading(true);
              signIn("google", { callbackUrl: onboardingUrl });
            }}
            disabled={loading || oauthLoading}
            className="mb-4 w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white text-slate-900 border border-[var(--color-border)] font-semibold text-sm disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/10 hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]"
            style={anim(450)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {oauthLoading ? "..." : t("continueWithGoogle")}
          </button>

          <div className="flex items-center gap-3 mb-4" style={anim(480)}>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">
              {t("orContinueWithEmail")}
            </span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3"
            style={anim(500)}
            aria-describedby={error ? "signup-error" : undefined}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]"
              >
                {t("name")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "signup-error" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]"
              >
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
                aria-describedby={error ? "signup-error" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]"
              >
                {t("password")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "signup-error" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]"
              >
                {t("confirmPassword")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmPasswordPlaceholder")}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "signup-error" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-medium text-sm disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20 hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]"
            >
              {loading ? t("creatingAccount") : t("signUpButton")}
            </button>
          </form>

          <p
            className="text-center text-sm text-[var(--color-text-muted)] mt-5"
            style={
              noMotion
                ? undefined
                : { animation: `fade-in 0.5s ease 700ms both` }
            }
          >
            {t("hasAccount")}{" "}
            <Link
              href={`${basePath}/signin`}
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
