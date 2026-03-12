import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("chat API responds to POST", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [{ role: "user", content: "What is AI Seeds?" }],
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.content).toBeTruthy();
    expect(body.content.length).toBeGreaterThan(10);
  });

  test("chat API rejects GET", async ({ request }) => {
    const response = await request.get("/api/chat");
    expect(response.status()).toBe(405);
  });

  test("chat API validates input", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: { messages: "not-an-array" },
    });
    expect(response.status()).toBe(400);
  });

  test("mock-interview API responds to POST", async ({ request }) => {
    const response = await request.post("/api/mock-interview", {
      data: {
        type: "behavioral",
        message: "Start the interview",
        history: [],
        stage: "question",
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.content).toBeTruthy();
  });

  test("mock-interview API validates type enum", async ({ request }) => {
    const response = await request.post("/api/mock-interview", {
      data: {
        type: "invalid-type",
        message: "Hello",
        history: [],
        stage: "question",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("newsletter API rejects invalid email", async ({ request }) => {
    const response = await request.post("/api/newsletter", {
      data: { email: "not-an-email" },
    });
    expect(response.status()).toBe(400);
  });

  test("feedback API validates required fields", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test("certificates API rejects unauthenticated", async ({ request }) => {
    const response = await request.post("/api/certificates", {
      data: { programSlug: "ai-seeds" },
    });
    // Should be 401 (unauthenticated) — not 500
    expect([401, 403]).toContain(response.status());
  });
});

test.describe("SEO & Security", () => {
  test("robots.txt blocks sensitive paths", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain("Disallow: /admin/");
    expect(text).toContain("Disallow: /dashboard/");
    expect(text).toContain("Sitemap:");
  });

  test("sitemap.xml has all locales", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    for (const locale of ["en", "fr", "nl", "hi", "te", "es", "pt", "de", "zh", "ja", "ar"]) {
      expect(xml).toContain(`hreflang="${locale}"`);
    }
  });

  test("manifest.webmanifest is valid JSON", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeDefined();
  });

  test("RSS feed is valid XML", async ({ request }) => {
    const response = await request.get("/feed.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect(xml).toContain("<rss");
  });

  test("security headers are present", async ({ request }) => {
    const response = await request.get("/en");
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBeTruthy();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBeTruthy();
    expect(headers["content-security-policy"]).toBeTruthy();
    expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
  });

  test("admin API rejects unauthenticated requests", async ({ request }) => {
    const response = await request.get("/api/admin/users");
    expect([401, 403]).toContain(response.status());
  });
});

test.describe("Career Ready Track", () => {
  const careerPrograms = [
    "ai-behavioral",
    "ai-technical",
    "ai-ml-interview",
    "ai-offer",
    "ai-launchpad",
  ];

  for (const slug of careerPrograms) {
    test(`${slug} program page loads`, async ({ page }) => {
      const response = await page.goto(`/en/programs/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
    });
  }
});
