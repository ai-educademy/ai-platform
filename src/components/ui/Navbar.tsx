"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { locales } from "@/i18n/request";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { BrandMark } from "./BrandMark";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { profile } = useGuestProfile();

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

  if (profile) {
    links.push({ href: `${basePath}/dashboard`, label: t("dashboard"), match: "/dashboard" });
  }

  function isActive(match: string) {
    if (match === "/") return pathWithoutLocale === "/";
    return pathWithoutLocale.startsWith(match);
  }

  return (
    <nav className={`sticky top-0 z-50 glass border-b border-[var(--color-border)] transition-shadow duration-300 ${scrolled ? "shadow-md shadow-black/[0.04] dark:shadow-black/20" : ""}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
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
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isActive(link.match)
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold"
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
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact />
            <button
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] transition-colors"
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
          <div className="md:hidden pb-3 pt-1 mt-1 bg-[var(--color-bg-card)] rounded-xl shadow-lg border border-[var(--color-border)] animate-fade-in">
            <div className="space-y-0.5 px-2">
              {links.map((link) => (
                <Link
                  key={link.match}
                  href={link.href}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.match)
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/8"
                      : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 px-2 pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <UserMenu />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
