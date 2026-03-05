"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGuestProfile } from "@/hooks/useGuestProfile";

export function SignInModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { saveProfile } = useGuestProfile();
  const t = useTranslations("auth");
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      saveProfile(name.trim());
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border)] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-8 pt-10 pb-6 text-center bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent">
            <div className="text-5xl mb-4 animate-float-slow">🎓</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Open AI School</h2>
            <p className="text-[var(--color-text-muted)] text-sm">
              Tell us your name to save your learning progress
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="mb-6">
              <label
                htmlFor="guest-name"
                className="block text-sm font-medium mb-2"
              >
                What should we call you?
              </label>
              <input
                ref={inputRef}
                id="guest-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-lg"
                autoComplete="name"
                maxLength={50}
              />
            </div>

            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="w-full btn-primary py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {t("startLearning")} →
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-3 py-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {t("skipForNow")}
            </button>

            <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
              {t("progressSavedLocally")}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
