import { beforeEach, describe, expect, it, vi } from "vitest";

const results: unknown[][] = [];
let throwOnQuery = false;
let dbConfigured = true;

vi.mock("@/lib/db", () => {
  const chain = {
    select: () => chain,
    from: () => chain,
    where: () => chain,
    limit: async () => {
      if (throwOnQuery) throw new Error("db down");
      return results.shift() ?? [];
    },
  };
  return {
    get db() {
      return chain;
    },
    get isDbConfigured() {
      return dbConfigured;
    },
  };
});
vi.mock("@/lib/db/schema", () => ({
  users: { email: "users.email", marketingOptOutAt: "users.opt" },
  newsletterSubscribers: { email: "ns.email", unsubscribedAt: "ns.unsub" },
}));

import { isMarketingSuppressed } from "@/lib/unsubscribe";

beforeEach(() => {
  results.length = 0;
  throwOnQuery = false;
  dbConfigured = true;
});

describe("isMarketingSuppressed", () => {
  it("given an account that opted out, when checked, then marketing is suppressed", async () => {
    results.push([{ optedOutAt: new Date() }]);
    expect(await isMarketingSuppressed("Learner@Gmail.com")).toBe(true);
  });

  it("given a newsletter unsubscribe without an account, when checked, then marketing is suppressed", async () => {
    results.push([], [{ unsubscribedAt: new Date() }]);
    expect(await isMarketingSuppressed("reader@gmail.com")).toBe(true);
  });

  it("given no opt-out anywhere, when checked, then marketing may be sent", async () => {
    results.push([{ optedOutAt: null }], []);
    expect(await isMarketingSuppressed("learner@gmail.com")).toBe(false);
  });

  it("given a disposable address, when checked, then it is suppressed without touching the database", async () => {
    throwOnQuery = true;
    expect(await isMarketingSuppressed("someone@mailinator.com")).toBe(true);
  });

  it("given the database is unreachable, when checked, then it fails closed", async () => {
    throwOnQuery = true;
    expect(await isMarketingSuppressed("learner@gmail.com")).toBe(true);
  });

  it("given no database is configured, when checked, then it fails closed", async () => {
    dbConfigured = false;
    expect(await isMarketingSuppressed("learner@gmail.com")).toBe(true);
  });
});
