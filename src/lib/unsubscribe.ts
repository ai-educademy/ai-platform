import { randomBytes, createHash, timingSafeEqual } from "crypto";

/**
 * Unsubscribe token handling.
 *
 * Marketing email must carry a working opt-out, so every recipient needs a
 * stable, unguessable token in their link. The token is generated once per user
 * and stored; it is deliberately NOT derived from the user id, so a leaked link
 * reveals nothing about the account and cannot be used against other records.
 */

/** Generates a fresh, URL-safe unsubscribe token. */
export function generateUnsubscribeToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Constant-time comparison, so a caller cannot narrow a token down by timing
 * repeated guesses against the endpoint.
 */
export function tokensMatch(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Builds the absolute unsubscribe URL placed in an email. */
export function unsubscribeUrl(token: string, locale: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org";
  const prefix = locale === "en" ? "" : `/${locale}`;
  return `${base}${prefix}/unsubscribe?token=${encodeURIComponent(token)}`;
}

/**
 * Returns the user's unsubscribe token, creating and persisting one on first
 * use.
 *
 * Existing accounts predate the column, so tokens are backfilled lazily here
 * rather than in a migration that would have to rewrite every row.
 */
export async function getOrCreateUnsubscribeToken(email: string): Promise<string | null> {
  const { db, isDbConfigured } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  if (!isDbConfigured) return null;

  try {
    const [user] = await db
      .select({ id: users.id, unsubscribeToken: users.unsubscribeToken })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return null;
    if (user.unsubscribeToken) return user.unsubscribeToken;

    const token = generateUnsubscribeToken();
    await db.update(users).set({ unsubscribeToken: token }).where(eq(users.id, user.id));
    return token;
  } catch {
    return null;
  }
}

/**
 * Link to put in an email footer.
 *
 * Falls back to the bare unsubscribe page when no token exists (for example a
 * newsletter-only address with no account), which still lets someone opt out
 * instead of dead-ending them on the homepage.
 */
export function unsubscribeLinkFor(token: string | null, locale: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org";
  const prefix = locale === "en" ? "" : `/${locale}`;
  return token ? unsubscribeUrl(token, locale) : `${base}${prefix}/unsubscribe`;
}
