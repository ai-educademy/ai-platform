"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Check, Tag, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {
  getAnnualSavingPercent,
  getPlanPriceLabels,
  type PricingCurrency,
} from "@/lib/pricing";
import { useProStatus } from "@/hooks/useProStatus";

type PaidPlan = "monthly" | "annual" | "lifetime";

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
        aria-expanded={expanded}
        className="mx-auto flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
      >
        <Tag className="h-3.5 w-3.5" aria-hidden="true" />
        {t("promoCode")}
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
      {expanded && (
        <div className="mx-auto mt-3 flex max-w-xs items-center gap-2">
          <label htmlFor="promo-code" className="sr-only">
            {t("promoCode")}
          </label>
          <input
            id="promo-code"
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder={t("promoCodePlaceholder")}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
      )}
      {/* Announced, because the result of a code only arrives after the
          checkout call and a sighted user sees it appear. */}
      <div aria-live="polite">
        {promoStatus === "applied" && (
          <p className="mt-2 text-center text-xs font-medium text-emerald-600">
            {t("promoCodeApplied")}
          </p>
        )}
        {promoStatus === "invalid" && (
          <p className="mt-2 text-center text-xs text-red-500">
            {t("promoCodeInvalid")}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * One paid plan. The whole card is a single checkout button, so a click
 * anywhere on it goes straight to Stripe (or to sign in first). Selecting a
 * plan and then hunting for a separate, initially disabled button added a
 * step at the exact moment someone had decided to pay.
 */
function PlanCard({
  title,
  price,
  period,
  features,
  popular,
  plan,
  ctaLabel,
  note,
  pending,
  disabled,
  onCheckout,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  plan: PaidPlan;
  ctaLabel: string;
  note?: string;
  pending: boolean;
  disabled: boolean;
  onCheckout: (plan: PaidPlan) => void;
}) {
  const t = useTranslations("pricing");

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border p-8 transition-all focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-bg)] ${
        pending
          ? "border-violet-500 shadow-xl shadow-violet-500/10 ring-2 ring-violet-500"
          : popular
            ? "border-violet-400/70 hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/10"
            : "border-[var(--color-border)] hover:border-violet-400 hover:shadow-lg"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {t("mostPopular")}
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tabular-nums text-[var(--color-text)]">
            {price}
          </span>
          {period && (
            <span className="text-sm text-[var(--color-text-muted)]">
              /{period}
            </span>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-3">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm text-[var(--color-text)]"
          >
            <Check
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* The ::after overlay stretches this button across the card, so the
          card is one real, focusable control rather than a div with onClick. */}
      <button
        type="button"
        onClick={() => onCheckout(plan)}
        disabled={disabled}
        aria-label={`${ctaLabel}: ${title}`}
        data-plan={plan}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 ${
          popular || pending
            ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 group-hover:opacity-90"
            : "border border-violet-500/40 text-violet-600 group-hover:bg-violet-500 group-hover:text-white dark:text-violet-300"
        }`}
      >
        <Sparkles size={16} aria-hidden="true" />
        {pending ? t("redirecting") : ctaLabel}
      </button>
      {note && (
        <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
          {note}
        </p>
      )}
    </article>
  );
}

/** The free tier. Informational: nobody checks out with it. */
function FreePlanCard({
  title,
  price,
  features,
}: {
  title: string;
  price: string;
  features: string[];
}) {
  const t = useTranslations("pricing");
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tabular-nums text-[var(--color-text)]">
            {price}
          </span>
        </div>
      </div>
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm text-[var(--color-text)]"
          >
            <Check
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <p className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">
        {t("free.cta")}
      </p>
    </div>
  );
}

export function PricingCards({
  locale,
  purchasablePlans,
  pricingCurrency = "gbp",
}: {
  locale: string;
  pricingCurrency?: PricingCurrency;
  /**
   * Which plans this deployment can actually charge for. Defaults to all
   * three so existing callers and tests keep their previous behaviour.
   */
  purchasablePlans?: PaidPlan[];
}) {
  const t = useTranslations("pricing");
  const { data: session } = useSession();
  const { isPro, loading: proLoading } = useProStatus();

  const available: PaidPlan[] =
    purchasablePlans && purchasablePlans.length > 0
      ? purchasablePlans
      : (["monthly", "annual", "lifetime"] as PaidPlan[]);

  const [pendingPlan, setPendingPlan] = useState<PaidPlan | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<
    "idle" | "applied" | "invalid"
  >("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const basePath = locale === "en" ? "" : `/${locale}`;
  const priceLabels = getPlanPriceLabels(pricingCurrency);
  const annualSavingPercent = getAnnualSavingPercent(pricingCurrency);

  const handleCheckout = async (plan: PaidPlan) => {
    setError("");
    setPendingPlan(plan);

    if (!session?.user) {
      window.location.href = `${basePath}/signin?callbackUrl=${encodeURIComponent(
        `${basePath}/pricing`,
      )}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          locale,
          ...(promoCode ? { promoCode } : {}),
        }),
      });
      const data = await res.json();
      if (!data.url) {
        setError(data.error || t("checkoutError"));
        return;
      }
      if (promoCode) {
        setPromoStatus(data.promoApplied === true ? "applied" : "invalid");
        // Stripe accepted the session but ignored the code. Redirecting here
        // would charge full price while the customer believes a discount
        // applied, so stop and let them correct it or retry without a code.
        if (data.promoApplied !== true) return;
      }
      window.location.href = data.url;
    } catch {
      setError(t("genericError"));
    } finally {
      setLoading(false);
      setPendingPlan(null);
    }
  };

  const paidPlans: {
    plan: PaidPlan;
    title: string;
    price: string;
    period: string;
    features: string[];
    popular?: boolean;
  }[] = [
    {
      plan: "monthly",
      title: t("monthly.title"),
      price: priceLabels.monthly,
      period: t("monthly.period"),
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
        t("pro.f6"),
      ],
      popular: true,
    },
    {
      plan: "annual",
      title: t("annual.title"),
      price: priceLabels.annual,
      period: t("annual.period"),
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
        t("pro.f6"),
        t("annual.save", { percent: annualSavingPercent }),
      ],
    },
    {
      plan: "lifetime",
      title: t("lifetime.title"),
      price: priceLabels.lifetime,
      period: "",
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
        t("pro.f6"),
        t("lifetime.forever"),
      ],
    },
  ];

  const ctaFor: Record<PaidPlan, string> = {
    monthly: t("trialCta"),
    annual: t("trialCta"),
    lifetime: t("lifetime.cta"),
  };
  const alreadyPro = !proLoading && isPro;

  return (
    <div>
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
          available.length === 3
            ? "lg:grid-cols-4"
            : available.length === 2
              ? "lg:grid-cols-3"
              : "lg:grid-cols-2"
        }`}
      >
        <FreePlanCard
          title={t("free.title")}
          price={priceLabels.free}
          features={[
            t("free.f1"),
            t("free.f2"),
            t("free.f3"),
            t("free.f4"),
            t("free.f5"),
          ]}
        />
        {paidPlans
          .filter((p) => available.includes(p.plan))
          .map((p) => (
            <PlanCard
              key={p.plan}
              {...p}
              ctaLabel={ctaFor[p.plan]}
              note={p.plan === "lifetime" ? t("lifetime.note") : undefined}
              pending={pendingPlan === p.plan}
              disabled={loading || alreadyPro}
              onCheckout={handleCheckout}
            />
          ))}
      </div>

      <div className="mt-8 flex flex-col items-center">
        {alreadyPro ? (
          <p className="text-center text-sm font-medium text-emerald-600">
            {t("alreadyPro")}
          </p>
        ) : (
          <p className="max-w-md text-center text-sm text-[var(--color-text-muted)]">
            {t("trialNote")}
          </p>
        )}
        <div aria-live="polite">
          {error && (
            <p className="mt-3 text-center text-sm text-red-500">{error}</p>
          )}
        </div>
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
