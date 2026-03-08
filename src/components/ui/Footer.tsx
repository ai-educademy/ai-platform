"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { locales } from "@/i18n/request";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { BrandMark } from "./BrandMark";
import { PageViewCounter } from "./PageViewCounter";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
  const prefersReducedMotion = useReducedMotion();

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0])
    ? segments[0]
    : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease },
    },
  };

  return (
    <footer
      ref={ref}
      className="relative border-t border-[var(--color-border)] bg-[var(--color-bg-section)]"
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
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
          </motion.div>

          {/* Learn */}
          <motion.div variants={itemVariants}>
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
          </motion.div>

          {/* Community */}
          <motion.div variants={itemVariants}>
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
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
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
          </motion.div>
        </motion.div>

      </div>

      {/* Floating back-to-top button - fixed to viewport */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? "auto" : "smooth",
              })
            }
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full
              bg-[var(--color-primary)] text-white
              dark:bg-white dark:text-[var(--color-primary)]
              shadow-lg shadow-[var(--color-primary)]/30 dark:shadow-black/20
              hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            aria-label="Scroll to top"
            initial={{ opacity: 0, y: 24, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            whileHover={prefersReducedMotion ? undefined : { y: -3 }}
          >
            <ArrowUp className="w-7 h-7 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
