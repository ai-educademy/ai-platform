"use client";

import { useState } from "react";
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

      router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
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
              {t("signUpTitle")}
            </h1>
            <p
              className="text-sm text-[var(--color-text-muted)]"
              style={noMotion ? undefined : { animation: `fade-in 0.5s ease 400ms both` }}
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

          <form onSubmit={handleSubmit} className="space-y-3" style={anim(500)} aria-describedby={error ? "signup-error" : undefined}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
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
                aria-describedby={error ? "signup-error" : undefined}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
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
            style={noMotion ? undefined : { animation: `fade-in 0.5s ease 700ms both` }}
          >
            {t("hasAccount")}{" "}
            <Link
              href="/signin"
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
