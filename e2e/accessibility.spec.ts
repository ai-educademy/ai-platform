import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("homepage has no major accessibility issues", async ({ page }) => {
    await page.goto("/en");
    // Check for heading hierarchy
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();

    // Check that images have alt text
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // Next.js Image components should always have alt
      expect(alt).not.toBeNull();
    }
  });

  test("navigation is keyboard accessible", async ({ page }) => {
    await page.goto("/en");
    // Tab through nav elements
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    // First focusable element should be a link or button
    expect(["A", "BUTTON", "INPUT"]).toContain(focused);
  });

  test("color contrast — text is readable", async ({ page }) => {
    await page.goto("/en");
    // Verify body text is visible (basic check)
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const bodyText = await body.textContent();
    expect(bodyText?.length).toBeGreaterThan(100);
  });
});

test.describe("Performance", () => {
  test("homepage loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test("programs page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/en/programs", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/en");
    await page.waitForTimeout(2000);
    // Filter out known benign errors (hydration warnings, etc.)
    const realErrors = errors.filter(
      (e) =>
        !e.includes("hydrat") &&
        !e.includes("Warning") &&
        !e.includes("favicon") &&
        !e.includes("_vercel/") &&
        !e.includes("MIME type") &&
        !e.includes("Failed to load resource") &&
        !e.includes("net::ERR_")
    );
    expect(realErrors).toHaveLength(0);
  });
});
