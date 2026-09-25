/**
 * Creates the test-mode referral coupon and promotion code.
 *
 * Run once with a Stripe test secret key in .env.local:
 *   npx tsx scripts/create-referral-promo-code.ts
 *
 * The promotion code defaults to GIVEAMONTH, matching STRIPE_REFERRAL_PROMO_CODE.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

function loadEnv(filePath: string): void {
  try {
    const content = readFileSync(resolve(filePath), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // Missing local env file is handled below.
  }
}

loadEnv(".env.local");

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY not found in .env.local");
  process.exit(1);
}

if (!secretKey.startsWith("sk_test_")) {
  console.error(
    "Refusing to create live referral coupons before the PR is merged and verified.",
  );
  process.exit(1);
}

const promotionCode = process.env.STRIPE_REFERRAL_PROMO_CODE || "GIVEAMONTH";
const stripe = new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" });

async function findExistingPromotionCode(code: string) {
  const existing = await stripe.promotionCodes.list({
    code,
    active: true,
    limit: 1,
  });
  return existing.data[0];
}

async function main() {
  const existing = await findExistingPromotionCode(promotionCode);
  if (existing) {
    console.log(
      `Promotion code already exists: ${existing.code} (${existing.id})`,
    );
    return;
  }

  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: "once",
    name: "Referral first month free",
    metadata: { purpose: "referral_referee_first_month_free" },
  });

  const promo = await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: coupon.id },
    code: promotionCode,
    metadata: { purpose: "referral_referee_first_month_free" },
  });

  console.log(`Coupon created: ${coupon.id}`);
  console.log(`Promotion code created: ${promo.code} (${promo.id})`);
}

main().catch((err) => {
  console.error("Failed to create referral promotion code:", err);
  process.exit(1);
});
