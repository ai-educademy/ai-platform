import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * The `users` columns Auth.js needs, and deliberately nothing else.
 *
 * The Drizzle adapter issues `select` over every column of whatever table it is
 * handed, so pointing it at the full `users` table silently couples signing in
 * to columns that exist purely for marketing or personalisation. Migrations here
 * are applied by hand, so a deploy reaches production before its schema change
 * does: the moment such a column is declared in code but missing in the
 * database, every adapter query fails with 42703 and Auth.js surfaces it as
 * `error=Configuration`, which takes sign-in, sign-up and therefore checkout
 * down for everybody.
 *
 * That is exactly what happened when migration 0004 added `locale`,
 * `marketing_opt_out_at` and `unsubscribe_token`. Narrowing the adapter's view
 * to the canonical Auth.js fields means no future column outside this set can
 * repeat it.
 *
 * This table intentionally lives outside `schema.ts`, because `drizzle.config.ts`
 * scans that file to generate migrations and would otherwise see two
 * declarations of `users`. `schema.ts` remains the single source of truth for
 * the real shape of the table.
 *
 * Columns omitted here are safe to omit: every one of them is either nullable or
 * carries a database default, so rows the adapter inserts are still valid.
 */
export const authUsers = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});
