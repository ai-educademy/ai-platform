import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateBalanceTransaction = vi.fn();
const mockPaymentIntentRetrieve = vi.fn();
const mockPaymentMethodsList = vi.fn();
const updates: Array<{ table: string; values: Record<string, unknown> }> = [];
let selectRows: Array<Array<Record<string, unknown>>> = [];

vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => ({ and: args }),
  count: () => "count",
  eq: (...args: unknown[]) => ({ eq: args }),
  gte: (...args: unknown[]) => ({ gte: args }),
  isNull: (...args: unknown[]) => ({ isNull: args }),
  ne: (...args: unknown[]) => ({ ne: args }),
}));

vi.mock("@/lib/stripe", () => ({
  PLANS: { monthly: { price: 399 } },
  getStripe: () => ({
    customers: { createBalanceTransaction: mockCreateBalanceTransaction },
    paymentIntents: { retrieve: mockPaymentIntentRetrieve },
    paymentMethods: { list: mockPaymentMethodsList },
  }),
}));

vi.mock("@/lib/db/schema", () => ({
  users: {
    __name: "users",
    id: "users.id",
    role: "users.role",
    stripeCustomerId: "users.stripeCustomerId",
  },
  referrals: {
    __name: "referrals",
    id: "referrals.id",
    referrerUserId: "referrals.referrerUserId",
    refereeUserId: "referrals.refereeUserId",
    status: "referrals.status",
    rewardStripeBalanceTransactionId:
      "referrals.rewardStripeBalanceTransactionId",
    rewardedAt: "referrals.rewardedAt",
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => {
          const rows = selectRows.shift() ?? [];
          return {
            limit: () => Promise.resolve(rows),
            then: (
              resolve: (value: Array<Record<string, unknown>>) => unknown,
            ) => Promise.resolve(rows).then(resolve),
          };
        },
      }),
    }),
    update: (table: { __name?: string }) => ({
      set: (values: Record<string, unknown>) => ({
        where: () => {
          updates.push({ table: table.__name ?? "unknown", values });
          return Promise.resolve();
        },
      }),
    }),
  },
}));

import { rewardReferralForPaidInvoice } from "@/lib/referrals/rewards";

const paidInvoice = {
  id: "in_1",
  customer: "cus_referee",
  subscription: "sub_1",
  currency: "gbp",
  amount_paid: 399,
  payment_intent: "pi_1",
};

beforeEach(() => {
  vi.clearAllMocks();
  updates.length = 0;
  selectRows = [];
  mockPaymentIntentRetrieve.mockResolvedValue({
    payment_method: { type: "card", card: { fingerprint: "fp_referee" } },
  });
  mockPaymentMethodsList.mockResolvedValue({
    data: [{ type: "card", card: { fingerprint: "fp_referrer" } }],
  });
  mockCreateBalanceTransaction.mockResolvedValue({ id: "cbtxn_1" });
});

describe("rewardReferralForPaidInvoice", () => {
  it("credits the referrer once with a one month customer balance reward", async () => {
    selectRows = [
      [{ id: "referee", role: "pro", stripeCustomerId: "cus_referee" }],
      [
        {
          id: "referral_1",
          referrerUserId: "referrer",
          refereeUserId: "referee",
          status: "signed_up",
          rewardStripeBalanceTransactionId: null,
        },
      ],
      [{ id: "referrer", role: "pro", stripeCustomerId: "cus_referrer" }],
      [{ total: 0 }],
    ];

    const result = await rewardReferralForPaidInvoice(paidInvoice as never);

    expect(result).toEqual({
      status: "rewarded",
      referralId: "referral_1",
      balanceTransactionId: "cbtxn_1",
    });
    expect(mockCreateBalanceTransaction).toHaveBeenCalledWith(
      "cus_referrer",
      expect.objectContaining({ amount: -399, currency: "gbp" }),
      { idempotencyKey: "referral_reward_referral_1_in_1" },
    );
    expect(updates).toContainEqual(
      expect.objectContaining({
        table: "referrals",
        values: expect.objectContaining({
          status: "rewarded",
          stripeInvoiceId: "in_1",
        }),
      }),
    );
  });

  it("is idempotent when the referral is already rewarded", async () => {
    selectRows = [
      [{ id: "referee", role: "pro", stripeCustomerId: "cus_referee" }],
      [],
    ];

    const result = await rewardReferralForPaidInvoice(paidInvoice as never);

    expect(result).toEqual({ status: "ignored", reason: "no_open_referral" });
    expect(mockCreateBalanceTransaction).not.toHaveBeenCalled();
  });

  it("blocks self referral before creating any Stripe credit", async () => {
    selectRows = [
      [{ id: "same_user", role: "pro", stripeCustomerId: "cus_referee" }],
      [
        {
          id: "referral_1",
          referrerUserId: "same_user",
          refereeUserId: "same_user",
          status: "signed_up",
          rewardStripeBalanceTransactionId: null,
        },
      ],
    ];

    const result = await rewardReferralForPaidInvoice(paidInvoice as never);

    expect(result).toEqual({ status: "blocked", reason: "self_referral" });
    expect(mockCreateBalanceTransaction).not.toHaveBeenCalled();
    expect(updates).toContainEqual(
      expect.objectContaining({
        table: "referrals",
        values: expect.objectContaining({
          status: "blocked",
          abuseReason: "self_referral",
        }),
      }),
    );
  });

  it("does not update the admin user record while applying a referral reward", async () => {
    selectRows = [
      [{ id: "referee", role: "pro", stripeCustomerId: "cus_referee" }],
      [
        {
          id: "referral_1",
          referrerUserId: "admin_1",
          refereeUserId: "referee",
          status: "signed_up",
          rewardStripeBalanceTransactionId: null,
        },
      ],
      [{ id: "admin_1", role: "admin", stripeCustomerId: "cus_admin" }],
      [{ total: 0 }],
    ];

    const result = await rewardReferralForPaidInvoice(paidInvoice as never);

    expect(result.status).toBe("rewarded");
    expect(updates.every((entry) => entry.table !== "users")).toBe(true);
  });
  it("ignores the zero-amount trial invoice", async () => {
    const result = await rewardReferralForPaidInvoice({
      ...paidInvoice,
      amount_paid: 0,
    } as never);
    expect(result).toEqual({
      status: "ignored",
      reason: "zero_amount_invoice",
    });
  });

  it("ignores non-GBP invoices", async () => {
    const result = await rewardReferralForPaidInvoice({
      ...paidInvoice,
      currency: "inr",
    } as never);
    expect(result).toEqual({ status: "ignored", reason: "non_gbp_invoice" });
  });
});
