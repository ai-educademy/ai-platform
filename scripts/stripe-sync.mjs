/**
 * Keeps the Stripe account in step with the code, on every production build.
 *
 *   1. The referral promotion code (STRIPE_REFERRAL_PROMO_CODE, default
 *      GIVEAMONTH) exists: 100% off once, restricted to the monthly product.
 *   2. The production webhook endpoint subscribes to every event the handler
 *      in src/app/api/stripe/webhook/route.ts relies on.
 *
 * Idempotent, and never fails the build: a Stripe outage must not block a
 * deploy. The outcome is written to "stripe_sync_log" so it can be checked
 * without access to the build logs.
 *
 * Runs when VERCEL_ENV=production, or locally with STRIPE_SYNC=1.
 */

const REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.expired",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
  "invoice.paid",
];

const WEBHOOK_PATH = "/api/stripe/webhook";

const secretKey = process.env.STRIPE_SECRET_KEY;
const shouldRun =
  process.env.VERCEL_ENV === "production" || process.env.STRIPE_SYNC === "1";

if (!shouldRun || !secretKey) {
  console.log(
    `[stripe-sync] skipped (${!shouldRun ? "not a production build" : "no STRIPE_SECRET_KEY"}).`,
  );
  process.exit(0);
}

const { default: Stripe } = await import("stripe");
const stripe = new Stripe(secretKey);
const results = [];

async function ensureReferralPromoCode() {
  const code = process.env.STRIPE_REFERRAL_PROMO_CODE || "GIVEAMONTH";
  const existing = await stripe.promotionCodes.list({
    code,
    active: true,
    limit: 1,
  });
  if (existing.data.length > 0) {
    return `promo ${code}: already present (${existing.data[0].id})`;
  }

  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY;
  if (!monthlyPriceId) return `promo ${code}: skipped, no STRIPE_PRICE_MONTHLY`;

  const price = await stripe.prices.retrieve(monthlyPriceId);
  const product =
    typeof price.product === "string" ? price.product : price.product.id;

  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: "once",
    name: "Referral first month free",
    applies_to: { products: [product] },
    metadata: { purpose: "referral_referee_first_month_free" },
  });
  const promo = await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: coupon.id },
    code,
    metadata: { purpose: "referral_referee_first_month_free" },
  });
  return `promo ${code}: created ${promo.id} (coupon ${coupon.id}, product ${product})`;
}

async function ensureWebhookEvents() {
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const targets = endpoints.data.filter(
    (e) =>
      e.status === "enabled" &&
      e.url.includes("aieducademy.org") &&
      e.url.includes(WEBHOOK_PATH),
  );
  if (targets.length === 0) return "webhook: no enabled aieducademy.org endpoint found";

  const lines = [];
  for (const endpoint of targets) {
    const events = endpoint.enabled_events;
    if (events.includes("*")) {
      lines.push(`webhook ${endpoint.id}: subscribes to all events`);
      continue;
    }
    const missing = REQUIRED_WEBHOOK_EVENTS.filter((e) => !events.includes(e));
    if (missing.length === 0) {
      lines.push(`webhook ${endpoint.id}: up to date`);
      continue;
    }
    await stripe.webhookEndpoints.update(endpoint.id, {
      enabled_events: [...events, ...missing],
    });
    lines.push(`webhook ${endpoint.id}: added ${missing.join(", ")}`);
  }
  return lines.join("; ");
}

for (const [name, step] of [
  ["promo", ensureReferralPromoCode],
  ["webhook", ensureWebhookEvents],
]) {
  try {
    results.push({ step: name, ok: true, detail: await step() });
  } catch (error) {
    results.push({ step: name, ok: false, detail: String(error?.message ?? error) });
  }
}

for (const r of results) {
  console.log(`[stripe-sync] ${r.ok ? "ok" : "FAILED"}: ${r.detail}`);
}

if (process.env.DATABASE_URL) {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS "stripe_sync_log" (
        "id" serial PRIMARY KEY,
        "step" text NOT NULL,
        "ok" boolean NOT NULL,
        "detail" text NOT NULL,
        "mode" text NOT NULL,
        "ran_at" timestamp NOT NULL DEFAULT now()
      )
    `);
    const mode = secretKey.startsWith("sk_live_") ? "live" : "test";
    for (const r of results) {
      await sql.query(
        `INSERT INTO "stripe_sync_log" (step, ok, detail, mode) VALUES ($1, $2, $3, $4)`,
        [r.step, r.ok, r.detail, mode],
      );
    }
  } catch (error) {
    console.warn(`[stripe-sync] could not record outcome: ${error?.message ?? error}`);
  }
}

process.exit(0);
