"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";

const STORAGE_KEY = "open-ai-school-newsletter";

export function NewsletterSignup() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("invalidEmail"));
      return;
    }

    const existing: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    if (!existing.includes(email)) {
      existing.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <p className="text-center font-semibold text-lg">{t("success")}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full pl-9 pr-3 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[48px]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all cursor-pointer whitespace-nowrap min-h-[48px]"
        >
          {t("subscribe")}
        </button>
      </div>
      {error && (
        <p className="text-sm text-[var(--color-secondary)]">{error}</p>
      )}
    </form>
  );
}
