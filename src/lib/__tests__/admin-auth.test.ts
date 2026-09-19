import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();

vi.mock("@/auth", () => ({ auth: () => mockAuth() }));

import { requireAdmin } from "@/lib/admin-auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAdmin", () => {
  it("rejects anonymous callers", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await requireAdmin();

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.response.status).toBe(401);
  });

  it("allows an admin token through", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "admin" } });

    const result = await requireAdmin();

    expect(result.authorized).toBe(true);
  });

  it("documents the current bug: a real admin is refused while their JWT still says free", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "free" } });

    const result = await requireAdmin();

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.response.status).toBe(403);
  });
});
