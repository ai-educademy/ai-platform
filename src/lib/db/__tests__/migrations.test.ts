import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * `scripts/migrate.mjs` applies migrations during the production build. Neon's
 * HTTP driver is stateless, so a migration file cannot be wrapped in a single
 * transaction and a run that fails halfway leaves partial state. Re-running is
 * the recovery path, which only works if every statement is safe to repeat.
 *
 * These tests enforce that, because the failure mode is otherwise invisible
 * until a deploy is already half-applied against production.
 */
const MIGRATIONS_DIR = "drizzle";

/** Must match BASELINE_THROUGH in scripts/migrate.mjs. */
const BASELINE_THROUGH = "0003_early_blue_marvel.sql";

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const postBaseline = files.filter((f) => f > BASELINE_THROUGH);

function statementsOf(file: string): string[] {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
  const parts = sql.includes("--> statement-breakpoint")
    ? sql.split("--> statement-breakpoint")
    : [sql];
  return parts
    // Comments can contain the very keywords being asserted on.
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
}

describe("migration files", () => {
  it("still contains the file the runner baselines through", () => {
    // A rename would make the runner replay the whole pre-existing history,
    // which is not idempotent and would abort against production.
    expect(files).toContain(BASELINE_THROUGH);
  });

  it("has migrations beyond the baseline to check", () => {
    expect(postBaseline.length).toBeGreaterThan(0);
  });

  it("keeps the runner's baseline in step with this test", () => {
    const runner = readFileSync("scripts/migrate.mjs", "utf8");
    expect(runner).toContain(`const BASELINE_THROUGH = "${BASELINE_THROUGH}"`);
  });

  describe.each(postBaseline)("%s", (file) => {
    const statements = statementsOf(file);

    it("creates tables only with IF NOT EXISTS", () => {
      for (const statement of statements) {
        if (/^CREATE TABLE/i.test(statement)) {
          expect(statement).toMatch(/CREATE TABLE IF NOT EXISTS/i);
        }
      }
    });

    it("adds columns only with IF NOT EXISTS", () => {
      for (const statement of statements) {
        if (/ALTER TABLE .* ADD COLUMN/i.test(statement)) {
          expect(statement).toMatch(/ADD COLUMN IF NOT EXISTS/i);
        }
      }
    });

    it("guards constraint additions against already existing", () => {
      for (const statement of statements) {
        if (/ALTER TABLE .* ADD CONSTRAINT/i.test(statement)) {
          // Postgres has no IF NOT EXISTS for constraints, so the accepted form
          // is a DO block swallowing duplicate_object.
          expect(statement).toMatch(/DO \$\$/);
          expect(statement).toMatch(/duplicate_object/);
        }
      }
    });

    it("creates indexes only with IF NOT EXISTS", () => {
      for (const statement of statements) {
        if (/^CREATE (UNIQUE )?INDEX/i.test(statement)) {
          expect(statement).toMatch(/INDEX IF NOT EXISTS/i);
        }
      }
    });

    it("contains no destructive statement", () => {
      // A build step must never be able to drop data. Anything genuinely
      // destructive has to be run by hand, deliberately, outside the build.
      for (const statement of statements) {
        expect(statement).not.toMatch(/\bDROP\s+(TABLE|COLUMN|DATABASE|SCHEMA)\b/i);
        expect(statement).not.toMatch(/\bTRUNCATE\b/i);
        expect(statement).not.toMatch(/^\s*DELETE\s+FROM\b/im);
      }
    });
  });
});
