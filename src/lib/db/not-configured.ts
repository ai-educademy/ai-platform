/**
 * The database-not-configured error, with no HTTP dependency.
 *
 * This lives apart from `@/lib/db-guard` because that module returns a
 * `NextResponse`, which pulls `next/server` into anything that imports it. The
 * database layer itself needs only the error, and is used by background tasks
 * and command-line tooling that run outside a Next runtime. Keeping the error
 * here lets those callers import the database without importing a web
 * framework.
 *
 * `@/lib/db-guard` re-exports both symbols, so request handlers carry on
 * importing from there.
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
