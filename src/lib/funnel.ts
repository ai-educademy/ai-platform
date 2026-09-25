import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { funnelEvents } from "@/lib/db/schema";

export type FunnelEventName =
  | "signup_completed"
  | "signin"
  | "lesson_viewed"
  | "lesson_completed"
  | "paywall_viewed"
  | "pricing_viewed"
  | "checkout_started"
  | "checkout_completed"
  | "trial_started"
  | "subscription_cancelled"
  | "referral_link_shared";

export interface FunnelEventInput {
  userId?: string | null;
  anonId?: string | null;
  locale?: string | null;
  path?: string | null;
  programSlug?: string | null;
  lessonSlug?: string | null;
  plan?: string | null;
  country?: string | null;
}

export interface FunnelSummary {
  days: number;
  current: FunnelSummaryWindow;
  previous: FunnelSummaryWindow;
  weekOnWeek: Record<keyof Omit<FunnelSummaryWindow, "activationRate">, number | null>;
}

export interface FunnelSummaryWindow {
  visitors: number;
  signups: number;
  activationRate: number;
  paywallViews: number;
  checkoutStarts: number;
  trials: number;
  paid: number;
  churn: number;
}

function normalise(value: string | null | undefined, max = 200): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function getHeader(headersList: Headers, name: string): string | null {
  return normalise(headersList.get(name));
}

function isDoNotTrack(headersList: Headers): boolean {
  return headersList.get("dnt") === "1" || headersList.get("sec-gpc") === "1";
}

async function requestHeaders(): Promise<Headers> {
  try {
    return await headers();
  } catch {
    return new Headers();
  }
}

function anonymise(headersList: Headers): string {
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = headersList.get("user-agent") ?? "unknown";
  const salt = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "ai-educademy";
  return createHash("sha256").update(`${salt}|${ip}|${ua}`).digest("hex").slice(0, 32);
}

async function writeEvent(event: FunnelEventName, input: FunnelEventInput = {}): Promise<void> {
  const headersList = await requestHeaders();
  if (!input.userId && isDoNotTrack(headersList)) return;

  await db.insert(funnelEvents).values({
    event,
    userId: normalise(input.userId, 128),
    anonId: normalise(input.anonId, 128) ?? anonymise(headersList),
    locale: normalise(input.locale, 16),
    path: normalise(input.path ?? getHeader(headersList, "x-pathname") ?? getHeader(headersList, "referer"), 500),
    programSlug: normalise(input.programSlug, 120),
    lessonSlug: normalise(input.lessonSlug, 120),
    plan: normalise(input.plan, 80),
    country: normalise(input.country ?? getHeader(headersList, "x-vercel-ip-country"), 8),
  });
}

export function trackEvent(event: FunnelEventName, input: FunnelEventInput = {}): void {
  void writeEvent(event, input).catch((error) => {
    console.error("[funnel] trackEvent failed:", error);
  });
}

export async function trackEventForTest(event: FunnelEventName, input: FunnelEventInput = {}): Promise<void> {
  await writeEvent(event, input).catch((error) => {
    console.error("[funnel] trackEvent failed:", error);
  });
}

function pct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function getFunnelSummary(days = 7): Promise<FunnelSummary> {
  const safeDays = Math.max(1, Math.min(90, Math.floor(days)));
  const [row] = await db
    .select({
      current_visitors: sql<number>`COUNT(DISTINCT ${funnelEvents.anonId}) FILTER (WHERE ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      current_signups: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'signup_completed' AND ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      current_lesson_completed: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'lesson_completed' AND ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      current_paywall_views: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'paywall_viewed' AND ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      current_checkout_starts: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'checkout_started' AND ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      current_trials: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'trial_started' AND ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      current_paid: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'checkout_completed' AND ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      current_churn: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'subscription_cancelled' AND ${funnelEvents.createdAt} >= now() - (${safeDays} * interval '1 day'))::int`,
      previous_visitors: sql<number>`COUNT(DISTINCT ${funnelEvents.anonId}) FILTER (WHERE ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
      previous_signups: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'signup_completed' AND ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
      previous_lesson_completed: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'lesson_completed' AND ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
      previous_paywall_views: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'paywall_viewed' AND ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
      previous_checkout_starts: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'checkout_started' AND ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
      previous_trials: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'trial_started' AND ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
      previous_paid: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'checkout_completed' AND ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
      previous_churn: sql<number>`COUNT(*) FILTER (WHERE ${funnelEvents.event} = 'subscription_cancelled' AND ${funnelEvents.createdAt} >= now() - (${safeDays * 2} * interval '1 day') AND ${funnelEvents.createdAt} < now() - (${safeDays} * interval '1 day'))::int`,
    })
    .from(funnelEvents);

  const current: FunnelSummaryWindow = {
    visitors: row?.current_visitors ?? 0,
    signups: row?.current_signups ?? 0,
    activationRate: row?.current_signups ? Math.round(((row.current_lesson_completed ?? 0) / row.current_signups) * 1000) / 10 : 0,
    paywallViews: row?.current_paywall_views ?? 0,
    checkoutStarts: row?.current_checkout_starts ?? 0,
    trials: row?.current_trials ?? 0,
    paid: row?.current_paid ?? 0,
    churn: row?.current_churn ?? 0,
  };
  const previous: FunnelSummaryWindow = {
    visitors: row?.previous_visitors ?? 0,
    signups: row?.previous_signups ?? 0,
    activationRate: row?.previous_signups ? Math.round(((row.previous_lesson_completed ?? 0) / row.previous_signups) * 1000) / 10 : 0,
    paywallViews: row?.previous_paywall_views ?? 0,
    checkoutStarts: row?.previous_checkout_starts ?? 0,
    trials: row?.previous_trials ?? 0,
    paid: row?.previous_paid ?? 0,
    churn: row?.previous_churn ?? 0,
  };

  return {
    days: safeDays,
    current,
    previous,
    weekOnWeek: {
      visitors: pct(current.visitors, previous.visitors),
      signups: pct(current.signups, previous.signups),
      paywallViews: pct(current.paywallViews, previous.paywallViews),
      checkoutStarts: pct(current.checkoutStarts, previous.checkoutStarts),
      trials: pct(current.trials, previous.trials),
      paid: pct(current.paid, previous.paid),
      churn: pct(current.churn, previous.churn),
    },
  };
}
