import { NextResponse } from "next/server";

export {
  DatabaseNotConfiguredError,
  isDatabaseNotConfigured,
} from "@/lib/db/not-configured";

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
