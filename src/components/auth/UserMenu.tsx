"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserMenu() {
  const { data: session } = useSession();
  const { profile, clearProfile, isSignedIn: isGuestSignedIn } = useGuestProfile();
  const t = useTranslations("auth");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const allLocales = ["en", "fr", "nl", "hi", "te"];
  const segments = pathname.split("/");
  const locale = allLocales.includes(segments[1]) ? segments[1] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  // Prefer NextAuth session, fall back to guest profile
  const user = session?.user;
  const isSignedIn = !!user || isGuestSignedIn;
  const displayName = user?.name || profile?.name || t("learner");
  const avatar = user?.image || null;
  const displayAvatar = profile?.avatar || "👤";
  const email = user?.email || null;

  if (!isSignedIn) {
    return (
      <Link
        href={`${basePath}/signin`}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label={t("signIn")}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden sm:inline">{t("signIn")}</span>
      </Link>
    );
  }

  const handleSignOut = () => {
    if (user) {
      nextAuthSignOut({ callbackUrl: "/" });
    } else {
      clearProfile();
    }
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-full hover:bg-[var(--color-bg-card)] transition-colors"
        aria-label="User menu"
      >
        {avatar ? (
          <img src={avatar} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <span className="text-xl">{displayAvatar}</span>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        <svg className="w-3 h-3 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl z-50 animate-scale-in origin-top-right">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img src={avatar} alt="" className="w-9 h-9 rounded-full" />
                ) : (
                  <span className="text-2xl">{displayAvatar}</span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {email || (profile?.username ? `@${profile.username}` : t("guestLearner"))}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href={`${basePath}/dashboard`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg)] transition-colors"
            >
              <span>📊</span> My Progress
            </Link>
            <Link
              href={`${basePath}/programs`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg)] transition-colors"
            >
              <span>📚</span> All Programs
            </Link>
            <div className="border-t border-[var(--color-border)] mt-1 pt-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
              >
                <span>👋</span> {t("signOut")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
