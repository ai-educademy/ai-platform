import { describe, it, expect } from "vitest";
import {
  DatabaseNotConfiguredError,
  isDatabaseNotConfigured,
  databaseUnavailable,
} from "@/lib/db-guard";

describe("isDatabaseNotConfigured", () => {
  it("given the database error, when checked, then it is recognised", () => {
    expect(isDatabaseNotConfigured(new DatabaseNotConfiguredError())).toBe(true);
  });

  it("given an unrelated error, when checked, then it is not recognised", () => {
    expect(isDatabaseNotConfigured(new Error("connection reset"))).toBe(false);
  });

  it("given a non-error value, when checked, then it does not throw", () => {
    expect(isDatabaseNotConfigured(null)).toBe(false);
    expect(isDatabaseNotConfigured(undefined)).toBe(false);
    expect(isDatabaseNotConfigured("DATABASE_URL")).toBe(false);
  });

  it("given an error merely mentioning the database, then it is not recognised", () => {
    // Matching on message text would misclassify unrelated failures, so the
    // check is by type only.
    expect(
      isDatabaseNotConfigured(new Error("Database is not configured: DATABASE_URL is not set."))
    ).toBe(false);
  });
});

describe("DatabaseNotConfiguredError", () => {
  it("given the error, then it carries a name and an actionable message", () => {
    const err = new DatabaseNotConfiguredError();
    expect(err.name).toBe("DatabaseNotConfiguredError");
    expect(err.message).toContain("DATABASE_URL");
    expect(err.message).toContain("isDbConfigured");
  });
});

describe("databaseUnavailable", () => {
  it("given the database is unavailable, then it responds 503 rather than 500", async () => {
    const res = databaseUnavailable();
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toMatchObject({
      error: "Service temporarily unavailable",
    });
  });
});
