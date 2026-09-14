#!/usr/bin/env node
/**
 * Applies a single SQL migration file against DATABASE_URL.
 *
 * Deliberately not `drizzle-kit migrate`. The migration journal has drifted
 * from production: `playground_scores` and `user_streaks` exist live but were
 * created with `drizzle-kit push`, so they never entered migrations 0000-0003.
 * Replaying the journal would try to create them again and abort. Until that
 * drift is reconciled, migrations are applied one file at a time, and each file
 * is written to be idempotent so a repeat run is harmless.
 *
 *   node scripts/apply-migration.mjs drizzle/0004_marketing_consent_and_campaigns.sql
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-migration.mjs <path-to-sql>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);
const contents = readFileSync(file, "utf8");

// drizzle separates statements with this marker; fall back to semicolons only
// when it is absent, since splitting naively would break dollar-quoted blocks.
const statements = contents.includes("--> statement-breakpoint")
  ? contents.split("--> statement-breakpoint")
  : [contents];

console.log(`Applying ${file} (${statements.length} statement(s))`);

for (const [i, raw] of statements.entries()) {
  const statement = raw.trim();
  if (!statement) continue;
  try {
    await sql.query(statement);
    console.log(`  ✓ statement ${i + 1}`);
  } catch (error) {
    console.error(`  ✗ statement ${i + 1} failed:`, error.message);
    process.exit(1);
  }
}

console.log("Done.");
