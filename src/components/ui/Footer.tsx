"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { ArrowUp } from "lucide-react";
import { locales } from "@/i18n/request";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { BrandMark } from "./BrandMark";
import { PageViewCounter } from "./PageViewCounter";

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const cls =
    "group relative inline-block text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors";
  const underline = (
    <span className="absolute -bottom-px left-0 h-px w-0 bg-[var(--color-primary)] transition-all duration-300 ease-out group-hover:w-full" />
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        {underline}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
      {underline}
    </Link>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const { data: session } = useSession();
  const { profile } = useGuestProfile();
  const isSignedIn = !!session?.user || !!profile;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0])
    ? segments[0]
    : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-40px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer
      ref={ref}
      className="relative border-t border-[var(--color-border)] bg-[var(--color-bg-section)]"
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-10 ${
            isInView && !prefersReducedMotion ? "footer-revealed" : ""
          }`}
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 footer-item" style={prefersReducedMotion ? undefined : { transitionDelay: "50ms" }}>
            <Link
              href={`${basePath}/`}
              className="inline-flex items-center mb-3 hover:opacity-90 transition-opacity"
            >
              <BrandMark size="sm" />
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed">
              {t("license")}
            </p>
            <div className="mt-3">
              <PageViewCounter />
            </div>
          </div>

          {/* Learn */}
          <div className="footer-item" style={prefersReducedMotion ? undefined : { transitionDelay: "150ms" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
              {t("learnHeader")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <FooterLink href={`${basePath}/programs`}>
                  {t("programs")}
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${basePath}/programs/ai-seeds`}>
                  {t("lessons")}
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${basePath}/lab`}>{t("lab")}</FooterLink>
              </li>
              {isSignedIn && (
                <li>
                  <FooterLink href={`${basePath}/dashboard`}>
                    {t("dashboard")}
                  </FooterLink>
                </li>
              )}
            </ul>
          </div>

          {/* Community */}
          <div className="footer-item" style={prefersReducedMotion ? undefined : { transitionDelay: "250ms" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
              {t("communityHeader")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <FooterLink href="https://github.com/ai-educademy" external>
                  {t("github")}
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  href="https://github.com/ai-educademy/ai-platform/blob/main/CONTRIBUTING.md"
                  external
                >
                  {t("contributing")}
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  href="https://github.com/ai-educademy/ai-platform/blob/main/CODE_OF_CONDUCT.md"
                  external
                >
                  {t("coc")}
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${basePath}/about`}>
                  {t("about")}
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${basePath}/faq`}>
                  {t("faq")}
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-item" style={prefersReducedMotion ? undefined : { transitionDelay: "350ms" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
              {t("supportHeader")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://buymeacoffee.com/rameshreddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-block text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("buyMeACoffee")}{" "}
                  <span className="inline-block transition-transform duration-300 group-hover:animate-bounce">
                    ☕
                  </span>
                  <span className="absolute -bottom-px left-0 h-px w-0 bg-[var(--color-primary)] transition-all duration-300 ease-out group-hover:w-full" />
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Floating back-to-top button - fixed to viewport */}
      <button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          })
        }
        className={`fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full
          bg-[var(--color-primary)] text-white
          dark:bg-white dark:text-[var(--color-primary)]
          shadow-lg shadow-[var(--color-primary)]/30 dark:shadow-black/20
          hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer
          ${showBackToTop ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-60 pointer-events-none"}`}
        aria-label={t("scrollToTop")}
      >
        <ArrowUp className="w-7 h-7 stroke-[2.5]" />
      </button>
    </footer>
  );
}
