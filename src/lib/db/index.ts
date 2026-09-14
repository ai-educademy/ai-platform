import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { DatabaseNotConfiguredError } from "@/lib/db-guard";

type Db = NeonHttpDatabase<typeof schema>;

function createDb(): Db | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

const instance = createDb();

/** True when DATABASE_URL is configured and `db` is safe to use. */
export const isDbConfigured = instance !== null;

function createUnconfiguredDb(): Db {
  const fail = (): never => {
    throw new DatabaseNotConfiguredError();
  };

  return new Proxy({} as Db, { get: fail, apply: fail, has: fail });
}

/**
 * The Drizzle client.
 *
 * DATABASE_URL is absent in CI and in some preview environments. This used to
 * be exported as `createDb()!`, where the non-null assertion told the type
 * system the value could never be null while the factory plainly returned null.
 * Callers went straight to `db.select(...)` and blew up at runtime with
 * `TypeError: Cannot read properties of null (reading 'select')`, which says
 * nothing about the actual problem.
 *
 * When unconfigured we now hand back a stand-in that throws a self-describing
 * error on first use. Route handlers already wrap their work in try/catch, so
 * the failure is logged clearly instead of surfacing as a mystery TypeError.
 *
 * Prefer guarding with `isDbConfigured` in new code rather than relying on this.
 */
export const db: Db = instance ?? createUnconfiguredDb();
