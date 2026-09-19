import { test, expect } from "@playwright/test";

/**
 * Horizontal scroll on a phone is a conversion problem, not a cosmetic one.
 * The sign-in, sign-up and password pages each painted a decorative 500px
 * blur inside a `relative` wrapper that had no clipping, so on a 320px
 * screen the document was 90px wider than the viewport and the whole page
 * slid sideways. That is the top of the signup funnel.
 *
 * Checked at the narrowest widths we support, in three locales, including
 * Arabic so a right to left layout cannot regress unnoticed.
 */

const WIDTHS = [320, 375, 414];
const LOCALES = ["", "/de", "/ar"];
const PATHS = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/pricing",
  "/programs",
  "",
];

test.describe("Mobile layout", () => {
  for (const width of WIDTHS) {
    test(`no page scrolls sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const offenders: string[] = [];

      for (const locale of LOCALES) {
        for (const path of PATHS) {
          const url = `${locale}${path}` || "/";
          await page.goto(url);

          // A page that fails to render has no overflow, which would make
          // this test pass for entirely the wrong reason.
          await expect(page.locator("footer")).toBeAttached();

          const overflow = await page.evaluate(() => {
            const el = document.documentElement;
            return el.scrollWidth - el.clientWidth;
          });

          if (overflow > 0) offenders.push(`${url} +${overflow}px`);
        }
      }

      expect(
        offenders,
        `Horizontal overflow at ${width}px:\n${offenders.join("\n")}`,
      ).toEqual([]);
    });
  }
});
