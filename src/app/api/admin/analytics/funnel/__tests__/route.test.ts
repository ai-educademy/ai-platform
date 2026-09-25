import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAdmin = vi.fn();
const mockGetFunnelSummary = vi.fn();

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

vi.mock("@/lib/funnel", () => ({
  getFunnelSummary: () => mockGetFunnelSummary(),
}));

import { GET } from "../route";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFunnelSummary.mockResolvedValue({
    days: 7,
    current: { visitors: 1, signups: 1, activationRate: 100, paywallViews: 1, checkoutStarts: 1, trials: 0, paid: 1, churn: 0 },
    previous: { visitors: 0, signups: 0, activationRate: 0, paywallViews: 0, checkoutStarts: 0, trials: 0, paid: 0, churn: 0 },
    weekOnWeek: { visitors: null, signups: null, paywallViews: null, checkoutStarts: null, trials: 0, paid: null, churn: 0 },
  });
});

describe("GET /api/admin/analytics/funnel", () => {
  it("rejects non-admin callers", async () => {
    mockRequireAdmin.mockResolvedValue({
      authorized: false,
      response: new Response("Forbidden", { status: 403 }),
    });

    const res = await GET();

    expect(res.status).toBe(403);
    expect(mockGetFunnelSummary).not.toHaveBeenCalled();
  });

  it("returns the funnel summary for admins", async () => {
    mockRequireAdmin.mockResolvedValue({ authorized: true, session: { user: { id: "admin_1" } } });

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ current: { visitors: 1, paid: 1 } });
  });
});
