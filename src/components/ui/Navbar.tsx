"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { locales } from "@/i18n/request";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { BrandMark } from "./BrandMark";
import { NavSearch } from "./NavSearch";
import { NavDropdown } from "./NavDropdown";
import programsData from "@data/programs.json";

/* ─── Build program lists from registry ─── */

interface NavProgram {
  slug: string;
  icon: string;
}

const AI_PATH_SLUGS = programsData.tracks.find((t) => t.slug === "ai-learning")?.programs ?? [];
const CRAFT_PATH_SLUGS = programsData.tracks.find((t) => t.slug === "craft-engineering")?.programs ?? [];

function buildNavPrograms(slugs: string[]): NavProgram[] {
  return slugs.map((slug) => {
    const p = programsData.programs[slug as keyof typeof programsData.programs];
    return { slug, icon: p?.icon ?? "📚" };
  });
}

const AI_PATH = buildNavPrograms(AI_PATH_SLUGS);
const CRAFT_PATH = buildNavPrograms(CRAFT_PATH_SLUGS);

const LAB_EXPERIMENTS = [
  { slug: "neural-playground", icon: "🧠", title: "Neural Network Playground" },
  { slug: "ai-or-human", icon: "🤖", title: "AI or Human?" },
  { slug: "prompt-lab", icon: "💬", title: "Prompt Lab" },
  { slug: "image-gen", icon: "🎨", title: "Image Generator" },
  { slug: "sentiment", icon: "😊", title: "Sentiment Analyzer" },
  { slug: "chatbot", icon: "💡", title: "Chatbot Builder" },
  { slug: "ethics-sim", icon: "⚖️", title: "Ethics Simulator" },
];

/* ─── Animated hamburger icon ─── */

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="overflow-visible">
      <motion.line
        x1="3" y1="5" x2="17" y2="5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={open ? { rotate: 45, y: 5, x: 0 } : { rotate: 0, y: 0, x: 0 }}
        style={{ originX: "10px", originY: "10px" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      <motion.line
        x1="3" y1="10" x2="17" y2="10"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.line
        x1="3" y1="15" x2="17" y2="15"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={open ? { rotate: -45, y: -5, x: 0 } : { rotate: 0, y: 0, x: 0 }}
        style={{ originX: "10px", originY: "10px" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
    </svg>
  );
}

/* ─── Mobile expandable section ─── */

function MobileSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--color-border)]/50 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full py-3.5 px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.03] transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          {title}
        </span>
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-[var(--color-text-muted)]"
        >
          <path d="M3.5 5.25L7 8.75L10.5 5.25" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile program list helper ─── */

function MobilePrograms({
  basePath,
  closeMobile,
  pathLabel,
  programs,
}: {
  basePath: string;
  closeMobile: () => void;
  pathLabel: string;
  programs: NavProgram[];
  trackSlug: string;
}) {
  const tP = useTranslations("programs");
  return (
    <div className="mb-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 px-1">
        {pathLabel}
      </p>
      {programs.map((p) => (
        <Link
          key={p.slug}
          href={`${basePath}/programs/${p.slug}`}
          onClick={closeMobile}
          className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
        >
          <span>{p.icon}</span>
          <span className="font-medium">{tP(`${p.slug}.title`)}</span>
        </Link>
      ))}
    </div>
  );
}

/* ─── Dropdown content components ─── */

function ProgramItem({
  slug,
  icon,
  basePath,
  t,
}: {
  slug: string;
  icon: string;
  basePath: string;
  t: (key: string) => string;
}) {
  const title = t(`${slug}.title`);
  const desc = t(`${slug}.homeDesc`);

  const content = (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg transition-colors group/item hover:bg-[var(--color-text)]/[0.04]">
      <span className="text-lg mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
            {title}
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  return (
    <Link href={`${basePath}/programs/${slug}`} role="menuitem">
      {content}
    </Link>
  );
}

function ProgramsDropdownContent({ basePath, t }: { basePath: string; t: (key: string) => string }) {
  const tP = useTranslations("programs");
  return (
    <div className="w-[540px] p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* AI Learning Path */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <span className="text-sm">🌳</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t("aiLearningPath")}
            </h3>
          </div>
          <div className="space-y-0.5">
            {AI_PATH.map((p) => (
              <ProgramItem key={p.slug} slug={p.slug} icon={p.icon} basePath={basePath} t={(k: string) => tP(k)} />
            ))}
          </div>
        </div>
        {/* Craft Engineering Path */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <span className="text-sm">🔨</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t("craftEngineeringPath")}
            </h3>
          </div>
          <div className="space-y-0.5">
            {CRAFT_PATH.map((p) => (
              <ProgramItem key={p.slug} slug={p.slug} icon={p.icon} basePath={basePath} t={(k: string) => tP(k)} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50 px-3">
        <Link
          href={`${basePath}/programs`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          role="menuitem"
        >
          {t("viewAllPrograms")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function LabDropdownContent({ basePath, t }: { basePath: string; t: (key: string) => string }) {
  return (
    <div className="w-[320px] p-4">
      <div className="flex items-center justify-between px-3 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t("lab")}
        </h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {t("experimentsLoaded")}
        </span>
      </div>
      <div className="space-y-0.5">
        {LAB_EXPERIMENTS.map((exp) => (
          <Link
            key={exp.slug}
            href={`${basePath}/lab`}
            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
            role="menuitem"
          >
            <span className="text-base shrink-0">{exp.icon}</span>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {exp.title}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50 px-3">
        <Link
          href={`${basePath}/lab`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          role="menuitem"
        >
          {t("enterLab")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function BlogDropdownContent({ basePath, t }: { basePath: string; t: (key: string) => string }) {
  return (
    <div className="w-[280px] p-4">
      <div className="flex items-center gap-3 px-3 mb-3">
        <span className="text-2xl">📝</span>
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("blog")}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("latestArticles")}</p>
        </div>
      </div>
      <div className="pt-3 border-t border-[var(--color-border)]/50 px-3">
        <Link
          href={`${basePath}/blog`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          role="menuitem"
        >
          {t("readBlog")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function AboutDropdownContent({ basePath, t }: { basePath: string; t: (key: string) => string }) {
  return (
    <div className="w-[300px] p-4">
      <div className="space-y-0.5">
        <Link
          href={`${basePath}/about`}
          className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
          role="menuitem"
        >
          <span className="text-base mt-0.5">🎯</span>
          <div>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {t("mission")}
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("missionDesc")}</p>
          </div>
        </Link>
        <Link
          href={`${basePath}/about`}
          className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
          role="menuitem"
        >
          <span className="text-base mt-0.5">💜</span>
          <div>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {t("values")}
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("valuesDesc")}</p>
          </div>
        </Link>
        <a
          href="https://github.com/ai-educademy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-text)]/[0.04] transition-colors group/item"
          role="menuitem"
        >
          <span className="text-base mt-0.5">⭐</span>
          <div>
            <span className="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors">
              {t("openSource")}
            </span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("openSourceDesc")}</p>
          </div>
        </a>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50 px-3 flex flex-col gap-2">
        <Link
          href={`${basePath}/about`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          role="menuitem"
        >
          {t("meetCreator")}
          <span aria-hidden>→</span>
        </Link>
        <a
          href="https://github.com/ai-educademy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline"
          role="menuitem"
        >
          {t("viewOnGithub")}
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ─── Main Navbar component ─── */

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

              <NavDropdown
                trigger={t("blog")}
                isActive={isActive("/blog")}
                align="center"
              >
                <BlogDropdownContent basePath={basePath} t={t} />
              </NavDropdown>

              <NavDropdown
                trigger={t("about")}
                isActive={isActive("/about")}
                align="center"
              >
                <AboutDropdownContent basePath={basePath} t={t} />
              </NavDropdown>

              {/* Dashboard: simple link (no dropdown) - only when signed in */}
              {isSignedIn && (
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
              )}
            </div>

            {/* ─── Desktop Actions ─── */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <NavSearch />
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="w-px h-5 bg-[var(--color-border)] mx-0.5" />
              {isSignedIn ? (
                <UserMenu />
              ) : (
                <motion.div whileHover={{ scale: 1.04, filter: "brightness(1.1)" }} whileTap={{ scale: 0.97 }}>
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
                </motion.div>
              )}
            </div>

            {/* ─── Mobile Actions ─── */}
            <div className="flex items-center gap-2 md:hidden">
              <NavSearch />
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

      {/* ─── Mobile Drawer Overlay + Panel ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              aria-hidden
            />
            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm md:hidden overflow-y-auto"
              style={{
                background: "var(--color-bg)",
                borderLeft: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-lg)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                  <MobilePrograms basePath={basePath} closeMobile={closeMobile} pathLabel={t("aiLearningPath")} programs={AI_PATH} trackSlug="ai-learning" />
                  <MobilePrograms basePath={basePath} closeMobile={closeMobile} pathLabel={t("craftEngineeringPath")} programs={CRAFT_PATH} trackSlug="craft-engineering" />
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
                      <span className="font-medium">{exp.title}</span>
                    </Link>
                  ))}
                </MobileSection>

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
                    <span className="font-medium">{t("mission")}</span>
                  </Link>
                  <Link
                    href={`${basePath}/about`}
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                  >
                    <span>💜</span>
                    <span className="font-medium">{t("values")}</span>
                  </Link>
                  <a
                    href="https://github.com/ai-educademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.04]"
                  >
                    <span>⭐</span>
                    <span className="font-medium">{t("viewOnGithub")}</span>
                  </a>
                </MobileSection>

                {/* Dashboard (if signed in) */}
                {isSignedIn && (
                  <Link
                    href={`${basePath}/dashboard`}
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 py-3.5 px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-text)]/[0.03] border-b border-[var(--color-border)]/50 transition-colors"
                  >
                    <span className="text-base">📊</span>
                    {t("dashboard")}
                  </Link>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
