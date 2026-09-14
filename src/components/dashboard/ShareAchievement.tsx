"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Share2, X, Copy, Check } from "lucide-react";

interface ShareAchievementProps {
  programSlug: string;
  programName: string;
  userName: string;
}

const SITE_URL = "https://aieducademy.org";

export function ShareAchievement({ programSlug, programName, userName }: ShareAchievementProps) {
  const t = useTranslations("dashboard");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${SITE_URL}/achievement/${programSlug}?user=${encodeURIComponent(userName)}`;

  const tweetText = t("shareTweet", { program: programName });

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-section)] hover:border-[var(--color-primary)]/40 transition-all cursor-pointer"
        aria-label={t("shareAchievement")}
        aria-expanded={open}
      >
        <Share2 size={14} />
        {t("shareAchievement")}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[260px] p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/80 backdrop-blur-xl shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--color-bg-section)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={14} className="text-[var(--color-text-muted)]" />
          </button>

          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-3">
            {t("shareModalTitle")}
          </p>

          <div className="flex items-center gap-2">
            {/* Twitter/X */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--color-bg-section)] hover:bg-[var(--color-bg-section)]/80 border border-transparent hover:border-[var(--color-border)] transition-all group"
              aria-label={t("shareOnTwitter")}
            >
              <svg className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]  transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                {t("shareOnTwitter")}
              </span>
            </a>

            {/* LinkedIn */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--color-bg-section)] hover:bg-[var(--color-bg-section)]/80 border border-transparent hover:border-[var(--color-border)] transition-all group"
              aria-label={t("shareOnLinkedin")}
            >
              <svg className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[#0A66C2] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                {t("shareOnLinkedin")}
              </span>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--color-bg-section)] hover:bg-[var(--color-bg-section)]/80 border border-transparent hover:border-[var(--color-border)] transition-all group cursor-pointer"
              aria-label={t("copyLink")}
            >
              {copied ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <Copy size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors" />
              )}
              <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                {copied ? t("linkCopied") : t("copyLink")}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
