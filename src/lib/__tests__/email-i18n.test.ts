import { describe, it, expect } from "vitest";
import { getEmailTranslator } from "../email-i18n";
import { abandonedCartEmailHtml } from "../emailTemplates";

describe("getEmailTranslator", () => {
  it("returns English for the default locale", async () => {
    const tr = await getEmailTranslator("en");
    expect(tr.locale).toBe("en");
    expect(tr.dir).toBe("ltr");
    expect(tr.t("abandonedCartCta")).toBe("Complete your purchase");
  });

  it("translates for a supported locale", async () => {
    const tr = await getEmailTranslator("de");
    expect(tr.locale).toBe("de");
    expect(tr.t("abandonedCartCta")).toBe("Kauf abschließen");
  });

  it("marks Arabic as right-to-left", async () => {
    const tr = await getEmailTranslator("ar");
    expect(tr.dir).toBe("rtl");
  });

  it("falls back to English for an unsupported locale", async () => {
    const tr = await getEmailTranslator("xx");
    expect(tr.locale).toBe("en");
    expect(tr.t("abandonedCartCta")).toBe("Complete your purchase");
  });

  it("falls back to English for a path-traversal locale rather than loading it", async () => {
    const tr = await getEmailTranslator("../../../etc/passwd");
    expect(tr.locale).toBe("en");
  });

  it("returns the key itself when a message is missing entirely", async () => {
    const tr = await getEmailTranslator("en");
    expect(tr.t("noSuchMessageKey")).toBe("noSuchMessageKey");
  });

  it("interpolates named values", async () => {
    const tr = await getEmailTranslator("en");
    expect(tr.t("abandonedCartGreeting", { name: "Ada" })).toBe("Hi Ada,");
  });

  it("leaves unknown placeholders untouched", async () => {
    const tr = await getEmailTranslator("en");
    expect(tr.t("abandonedCartGreeting", { other: "x" })).toContain("{name}");
  });
});

describe("abandonedCartEmailHtml", () => {
  const url = "https://aieducademy.org/de/pricing";

  it("renders localised copy with the right lang and dir", async () => {
    const tr = await getEmailTranslator("de");
    const html = abandonedCartEmailHtml("Ada", url, tr);
    expect(html).toContain('lang="de"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("Kauf abschließen");
    expect(html).not.toContain("Complete your purchase");
  });

  it("renders Arabic right-to-left", async () => {
    const tr = await getEmailTranslator("ar");
    const html = abandonedCartEmailHtml("Ada", url, tr);
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
  });

  it("omits the promo banner when no code is configured", async () => {
    const tr = await getEmailTranslator("en");
    const html = abandonedCartEmailHtml("Ada", url, tr);
    expect(html).not.toContain("#fef3c7");
  });

  it("renders the promo banner only when a code is supplied", async () => {
    const tr = await getEmailTranslator("en");
    const html = abandonedCartEmailHtml("Ada", url, tr, "SAVE20");
    expect(html).toContain("SAVE20");
    expect(html).toContain("#fef3c7");
  });

  it("escapes the customer name", async () => {
    const tr = await getEmailTranslator("en");
    const html = abandonedCartEmailHtml("<script>alert(1)</script>", url, tr);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("uses the translated fallback when no name is known", async () => {
    const tr = await getEmailTranslator("es");
    const html = abandonedCartEmailHtml(undefined, url, tr);
    expect(html).toContain("Hola hola,");
  });

  it("keeps the pricing URL intact", async () => {
    const tr = await getEmailTranslator("de");
    const html = abandonedCartEmailHtml("Ada", url, tr);
    expect(html).toContain(`href="${url}"`);
  });
});
