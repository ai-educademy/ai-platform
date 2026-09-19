import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockGetUserPlan = vi.fn();

vi.mock("@/auth", () => ({ auth: () => mockAuth() }));
vi.mock("@/lib/subscription", () => ({
  getUserPlan: (userId: string) => mockGetUserPlan(userId),
  canAccessPremium: (plan: string) => plan === "pro" || plan === "admin",
}));
vi.mock("@/lib/db-guard", () => ({
  isDatabaseNotConfigured: () => false,
}));

import { GET } from "@/app/api/subscription/status/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "user_1", role: "free" } });
  mockGetUserPlan.mockResolvedValue("free");
});

describe("GET /api/subscription/status", () => {
  it("given an anonymous viewer, when status is requested, then the page can show an upgrade prompt", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ plan: "free", isPro: false });
    expect(mockGetUserPlan).not.toHaveBeenCalled();
  });

  it("given a token that still says free after checkout, when status is requested, then the database plan wins", async () => {
    mockGetUserPlan.mockResolvedValue("pro");

    const res = await GET();

    expect(await res.json()).toEqual({ plan: "pro", isPro: true });
    expect(mockGetUserPlan).toHaveBeenCalledWith("user_1");
  });

  it("given an admin with no subscription row, when status is requested, then admin access is reported", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "free" } });
    mockGetUserPlan.mockResolvedValue("admin");

    const res = await GET();

    expect(await res.json()).toEqual({ plan: "admin", isPro: true });
  });

  it("given the entitlement lookup fails, when status is requested, then it degrades closed", async () => {
    mockGetUserPlan.mockRejectedValue(new Error("database unavailable"));

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ plan: "free", isPro: false });
  });
});
