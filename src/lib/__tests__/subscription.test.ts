import { beforeEach, describe, expect, it, vi } from "vitest";

type UserRow = { id: string; role: "free" | "pro" | "admin" };
type SubscriptionRow = {
  userId: string;
  status: "active" | "cancelled" | "past_due" | "trialing" | "incomplete";
  plan: "monthly" | "annual" | "lifetime";
  currentPeriodEnd?: Date | null;
};

let userRows: UserRow[] = [];
let subscriptionRows: SubscriptionRow[] = [];

type Condition =
  | { op: "eq"; column: string; value: unknown }
  | { op: "and"; conditions: Condition[] };

vi.mock("@/lib/db/schema", () => ({
  users: { table: "users", id: "users.id", role: "users.role" },
  subscriptions: {
    table: "subscriptions",
    userId: "subscriptions.userId",
    status: "subscriptions.status",
    plan: "subscriptions.plan",
    currentPeriodEnd: "subscriptions.currentPeriodEnd",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: (column: string, value: unknown): Condition => ({ op: "eq", column, value }),
  and: (...conditions: Condition[]): Condition => ({ op: "and", conditions }),
}));

function matches(row: Record<string, unknown>, condition: Condition | undefined): boolean {
  if (!condition) return true;
  if (condition.op === "and") return condition.conditions.every((c) => matches(row, c));
  const key = condition.column.split(".").at(-1);
  return key ? row[key] === condition.value : false;
}

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: (table: { table: "users" | "subscriptions" }) => ({
        where: (condition: Condition) => {
          const rows = () =>
            (table.table === "users" ? userRows : subscriptionRows).filter((row) =>
              matches(row as unknown as Record<string, unknown>, condition),
            );
          // getUserPlan reads the user with .limit(1) but reads subscriptions
          // without one, so the mock has to satisfy both shapes: awaitable on
          // its own, and still offering .limit().
          const thenable = {
            limit: (count: number) => Promise.resolve(rows().slice(0, count)),
            then: (
              resolve: (value: unknown) => unknown,
              reject?: (reason: unknown) => unknown,
            ) => Promise.resolve(rows()).then(resolve, reject),
          };
          return thenable;
        },
      }),
    }),
  },
}));

import { canAccessPremium, getUserPlan } from "@/lib/subscription";

beforeEach(() => {
  userRows = [];
  subscriptionRows = [];
});

describe("getUserPlan", () => {
  it("given a free user with no subscription, when the plan is read, then they stay free", async () => {
    userRows = [{ id: "user_free", role: "free" }];

    await expect(getUserPlan("user_free")).resolves.toBe("free");
  });

  it("given a user with an active monthly subscription, when the plan is read, then they are pro", async () => {
    userRows = [{ id: "user_monthly", role: "free" }];
    subscriptionRows = [{ userId: "user_monthly", status: "active", plan: "monthly" }];

    await expect(getUserPlan("user_monthly")).resolves.toBe("pro");
  });

  it("given an admin with no subscription row, when the plan is read, then admin still gets premium access", async () => {
    userRows = [{ id: "admin_without_subscription", role: "admin" }];

    await expect(getUserPlan("admin_without_subscription")).resolves.toBe("admin");
  });

  it("given an expired subscription, when the plan is read, then access is not granted", async () => {
    userRows = [{ id: "expired_user", role: "free" }];
    subscriptionRows = [{ userId: "expired_user", status: "cancelled", plan: "annual", currentPeriodEnd: new Date("2024-01-01T00:00:00Z") }];

    await expect(getUserPlan("expired_user")).resolves.toBe("free");
  });

  it("given a lifetime purchase, when the plan is read, then access is granted as pro", async () => {
    userRows = [{ id: "lifetime_user", role: "free" }];
    subscriptionRows = [{ userId: "lifetime_user", status: "active", plan: "lifetime", currentPeriodEnd: null }];

    await expect(getUserPlan("lifetime_user")).resolves.toBe("pro");
  });

  it("given a cancelled subscription, when the plan is read, then access has ended even if a period end is still stored", async () => {
    // This was previously labelled as a bug. It is not. Stripe keeps a
    // subscription at status `active` with cancel_at_period_end set until the
    // paid period actually runs out, and only then fires
    // customer.subscription.deleted, which is what writes `cancelled` here. So
    // by the time this status exists, the access really has ended. The stale
    // currentPeriodEnd on the row must not resurrect it.
    userRows = [{ id: "cancelled_inside_period", role: "free" }];
    subscriptionRows = [{
      userId: "cancelled_inside_period",
      status: "cancelled",
      plan: "annual",
      currentPeriodEnd: new Date("2099-01-01T00:00:00Z"),
    }];

    await expect(getUserPlan("cancelled_inside_period")).resolves.toBe("free");
  });

  it("given a past_due subscription inside the paid period, when the plan is read, then they keep pro", async () => {
    userRows = [{ id: "retrying_card", role: "free" }];
    subscriptionRows = [{
      userId: "retrying_card",
      status: "past_due",
      plan: "monthly",
      currentPeriodEnd: new Date("2099-01-01T00:00:00Z"),
    }];

    await expect(getUserPlan("retrying_card")).resolves.toBe("pro");
  });

  it("given a trialing subscription, when the plan is read, then they get pro", async () => {
    userRows = [{ id: "trial_user", role: "free" }];
    subscriptionRows = [{
      userId: "trial_user",
      status: "trialing",
      plan: "monthly",
      currentPeriodEnd: new Date("2099-01-01T00:00:00Z"),
    }];

    await expect(getUserPlan("trial_user")).resolves.toBe("pro");
  });
});

describe("canAccessPremium", () => {
  it.each([
    ["free", false],
    ["pro", true],
    ["admin", true],
  ] as const)("given %s, when access is checked, then premium access is %s", (plan, expected) => {
    expect(canAccessPremium(plan)).toBe(expected);
  });
});
