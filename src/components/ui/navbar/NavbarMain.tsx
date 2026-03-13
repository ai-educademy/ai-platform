"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

import { locales } from "@/i18n/request";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeToggle } from "../ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { BrandMark } from "../BrandMark";
import { CommandPalette } from "../CommandPalette";
import { NavDropdown } from "../NavDropdown";
import { AI_PATH, CRAFT_PATH, CAREER_READY_PATH, LAB_EXPERIMENTS } from "./navData";
import { HamburgerIcon } from "./HamburgerIcon";
import { MobileSection } from "./MobileSection";
import { MobilePrograms } from "./MobileMenu";
import { Bookmark } from "lucide-react";
import {
  ProgramsDropdownContent,
  LabDropdownContent,
  AboutDropdownContent,
} from "./dropdowns";

/* ─── Main Navbar component ─── */

export function Navbar() {
  const t = useTranslations("nav");
  const tl = useTranslations("lab");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { profile } = useGuestProfile();
  const { data: session } = useSession();
  const isSignedIn = !!profile || !!session?.user;

  const labTitles: Record<string, string> = {
    "neural-playground": tl("navNeural"),
    "ai-or-human": tl("navAiOrHuman"),
    "prompt-lab": tl("navPromptLab"),
    "image-gen": tl("navImageGen"),
    "sentiment": tl("navSentiment"),
    "chatbot": tl("navChatbot"),
    "ethics-sim": tl("navEthics"),
  };

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0]) ? segments[0] : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  const pathWithoutLocale = locale === "en"
    ? pathname
    : pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

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
            {/* Brand */}
            <Link
              href={`${basePath}/`}
              className="flex items-center shrink-0 group hover:opacity-90 transition-opacity"
            >
              <BrandMark size="sm" />
            </Link>

            {/* ─── Desktop Nav with Mega Dropdowns ─── */}
            <div className="hidden md:flex items-center gap-0.5">
              <NavDropdown
                trigger={t("programs")}
                isActive={isActive("/programs")}
                align="left"
              >
                <ProgramsDropdownContent basePath={basePath} t={t} />
              </NavDropdown>

              <NavDropdown
                trigger={t("lab")}
                isActive={isActive("/lab")}
                align="center"
              >
                <LabDropdownContent basePath={basePath} t={t} />
              </NavDropdown>

              {/* Journey – direct link */}
              <Link
                href={`${basePath}/journey`}
                className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive("/journey")
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.06]"
                }`}
              >
                {t("journey")}
                {isActive("/journey") && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>

              {/* Blog – simple direct link */}
              <Link
                href={`${basePath}/blog`}
                className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive("/blog")
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.06]"
                }`}
              >
                {t("blog")}
                {isActive("/blog") && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>

              <NavDropdown
                trigger={t("about")}
                isActive={isActive("/about")}
                align="center"
              >
                <AboutDropdownContent basePath={basePath} t={t} />
              </NavDropdown>

              {/* Dashboard: simple link (no dropdown) - only when signed in */}
              {isSignedIn && (
                <>
                  <Link
                    href={`${basePath}/bookmarks`}
                    className={`relative px-2.5 py-1.5 rounded-full transition-all duration-200 ${
                      isActive("/bookmarks")
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-text)]/[0.06]"
                    }`}
                    aria-label={t("bookmarks") ?? "Bookmarks"}
                    title={t("bookmarks") ?? "Bookmarks"}
                  >
                    <Bookmark size={16} fill={isActive("/bookmarks") ? "currentColor" : "none"} />
                    {isActive("/bookmarks") && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </Link>
                  <Link
                  href={`${basePath}/dashboard`}
                  className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.06]"
                  }`}
                >
                  {t("dashboard")}
                  {isActive("/dashboard") && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-primary)]" />
                  )}
                </Link>
                </>
              )}
            </div>

            {/* ─── Desktop Actions ─── */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <CommandPalette />
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="w-px h-5 bg-[var(--color-border)] mx-0.5" />
              {isSignedIn ? (
                <UserMenu />
              ) : (
                <div className="hover:scale-[1.04] hover:brightness-110 active:scale-[0.97] transition-transform">
                  <Link
                    href={`${basePath}/signin`}
                    className="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full text-white transition-colors"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
                      boxShadow: "0 2px 8px var(--color-primary-glow)",
                    }}
                  >
                    {t("getStarted")}
                  </Link>
                </div>
              )}
            </div>

            {/* ─── Mobile Actions ─── */}
            <div className="flex items-center gap-2 md:hidden">
              <CommandPalette />
              <ThemeToggle compact />
              <button
                className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-text)]/[0.06] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={t("toggleMenu")}
                aria-expanded={mobileOpen}
              >
                <HamburgerIcon open={mobileOpen} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Drawer Overlay + Panel (CSS animations, no framer-motion) ─── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden animate-navbar-backdrop"
            onClick={closeMobile}
            aria-hidden
          />
          {/* Drawer */}
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm md:hidden overflow-y-auto animate-navbar-drawer"
            style={{
              background: "var(--color-bg)",
              borderLeft: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <BrandMark size="sm" />
              <button
                onClick={closeMobile}
                className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-text)]/[0.06] transition-colors"
                aria-label={t("toggleMenu")}
              >
                <HamburgerIcon open={true} />
              </button>
            </div>

            {/* Drawer sections */}
            <div className="py-2">
              {/* Programs */}
              <MobileSection title={t("programs")} icon="📚">
                <MobilePrograms basePath={basePath} closeMobile={closeMobile} pathLabel={t("aiFoundationsPath")} programs={AI_PATH} trackSlug="ai-learning" />
                <MobilePrograms basePath={basePath} closeMobile={closeMobile} pathLabel={t("aiMasteryPath")} programs={CRAFT_PATH} trackSlug="craft-engineering" />
                <MobilePrograms basePath={basePath} closeMobile={closeMobile} pathLabel={t("careerReadyPath")} programs={CAREER_READY_PATH} trackSlug="career-ready" />
              </MobileSection>

              {/* Lab */}
              <MobileSection title={t("lab")} icon="🧪">
                {LAB_EXPERIMENTS.map((exp) => (
                  <Link
                    key={exp.slug}
                    href={`${basePath}/lab`}
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                  >
                    <span>{exp.icon}</span>
                    <span className="font-medium">{labTitles[exp.slug]}</span>
                  </Link>
                ))}
                <Link
                  href={`${basePath}/mock-interview`}
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                >
                  <span>🎯</span>
                  <span className="font-medium">{t("mockInterview")}</span>
                </Link>
              </MobileSection>

              {/* Journey - simple link */}
              <Link
                href={`${basePath}/journey`}
                onClick={closeMobile}
                className="flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.03] border-b border-[var(--color-border)]/50 transition-colors"
              >
                <span className="text-base">🗺️</span>
                {t("journey")}
              </Link>

              {/* Blog - simple link */}
              <Link
                href={`${basePath}/blog`}
                onClick={closeMobile}
                className="flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.03] border-b border-[var(--color-border)]/50 transition-colors"
              >
                <span className="text-base">📝</span>
                {t("blog")}
              </Link>

              {/* About */}
              <MobileSection title={t("about")} icon="💡">
                <Link
                  href={`${basePath}/about`}
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                >
                  <span>🎯</span>
                  <span className="font-medium">{t("about")}</span>
                </Link>
                <Link
                  href={`${basePath}/contact`}
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                >
                  <span>✉️</span>
                  <span className="font-medium">Contact</span>
                </Link>
                <a
                  href="https://github.com/ai-educademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                >
                  <span>⭐</span>
                  <span className="font-medium">{t("openSource")}</span>
                </a>
              </MobileSection>

              {/* Bookmarks + Dashboard (if signed in) */}
              {isSignedIn && (
                <>
                  <Link
                    href={`${basePath}/bookmarks`}
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.03] border-b border-[var(--color-border)]/50 transition-colors"
                  >
                    <Bookmark size={16} className="shrink-0" />
                    {t("bookmarks") ?? "Bookmarks"}
                  </Link>
                  <Link
                    href={`${basePath}/dashboard`}
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.03] border-b border-[var(--color-border)]/50 transition-colors"
                  >
                    <span className="text-base">📊</span>
                    {t("dashboard")}
                  </Link>
                </>
              )}
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-4 mt-auto border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <LanguageSwitcher />
                {isSignedIn && <UserMenu />}
              </div>
              {!isSignedIn && (
                <Link
                  href={`${basePath}/signin`}
                  onClick={closeMobile}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
                    boxShadow: "0 2px 8px var(--color-primary-glow)",
                  }}
                >
                  {t("getStarted")}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
