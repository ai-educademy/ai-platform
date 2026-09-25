-- Referral reward ledger for Give a month, get a month.
--
-- Idempotent because production migrations can be retried after a partial
-- Neon HTTP run. The existing referrals.referral_code unique constraint made a
-- code usable only once, so it is dropped before adding per-referee and reward
-- idempotency guards.

DO $$ BEGIN
  ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_referral_code_unique";
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "stripe_invoice_id" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "referee_payment_fingerprint" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "reward_stripe_balance_transaction_id" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "abuse_reason" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "rewarded_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_status_check";
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referee_user_id_unique" ON "referrals" ("referee_user_id") WHERE "referee_user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_stripe_invoice_id_unique" ON "referrals" ("stripe_invoice_id") WHERE "stripe_invoice_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_reward_balance_tx_unique" ON "referrals" ("reward_stripe_balance_transaction_id") WHERE "reward_stripe_balance_transaction_id" IS NOT NULL;
