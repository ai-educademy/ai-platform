"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Check, Tag, ChevronDown, ChevronUp } from "lucide-react";

function PromoCodeInput({
  promoCode,
  setPromoCode,
  promoStatus,
}: {
  promoCode: string;
  setPromoCode: (v: string) => void;
  promoStatus: "idle" | "applied" | "invalid";
}) {
  const t = useTranslations("pricing");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-violet-600 transition-colors mx-auto"
      >
        <Tag className="w-3.5 h-3.5" />
        {t("promoCode")}
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      {expanded && (
        <div className="mt-3 flex items-center gap-2 max-w-xs mx-auto">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder={t("promoCodePlaceholder")}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
      )}
      {promoStatus === "applied" && (
        <p className="mt-2 text-xs text-emerald-600 text-center font-medium">
          ✓ {t("promoCodeApplied")}
        </p>
      )}
      {promoStatus === "invalid" && (
        <p className="mt-2 text-xs text-red-500 text-center">
          {t("promoCodeInvalid")}
        </p>
      )}
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  popular,
  plan,
  locale,
  promoCode,
  onPromoInvalid,
  onPromoApplied,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
  plan: "free" | "monthly" | "annual" | "lifetime";
  locale: string;
  promoCode: string;
  onPromoInvalid: () => void;
  onPromoApplied: () => void;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (plan === "free") return;
    setError("");

    if (!session?.user) {
      const basePath = locale === "en" ? "" : `/${locale}`;
      window.location.href = `${basePath}/signin?callbackUrl=${encodeURIComponent(`${basePath}/pricing`)}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, locale, ...(promoCode ? { promoCode } : {}) }),
      });
      const data = await res.json();
      if (data.url) {
        if (promoCode) onPromoApplied();
        window.location.href = data.url;
      } else {
        setError(data.error || "Could not create checkout session. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        popular
          ? "border-violet-500 shadow-xl shadow-violet-500/10 scale-[1.02]"
          : "border-[var(--color-border)]"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
          Most Popular
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-[var(--color-text)]">
            {price}
          </span>
          {period && (
            <span className="text-[var(--color-text-muted)] text-sm">
              /{period}
            </span>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-text)]">
            <Check className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={plan === "free" || loading}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
          popular
            ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/25"
            : plan === "free"
              ? "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] cursor-default"
              : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-violet-500 hover:text-violet-600"
        } disabled:opacity-50`}
      >
        {loading ? "Redirecting…" : cta}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}

export function PricingCards({ locale }: { locale: string }) {
  const t = useTranslations("pricing");
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "applied" | "invalid">("idle");

  const plans = [
    {
      title: t("free.title"),
      price: "£0",
      period: "",
      plan: "free" as const,
      features: [
        t("free.f1"),
        t("free.f2"),
        t("free.f3"),
        t("free.f4"),
        t("free.f5"),
      ],
      cta: t("free.cta"),
    },
    {
      title: t("monthly.title"),
      price: "£3.99",
      period: t("monthly.period"),
      plan: "monthly" as const,
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
        t("pro.f6"),
      ],
      cta: t("monthly.cta"),
      popular: true,
    },
    {
      title: t("annual.title"),
      price: "£29.99",
      period: t("annual.period"),
      plan: "annual" as const,
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
        t("pro.f6"),
        t("annual.save"),
      ],
      cta: t("annual.cta"),
    },
    {
      title: t("lifetime.title"),
      price: "£49.99",
      period: "",
      plan: "lifetime" as const,
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
        t("pro.f6"),
        t("lifetime.forever"),
      ],
      cta: t("lifetime.cta"),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <PricingCard
            key={p.plan}
            {...p}
            locale={locale}
            promoCode={promoCode}
            onPromoInvalid={() => setPromoStatus("invalid")}
            onPromoApplied={() => setPromoStatus("applied")}
          />
        ))}
      </div>
      <PromoCodeInput
        promoCode={promoCode}
        setPromoCode={(v) => {
          setPromoCode(v);
          setPromoStatus("idle");
        }}
        promoStatus={promoStatus}
      />
    </div>
  );
}
