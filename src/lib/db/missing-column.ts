/**
 * Detects a query that failed only because the database has not caught up with
 * the code.
 *
 * Migrations on this project are applied by hand rather than during the Vercel
 * build, so a deploy can reach production before its schema change does. A
 * feature that depends on a brand new column should degrade rather than take a
 * critical path down with it, and this is how those paths tell "the column is
 * not there yet" apart from a genuine query fault.
 *
 * Postgres reports a missing column as 42703 (undefined_column). The column
 * name is checked too, so an unrelated 42703 elsewhere in the statement is
 * still treated as the bug it is.
 */
export function isMissingColumn(error: unknown, column: string): boolean {
  const code = (error as { code?: string })?.code;
  const message = String((error as { message?: string })?.message ?? "");
  return code === "42703" && message.includes(column);
}
