/**
 * Refreshes src/lib/disposable-domains.json from the community-maintained
 * disposable-email-domains blocklist (CC0).
 *
 *   node scripts/refresh-disposable-domains.mjs
 */
/* global fetch */
import { writeFileSync } from "node:fs";

const SOURCE =
  "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf";

const res = await fetch(SOURCE);
if (!res.ok) throw new Error("Fetch failed: " + res.status);
const domains = [
  ...new Set(
    (await res.text())
      .split("\n")
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith("#")),
  ),
].sort();
writeFileSync("src/lib/disposable-domains.json", JSON.stringify(domains) + "\n");
console.info("Wrote " + domains.length + " domains.");
