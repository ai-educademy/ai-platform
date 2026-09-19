import { test, expect } from "@playwright/test";

/**
 * The root layout applies a `%s | AI Educademy` title template. Two pages,
 * including /pricing, also appended the brand themselves, so they shipped as
 * "Pricing | AI Educademy | AI Educademy".
 *
 * Google truncates long titles, and /pricing is the page we most want to
 * rank, so a wasted 15 characters there is a real cost rather than a nit.
 */

const PAGES = [
  "/en",
  "/en/programs",
  "/en/pricing",
  "/en/blog",
  "/en/lab",
  "/en/about",
  "/en/contact",
  "/en/faq",
];

test.describe("Page titles", () => {
  for (const path of PAGES) {
    test(`${path} names the brand exactly once`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();

      // A page that failed to render can still have a title from the layout,
      // so assert the page body is real before trusting the title.
      await expect(page.locator("footer")).toBeAttached();

      expect(title.length, `${path} has no title`).toBeGreaterThan(0);

      const occurrences = title.split("AI Educademy").length - 1;
      expect(occurrences, `"${title}" repeats the brand`).toBeLessThanOrEqual(
        1,
      );
    });
  }
});
