import { NextResponse } from "next/server";

/**
 * Thrown when a code path reaches the database while DATABASE_URL is unset,
 * which is the case in CI and in some preview environments.
 */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Database is not configured: DATABASE_URL is not set. " +
        "Guard this code path with `isDbConfigured` from @/lib/db."
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseNotConfigured(err: unknown): boolean {
  return err instanceof DatabaseNotConfiguredError;
}

/**
 * The response to send when a handler could not reach the database.
 *
 * 503 rather than 500: the request itself was fine, the dependency is missing.
 *
 * Call this from a catch block rather than at the top of a handler. Guarding
 * first would pre-empt input validation and authentication, so a malformed or
 * unauthenticated request would receive a 503 instead of the 400 or 401 it
 * had earned.
 *
 * @example
 * } catch (error) {
 *   if (isDatabaseNotConfigured(error)) return databaseUnavailable();
 *   // ...existing handling
 * }
 */
export function databaseUnavailable(): NextResponse {
  return NextResponse.json(
    {
      error: "Service temporarily unavailable",
      detail: "The database is not configured for this environment.",
    },
    { status: 503 }
  );
}
