import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the checkout route, which is the only path by which this product
 * earns anything.
 *
 * Before these existed the revenue path had no end-to-end coverage and two
 * unit tests, both on lesson gating. A change that broke checkout would have
 * gone green through CI, and the first signal would have been a flat revenue
 * graph some days later.
 *
 * The invariants worth defending are the ones that either give the product
 * away or take money under false pretences.
 */

const mockAuth = vi.fn();
const mockCustomersCreate = vi.fn();
const mockSessionsCreate = vi.fn();
const mockPromoList = vi.fn();
const mockDbUpdate = vi.fn();

let selectResult: Array<{ stripeCustomerId: string | null }> = [];

vi.mock("@/auth", () => ({ auth: () => mockAuth() }));

vi.mock("@/lib/stripe", async () => {
  const actual = await vi.importActual<typeof import("@/lib/pricing")>("@/lib/pricing");
  return {
    PLANS: {
      monthly: { name: "Pro Monthly", price: actual.PLAN_PRICES_PENCE.monthly, interval: "month", priceId: "price_monthly" },
      annual: { name: "Pro Annual", price: actual.PLAN_PRICES_PENCE.annual, interval: "year", priceId: "price_annual" },
      lifetime: { name: "Lifetime", price: actual.PLAN_PRICES_PENCE.lifetime, interval: null, priceId: "price_lifetime" },
    },
    getStripe: () => ({
      customers: { create: mockCustomersCreate },
      checkout: { sessions: { create: mockSessionsCreate } },
      promotionCodes: { list: mockPromoList },
    }),
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: () => Promise.resolve(selectResult) }) }),
    }),
    update: () => ({
      set: (v: unknown) => ({
        where: () => {
          mockDbUpdate(v);
          return Promise.resolve();
        },
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({ users: {} }));
vi.mock("drizzle-orm", () => ({ eq: () => ({}) }));

import { POST } from "@/app/api/stripe/checkout/route";

function request(body: unknown) {
  return new Request("https://aieducademy.org/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0];
}

const SIGNED_IN = { user: { id: "user_1", email: "learner@example.com", name: "Learner" } };

beforeEach(() => {
  vi.clearAllMocks();
  selectResult = [{ stripeCustomerId: "cus_existing" }];
  mockAuth.mockResolvedValue(SIGNED_IN);
  mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/s/1" });
  mockPromoList.mockResolvedValue({ data: [] });
  mockCustomersCreate.mockResolvedValue({ id: "cus_new" });
});

describe("POST /api/stripe/checkout", () => {
  it("refuses anonymous callers, so checkout cannot be driven without an account", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST(request({ plan: "monthly" }));

    expect(res.status).toBe(401);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("refuses a signed-in session with no email, which Stripe requires", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });

    const res = await POST(request({ plan: "monthly" }));

    expect(res.status).toBe(401);
  });

  it.each(["monthly", "annual", "lifetime"])("creates a session for the %s plan", async (plan) => {
    const res = await POST(request({ plan }));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ url: "https://checkout.stripe.com/s/1" });
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ line_items: [{ price: `price_${plan}`, quantity: 1 }] }),
    );
  });

  it("rejects an unknown plan rather than charging for something undefined", async () => {
    const res = await POST(request({ plan: "free" }));

    expect(res.status).toBe(400);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  // A real plan with no configured Stripe price is an operator mistake, not a
  // malformed request. Collapsing both into 400 "Invalid plan" made a silent
  // revenue leak indistinguishable from ordinary client noise in the logs.
  it("reports a real plan with no configured price as unavailable, not as a bad request", async () => {
    const { PLANS } = await import("@/lib/stripe");
    const original = PLANS.annual.priceId;
    (PLANS.annual as { priceId: string }).priceId = "";

    try {
      const res = await POST(request({ plan: "annual" }));

      expect(res.status).toBe(503);
      expect((await res.json()).error).toBe("Plan unavailable");
      expect(mockSessionsCreate).not.toHaveBeenCalled();
    } finally {
      (PLANS.annual as { priceId: string }).priceId = original;
    }
  });

  it("bills lifetime as a one-off payment, not a recurring subscription", async () => {
    await POST(request({ plan: "lifetime" }));

    expect(mockSessionsCreate).toHaveBeenCalledWith(expect.objectContaining({ mode: "payment" }));
  });

  it.each(["monthly", "annual"])("bills %s as a subscription", async (plan) => {
    await POST(request({ plan }));

    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "subscription" }),
    );
  });

  it("reports promoApplied false when the code does not resolve", async () => {
    // The UI previously showed "code applied" whenever checkout returned a
    // URL, so a typo sent the customer to Stripe at full price while being
    // told they had a discount.
    mockPromoList.mockResolvedValue({ data: [] });

    const res = await POST(request({ plan: "monthly", promoCode: "NOPE" }));

    expect(await res.json()).toMatchObject({ promoApplied: false });
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.not.objectContaining({ discounts: expect.anything() }),
    );
  });

  it("applies a resolved promo code and says so", async () => {
    mockPromoList.mockResolvedValue({ data: [{ id: "promo_1" }] });

    const res = await POST(request({ plan: "monthly", promoCode: "LAUNCH" }));

    expect(await res.json()).toMatchObject({ promoApplied: true });
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ discounts: [{ promotion_code: "promo_1" }] }),
    );
  });

  it("still completes checkout when the promo lookup throws", async () => {
    // A failing discount lookup must never block someone trying to pay.
    mockPromoList.mockRejectedValue(new Error("stripe down"));

    const res = await POST(request({ plan: "monthly", promoCode: "LAUNCH" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ promoApplied: false });
  });

  it("creates a Stripe customer only when the user has none, and stores the id", async () => {
    selectResult = [{ stripeCustomerId: null }];

    await POST(request({ plan: "monthly" }));

    expect(mockCustomersCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: "learner@example.com", metadata: { userId: "user_1" } }),
    );
    expect(mockDbUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ stripeCustomerId: "cus_new" }),
    );
  });

  it("reuses an existing Stripe customer instead of creating duplicates", async () => {
    await POST(request({ plan: "monthly" }));

    expect(mockCustomersCreate).not.toHaveBeenCalled();
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" }),
    );
  });

  it("carries the user id and plan in metadata, which the webhook needs to grant access", async () => {
    await POST(request({ plan: "annual" }));

    const arg = mockSessionsCreate.mock.calls[0][0];
    expect(arg.metadata).toMatchObject({ userId: "user_1", plan: "annual" });
  });

  it("launders the locale, which reaches Stripe metadata and an outbound email", async () => {
    await POST(request({ plan: "monthly", locale: "../../evil" }));

    const arg = mockSessionsCreate.mock.calls[0][0];
    expect(arg.metadata.locale).toBe("en");
    expect(arg.success_url).not.toContain("evil");
    expect(arg.cancel_url).not.toContain("evil");
  });

  it("returns the learner to their own language after paying", async () => {
    await POST(request({ plan: "monthly", locale: "fr" }));

    const arg = mockSessionsCreate.mock.calls[0][0];
    expect(arg.metadata.locale).toBe("fr");
    expect(arg.success_url).toContain("/fr/dashboard");
    expect(arg.cancel_url).toContain("/fr/pricing");
  });

  it("does not leak internal errors to the caller", async () => {
    mockSessionsCreate.mockRejectedValue(new Error("card network on fire"));

    const res = await POST(request({ plan: "monthly" }));

    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("card network on fire");
  });
});
