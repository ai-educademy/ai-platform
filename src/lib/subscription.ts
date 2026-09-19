import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type UserPlan = "free" | "pro" | "admin";

export async function getUserPlan(userId: string): Promise<UserPlan> {
  // Check user role first (admin overrides everything)
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return "free";
  if (user.role === "admin") return "admin";

  const subs = await db
    .select({
      status: subscriptions.status,
      plan: subscriptions.plan,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  if (subs.some((s) => grantsAccess(s.status, s.currentPeriodEnd))) return "pro";
  return user.role as UserPlan;
}

/**
 * Whether a subscription row should currently unlock paid content.
 *
 * This used to be a bare `status === "active"` check, which locked out two
 * groups of people who have every right to be inside.
 *
 * `past_due` does not mean somebody has stopped paying. Stripe sets it the
 * moment a single charge attempt fails, then keeps retrying for days under
 * its smart retry schedule, and most of those recover. Treating it as a
 * cancellation threw a paying customer out of the product over a bank blip,
 * which is a very good way to turn a temporary card problem into a permanent
 * cancellation. We keep them in until the period they have already paid for
 * actually runs out.
 *
 * `trialing` never reached the database at all. The webhook mapped any status
 * it did not recognise to `incomplete`, so a trial subscriber was recorded as
 * incomplete and got nothing. The schema has always declared a `trialing`
 * value, so the intent was clearly there.
 */
export function grantsAccess(
  status: string,
  currentPeriodEnd: Date | null,
  now: Date = new Date()
): boolean {
  if (status === "active" || status === "trialing") return true;

  // Still inside the window they paid for, so the access is already bought.
  if (status === "past_due") {
    return currentPeriodEnd !== null && currentPeriodEnd.getTime() > now.getTime();
  }

  return false;
}

export function canAccessPremium(plan: UserPlan): boolean {
  return plan === "pro" || plan === "admin";
}
