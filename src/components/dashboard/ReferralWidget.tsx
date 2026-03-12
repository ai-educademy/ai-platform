"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Copy, Check, Share2, Users } from "lucide-react";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulReferrals: number;
}

export function ReferralWidget() {
  const t = useTranslations("referral");
  const { data: session } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    fetch("/api/referrals")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ReferralData | null) => {
        if (json) setData(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  const copyLink = useCallback(async () => {
    if (!data?.referralLink) return;
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = data.referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data?.referralLink]);

  const shareText = "Learn AI for free at AI Educademy! 🚀";

  const shareUrls = data
    ? {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(data.referralLink)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.referralLink)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${data.referralLink}`)}`,
      }
    : null;

  if (!session?.user?.id) return null;

  if (loading) {
    return (
      <div className="relative rounded-2xl p-6 bg-white/5 border border-white/10 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" />
        <div className="h-10 w-full bg-white/10 rounded mb-3" />
        <div className="h-8 w-32 bg-white/10 rounded" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="relative rounded-2xl p-6 overflow-hidden bg-white/5 border border-transparent bg-clip-padding"
      style={{
        backgroundImage:
          "linear-gradient(rgba(10,10,10,0.95), rgba(10,10,10,0.95)), linear-gradient(135deg, #6366f1, #8b5cf6)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        border: "1px solid transparent",
      }}
    >
      {/* Gradient glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <Share2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{t("title")}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t("description")}
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">
          {t("yourLink")}
        </label>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono truncate">
            {data.referralLink}
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all cursor-pointer shrink-0"
            aria-label={copied ? t("copied") : t("copy")}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {t("copied")}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t("copy")}
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Users className="w-4 h-4 text-violet-400" />
          <span className="text-[var(--color-text-muted)]">
            {data.successfulReferrals > 0
              ? t("joinedCount", { count: data.successfulReferrals })
              : t("noReferrals")}
          </span>
        </div>

        {/* Share buttons */}
        {shareUrls && (
          <div className="flex items-center gap-2">
            <a
              href={shareUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
              aria-label={t("shareOn", { platform: t("twitter") })}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t("twitter")}
            </a>
            <a
              href={shareUrls.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
              aria-label={t("shareOn", { platform: t("linkedin") })}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {t("linkedin")}
            </a>
            <a
              href={shareUrls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
              aria-label={t("shareOn", { platform: t("whatsapp") })}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("whatsapp")}
            </a>
          </div>
        )}

        {/* Reward hint */}
        <p className="mt-4 text-xs text-[var(--color-text-muted)] text-center">
          🎁 {t("reward")}
        </p>
      </div>
    </div>
  );
}
