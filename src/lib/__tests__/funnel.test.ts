import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const values = vi.fn();
  return {
    values,
    insert: vi.fn(() => ({ values })),
    headers: vi.fn(),
  };
});

vi.mock("@/lib/db", () => ({
  db: { insert: mocks.insert },
}));

vi.mock("@/lib/db/schema", () => ({
  funnelEvents: {},
}));

vi.mock("next/headers", () => ({
  headers: () => mocks.headers(),
}));

import { trackEvent, trackEventForTest } from "@/lib/funnel";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.values.mockResolvedValue(undefined);
  mocks.headers.mockResolvedValue(
    new Headers({
      "user-agent": "vitest",
      "x-forwarded-for": "203.0.113.10",
      "x-vercel-ip-country": "GB",
    })
  );
});

describe("trackEvent", () => {
  it("does not throw when the database is down", async () => {
    mocks.values.mockRejectedValue(new Error("db down"));

    expect(() => trackEvent("pricing_viewed", { path: "/pricing" })).not.toThrow();
    await trackEventForTest("pricing_viewed", { path: "/pricing" });
  });

  it("does not store anonymous events when Do Not Track is enabled", async () => {
    mocks.headers.mockResolvedValue(new Headers({ dnt: "1" }));

    await trackEventForTest("pricing_viewed", { path: "/pricing" });

    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("still stores signed-in events when Do Not Track is enabled", async () => {
    mocks.headers.mockResolvedValue(new Headers({ dnt: "1" }));

    await trackEventForTest("lesson_completed", { userId: "user_1", path: "/lesson" });

    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ userId: "user_1" }));
  });
});
