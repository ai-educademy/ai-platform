CREATE TABLE IF NOT EXISTS "funnel_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event" text NOT NULL,
  "user_id" text,
  "anon_id" text NOT NULL,
  "locale" text,
  "path" text,
  "program_slug" text,
  "lesson_slug" text,
  "plan" text,
  "country" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "funnel_events"
    ADD CONSTRAINT "funnel_events_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE set null;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funnel_events_created_at_idx" ON "funnel_events" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funnel_events_event_created_at_idx" ON "funnel_events" ("event", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funnel_events_anon_id_idx" ON "funnel_events" ("anon_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funnel_events_user_id_idx" ON "funnel_events" ("user_id");
