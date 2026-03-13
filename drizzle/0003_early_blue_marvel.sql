CREATE TABLE "lesson_bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"program_slug" text NOT NULL,
	"lesson_slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_bookmarks_user_id_program_slug_lesson_slug_unique" UNIQUE("user_id","program_slug","lesson_slug")
);
--> statement-breakpoint
ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;