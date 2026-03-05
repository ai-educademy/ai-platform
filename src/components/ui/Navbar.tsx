"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { locales } from "@/i18n/request";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect locale from pathname
  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  // Strip locale prefix for route matching
  const pathWithoutLocale = locale === "en"
    ? pathname
    : pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { href: `${basePath}/`, label: t("home"), match: "/" },
    { href: `${basePath}/programs`, label: t("programs"), match: "/programs" },
    { href: `${basePath}/playground`, label: t("playground"), match: "/playground" },
    { href: `${basePath}/dashboard`, label: t("dashboard"), match: "/dashboard" },
    { href: `${basePath}/about`, label: t("about"), match: "/about" },
  ];

  function isActive(match: string) {
    if (match === "/") return pathWithoutLocale === "/";
    return pathWithoutLocale.startsWith(match);
  }

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href={`${basePath}/`}
            className="flex items-center gap-2 font-semibold text-base shrink-0"
          >
            <span className="text-xl">🎓</span>
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent whitespace-nowrap">
              Open AI School
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.match}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.match)
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/8"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
            <UserMenu />
            <Link
              href={`${basePath}/programs/ai-seeds`}
              className="ml-1 px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium hover:brightness-110 transition-all active:scale-95 whitespace-nowrap"
            >
              {t("getStarted")}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] transition-colors"
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

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-[var(--color-border)]">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.match}
                  href={link.href}
                  className={`block py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.match)
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/8"
                      : "text-[var(--color-text)] hover:bg-[var(--color-bg-card)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 px-4">
              <Link
                href={`${basePath}/programs/ai-seeds`}
                className="block w-full text-center px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium"
              >
                {t("getStarted")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
