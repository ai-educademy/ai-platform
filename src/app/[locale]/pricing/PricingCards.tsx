"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Check, Tag, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { PLAN_PRICE_LABELS, ANNUAL_SAVING_PERCENT } from "@/lib/pricing";
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
          <p className="mt-2 text-center text-xs text-red-500">{t("promoCodeInvalid")}</p>
        )}
      </div>
    </div>
  );
}

/**
 * One selectable plan.
 *
 * Built on a real radio input wrapped in a label rather than a div with an
 * onClick handler. That makes the entire card a click target, and the browser
 * supplies arrow key navigation, roving focus and screen reader semantics for
 * nothing. Previously only the button at the foot of each card did anything,
 * so most of the card looked interactive and was not, and the violet ring on
 * the monthly plan was a hardcoded "most popular" badge that visitors read as
 * a selection they were unable to change.
 */
function SelectablePlanCard({
  title,
  price,
  period,
  features,
  popular,
  plan,
  selected,
  onSelect,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  plan: PaidPlan;
  selected: boolean;
  onSelect: (plan: PaidPlan) => void;
}) {
  const t = useTranslations("pricing");

  return (
    <label
      className={`group relative flex cursor-pointer flex-col rounded-2xl border p-8 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-500 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--color-bg)] ${
        selected
          ? "border-violet-500 shadow-xl shadow-violet-500/10 ring-2 ring-violet-500"
          : "border-[var(--color-border)] hover:border-violet-400 hover:shadow-lg"
      }`}
    >
      <input
        type="radio"
        name="plan"
        value={plan}
        checked={selected}
        onChange={() => onSelect(plan)}
        className="sr-only"
      />

      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {t("mostPopular")}
        </span>
      )}

      <div className="mb-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
          {/* The tick is the only thing that means "selected". The popular
              badge is social proof and must never be mistaken for one, which
              is exactly how the previous design read. */}
          <span
            aria-hidden="true"
            className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              selected
                ? "border-violet-500 bg-violet-500 text-white"
                : "border-[var(--color-border)] group-hover:border-violet-400"
            }`}
          >
            {selected && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tabular-nums text-[var(--color-text)]">
            {price}
          </span>
          {period && <span className="text-sm text-[var(--color-text-muted)]">/{period}</span>}
        </div>
      </div>

      <ul className="flex-1 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-text)]">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <span
        className={`mt-6 block text-center text-xs font-bold uppercase tracking-wider transition-colors ${
          selected ? "text-violet-600" : "text-[var(--color-text-muted)]"
        }`}
      >
        {selected ? t("selected") : t("selectThisPlan")}
      </span>
    </label>
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
          <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-text)]">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" aria-hidden="true" />
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
}: {
  locale: string;
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

  const [selected, setSelected] = useState<PaidPlan>(
    available.includes("monthly") ? "monthly" : available[0]
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "applied" | "invalid">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const basePath = locale === "en" ? "" : `/${locale}`;

  const handleCheckout = async () => {
    setError("");

    if (!session?.user) {
      window.location.href = `${basePath}/signin?callbackUrl=${encodeURIComponent(
        `${basePath}/pricing`
      )}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected, locale, ...(promoCode ? { promoCode } : {}) }),
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
      price: PLAN_PRICE_LABELS.monthly,
      period: t("monthly.period"),
      features: [t("pro.f1"), t("pro.f2"), t("pro.f3"), t("pro.f4"), t("pro.f5"), t("pro.f6")],
      popular: true,
    },
    {
      plan: "annual",
      title: t("annual.title"),
      price: PLAN_PRICE_LABELS.annual,
      period: t("annual.period"),
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
        t("pro.f6"),
        t("annual.save", { percent: ANNUAL_SAVING_PERCENT }),
      ],
    },
    {
      plan: "lifetime",
      title: t("lifetime.title"),
      price: PLAN_PRICE_LABELS.lifetime,
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

  const ctaLabel = {
    monthly: t("monthly.cta"),
    annual: t("annual.cta"),
    lifetime: t("lifetime.cta"),
  }[selected];

  return (
    <div>
      <fieldset className="border-0 p-0">
        <legend className="sr-only">{t("chooseAPlan")}</legend>
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
            price={PLAN_PRICE_LABELS.free}
            features={[t("free.f1"), t("free.f2"), t("free.f3"), t("free.f4"), t("free.f5")]}
          />
          {paidPlans
            .filter((p) => available.includes(p.plan))
            .map((p) => (
              <SelectablePlanCard
                key={p.plan}
                {...p}
                selected={selected === p.plan}
                onSelect={setSelected}
              />
            ))}
        </div>
      </fieldset>

      {/* One checkout action for the page, acting on whatever is selected.
          Each card used to carry its own button, so the page offered four
          competing calls to action with no way to tell which was active. */}
      {!proLoading && isPro ? (
        <p className="mt-8 text-center text-sm font-medium text-emerald-600">{t("alreadyPro")}</p>
      ) : (
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50"
          >
            <Sparkles size={18} aria-hidden="true" />
            {loading ? t("redirecting") : ctaLabel}
          </button>
          <div aria-live="polite">
            {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
          </div>
        </div>
      )}

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
