import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const path = "/ar/programs/ai-behavioral/lessons/star-framework";
const widths = [390, 1024, 1440];
mkdirSync("artifacts/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: 1200 },
    reducedMotion: "reduce",
  });
  await page.goto(`http://localhost:3950${path}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: `artifacts/screenshots/star-framework-${width}.png`,
    fullPage: true,
  });
  await page.close();
}
await browser.close();
