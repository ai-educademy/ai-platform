import { test, expect } from "@playwright/test";

/**
 * Guards a class of bug rather than one instance of it.
 *
 * The programme pages shipped a call to action pointing at /experiments and
 * /experiments/prompt-lab. Neither route has ever existed. Because that
 * component renders on every programme page in every locale, it produced a
 * 404 on dozens of URLs, and nothing in the suite noticed, because no test
 * ever followed an internal link.
 *
 * This walks the real anchors on the highest-traffic pages and asserts every
 * internal destination actually resolves.
 */

const PAGES_TO_CRAWL = [
  "/en",
  "/en/programs",
  "/en/programs/ai-seeds",
  "/en/pricing",
  "/en/blog",
  "/en/lab",
];

test.describe("Internal links", () => {
  test("no page links to a route that does not exist", async ({
    page,
    request,
  }) => {
    const checked = new Map<string, number>();
    const broken: string[] = [];

    for (const path of PAGES_TO_CRAWL) {
      await page.goto(path);

      // A page that failed to render has no links, which would make this test
      // pass for the wrong reason. Assert it rendered first.
      await expect(page.locator("footer")).toBeAttached();

      const hrefs: string[] = await page.$$eval("a[href]", (anchors) =>
        anchors.map((a) => a.getAttribute("href") ?? ""),
      );

      const internal = [
        ...new Set(
          hrefs.filter(
            (href) =>
              href.startsWith("/") &&
              !href.startsWith("//") &&
              !href.startsWith("/#"),
          ),
        ),
      ]
        // Strip fragments and query strings: they do not change which route
        // Next.js resolves, and keeping them multiplies the request count.
        .map((href) => href.split("#")[0].split("?")[0])
        .filter((href) => href.length > 0);

      for (const href of internal) {
        if (checked.has(href)) continue;

        const response = await request.get(href, { maxRedirects: 5 });
        checked.set(href, response.status());

        if (response.status() >= 400) {
          broken.push(`${href} -> ${response.status()} (linked from ${path})`);
        }
      }
    }

    // Guard against a vacuous pass: if the crawl found almost nothing, the
    // pages did not render properly and this test proved nothing.
    expect(checked.size).toBeGreaterThan(20);

    expect(broken, `Broken internal links:\n${broken.join("\n")}`).toEqual([]);
  });
});
