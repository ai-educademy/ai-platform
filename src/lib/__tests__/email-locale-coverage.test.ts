import { describe, it, expect } from "vitest";
import { getEmailTranslator } from "../email-i18n";
import { proUpgradeEmailHtml, welcomeEmailHtml, subscriptionEmailHtml } from "../emailTemplates";
import { locales } from "@/i18n/locales";

const UNSUBSCRIBE = "https://aieducademy.org/unsubscribe?token=abc123";
const PRICING = "https://aieducademy.org/pricing";

/**
 * Every locale the site advertises must produce a complete email.
 *
 * These templates previously shipped strings for only five of the eleven
 * locales, so six languages silently received English. A missing key now fails
 * here rather than in someone's inbox.
 */
describe("Pro upgrade email renders in every locale", () => {
  it.each(locales)("%s", async (locale) => {
    const tr = await getEmailTranslator(locale);
    const html = proUpgradeEmailHtml("Ramesh", PRICING, UNSUBSCRIBE, tr);

    // A next-intl miss renders the key path itself, which is the failure mode
    // that would otherwise reach a customer.
    expect(html).not.toMatch(/emails\.proUpgrade/);
    // Unreplaced ICU placeholders mean the greeting lost its name.
    expect(html).not.toMatch(/\{name\}/);
    expect(html).toContain("Ramesh");
    expect(html).toContain(UNSUBSCRIBE);
    expect(html).toContain(PRICING);
    expect(html).toContain(`dir="${locale === "ar" ? "rtl" : "ltr"}"`);
    expect(html).toContain(`lang="${locale}"`);
  });

  it("falls back to a neutral greeting when the account has no name", async () => {
    const tr = await getEmailTranslator("en");
    const html = proUpgradeEmailHtml(undefined, PRICING, UNSUBSCRIBE, tr);

    expect(html).not.toMatch(/\{name\}/);
    expect(html).toContain("Hi there,");
  });

  it("escapes a name containing markup exactly once", async () => {
    const tr = await getEmailTranslator("en");
    const html = proUpgradeEmailHtml("<script>x</script>", PRICING, UNSUBSCRIBE, tr);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    // Double-escaping would produce &amp;lt;, which renders as literal "&lt;".
    expect(html).not.toContain("&amp;lt;");
  });
});

describe("welcome and subscription emails cover every locale", () => {
  it.each(locales)("welcome renders in %s", (locale) => {
    const html = welcomeEmailHtml("learner@example.com", locale, "Ramesh", UNSUBSCRIBE);

    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(`dir="${locale === "ar" ? "rtl" : "ltr"}"`);
    expect(html).toContain(UNSUBSCRIBE);
    // The homepage was previously used as a stand-in for a real opt-out link.
    expect(html).not.toMatch(/href="https:\/\/aieducademy\.org"[^>]*>\s*(Unsubscribe|Se desabonner)/);
  });

  it.each(locales)("subscription activation renders in %s", (locale) => {
    const html = subscriptionEmailHtml("learner@example.com", "activated", "monthly", locale);

    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(`dir="${locale === "ar" ? "rtl" : "ltr"}"`);
    // The amount is held out of translation, but the decimal separator and the
    // symbol's position are locale conventions, so assert on the digits only.
    expect(html).toMatch(/3[.,]99/);
    expect(html).toContain("£");
    // "/mo" and "/yr" are English abbreviations. They were left behind in six
    // locales when the plan labels were first generated.
    if (locale !== "en") {
      expect(html).not.toMatch(/\/mo\b/);
      expect(html).not.toMatch(/\/yr\b/);
    }
  });
});
