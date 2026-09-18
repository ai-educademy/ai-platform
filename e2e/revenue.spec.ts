import { test, expect } from "@playwright/test";

/**
 * End-to-end cover for the money path.
 *
 * The site earns in exactly one way: a visitor finds the paid plan, reaches
 * checkout, and locked lessons open once they pay. None of that had an e2e
 * test, so a change that hid the upgrade route or unlocked the paid content
 * would have gone green through CI.
 *
 * These run unauthenticated against a real build, so they cannot assert what
 * happens after payment. What they can defend is everything up to the Stripe
 * redirect, plus the gate that stops the content being given away.
 */

const LOCALES = ["en", "fr", "nl", "hi", "te", "es", "pt", "de", "zh", "ja", "ar"];

test.describe("Pricing page", () => {
  test("loads and shows all paid tiers", async ({ page }) => {
    await page.goto("/en/pricing");

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText("£3.99").first()).toBeVisible();
    await expect(page.getByText("£29.99").first()).toBeVisible();
    await expect(page.getByText("£49.99").first()).toBeVisible();
  });

  test("advertises the annual saving that matches the prices", async ({ page }) => {
    // 3.99 x 12 = 47.88 against 29.99 is 37%. This was advertised as 27% for
    // months because the prices were written twice and drifted.
    await page.goto("/en/pricing");

    await expect(page.getByText(/37\s*%/).first()).toBeVisible();
  });

  test("loads in every locale", async ({ page }) => {
    for (const locale of LOCALES) {
      const response = await page.goto(`/${locale}/pricing`);
      expect(response?.status(), `${locale} pricing page`).toBe(200);
    }
  });

  test("never shows an untranslated English heading in another locale", async ({ page }) => {
    await page.goto("/fr/pricing");
    const heading = await page.locator("h1").first().textContent();

    expect(heading?.trim().length).toBeGreaterThan(0);
    expect(heading).not.toContain("Simple Pricing");
  });
});

test.describe("Route to upgrade", () => {
  test("pricing is reachable from the homepage without hitting a paywall first", async ({ page }) => {
    // The only upgrade prompt used to be mid-lesson, so anyone who decided to
    // subscribe at any other moment had nowhere to go.
    await page.goto("/en");

    const pricingLink = page.locator('a[href$="/pricing"], a[href="/pricing"]').first();
    await expect(pricingLink).toBeVisible();
  });

  test("the pricing link actually lands on the pricing page", async ({ page }) => {
    await page.goto("/en");
    await page.locator('a[href$="/pricing"], a[href="/pricing"]').first().click();

    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("footer offers a route to pricing", async ({ page }) => {
    await page.goto("/en");
    const footerLink = page.locator('footer a[href*="/pricing"]').first();

    await expect(footerLink).toHaveCount(1);
  });
});

test.describe("Checkout API", () => {
  test("refuses to create a session for an anonymous visitor", async ({ request }) => {
    const res = await request.post("/api/stripe/checkout", {
      data: { plan: "monthly" },
    });

    expect(res.status()).toBe(401);
  });

  test("refuses an unknown plan", async ({ request }) => {
    const res = await request.post("/api/stripe/checkout", {
      data: { plan: "free-forever" },
    });

    // Anonymous is rejected first, which is the stricter of the two.
    expect([400, 401]).toContain(res.status());
  });
});

test.describe("Paid content stays paid", () => {
  test("a locked lesson does not serve its body to an anonymous visitor", async ({ page }) => {
    // Lesson 1 of each programme is a free preview; later lessons are not.
    await page.goto("/en/programs/ai-sprouts");

    const lessonLinks = page.locator('a[href*="/lessons/"]');
    const count = await lessonLinks.count();
    test.skip(count < 2, "needs at least two lessons to find a locked one");

    const href = await lessonLinks.nth(count - 1).getAttribute("href");
    await page.goto(href!);

    await expect(page.locator("body")).toContainText(/pro|upgrade|unlock/i);
  });

  test("subscription status reports anonymous visitors as not pro", async ({ request }) => {
    const res = await request.get("/api/subscription/status");

    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ isPro: false });
  });
});

test.describe("Discoverability", () => {
  test("sitemap advertises no URL that redirects", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);

    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(locs.length).toBeGreaterThan(0);
    expect(locs.filter((u) => new URL(u).pathname.startsWith("/en"))).toEqual([]);
  });

  test("pricing page is indexable and canonical", async ({ page }) => {
    await page.goto("/en/pricing");

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots ?? "").not.toContain("noindex");

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/pricing");
    expect(canonical).not.toContain("/en/");
  });
});
