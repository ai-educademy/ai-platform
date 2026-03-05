"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGuestProfile } from "@/hooks/useGuestProfile";

type Tab = "signIn" | "signUp";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all";

export function SignInModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { signIn, signUp } = useGuestProfile();
  const t = useTranslations("auth");
  const [tab, setTab] = useState<Tab>("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, tab]);

  // Reset form when tab changes
  useEffect(() => {
    setUsername("");
    setPassword("");
    setDisplayName("");
    setError("");
  }, [tab]);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username.trim().length < 3) { setError(t("usernameMinLength")); return; }
    if (password.length < 6) { setError(t("passwordMinLength")); return; }
    const result = signIn(username.trim(), password);
    if (result.success) { onClose(); }
    else { setError(t(result.error as "invalidCredentials")); }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username.trim().length < 3) { setError(t("usernameMinLength")); return; }
    if (password.length < 6) { setError(t("passwordMinLength")); return; }
    if (displayName.trim().length < 2) { setError(t("nameMinLength")); return; }
    const result = signUp(username.trim(), password, displayName.trim());
    if (result.success) { onClose(); }
    else { setError(t(result.error as "usernameTaken")); }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border)] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-8 pt-10 pb-6 text-center bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent">
            <div className="text-5xl mb-4 animate-float-slow">🎓</div>
            <h2 className="text-2xl font-bold mb-2">Open AI School</h2>
            <p className="text-[var(--color-text-muted)] text-sm">
              {t("signInPrompt")}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 mt-2 mb-4 rounded-xl bg-[var(--color-bg)] p-1 border border-[var(--color-border)]">
            {(["signIn", "signUp"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTab(v)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === v
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {t(v)}
              </button>
            ))}
          </div>

          {/* Sign In Form */}
          {tab === "signIn" && (
            <form onSubmit={handleSignIn} className="px-8 pb-8 space-y-4">
              <div>
                <label htmlFor="si-username" className="block text-sm font-medium mb-1.5">
                  {t("username")}
                </label>
                <input
                  ref={firstInputRef}
                  id="si-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("signInPlaceholder")}
                  className={inputClass}
                  autoComplete="username"
                  maxLength={30}
                />
              </div>
              <div>
                <label htmlFor="si-password" className="block text-sm font-medium mb-1.5">
                  {t("password")}
                </label>
                <input
                  id="si-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("signInPasswordPlaceholder")}
                  className={inputClass}
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                className="w-full btn-primary py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("signIn")}
              </button>
              <p className="text-center text-sm text-[var(--color-text-muted)]">
                {t("noAccount")}{" "}
                <button type="button" onClick={() => setTab("signUp")} className="text-[var(--color-primary)] font-medium cursor-pointer">
                  {t("signUp")}
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {tab === "signUp" && (
            <form onSubmit={handleSignUp} className="px-8 pb-8 space-y-4">
              <div>
                <label htmlFor="su-username" className="block text-sm font-medium mb-1.5">
                  {t("username")}
                </label>
                <input
                  ref={firstInputRef}
                  id="su-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("usernamePlaceholder")}
                  className={inputClass}
                  autoComplete="username"
                  maxLength={30}
                />
              </div>
              <div>
                <label htmlFor="su-displayname" className="block text-sm font-medium mb-1.5">
                  {t("displayName")}
                </label>
                <input
                  id="su-displayname"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className={inputClass}
                  autoComplete="name"
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="su-password" className="block text-sm font-medium mb-1.5">
                  {t("password")}
                </label>
                <input
                  id="su-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className={inputClass}
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                className="w-full btn-primary py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("signUp")}
              </button>
              <p className="text-center text-sm text-[var(--color-text-muted)]">
                {t("hasAccount")}{" "}
                <button type="button" onClick={() => setTab("signIn")} className="text-[var(--color-primary)] font-medium cursor-pointer">
                  {t("signIn")}
                </button>
              </p>
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                {t("progressSavedLocally")}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
