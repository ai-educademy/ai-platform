"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { locales } from "@/i18n/request";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { BrandMark } from "./BrandMark";
import { NavSearch } from "./NavSearch";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { profile } = useGuestProfile();
  const { data: session } = useSession();
  const isSignedIn = !!profile || !!session?.user;

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  const pathWithoutLocale = locale === "en"
    ? pathname
    : pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `${basePath}/programs`, label: t("programs"), match: "/programs" },
    { href: `${basePath}/lab`, label: t("lab"), match: "/lab" },
    { href: `${basePath}/blog`, label: t("blog"), match: "/blog" },
    { href: `${basePath}/about`, label: t("about"), match: "/about" },
  ];

  if (isSignedIn) {
    links.push({ href: `${basePath}/dashboard`, label: t("dashboard"), match: "/dashboard" });
  }

  function isActive(match: string) {
    if (match === "/") return pathWithoutLocale === "/";
    return pathWithoutLocale.startsWith(match);
  }

  return (
    <div className="sticky top-0 z-50 px-3 sm:px-4 pt-3 pb-1">
      <nav
        className={`max-w-5xl mx-auto rounded-2xl border border-[var(--color-border)] glass transition-shadow duration-300 ${
          scrolled
            ? "shadow-lg shadow-black/[0.06] dark:shadow-black/30"
            : "shadow-sm shadow-black/[0.02] dark:shadow-black/10"
        }`}
      >
        <div className="px-4 sm:px-5">
          <div className="flex items-center justify-between h-13">
            {/* Brand Mark */}
            <Link
              href={`${basePath}/`}
              className="flex items-center shrink-0 group hover:opacity-90 transition-opacity"
            >
              <BrandMark size="sm" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.match}
                  href={link.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.match)
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.06]"
                  }`}
                >
                  {link.label}
                  {isActive(link.match) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-primary)]" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <NavSearch />
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="w-px h-5 bg-[var(--color-border)] mx-0.5" />
              {isSignedIn ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={`${basePath}/signin`}
                    className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full transition-colors"
                  >
                    {t("logIn")}
                  </Link>
                  <Link
                    href={`${basePath}/signin?mode=signup`}
                    className="px-4 py-1.5 text-sm font-semibold rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                  >
                    {t("signUp")}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <NavSearch />
              <ThemeToggle compact />
              <button
                className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-text)]/[0.06] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden mx-3 mb-3 p-2 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] animate-fade-in">
            <div className="space-y-0.5">
              {links.map((link) => (
                <Link
                  key={link.match}
                  href={link.href}
                  className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.match)
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/8"
                      : "text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between px-2">
                <LanguageSwitcher />
                {isSignedIn ? (
                  <UserMenu />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`${basePath}/signin`}
                      className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full transition-colors"
                    >
                      {t("logIn")}
                    </Link>
                    <Link
                      href={`${basePath}/signin?mode=signup`}
                      className="px-4 py-1.5 text-sm font-semibold rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                      {t("signUp")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
