import { describe, it, expect } from "vitest";
import { safeLocale, localeBasePath } from "@/lib/safe-locale";
import { locales } from "@/i18n/locales";

describe("safeLocale", () => {
  it("given every supported locale, when laundered, then it is preserved", () => {
    for (const locale of locales) {
      expect(safeLocale(locale)).toBe(locale);
    }
  });

  it("given an unsupported locale, when laundered, then it falls back to English", () => {
    expect(safeLocale("klingon")).toBe("en");
    expect(safeLocale("EN")).toBe("en");
    expect(safeLocale("fr-CA")).toBe("en");
  });

  it("given a missing value, when laundered, then it falls back to English", () => {
    expect(safeLocale(undefined)).toBe("en");
    expect(safeLocale(null)).toBe("en");
    expect(safeLocale("")).toBe("en");
  });

  it("given a non-string value, when laundered, then it falls back to English", () => {
    expect(safeLocale(42)).toBe("en");
    expect(safeLocale({ locale: "fr" })).toBe("en");
    expect(safeLocale(["fr"])).toBe("en");
    expect(safeLocale(true)).toBe("en");
  });

  // These are the values that made laundering necessary: the result is
  // interpolated straight into a URL that is emailed to a customer.
  it("given a path-traversal attempt, when laundered, then it is rejected", () => {
    expect(safeLocale("../../admin")).toBe("en");
    expect(safeLocale("..%2f..%2fadmin")).toBe("en");
    expect(safeLocale("fr/../../admin")).toBe("en");
  });

  it("given an absolute URL, when laundered, then it is rejected", () => {
    expect(safeLocale("https://evil.example")).toBe("en");
    expect(safeLocale("//evil.example")).toBe("en");
    expect(safeLocale("javascript:alert(1)")).toBe("en");
  });

  it("given a CRLF injection attempt, when laundered, then it is rejected", () => {
    expect(safeLocale("en\r\nBcc: attacker@evil.example")).toBe("en");
    expect(safeLocale("en\n<script>")).toBe("en");
  });
});

describe("localeBasePath", () => {
  it("given English, when building the prefix, then it is empty", () => {
    expect(localeBasePath("en")).toBe("");
  });

  it("given a non-English locale, when building the prefix, then it is prefixed", () => {
    expect(localeBasePath("fr")).toBe("/fr");
    expect(localeBasePath("ja")).toBe("/ja");
    expect(localeBasePath("ar")).toBe("/ar");
  });

  it("given every supported locale, when building the prefix, then it never double-slashes", () => {
    for (const locale of locales) {
      const path = `${localeBasePath(locale)}/dashboard`;
      expect(path.startsWith("//")).toBe(false);
      expect(path).not.toContain("//");
    }
  });
});
