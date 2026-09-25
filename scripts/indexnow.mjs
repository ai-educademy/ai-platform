#!/usr/bin/env node
/* global fetch */
import fs from "node:fs";
import path from "node:path";

const HOST = "aieducademy.org";
// api.indexnow.org fans out to all engines but rejects hosts it has not verified yet,
// so engines are also pinged directly and any acceptance counts as success.
const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];
const MAX_URLS_PER_REQUEST = 10000;
const root = process.cwd();

function readKey() {
  const keyFromEnv = process.env.INDEXNOW_KEY;
  if (keyFromEnv) return keyFromEnv.trim();

  const keyFile = fs
    .readdirSync(path.join(root, "public"))
    .find((file) => /^[a-f0-9]{32}\.txt$/i.test(file));

  if (!keyFile) {
    throw new Error("IndexNow key file not found in public/. Set INDEXNOW_KEY or add the key file.");
  }

  return fs.readFileSync(path.join(root, "public", keyFile), "utf8").trim();
}

async function readSitemapUrls(sitemapUrl) {
  const xml = await (await fetch(sitemapUrl)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!/<sitemapindex/i.test(xml)) return locs;
  const nested = await Promise.all(locs.map((loc) => readSitemapUrls(loc)));
  return nested.flat();
}

async function readUrls() {
  const args = process.argv.slice(2);
  const sitemapArgIndex = args.indexOf("--sitemap");
  if (sitemapArgIndex >= 0) {
    return readSitemapUrls(args[sitemapArgIndex + 1] || `https://${HOST}/sitemap.xml`);
  }
  const fileArgIndex = args.indexOf("--file");
  if (fileArgIndex >= 0) {
    const file = args[fileArgIndex + 1];
    if (!file) throw new Error("--file needs a path containing one URL per line.");
    return fs.readFileSync(path.resolve(root, file), "utf8").split(/\r?\n/);
  }

  return args;
}

const urls = [...new Set((await readUrls()).map((url) => url.trim()).filter(Boolean))];
if (urls.length === 0) {
  throw new Error("Usage: node scripts/indexnow.mjs <url...>, --sitemap [url], or node scripts/indexnow.mjs --file changed-urls.txt");
}

const key = readKey();
const accepted = [];
const failures = [];

for (let start = 0; start < urls.length; start += MAX_URLS_PER_REQUEST) {
  const body = JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: urls.slice(start, start + MAX_URLS_PER_REQUEST),
  });
  for (const endpoint of ENDPOINTS) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body,
    });
    if (response.ok) accepted.push(endpoint);
    else failures.push(`${endpoint} ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
}

for (const failure of failures) console.warn(`IndexNow rejected: ${failure}`);
if (accepted.length === 0) throw new Error("No IndexNow endpoint accepted the submission.");
console.log(`IndexNow accepted ${urls.length} URL${urls.length === 1 ? "" : "s"} via ${[...new Set(accepted)].join(", ")}.`);
