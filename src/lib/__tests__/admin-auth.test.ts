import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
let userRows: Array<{ id: string; role: "free" | "pro" | "admin" }> = [];
let roleLookupThrows = false;

vi.mock("@/auth", () => ({ auth: () => mockAuth() }));
vi.mock("@/lib/db/schema", () => ({
  users: { id: "users.id", role: "users.role" },
}));
vi.mock("drizzle-orm", () => ({
  eq: (column: string, value: unknown) => ({ column, value }),
}));
vi.mock("@/lib/db", () => ({
  db: {
    select: () => {
      if (roleLookupThrows) throw new Error("database unavailable");
      return {
        from: () => ({
          where: (condition: { value: unknown }) => ({
            limit: (count: number) =>
              Promise.resolve(
                userRows
                  .filter((row) => row.id === condition.value)
                  .slice(0, count),
              ),
          }),
        }),
      };
    },
  },
}));

import { requireAdmin } from "@/lib/admin-auth";

beforeEach(() => {
  vi.clearAllMocks();
  userRows = [];
  roleLookupThrows = false;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requireAdmin", () => {
  it("rejects anonymous callers", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await requireAdmin();

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.response.status).toBe(401);
  });

  it("accepts a DB-confirmed admin even when their token is stale", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "admin" } });
    userRows = [{ id: "admin_1", role: "admin" }];

    const result = await requireAdmin();

    expect(result.authorized).toBe(true);
  });

  it("rejects a stale token when the database says the user is not an admin", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1", role: "admin" } });
    userRows = [{ id: "user_1", role: "free" }];

    const result = await requireAdmin();

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.response.status).toBe(403);
  });

  it("accepts a real admin even when their JWT still says free", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "free" } });
    userRows = [{ id: "admin_1", role: "admin" }];

    const result = await requireAdmin();

    expect(result.authorized).toBe(true);
  });

  it("fails closed when the role lookup errors", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "admin" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    roleLookupThrows = true;

    const result = await requireAdmin();

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.response.status).toBe(403);
  });
});
