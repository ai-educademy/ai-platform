#!/usr/bin/env node
/* global fetch */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_SITE = "https://aieducademy.org";
const USER_AGENT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const LOCALES = ["en", "ar", "de", "es", "fr", "hi", "ja", "nl", "pt", "te", "zh"];
const PREFIXED_LOCALES = LOCALES.filter((locale) => locale !== "en");
const CONCURRENCY = Number.parseInt(process.env.SEO_CRAWL_CONCURRENCY ?? "10", 10);
const MAX_REDIRECTS = Number.parseInt(process.env.SEO_CRAWL_MAX_REDIRECTS ?? "10", 10);
const MAX_PAGES = Number.parseInt(process.env.SEO_CRAWL_MAX_PAGES ?? "0", 10);

const siteArg = process.argv.find((arg) => arg.startsWith("--site="));
const outArg = process.argv.find((arg) => arg.startsWith("--out="));
const SITE = normaliseSite(siteArg ? siteArg.slice("--site=".length) : process.env.SEO_CRAWL_SITE ?? DEFAULT_SITE);
const OUT_DIR = outArg ? outArg.slice("--out=".length) : "seo-crawl-results";
const siteOrigin = new URL(SITE).origin;

const robots = await loadRobots();
const sitemapUrls = await loadSitemapUrls();
const seeds = new Set([
  `${siteOrigin}/`,
  ...PREFIXED_LOCALES.map((locale) => `${siteOrigin}/${locale}`),
  ...sitemapUrls,
]);

const queue = [];
const queued = new Set();
const records = new Map();
const inlinks = new Map();
const internalLinkEdges = [];

for (const seed of seeds) enqueue(seed, null);

let active = 0;
await new Promise((resolve) => {
  const pump = () => {
    while (active < CONCURRENCY && queue.length > 0 && (MAX_PAGES === 0 || records.size < MAX_PAGES)) {
      const { url, from } = queue.shift();
      active += 1;
      crawlUrl(url, from)
        .catch((error) => {
          records.set(url, {
            url,
            error: error.message,
            status: 0,
            redirectChain: [],
            finalUrl: url,
            canonical: null,
            metaRobots: null,
            title: null,
          });
        })
        .finally(() => {
          active -= 1;
          pump();
        });
    }

    if (active === 0 && (queue.length === 0 || (MAX_PAGES > 0 && records.size >= MAX_PAGES))) {
      resolve();
    }
  };
  pump();
});

const pages = [...records.values()].sort((a, b) => a.url.localeCompare(b.url));
for (const page of pages) {
  page.inlinks = inlinks.get(page.url)?.size ?? 0;
}

const byUrl = new Map(pages.map((page) => [page.url, page]));
const brokenInternalLinks = internalLinkEdges
  .map((edge) => ({ ...edge, target: byUrl.get(edge.to) }))
  .filter(({ target }) => target && target.status >= 400 && target.status < 500)
  .map(({ from, to, target }) => ({ from, to, status: target.status }));

const redirectChains = pages
  .filter((page) => page.redirectChain.length > 1)
  .map((page) => ({
    url: page.url,
    status: page.status,
    finalUrl: page.finalUrl,
    chainLength: page.redirectChain.length,
    chain: page.redirectChain,
  }));

const internalLinksToRedirects = internalLinkEdges
  .map((edge) => ({ ...edge, target: byUrl.get(edge.to) }))
  .filter(({ target }) => target && target.redirectChain.length > 0)
  .map(({ from, to, target }) => ({
    from,
    to,
    finalUrl: target.finalUrl,
    chainLength: target.redirectChain.length,
  }));

const orphanIndexablePages = pages
  .filter((page) => sitemapUrls.includes(page.url))
  .filter(isIndexable)
  .filter((page) => page.inlinks === 0)
  .map((page) => page.url);

const soft404Candidates = pages
  .filter((page) => page.status === 200)
  .filter((page) => /not found|page not found|does not exist|404/i.test(`${page.title ?? ""} ${page.bodySample ?? ""}`))
  .map((page) => ({ url: page.url, title: page.title, sample: page.bodySample }));

const mixedLocaleLinks = internalLinkEdges.filter((edge) => {
  const fromLocale = localeFromPath(new URL(edge.from).pathname);
  const toLocale = localeFromPath(new URL(edge.to).pathname);
  return fromLocale !== "en" && toLocale === "en";
});

const issueCounts = {
  brokenInternalLinks: brokenInternalLinks.length,
  redirectChains: redirectChains.length,
  internalLinksToRedirects: internalLinksToRedirects.length,
  orphanIndexablePages: orphanIndexablePages.length,
  soft404Candidates: soft404Candidates.length,
  mixedLocaleLinks: mixedLocaleLinks.length,
};

const report = {
  site: SITE,
  generatedAt: new Date().toISOString(),
  totals: {
    crawled: pages.length,
    sitemapUrls: sitemapUrls.length,
    internalEdges: internalLinkEdges.length,
    indexable: pages.filter(isIndexable).length,
  },
  issueCounts,
  issues: {
    brokenInternalLinks,
    redirectChains,
    internalLinksToRedirects,
    orphanIndexablePages,
    soft404Candidates,
    mixedLocaleLinks,
  },
  pages,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "seo-crawl-report.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(OUT_DIR, "seo-crawl-summary.md"), renderSummary(report));

console.log(renderConsoleSummary(report));
process.exitCode = Object.values(issueCounts).some((count) => count > 0) ? 1 : 0;

function normaliseSite(value) {
  const url = new URL(value);
  return url.origin;
}

async function loadRobots() {
  const fallback = { sitemapUrls: [`${siteOrigin}/sitemap.xml`], disallow: [] };
  try {
    const response = await fetch(`${siteOrigin}/robots.txt`, {
      headers: { "user-agent": USER_AGENT },
      redirect: "manual",
    });
    if (!response.ok) return fallback;
    const text = await response.text();
    const sitemapLines = [...text.matchAll(/^sitemap:\s*(.+)$/gim)].map((match) => match[1].trim());
    return {
      sitemapUrls: sitemapLines.length > 0 ? sitemapLines.map(resolveInternalUrl).filter(Boolean) : fallback.sitemapUrls,
      disallow: parseRobotsDisallow(text),
    };
  } catch {
    return fallback;
  }
}

function parseRobotsDisallow(text) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/#.*/, "").trim());
  const disallow = [];
  let appliesToGooglebot = false;
  let appliesToAll = false;

  for (const line of lines) {
    const [rawKey, ...rawValue] = line.split(":");
    if (!rawKey || rawValue.length === 0) continue;
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (key === "user-agent") {
      const agent = value.toLowerCase();
      appliesToGooglebot = agent.includes("googlebot");
      appliesToAll = agent === "*";
      continue;
    }
    if (key === "disallow" && value && (appliesToGooglebot || appliesToAll)) {
      disallow.push(value);
    }
  }

  return disallow;
}

async function loadSitemapUrls() {
  const discovered = new Set();
  const pending = [...robots.sitemapUrls];
  const urls = new Set();

  while (pending.length > 0) {
    const sitemapUrl = pending.shift();
    if (!sitemapUrl || discovered.has(sitemapUrl)) continue;
    discovered.add(sitemapUrl);

    const response = await fetch(sitemapUrl, {
      headers: { "user-agent": USER_AGENT },
      redirect: "manual",
    });
    if (!response.ok) continue;
    const xml = await response.text();
    for (const loc of [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => decodeHtml(match[1].trim()))) {
      const resolved = resolveInternalUrl(loc);
      if (!resolved) continue;
      if (/\.xml($|\?)/i.test(new URL(resolved).pathname)) {
        pending.push(resolved);
      } else {
        urls.add(stripHash(resolved));
      }
    }
  }

  return [...urls].sort();
}

function enqueue(url, from) {
  const resolved = resolveInternalUrl(url);
  if (!resolved || queued.has(resolved) || isBlockedByRobots(resolved)) return;
  queued.add(resolved);
  queue.push({ url: resolved, from });
}

async function crawlUrl(url) {
  const redirectChain = [];
  let current = url;
  let response;

  for (let index = 0; index <= MAX_REDIRECTS; index += 1) {
    response = await fetch(current, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
      redirect: "manual",
    });
    const location = response.headers.get("location");
    if (!isRedirectStatus(response.status) || !location) break;
    const next = resolveInternalUrl(new URL(location, current).href) ?? new URL(location, current).href;
    redirectChain.push({ from: current, to: next, status: response.status });
    if (!next.startsWith(siteOrigin)) break;
    current = stripHash(next);
  }

  const record = {
    url,
    status: response.status,
    finalUrl: current,
    redirectChain,
    canonical: null,
    metaRobots: null,
    title: null,
    bodySample: null,
    contentType: response.headers.get("content-type") ?? "",
  };

  if (response.status >= 200 && response.status < 300 && record.contentType.includes("text/html")) {
    const html = await response.text();
    record.canonical = extractAttribute(html, /<link\b[^>]*rel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i, "href");
    record.metaRobots = extractAttribute(html, /<meta\b[^>]*(?:name|property)=["']robots["'][^>]*>/i, "content");
    record.title = textContent(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null);
    record.bodySample = textContent(html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")).slice(0, 500);

    for (const link of extractLinks(html)) {
      const target = resolveInternalUrl(link);
      if (!target || isBlockedByRobots(target)) continue;
      internalLinkEdges.push({ from: current, to: target });
      if (!inlinks.has(target)) inlinks.set(target, new Set());
      inlinks.get(target).add(current);
      enqueue(target, current);
    }
  }

  records.set(url, record);
}

function resolveInternalUrl(raw) {
  if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return null;
  const url = new URL(raw, siteOrigin);
  if (url.origin !== siteOrigin && url.hostname === new URL(DEFAULT_SITE).hostname) {
    const configured = new URL(siteOrigin);
    url.protocol = configured.protocol;
    url.host = configured.host;
  }
  if (url.origin !== siteOrigin) return null;
  url.hash = "";
  url.searchParams.sort();
  return stripIndex(stripTrailingSlash(url.href));
}

function stripHash(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  return stripIndex(stripTrailingSlash(parsed.href));
}

function stripTrailingSlash(url) {
  const parsed = new URL(url);
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }
  return parsed.href;
}

function stripIndex(url) {
  const parsed = new URL(url);
  parsed.pathname = parsed.pathname.replace(/\/index\.html?$/i, "");
  return parsed.href;
}

function isRedirectStatus(status) {
  return [301, 302, 303, 307, 308].includes(status);
}

function extractLinks(html) {
  return [...html.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1/gi)]
    .map((match) => decodeHtml(match[2].trim()))
    .filter(Boolean);
}

function extractAttribute(html, tagPattern, attribute) {
  const tag = html.match(tagPattern)?.[0];
  if (!tag) return null;
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const value = tag.match(new RegExp(`${escaped}\\s*=\\s*("[^"]*"|'[^']*')`, "i"))?.[1];
  return value ? decodeHtml(value.slice(1, -1).trim()) : null;
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function textContent(value) {
  if (!value) return null;
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function isBlockedByRobots(url) {
  const pathname = new URL(url).pathname;
  return robots.disallow.some((rule) => {
    if (rule === "/") return true;
    return pathname.startsWith(rule);
  });
}

function isIndexable(page) {
  if (page.status !== 200) return false;
  if (page.metaRobots && /noindex/i.test(page.metaRobots)) return false;
  return true;
}

function localeFromPath(pathname) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return PREFIXED_LOCALES.includes(segment) ? segment : "en";
}

function renderConsoleSummary(report) {
  return [
    `SEO crawl complete for ${report.site}`,
    `Crawled: ${report.totals.crawled}`,
    `Sitemap URLs: ${report.totals.sitemapUrls}`,
    `Internal links: ${report.totals.internalEdges}`,
    `Broken internal links: ${report.issueCounts.brokenInternalLinks}`,
    `Redirect chains: ${report.issueCounts.redirectChains}`,
    `Internal links to redirects: ${report.issueCounts.internalLinksToRedirects}`,
    `Orphan indexable sitemap pages: ${report.issueCounts.orphanIndexablePages}`,
    `Soft 404 candidates: ${report.issueCounts.soft404Candidates}`,
    `Mixed locale links: ${report.issueCounts.mixedLocaleLinks}`,
    `Report: ${path.join(OUT_DIR, "seo-crawl-report.json")}`,
  ].join("\n");
}

function renderSummary(report) {
  return `${renderConsoleSummary(report)}

## Issue details

### Broken internal links
${renderList(report.issues.brokenInternalLinks, (item) => `- ${item.status} ${item.to} from ${item.from}`)}

### Redirect chains
${renderList(report.issues.redirectChains, (item) => `- ${item.chainLength} hops ${item.url} to ${item.finalUrl}`)}

### Internal links to redirects
${renderList(report.issues.internalLinksToRedirects, (item) => `- ${item.from} links to ${item.to}, final ${item.finalUrl}`)}

### Orphan indexable sitemap pages
${renderList(report.issues.orphanIndexablePages, (item) => `- ${item}`)}

### Soft 404 candidates
${renderList(report.issues.soft404Candidates, (item) => `- ${item.url}: ${item.title ?? "untitled"}`)}

### Mixed locale links
${renderList(report.issues.mixedLocaleLinks, (item) => `- ${item.from} links to ${item.to}`)}
`;
}

function renderList(items, renderItem) {
  return items.length === 0 ? "- None" : items.map(renderItem).join("\n");
}
