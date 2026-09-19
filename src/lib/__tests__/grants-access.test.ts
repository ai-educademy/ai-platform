import { describe, it, expect } from "vitest";
import { grantsAccess } from "@/lib/subscription";

const NOW = new Date("2026-06-01T12:00:00Z");
const FUTURE = new Date("2026-06-20T12:00:00Z");
const PAST = new Date("2026-05-20T12:00:00Z");

describe("grantsAccess", () => {
  it("lets an active subscriber in", () => {
    expect(grantsAccess("active", FUTURE, NOW)).toBe(true);
  });

  it("lets an active subscriber in even with no recorded period end", () => {
    expect(grantsAccess("active", null, NOW)).toBe(true);
  });

  it("lets a trialing subscriber in, which the old status check never did", () => {
    expect(grantsAccess("trialing", FUTURE, NOW)).toBe(true);
  });

  it("keeps a past_due subscriber in while the paid period is still running", () => {
    // Stripe marks a subscription past_due on the first failed charge and then
    // retries for days. Throwing the customer out at that moment turns a bank
    // blip into a cancellation.
    expect(grantsAccess("past_due", FUTURE, NOW)).toBe(true);
  });

  it("locks out a past_due subscriber once the paid period has run out", () => {
    expect(grantsAccess("past_due", PAST, NOW)).toBe(false);
  });

  it("locks out a past_due subscriber with no period end, since nothing proves it is paid for", () => {
    expect(grantsAccess("past_due", null, NOW)).toBe(false);
  });

  it("locks out a cancelled subscriber", () => {
    expect(grantsAccess("cancelled", FUTURE, NOW)).toBe(false);
  });

  it("locks out an incomplete subscriber, because that payment never completed", () => {
    expect(grantsAccess("incomplete", FUTURE, NOW)).toBe(false);
  });

  it("locks out an unrecognised status rather than failing open", () => {
    expect(grantsAccess("something-new-from-stripe", FUTURE, NOW)).toBe(false);
  });

  it("treats the exact expiry instant as expired", () => {
    expect(grantsAccess("past_due", NOW, NOW)).toBe(false);
  });
});
