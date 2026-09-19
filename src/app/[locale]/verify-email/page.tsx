"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BrandMark } from "@/components/ui/BrandMark";
import Link from "next/link";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const noMotion = useReducedMotion();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Handle paste of full code
    if (value.length > 1) {
      const chars = value.slice(0, CODE_LENGTH).split("");
      chars.forEach((ch, i) => {
        if (index + i < CODE_LENGTH) newDigits[index + i] = ch;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(index + chars.length, CODE_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = useCallback(async () => {
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("errorGeneric"));
        return;
      }

      setSuccess(t("emailVerified"));
      setTimeout(() => router.push("/signin?verified=1"), 1500);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }, [digits, email, router, t]);

  // Auto-submit when all digits filled
  useEffect(() => {
    if (digits.every((d) => d) && digits.join("").length === CODE_LENGTH) {
      handleSubmit();
    }
  }, [digits, handleSubmit]);

  const handleResend = async () => {
    if (cooldown > 0) return;

    setError("");
    setSuccess("");
    setCooldown(RESEND_COOLDOWN);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(t("codeSent"));
      }
    } catch {
      // Silently fail — cooldown still applies
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
              {t("verifyEmailTitle")}
            </h1>
            <p
              className="text-sm text-[var(--color-text-muted)]"
              style={noMotion ? undefined : { animation: `fade-in 0.5s ease 400ms both` }}
            >
              {t("verifyEmailPrompt")}{" "}
              <strong className="text-[var(--color-text-secondary)]">{email}</strong>
            </p>
          </div>

          {error && (
            <div id="verify-email-error" role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          {success && (
            <div id="verify-email-success" role="status" className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-600 text-center">
              {success}
            </div>
          )}

          <div
            className="flex justify-center gap-2 mb-6"
            style={anim(500)}
            role="group"
            aria-label={t("verifyCode")}
            aria-describedby={error ? "verify-email-error" : success ? "verify-email-success" : undefined}
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={CODE_LENGTH}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                aria-label={`Digit ${i + 1}`}
                aria-invalid={error ? true : undefined}
              />
            ))}
          </div>

          <div className="space-y-3" style={anim(600)}>
            <button
              onClick={handleSubmit}
              disabled={loading || digits.join("").length !== CODE_LENGTH}
              className="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-medium text-sm disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20 hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]"
            >
              {loading ? t("verifying") : t("verifyCode")}
            </button>

            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm font-medium disabled:opacity-50 cursor-pointer transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/5"
            >
              {cooldown > 0 ? t("resendCooldown", { seconds: cooldown }) : t("resendCode")}
            </button>
          </div>

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
