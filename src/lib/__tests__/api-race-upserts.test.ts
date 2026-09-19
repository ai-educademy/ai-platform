import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
};

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

describe("race-safe activity writes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("records streak activity through a single upsert instead of select then insert", async () => {
    const returning = vi.fn().mockResolvedValue([
      { currentStreak: 1, longestStreak: 1, lastActivityDate: "2026-09-19" },
    ]);
    const onConflictDoUpdate = vi.fn().mockReturnValue({ returning });
    const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
    mockDb.insert.mockReturnValue({ values });

    const { POST } = await import("@/app/api/streak/route");
    const response = await POST(new Request("https://aieducademy.org/api/streak", { method: "POST" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ currentStreak: 1, longestStreak: 1 });
    expect(mockDb.select).not.toHaveBeenCalled();
    expect(onConflictDoUpdate).toHaveBeenCalledOnce();
  });

  it("migrates stored streaks with insert-on-conflict-do-nothing", async () => {
    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn().mockReturnValue({ onConflictDoNothing });
    mockDb.insert.mockReturnValue({ values });

    const { POST } = await import("@/app/api/streak/route");
    const response = await POST(
      new Request("https://aieducademy.org/api/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStreak: 3,
          longestStreak: 4,
          lastActivityDate: "2026-09-19",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockDb.select).not.toHaveBeenCalled();
    expect(onConflictDoNothing).toHaveBeenCalledOnce();
  });

  it("records playground scores through an upsert guarded by best score", async () => {
    const returning = vi.fn().mockResolvedValue([{ bestScore: 12 }]);
    const onConflictDoUpdate = vi.fn().mockReturnValue({ returning });
    const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
    mockDb.insert.mockReturnValue({ values });

    const { POST } = await import("@/app/api/playground-scores/route");
    const request = new Request("https://aieducademy.org/api/playground-scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: "prompt-race", score: 12 }),
    }) as NextRequest;
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ bestScore: 12, isNew: true });
    expect(onConflictDoUpdate).toHaveBeenCalledOnce();
    expect(onConflictDoUpdate.mock.calls[0]?.[0]).toHaveProperty("setWhere");
  });
});
