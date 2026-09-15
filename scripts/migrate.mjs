#!/usr/bin/env node
/**
 * Applies pending SQL migrations during the build.
 *
 * Without this, deployed code can reach production before its schema change
 * does. That is not theoretical: migration 0004 added three columns to `users`,
 * the Drizzle adapter selects every declared column, and the resulting
 * `42703 undefined_column` took sign-in down site-wide until the adapter was
 * decoupled from those columns.
 *
 * Deliberately not `drizzle-kit migrate`. The generated journal has drifted from
 * the live database: `playground_scores` and `user_streaks` exist in production
 * but were created with `drizzle-kit push`, so they were never recorded as
 * migrations. Replaying the journal would try to create them again and abort.
 * This runner keeps its own ledger instead, and treats everything up to
 * BASELINE_THROUGH as already applied.
 *
 * Two safety properties matter more than convenience here:
 *
 *   1. It only runs for production deployments. A preview build of an unmerged
 *      pull request shares the production connection string, so running
 *      migrations there would let unreviewed schema changes into the live
 *      database before anyone approved them.
 *
 *   2. A failure fails the build. The previous deployment keeps serving, which
 *      is the correct outcome: better to not ship than to ship code that its
 *      schema cannot support.
 *
 * Migrations after the baseline must be idempotent. Neon's HTTP driver is
 * stateless, so each statement is its own connection and a file cannot be
 * wrapped in one transaction. A run that fails halfway therefore leaves partial
 * state, and re-running is the recovery path. `scripts/__tests__` asserts that
 * every post-baseline file carries the guards that make that safe.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "drizzle";

/**
 * Migrations up to and including this file were applied with `drizzle-kit push`
 * before this runner existed. They are recorded as applied without being
 * executed, because they are not idempotent and would abort against the live
 * schema. Never lower this value.
 */
const BASELINE_THROUGH = "0003_early_blue_marvel.sql";

const url = process.env.DATABASE_URL;
const isProductionDeploy = process.env.VERCEL_ENV === "production";
const forced = process.env.MIGRATE_ON_BUILD === "1";

if (!url) {
  // Fork pull requests and local builds have no database. Skipping keeps them
  // buildable; it cannot mask a problem, because there is nothing to migrate.
  console.log("[migrate] DATABASE_URL not set, skipping.");
  process.exit(0);
}

if (!isProductionDeploy && !forced) {
  console.log(
    `[migrate] VERCEL_ENV is ${process.env.VERCEL_ENV ?? "unset"}, skipping. ` +
      "Set MIGRATE_ON_BUILD=1 to override."
  );
  process.exit(0);
}

const { neon } = await import("@neondatabase/serverless");
const sql = neon(url);

/** Splits on drizzle's marker; dollar-quoted blocks make naive splitting unsafe. */
function statementsOf(contents) {
  const parts = contents.includes("--> statement-breakpoint")
    ? contents.split("--> statement-breakpoint")
    : [contents];
  return parts.map((s) => s.trim()).filter(Boolean);
}

async function main() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "schema_migrations" (
      "filename" text PRIMARY KEY,
      "applied_at" timestamp NOT NULL DEFAULT now()
    )
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const recorded = new Set(
    (await sql.query(`SELECT filename FROM "schema_migrations"`)).map((r) => r.filename)
  );

  // Record the pre-existing history once, without running it.
  const baseline = files.filter((f) => f <= BASELINE_THROUGH && !recorded.has(f));
  for (const file of baseline) {
    await sql.query(
      `INSERT INTO "schema_migrations" (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
      [file]
    );
    recorded.add(file);
    console.log(`[migrate] baselined ${file} (not executed)`);
  }

  const pending = files.filter((f) => f > BASELINE_THROUGH && !recorded.has(f));
  if (pending.length === 0) {
    console.log("[migrate] up to date.");
    return;
  }

  for (const file of pending) {
    const statements = statementsOf(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
    console.log(`[migrate] applying ${file} (${statements.length} statement(s))`);

    for (const [i, statement] of statements.entries()) {
      try {
        await sql.query(statement);
      } catch (error) {
        throw new Error(`${file} statement ${i + 1} failed: ${error.message}`, {
          cause: error,
        });
      }
    }

    // Written only after the file succeeds. A concurrent build that applied the
    // same file first is harmless: the insert is a no-op and the statements
    // above are idempotent.
    await sql.query(
      `INSERT INTO "schema_migrations" (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
      [file]
    );
    console.log(`[migrate] applied ${file}`);
  }
}

try {
  await main();
} catch (error) {
  console.error(`[migrate] FAILED: ${error.message}`);
  console.error("[migrate] Build aborted so the previous deployment keeps serving.");
  process.exit(1);
}
