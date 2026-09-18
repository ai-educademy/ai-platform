import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the Stripe webhook, which is the only thing that grants and
 * revokes paid access.
 *
 * Two failure modes here are both silent and expensive. If it stops granting,
 * customers pay and get nothing. If it stops revoking, cancelled customers keep
 * everything. Neither shows up in an error log, and neither had a test.
 *
 * Replay safety matters as much as the happy path. Stripe delivers at least
 * once, so every one of these handlers gets re-run in production sooner or
 * later.
 */

const mockConstructEvent = vi.fn();
const mockSubsRetrieve = vi.fn();
const mockSendSubscriptionEmail = vi.fn();
const mockSendAdminNotification = vi.fn();
const mockSendAbandonedCart = vi.fn();

const userUpdates: Array<Record<string, unknown>> = [];
const subUpdates: Array<Record<string, unknown>> = [];
let insertReturns: Array<{ id: string }> = [];
let userSelectRows: Array<Record<string, unknown>> = [];
let subSelectRows: Array<Record<string, unknown>> = [];
let selectCall = 0;

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubsRetrieve },
  }),
}));

vi.mock("@/lib/email", () => ({
  sendSubscriptionEmail: (...a: unknown[]) => { mockSendSubscriptionEmail(...a); return Promise.resolve(); },
  sendAdminNotification: (...a: unknown[]) => { mockSendAdminNotification(...a); return Promise.resolve(); },
  sendAbandonedCartEmail: (...a: unknown[]) => { mockSendAbandonedCart(...a); return Promise.resolve(); },
}));

vi.mock("@/lib/db/schema", () => ({
  users: { id: "users.id" },
  subscriptions: { stripeSubscriptionId: "subscriptions.stripeSubscriptionId", id: "subscriptions.id" },
}));

vi.mock("drizzle-orm", () => ({ eq: (col: unknown) => ({ col }) }));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: (table: { id?: string }) => ({
        where: () => ({
          limit: () => {
            selectCall += 1;
            return Promise.resolve(table?.id === "users.id" ? userSelectRows : subSelectRows);
          },
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoNothing: () => ({ returning: () => Promise.resolve(insertReturns) }),
      }),
    }),
    update: (table: { id?: string }) => ({
      set: (v: Record<string, unknown>) => ({
        where: () => {
          (table?.id === "users.id" ? userUpdates : subUpdates).push(v);
          return Promise.resolve();
        },
      }),
    }),
  },
}));

import { POST } from "@/app/api/stripe/webhook/route";

function request(signature: string | null = "sig_valid") {
  const headers = new Headers();
  if (signature) headers.set("stripe-signature", signature);
  return new Request("https://aieducademy.org/api/stripe/webhook", {
    method: "POST",
    headers,
    body: "{}",
  }) as unknown as Parameters<typeof POST>[0];
}

const SUBSCRIPTION_EVENT = {
  type: "checkout.session.completed",
  data: {
    object: {
      metadata: { userId: "user_1", plan: "monthly", locale: "fr" },
      subscription: "sub_123",
      amount_total: 399,
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  userUpdates.length = 0;
  subUpdates.length = 0;
  selectCall = 0;
  insertReturns = [{ id: "row_1" }];
  userSelectRows = [{ email: "learner@example.com", name: "Learner" }];
  subSelectRows = [{ userId: "user_1" }];
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mockConstructEvent.mockReturnValue(SUBSCRIPTION_EVENT);
  mockSubsRetrieve.mockResolvedValue({
    id: "sub_123",
    items: {
      data: [{
        price: { id: "price_monthly" },
        current_period_start: 1_700_000_000,
        current_period_end: 1_702_592_000,
      }],
    },
  });
});

describe("POST /api/stripe/webhook", () => {
  describe("signature verification", () => {
    it("rejects a request with no signature header", async () => {
      const res = await POST(request(null));

      expect(res.status).toBe(400);
      expect(userUpdates).toEqual([]);
    });

    it("rejects a forged signature and touches nothing", async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("no signatures found matching the expected signature");
      });

      const res = await POST(request("sig_forged"));

      expect(res.status).toBe(400);
      expect(userUpdates).toEqual([]);
      expect(mockSendSubscriptionEmail).not.toHaveBeenCalled();
    });

    it("rejects when the signing secret is not configured", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const res = await POST(request());

      expect(res.status).toBe(400);
    });
  });

  describe("granting access", () => {
    it("promotes the user to pro on a completed subscription checkout", async () => {
      const res = await POST(request());

      expect(res.status).toBe(200);
      expect(userUpdates).toContainEqual(expect.objectContaining({ role: "pro" }));
    });

    it("promotes the user to pro on a completed lifetime payment", async () => {
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: { metadata: { userId: "user_1", plan: "lifetime" }, payment_intent: "pi_1", amount_total: 4999 } },
      });

      await POST(request());

      expect(userUpdates).toContainEqual(expect.objectContaining({ role: "pro" }));
    });

    it("confirms to the customer and notifies the admin", async () => {
      await POST(request());

      expect(mockSendSubscriptionEmail).toHaveBeenCalledWith(
        "learner@example.com", "activated", "monthly",
      );
      expect(mockSendAdminNotification).toHaveBeenCalled();
    });

    it("ignores a session with no metadata rather than crashing", async () => {
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: { metadata: {} } },
      });

      const res = await POST(request());

      expect(res.status).toBe(200);
      expect(userUpdates).toEqual([]);
    });
  });

  describe("replay safety", () => {
    it("does not thank a customer twice when Stripe redelivers the event", async () => {
      // onConflictDoNothing returns no rows on replay. That empty result is the
      // only thing standing between a redelivery and a duplicate receipt.
      insertReturns = [];

      const res = await POST(request());

      expect(res.status).toBe(200);
      expect(mockSendSubscriptionEmail).not.toHaveBeenCalled();
      expect(mockSendAdminNotification).not.toHaveBeenCalled();
    });

    it("still returns 200 on replay, so Stripe stops retrying", async () => {
      insertReturns = [];

      const res = await POST(request());

      expect(res.status).toBe(200);
    });
  });

  describe("revoking access", () => {
    it("drops the user back to free when the subscription is deleted", async () => {
      mockConstructEvent.mockReturnValue({
        type: "customer.subscription.deleted",
        data: { object: { id: "sub_123" } },
      });

      const res = await POST(request());

      expect(res.status).toBe(200);
      expect(userUpdates).toContainEqual(expect.objectContaining({ role: "free" }));
    });

    it("does not revoke access for an unknown subscription", async () => {
      mockConstructEvent.mockReturnValue({
        type: "customer.subscription.deleted",
        data: { object: { id: "sub_unknown" } },
      });
      subSelectRows = [];

      const res = await POST(request());

      expect(res.status).toBe(200);
      expect(userUpdates).toEqual([]);
    });
  });

  describe("failure handling", () => {
    it("returns 500 so Stripe retries when the handler throws", async () => {
      mockSubsRetrieve.mockRejectedValue(new Error("stripe unreachable"));

      const res = await POST(request());

      expect(res.status).toBe(500);
    });

    it("ignores event types it does not handle", async () => {
      mockConstructEvent.mockReturnValue({
        type: "invoice.payment_succeeded",
        data: { object: {} },
      });

      const res = await POST(request());

      expect(res.status).toBe(200);
      expect(userUpdates).toEqual([]);
    });
  });
});
