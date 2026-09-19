/**
 * Keeping the role inside a JWT honest.
 *
 * The role used to be written once, at sign-in, and never looked at again.
 * With a 30 day token that meant a promotion to admin, or a successful Stripe
 * checkout, stayed invisible to every caller reading the session until the
 * person happened to sign out: an admin would be told they were signed in
 * "with role 'free'", and somebody who had just paid would be refused the
 * premium features they had paid for.
 *
 * This re-reads the role from the database on a short interval so entitlement
 * follows the database rather than whatever happened to be true when the token
 * was minted.
 */

/** How long a role read from the database stays trusted inside the token. */
export const ROLE_REFRESH_MS = 5 * 60 * 1000;

export type RoleToken = {
  sub?: string;
  role?: unknown;
  roleCheckedAt?: unknown;
};

/** Looks a user's current role up. Returns null when there is nothing to trust. */
export type RoleLookup = (userId: string) => Promise<string | null>;

export function shouldRefreshRole(
  token: RoleToken,
  trigger: string | undefined,
  now: number
): boolean {
  if (!token.sub) return false;
  if (trigger === "update") return true;
  const checkedAt = typeof token.roleCheckedAt === "number" ? token.roleCheckedAt : 0;
  return now - checkedAt > ROLE_REFRESH_MS;
}

/**
 * Returns the token with its role brought up to date.
 *
 * A deleted user, or a database blip, must never silently downgrade somebody
 * who is paying, so the stored role is only ever replaced by one actually read
 * back from the database.
 */
export async function refreshTokenRole<T extends RoleToken>(
  token: T,
  trigger: string | undefined,
  lookup: RoleLookup,
  now: number = Date.now()
): Promise<T> {
  if (!shouldRefreshRole(token, trigger, now)) return token;

  try {
    const role = await lookup(token.sub as string);
    if (role) {
      token.role = role;
      token.roleCheckedAt = now;
    }
  } catch (err) {
    console.error("[Auth] Role refresh failed:", err);
  }
  return token;
}
