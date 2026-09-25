/* global CSS, Node, document, fetch, window */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const PROD_ORIGIN = "https://aieducademy.org";
const widths = [390, 1024, 1440];
const height = 1200;
const concurrency = Number(process.env.SWEEP_CONCURRENCY || 6);
const base =
  process.argv
    .find((arg) => arg.startsWith("--base="))
    ?.slice("--base=".length) || PROD_ORIGIN;
const out =
  process.argv
    .find((arg) => arg.startsWith("--out="))
    ?.slice("--out=".length) || "artifacts/page-sweep-summary.json";
const maxUrls = Number(process.env.SWEEP_MAX_URLS || 0);

const sitemapPaths = ["/sitemap/en.xml", "/sitemap/fr.xml", "/sitemap/ar.xml"];
const signedOutPaths = ["/signin", "/signup", "/pricing", "/dashboard"];
const noisyMessages = [
  "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT",
  "Failed to load resource: the server responded with a status of 404",
  "Failed to load resource: the server responded with a status of 403",
  "Failed to load resource: the server responded with a status of 500",
  "chrome-extension://",
  "googletagmanager",
  "google analytics",
  "google.co.uk/ads/ga-audiences",
  "_vercel/insights",
  "_vercel/speed-insights",
  "vercel analytics",
  "va.vercel-scripts",
  "vitals.vercel-insights",
];

function isNoise(text) {
  const lower = String(text || "").toLowerCase();
  return noisyMessages.some((noise) => lower.includes(noise.toLowerCase()));
}

function normaliseUrl(raw) {
  const url = new URL(raw, PROD_ORIGIN);
  const local = new URL(base);
  if (url.origin === PROD_ORIGIN && local.origin !== PROD_ORIGIN) {
    return `${local.origin}${url.pathname}${url.search}`;
  }
  if (url.origin === PROD_ORIGIN && base !== PROD_ORIGIN) {
    return `${base.replace(/\/$/, "")}${url.pathname}${url.search}`;
  }
  return url.toString();
}

function canonicalPath(raw) {
  const url = new URL(raw, PROD_ORIGIN);
  return `${url.pathname}${url.search}`;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  return await res.text();
}

async function getUrls() {
  const urls = new Set();
  for (const path of sitemapPaths) {
    const xml = await fetchText(`${PROD_ORIGIN}${path}`);
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.add(canonicalPath(match[1]));
    }
  }
  for (const path of signedOutPaths) urls.add(path);
  const sorted = [...urls].sort();
  return maxUrls > 0 ? sorted.slice(0, maxUrls) : sorted;
}

function shortText(text, limit = 220) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function signature(issue) {
  if (issue.type === "overflow") return `${issue.type}:${issue.selector}`;
  if (issue.type === "failed-request")
    return `${issue.type}:${issue.status}:${issue.path}`;
  if (issue.type === "console-error" || issue.type === "hydration-mismatch")
    return `${issue.type}:${shortText(issue.message, 120)}`;
  if (issue.type === "pageerror")
    return `${issue.type}:${shortText(issue.message, 120)}`;
  if (issue.selector) return `${issue.type}:${issue.selector}`;
  return `${issue.type}:${issue.message || ""}`;
}

function addIssue(groups, issue, context) {
  const key = signature(issue);
  const current = groups.get(key) || {
    signature: key,
    type: issue.type,
    count: 0,
    examples: [],
  };
  current.count += 1;
  if (current.examples.length < 8)
    current.examples.push({ ...context, ...issue });
  groups.set(key, current);
}

async function inspectPage(page) {
  return await page.evaluate(() => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const cssPath = (el) => {
      if (!el || !el.tagName) return "unknown";
      const parts = [];
      let node = el;
      while (node && node.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
        let part = node.tagName.toLowerCase();
        if (node.id) {
          part += `#${CSS.escape(node.id)}`;
          parts.unshift(part);
          break;
        }
        const testId = node.getAttribute("data-testid");
        if (testId) part += `[data-testid="${testId}"]`;
        const cls = [...node.classList].filter(Boolean).slice(0, 3);
        if (cls.length)
          part += `.${cls.map((value) => CSS.escape(value)).join(".")}`;
        const parent = node.parentElement;
        if (parent) {
          const siblings = [...parent.children].filter(
            (child) => child.tagName === node.tagName,
          );
          if (siblings.length > 1)
            part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
        }
        parts.unshift(part);
        node = parent;
      }
      return parts.join(" > ");
    };
    const textOf = (el) =>
      (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    const labelledBy = (el) => {
      const ids = (el.getAttribute("aria-labelledby") || "")
        .split(/\s+/)
        .filter(Boolean);
      return ids
        .map((id) => document.getElementById(id)?.textContent || "")
        .join(" ")
        .trim();
    };
    const accessibleName = (el) => {
      if (el.getAttribute("aria-hidden") === "true") return "hidden";
      return (
        [
          el.getAttribute("aria-label"),
          labelledBy(el),
          el.getAttribute("title"),
          el.getAttribute("alt"),
          textOf(el),
          [...el.querySelectorAll("img[alt]")]
            .map((img) => img.getAttribute("alt"))
            .join(" "),
          [...el.querySelectorAll("svg title")]
            .map((title) => title.textContent)
            .join(" "),
        ]
          .map((value) => (value || "").trim())
          .find(Boolean) || ""
      );
    };

    const issues = [];
    const h1s = [...document.querySelectorAll("h1")].filter(visible);
    if (h1s.length === 0)
      issues.push({ type: "heading", message: "missing h1" });
    if (h1s.length > 1)
      issues.push({
        type: "heading",
        message: "multiple h1",
        count: h1s.length,
        selector: h1s.map(cssPath).join(", "),
      });
    if (!document.querySelector("main"))
      issues.push({ type: "landmark", message: "missing main" });

    for (const img of [...document.images]) {
      if (!visible(img)) continue;
      if (!img.hasAttribute("alt"))
        issues.push({
          type: "image-alt",
          selector: cssPath(img),
          message: "image missing alt",
        });
    }

    for (const el of [...document.querySelectorAll("button, a[href]")]) {
      if (!visible(el)) continue;
      if (!accessibleName(el))
        issues.push({
          type: "accessible-name",
          selector: cssPath(el),
          message: `${el.tagName.toLowerCase()} has no accessible name`,
        });
    }

    const overflow =
      document.documentElement.scrollWidth > window.innerWidth + 1;
    if (overflow) {
      const offenders = [...document.querySelectorAll("body *")]
        .filter(visible)
        .map((el) => ({ el, rect: el.getBoundingClientRect() }))
        .filter(
          ({ rect }) =>
            rect.right > window.innerWidth + 1 && rect.left < window.innerWidth,
        )
        .sort(
          (a, b) =>
            b.rect.right -
            window.innerWidth -
            (a.rect.right - window.innerWidth),
        )
        .slice(0, 5)
        .map(({ el, rect }) => ({
          type: "overflow",
          selector: cssPath(el),
          message: `right ${Math.round(rect.right)} exceeds viewport ${window.innerWidth}`,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          text: textOf(el).slice(0, 120),
        }));
      issues.push(
        ...(offenders.length
          ? offenders
          : [
              {
                type: "overflow",
                selector: "document",
                message: `scrollWidth ${document.documentElement.scrollWidth} exceeds viewport ${window.innerWidth}`,
              },
            ]),
      );
    }

    return issues;
  });
}

async function sweepOne(browser, path, width, groups) {
  const pageUrl = normaliseUrl(path);
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const context = { url: pageUrl, path, width };

  page.on("pageerror", (error) => {
    addIssue(
      groups,
      { type: "pageerror", message: shortText(error.stack || error.message) },
      context,
    );
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (isNoise(text)) return;
    const type = /hydration|did not match|server rendered html/i.test(text)
      ? "hydration-mismatch"
      : "console-error";
    addIssue(groups, { type, message: shortText(text) }, context);
  });
  page.on("response", (response) => {
    const requestUrl = new URL(response.url());
    const targetOrigin = new URL(pageUrl).origin;
    if (requestUrl.origin !== targetOrigin) return;
    if (requestUrl.pathname.startsWith("/_vercel/")) return;
    if (response.status() < 400) return;
    addIssue(
      groups,
      {
        type: "failed-request",
        status: response.status(),
        path: requestUrl.pathname,
        message: `${response.status()} ${requestUrl.pathname}`,
      },
      context,
    );
  });

  try {
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page
      .waitForLoadState("networkidle", { timeout: 15000 })
      .catch(() => {});
    await delay(300);
    for (const issue of await inspectPage(page))
      addIssue(groups, issue, context);
  } catch (error) {
    addIssue(
      groups,
      { type: "navigation", message: shortText(error.message) },
      context,
    );
  } finally {
    await page.close();
  }
}

async function worker(browser, queue, groups) {
  while (queue.length) {
    const item = queue.shift();
    await sweepOne(browser, item.path, item.width, groups);
  }
}

async function main() {
  mkdirSync("artifacts", { recursive: true });
  const urls = await getUrls();
  const queue = urls.flatMap((path) =>
    widths.map((width) => ({ path, width })),
  );
  const groups = new Map();
  const browser = await chromium.launch({ headless: true });
  const startedAt = new Date().toISOString();
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, () =>
      worker(browser, queue, groups),
    ),
  );
  await browser.close();
  const issues = [...groups.values()].sort(
    (a, b) => b.count - a.count || a.signature.localeCompare(b.signature),
  );
  const summary = {
    base,
    sitemapPaths,
    widths,
    urlCount: urls.length,
    pageWidthChecks: urls.length * widths.length,
    issueSignatureCount: issues.length,
    issueCount: issues.reduce((sum, issue) => sum + issue.count, 0),
    startedAt,
    finishedAt: new Date().toISOString(),
    issues,
  };
  writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        out,
        urlCount: summary.urlCount,
        pageWidthChecks: summary.pageWidthChecks,
        issueSignatureCount: summary.issueSignatureCount,
        issueCount: summary.issueCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
