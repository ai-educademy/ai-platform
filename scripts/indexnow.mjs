#!/usr/bin/env node
/* global fetch */
import fs from "node:fs";
import path from "node:path";

const HOST = "aieducademy.org";
const ENDPOINT = "https://api.indexnow.org/indexnow";
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

function readUrls() {
  const args = process.argv.slice(2);
  const fileArgIndex = args.indexOf("--file");
  if (fileArgIndex >= 0) {
    const file = args[fileArgIndex + 1];
    if (!file) throw new Error("--file needs a path containing one URL per line.");
    return fs.readFileSync(path.resolve(root, file), "utf8").split(/\r?\n/);
  }

  return args;
}

const urls = [...new Set(readUrls().map((url) => url.trim()).filter(Boolean))];
if (urls.length === 0) {
  throw new Error("Usage: node scripts/indexnow.mjs <url...> or node scripts/indexnow.mjs --file changed-urls.txt");
}

const key = readKey();
const body = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${key}.txt`,
  urlList: urls,
};

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`IndexNow ping failed with ${response.status}: ${text}`);
}

console.log(`IndexNow accepted ${urls.length} URL${urls.length === 1 ? "" : "s"}.`);
