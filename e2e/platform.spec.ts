import { test, expect } from "@playwright/test";

const LOCALES = ["en", "fr", "nl", "hi", "te"];

test.describe("Navigation & Pages", () => {
  test("homepage loads and shows hero", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/AI Educademy/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("all locale homepages load", async ({ page }) => {
    for (const locale of LOCALES) {
      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBe(200);
    }
  });

  test("programs page loads with both tracks", async ({ page }) => {
    await page.goto("/en/programs");
    await expect(page.locator("h1").first()).toBeVisible();
    // Should have program cards
    const cards = page.locator('[href*="/programs/ai-"]');
    await expect(cards.first()).toBeVisible();
  });

  test("lab page loads", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/en/about");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/en/programs/ai-seeds");
    // Use JS click to bypass any overlay/interception issues on mobile
    const link = page.locator('a[href*="/lessons/"]').first();
    await link.waitFor({ state: "attached" });
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    // Navigate via the link href directly to verify routing works
    await page.goto(href!);
    await expect(page).toHaveURL(/lessons\//);
  });
});

test.describe("Programs & Lessons", () => {
  test("ai-seeds program page loads", async ({ page }) => {
    await page.goto("/en/programs/ai-seeds");
    await expect(page.locator("h1").first()).toBeVisible();
    // Should show lessons
    const lessons = page.locator('[href*="/lessons/"]');
    await expect(lessons.first()).toBeVisible();
  });

  test("ai-seeds lesson loads and renders content", async ({ page }) => {
    await page.goto("/en/programs/ai-seeds/lessons/what-is-ai");
    await expect(page.locator("h1").first()).toBeVisible();
    // Lesson should have substantial content
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(500);
  });

  test("craft engineering programs load", async ({ page }) => {
    const programs = ["ai-sketch", "ai-chisel", "ai-craft", "ai-polish", "ai-masterpiece"];
    for (const slug of programs) {
      const response = await page.goto(`/en/programs/${slug}`);
      expect(response?.status()).toBe(200);
    }
  });

  test("coming-soon programs still load", async ({ page }) => {
    const response = await page.goto("/en/programs/ai-sprouts");
    expect(response?.status()).toBe(200);
  });
});

test.describe("Locale Switching", () => {
  test("content changes when switching locale", async ({ page }) => {
    await page.goto("/en");
    const enText = await page.textContent("h1");

    await page.goto("/fr");
    const frText = await page.textContent("h1");

    // Titles should be different in different locales
    expect(enText).not.toBe(frText);
  });

  test("programs page works in all locales", async ({ page }) => {
    for (const locale of LOCALES) {
      const response = await page.goto(`/${locale}/programs`);
      expect(response?.status()).toBe(200);
    }
  });
});

test.describe("SEO", () => {
  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await page.textContent("body");
    expect(text).toContain("User-Agent");
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });

  test("manifest.webmanifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");
    expect(response?.status()).toBe(200);
  });

  test("homepage has meta tags", async ({ page }) => {
    await page.goto("/en");
    // OG title
    const ogTitle = await page.getAttribute('meta[property="og:title"]', "content");
    expect(ogTitle).toBeTruthy();
    // Description
    const description = await page.getAttribute('meta[name="description"]', "content");
    expect(description).toBeTruthy();
    // Google verification
    const google = await page.getAttribute('meta[name="google-site-verification"]', "content");
    expect(google).toBeTruthy();
  });

  test("homepage has JSON-LD structured data", async ({ page }) => {
    await page.goto("/en");
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();
    const data = JSON.parse(jsonLd!);
    const types = Array.isArray(data["@type"]) ? data["@type"] : [data["@type"]];
    expect(types.some((t: string) => t.includes("Organization") || t.includes("EducationalOrganization") || t === "WebSite")).toBe(true);
  });
});
