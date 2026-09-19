import { describe, it, expect, vi } from "vitest";
import {
  refreshTokenRole,
  shouldRefreshRole,
  ROLE_REFRESH_MS,
  type RoleToken,
} from "@/lib/auth-role";

const NOW = 1_700_000_000_000;

describe("shouldRefreshRole", () => {
  it("does nothing without a subject to look up", () => {
    expect(shouldRefreshRole({ role: "free" }, undefined, NOW)).toBe(false);
  });

  it("leaves a recently checked role alone", () => {
    const token = { sub: "u1", role: "pro", roleCheckedAt: NOW - 1000 };
    expect(shouldRefreshRole(token, undefined, NOW)).toBe(false);
  });

  it("refreshes once the cached role has gone stale", () => {
    const token = { sub: "u1", role: "free", roleCheckedAt: NOW - ROLE_REFRESH_MS - 1 };
    expect(shouldRefreshRole(token, undefined, NOW)).toBe(true);
  });

  it("refreshes a token minted before roles were ever checked", () => {
    expect(shouldRefreshRole({ sub: "u1", role: "free" }, undefined, NOW)).toBe(true);
  });

  it("refreshes immediately when asked to, so checkout is honoured at once", () => {
    const token = { sub: "u1", role: "free", roleCheckedAt: NOW };
    expect(shouldRefreshRole(token, "update", NOW)).toBe(true);
  });
});

describe("refreshTokenRole", () => {
  it("promotes an admin whose token still says free", async () => {
    // The reported bug: both admin accounts were told they were signed in
    // "with role 'free'" because the token predated the role being granted.
    const token: RoleToken = { sub: "admin-1", role: "free" };
    const result = await refreshTokenRole(token, undefined, async () => "admin", NOW);
    expect(result.role).toBe("admin");
    expect(result.roleCheckedAt).toBe(NOW);
  });

  it("restores pro for a paying user whose token predates their subscription", async () => {
    const token = { sub: "payer-1", role: "free", roleCheckedAt: NOW - ROLE_REFRESH_MS - 1 };
    const result = await refreshTokenRole(token, undefined, async () => "pro", NOW);
    expect(result.role).toBe("pro");
  });

  it("does not hit the database while the cached role is still fresh", async () => {
    const lookup = vi.fn(async () => "admin");
    const token = { sub: "u1", role: "pro", roleCheckedAt: NOW };
    const result = await refreshTokenRole(token, undefined, lookup, NOW);
    expect(lookup).not.toHaveBeenCalled();
    expect(result.role).toBe("pro");
  });

  it("never downgrades a paying user when the database errors", async () => {
    const token = { sub: "payer-1", role: "pro" };
    const result = await refreshTokenRole(
      token,
      undefined,
      async () => {
        throw new Error("neon unreachable");
      },
      NOW
    );
    expect(result.role).toBe("pro");
  });

  it("never downgrades when the lookup finds no row", async () => {
    const token = { sub: "admin-1", role: "admin" };
    const result = await refreshTokenRole(token, undefined, async () => null, NOW);
    expect(result.role).toBe("admin");
  });

  it("picks up a demotion as readily as a promotion", async () => {
    const token = { sub: "u1", role: "admin" };
    const result = await refreshTokenRole(token, "update", async () => "free", NOW);
    expect(result.role).toBe("free");
  });
});
