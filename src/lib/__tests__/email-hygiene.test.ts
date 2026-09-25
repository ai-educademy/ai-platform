import { describe, it, expect } from "vitest";
import { isUndeliverableAddress } from "@/lib/email-hygiene";

describe("isUndeliverableAddress", () => {
  it("excludes RFC-reserved documentation and test domains", () => {
    for (const email of [
      "a@example.com",
      "a@example.net",
      "a@example.org",
      "a@anything.test",
      "a@anything.invalid",
      "a@host.localhost",
      "a@box.local",
    ]) {
      expect(isUndeliverableAddress(email), email).toBe(true);
    }
  });

  it("excludes parked and provider-sandbox domains seen in real signups", () => {
    expect(isUndeliverableAddress("tester@test.com")).toBe(true);
    expect(isUndeliverableAddress("preview@joriekol.resend.app")).toBe(true);
    expect(isUndeliverableAddress("preview@resend.app")).toBe(true);
  });

  it("excludes structurally invalid addresses", () => {
    for (const email of ["", null, undefined, "no-at-sign", "@nolocal.com", "trailing@", "a@nodot"]) {
      expect(isUndeliverableAddress(email as string), String(email)).toBe(true);
    }
  });

  /**
   * The list contains real subscribers on small and regional domains. Dropping
   * one of them is worse than tolerating a bounce, so unfamiliar domains must
   * pass. These are genuine verified addresses from the production database.
   */
  it("keeps real mailboxes, including unfamiliar and regional domains", () => {
    for (const email of [
      "learner@gmail.com",
      "learner@t-online.de",
      "learner@bluewin.ch",
      "learner@clavis.mu",
      "learner@cu.edu.ge",
      "learner@rezende.biz",
      "learner@yahoo.fr",
      "learner@nu.edu",
    ]) {
      expect(isUndeliverableAddress(email), email).toBe(false);
    }
  });

  it("is case and whitespace insensitive", () => {
    expect(isUndeliverableAddress("  Tester@TEST.com ")).toBe(true);
    expect(isUndeliverableAddress("  Learner@Gmail.com ")).toBe(false);
  });

  it("does not exclude a domain merely for containing a reserved word", () => {
    expect(isUndeliverableAddress("a@testing.com")).toBe(false);
    expect(isUndeliverableAddress("a@mytest.com")).toBe(false);
    expect(isUndeliverableAddress("a@notresend.appliances.com")).toBe(false);
  });
  it("excludes throwaway inboxes on the disposable blocklist", () => {
    expect(isUndeliverableAddress("someone@minitts.net")).toBe(true);
    expect(isUndeliverableAddress("someone@mailinator.com")).toBe(true);
  });

  it("keeps real providers and unfamiliar regional domains", () => {
    expect(isUndeliverableAddress("someone@gmail.com")).toBe(false);
    expect(isUndeliverableAddress("someone@cu.edu.ge")).toBe(false);
  });
});
