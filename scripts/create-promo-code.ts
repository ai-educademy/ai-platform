/**
 * Creates a 50% off coupon + promotion code "PH50" in Stripe.
 *
 * Run once:
 *   npx tsx scripts/create-promo-code.ts
 *
 * - 50% off
 * - Valid for first 50 redemptions
 * - Expires March 31, 2026
 * - Applies to all products
 *
 * Reads STRIPE_SECRET_KEY from .env.local
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

// Simple .env.local loader (no dotenv dependency needed)
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file not found — ignore
  }
}

loadEnv(".env.local");

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY not found in .env.local");
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

async function main() {
  // Create the 50% off coupon
  const coupon = await stripe.coupons.create({
    percent_off: 50,
    duration: "once",
    name: "Product Hunt 50% Off",
    max_redemptions: 50,
    redeem_by: Math.floor(new Date("2026-03-31T23:59:59Z").getTime() / 1000),
  });
  console.log(`✅ Coupon created: ${coupon.id} (${coupon.name})`);

  // Create the promotion code
  const promoCode = await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: coupon.id },
    code: "PH50",
    max_redemptions: 50,
    expires_at: Math.floor(
      new Date("2026-03-31T23:59:59Z").getTime() / 1000
    ),
  });
  console.log(`✅ Promotion code created: ${promoCode.code} (ID: ${promoCode.id})`);
  console.log("\nDone! Users can now apply code PH50 at checkout.");
}

main().catch((err) => {
  console.error("Failed to create promo code:", err);
  process.exit(1);
});
