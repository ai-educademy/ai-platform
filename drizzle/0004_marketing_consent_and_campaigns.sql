-- Marketing consent, preferred locale and campaign idempotency.
--
-- Written by hand rather than shipped as drizzle-kit generated it. The
-- generator also emitted CREATE TABLE for "playground_scores" and
-- "user_streaks", which already exist in production: those were applied with
-- `drizzle-kit push` and never recorded as migrations, so the journal has
-- drifted from the live database. Replaying them would abort the migration.
-- Everything below is therefore scoped to this change and is idempotent, so it
-- is safe whether the environment was built by push or by migrate.

CREATE TABLE IF NOT EXISTS "campaign_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign" text NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_sends_campaign_email_unique" UNIQUE("campaign","email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_out_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "unsubscribe_token" text;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "users" ADD CONSTRAINT "users_unsubscribe_token_unique" UNIQUE("unsubscribe_token");
EXCEPTION
	WHEN duplicate_table THEN NULL;
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "campaign_sends" ADD CONSTRAINT "campaign_sends_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
