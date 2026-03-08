"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_KEY = "aieducademy-newsletter";

function saveToLocalStorage(email: string) {
  try {
    const existing: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    if (!existing.includes(email)) {
      existing.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {
    // localStorage unavailable
  }
}

export function NewsletterSignup() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t("subscriptionFailed"));
      }
      saveToLocalStorage(email);
      setSubscribed(true);
    } catch {
      // Fallback to localStorage if API fails
      saveToLocalStorage(email);
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <motion.p
        className="text-center font-semibold text-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {t("success")}
      </motion.p>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
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
            disabled={loading}
            className="w-full pl-9 pr-3 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[48px] disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all cursor-pointer whitespace-nowrap min-h-[48px] disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t("subscribe")}
        </button>
      </div>
      {error && (
        <p className="text-sm text-[var(--color-secondary)]">{error}</p>
      )}
    </motion.form>
  );
}
