import { describe, it, expect } from "vitest";
import { getTableColumns, getTableName } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { authUsers } from "@/lib/db/auth-schema";
import { isMissingColumn } from "@/lib/db/missing-column";

/**
 * Sign-in went down in production because the Drizzle adapter was pointed at the
 * full `users` table. The adapter selects every declared column, so the moment
 * migration 0004 added `locale`, `marketing_opt_out_at` and `unsubscribe_token`
 * to the code without yet reaching the database, every adapter query failed with
 * 42703 and Auth.js reported `error=Configuration`.
 *
 * These tests pin the separation so nobody can widen the adapter's view back out.
 */
describe("auth adapter user view", () => {
  const authColumns = getTableColumns(authUsers);
  const appColumns = getTableColumns(users);

  it("targets the same physical table as the application schema", () => {
    // A typo here would silently create a second table at migration time.
    expect(getTableName(authUsers)).toBe(getTableName(users));
    expect(getTableName(authUsers)).toBe("users");
  });

  it("exposes only the fields Auth.js itself needs", () => {
    expect(Object.keys(authColumns).sort()).toEqual([
      "email",
      "emailVerified",
      "id",
      "image",
      "name",
    ]);
  });

  it("excludes columns that exist purely for marketing or personalisation", () => {
    for (const column of ["locale", "marketingOptOutAt", "unsubscribeToken"]) {
      expect(Object.keys(authColumns)).not.toContain(column);
      // Still expected on the application schema, which is the source of truth.
      expect(Object.keys(appColumns)).toContain(column);
    }
  });

  it("is a strict subset of the application schema", () => {
    for (const name of Object.keys(authColumns)) {
      expect(Object.keys(appColumns)).toContain(name);
    }
  });

  it("maps every exposed field to the same database column name", () => {
    for (const [name, column] of Object.entries(authColumns)) {
      expect(column.name).toBe(appColumns[name as keyof typeof appColumns].name);
    }
  });

  it("requires no omitted column to be populated on insert", () => {
    // The adapter creates rows through this narrow view, so anything it cannot
    // see must be nullable or carry a default, or sign-up would fail.
    const omitted = Object.keys(appColumns).filter((c) => !(c in authColumns));
    expect(omitted.length).toBeGreaterThan(0);
    for (const name of omitted) {
      const column = appColumns[name as keyof typeof appColumns];
      const satisfied = !column.notNull || column.hasDefault;
      expect(satisfied, `${name} is NOT NULL without a default`).toBe(true);
    }
  });
});

describe("isMissingColumn", () => {
  it("recognises a missing column by code and name", () => {
    expect(
      isMissingColumn({ code: "42703", message: 'column "locale" does not exist' }, "locale")
    ).toBe(true);
  });

  it("does not match a different column reported by the same code", () => {
    expect(
      isMissingColumn({ code: "42703", message: 'column "nickname" does not exist' }, "locale")
    ).toBe(false);
  });

  it("does not swallow unrelated database errors", () => {
    // A connection failure or constraint violation must still surface, or the
    // fallback path would hide real faults.
    expect(isMissingColumn({ code: "23505", message: "duplicate key" }, "locale")).toBe(false);
    expect(isMissingColumn(new Error("connection refused"), "locale")).toBe(false);
    expect(isMissingColumn(null, "locale")).toBe(false);
    expect(isMissingColumn(undefined, "locale")).toBe(false);
  });
});
