import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getClientIp,
  rateLimit,
  resetRateLimitForTests,
} from "@/lib/rate-limit";

afterEach(() => {
  resetRateLimitForTests();
  vi.useRealTimers();
});

describe("getClientIp", () => {
  it("uses Vercel's forwarded IP instead of a spoofed x-forwarded-for list", () => {
    const request = new Request("https://aieducademy.org/api/auth/signup", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.10",
        "x-forwarded-for": "198.51.100.99, 10.0.0.1",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("falls back to the first platform-provided forwarded hop", () => {
    const request = new Request("https://aieducademy.org/api/auth/signup", {
      headers: {
        "x-forwarded-for": "203.0.113.20, 10.0.0.1",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.20");
  });
});

describe("rateLimit", () => {
  it("resets the window at the exact boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-26T10:00:00.000Z"));
    resetRateLimitForTests();

    const config = { limit: 1, windowSeconds: 1 };

    expect(rateLimit("203.0.113.30", config).success).toBe(true);
    expect(rateLimit("203.0.113.30", config).success).toBe(false);

    vi.setSystemTime(new Date("2026-09-26T10:00:01.000Z"));

    expect(rateLimit("203.0.113.30", config).success).toBe(true);
  });
});
