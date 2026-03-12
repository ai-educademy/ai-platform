import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

  // Check for active subscription
  const [sub] = await db
    .select({ status: subscriptions.status, plan: subscriptions.plan })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  if (sub) return "pro";
  return user.role as UserPlan;
}

export function canAccessPremium(plan: UserPlan): boolean {
  return plan === "pro" || plan === "admin";
}
