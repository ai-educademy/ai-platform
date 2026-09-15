import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The campaign writes its ledger before dispatching, so it must be able to tell
 * "definitely not sent" from "outcome unknown". Collapsing the two either burns
 * the mailing list (a rejected send stays claimed and is never retried) or
 * double-mails customers (an unknown send is retried). These tests pin the
 * distinction at its source.
 */

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

describe("sendMarketingEmail outcome reporting", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    process.env.RESEND_API_KEY = "re_test_key";
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  const send = async () => {
    const { sendMarketingEmail } = await import("@/lib/email");
    return sendMarketingEmail("learner@example.com", "S", "<p>B</p>", "https://x/unsub");
  };

  it("reports a successful send", async () => {
    sendMock.mockResolvedValue({ data: { id: "abc" }, error: null });
    expect(await send()).toEqual({ status: "sent" });
  });

  it("treats a missing API key as a definite rejection, not a success", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await send();

    expect(result.status).toBe("rejected");
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("treats a provider rejection as definite, so it can be retried", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "domain not verified" } });
    const result = await send();

    expect(result.status).toBe("rejected");
    expect(result).toHaveProperty("reason", "domain not verified");
  });

  it("treats a thrown error as unknown, because the provider may have accepted it", async () => {
    sendMock.mockRejectedValue(new Error("socket hang up"));
    const result = await send();

    expect(result.status).toBe("unknown");
  });
});
