import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Recipient-privacy guarantees for bulk marketing.
 *
 * A campaign that puts recipients in a shared `to`, `cc` or `bcc` field leaks
 * the customer list. `bcc` hides addresses from each other but still shows the
 * sender's whole list to anyone who obtains one message's headers, and a single
 * mistake in `to` exposes every address outright. The campaign therefore sends
 * one message per recipient, and these tests fail if that ever changes.
 */

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

describe("marketing email recipient privacy", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "test" }, error: null });
    process.env.RESEND_API_KEY = "re_test_key";
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it("addresses exactly one recipient and never uses cc or bcc", async () => {
    const { sendMarketingEmail } = await import("@/lib/email");

    await sendMarketingEmail(
      "learner@example.com",
      "Subject",
      "<p>Body</p>",
      "https://aieducademy.org/unsubscribe?token=abc",
    );

    expect(sendMock).toHaveBeenCalledTimes(1);
    const payload = sendMock.mock.calls[0][0];

    expect(payload.to).toBe("learner@example.com");
    expect(Array.isArray(payload.to)).toBe(false);
    expect(payload.cc).toBeUndefined();
    expect(payload.bcc).toBeUndefined();
  });

  it("sets one-click unsubscribe headers required of bulk senders", async () => {
    const { sendMarketingEmail } = await import("@/lib/email");
    const link = "https://aieducademy.org/unsubscribe?token=abc";

    await sendMarketingEmail("learner@example.com", "Subject", "<p>Body</p>", link);

    const headers = sendMock.mock.calls[0][0].headers;
    expect(headers["List-Unsubscribe"]).toBe(`<${link}>`);
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("reports failure rather than swallowing it, so a campaign can resume", async () => {
    const { sendMarketingEmail } = await import("@/lib/email");
    sendMock.mockResolvedValue({ data: null, error: { message: "rate limited" } });

    const ok = await sendMarketingEmail("learner@example.com", "S", "<p>B</p>", "https://x/u");

    expect(ok.status).toBe("rejected");
  });

  it("does not attempt a send when no API key is configured", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendMarketingEmail } = await import("@/lib/email");

    const ok = await sendMarketingEmail("learner@example.com", "S", "<p>B</p>", "https://x/u");

    expect(ok.status).toBe("rejected");
    expect(sendMock).not.toHaveBeenCalled();
  });
});
