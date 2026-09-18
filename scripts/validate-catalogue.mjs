#!/usr/bin/env node
/**
 * Catalogue integrity check.
 *
 * The site advertises programmes from `data/programs.json`, but the lessons
 * themselves live in two separate repositories: the public `ai-courses` and the
 * private, paid `ai-courses-pro`. `prebuild` merges the second into
 * `content/programs/`. Nothing verified that the shopfront and the shelves
 * agreed, so a programme could be advertised with nothing behind it. A paying
 * learner would discover that only after handing over money, which is the worst
 * possible moment.
 *
 * This lives in `ai-platform` deliberately. It is the only place that
 * legitimately sees both halves, because it already consumes both as
 * submodules. Putting it in the public content repo would mean giving that repo
 * a credential to read the paid product, inverting the trust boundary.
 *
 * Run after `npm run build`, since `prebuild` performs the merge.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROGRAMS_DIR = join(ROOT, "content", "programs");
const APP_CATALOGUE = join(ROOT, "data", "programs.json");
const CONTENT_CATALOGUE = join(ROOT, "content", "programs.json");
const PRO_DIR = join(ROOT, "content-pro", "programs");

const errors = [];
const warnings = [];

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const dirsIn = (p) => (isDir(p) ? readdirSync(p).filter((d) => isDir(join(p, d))) : []);
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

if (!existsSync(APP_CATALOGUE)) {
  console.error(`✖ App catalogue not found at ${APP_CATALOGUE}.`);
  process.exit(1);
}
if (!isDir(PROGRAMS_DIR)) {
  console.error(`✖ No content at ${PROGRAMS_DIR}. Did the content submodule initialise?`);
  process.exit(1);
}

/**
 * When the private submodule is unavailable the build deliberately continues
 * with free content only, so paid programmes are legitimately absent and must
 * not be reported as broken. That degraded mode is announced loudly rather than
 * passing quietly: a check that cannot fail is worse than no check.
 */
const proAvailable = isDir(PRO_DIR);

const advertised = Object.keys(readJson(APP_CATALOGUE).programs ?? {});
if (advertised.length === 0) {
  console.error("✖ data/programs.json advertises no programmes at all.");
  process.exit(1);
}

const onDisk = new Set(dirsIn(PROGRAMS_DIR));

for (const slug of advertised) {
  if (!onDisk.has(slug)) {
    const msg = `Programme '${slug}' is advertised to learners but has no content directory.`;
    if (proAvailable) errors.push(msg);
    else warnings.push(`${msg} Private content is unavailable in this run, so it may be a paid programme.`);
    continue;
  }

  const localesDir = join(PROGRAMS_DIR, slug, "lessons");
  const locales = dirsIn(localesDir);

  if (locales.length === 0) {
    errors.push(`Programme '${slug}' is advertised and has a directory, but contains no lessons at all.`);
    continue;
  }

  for (const locale of locales) {
    const lessons = readdirSync(join(localesDir, locale)).filter((f) => f.endsWith(".mdx"));

    if (lessons.length === 0) {
      errors.push(`Programme '${slug}' locale '${locale}' contains no lessons.`);
      continue;
    }

    /**
     * The paywall rule is that `order: 1` is the free preview. Two of them give
     * a paid lesson away, none of them leaves the programme with no way in.
     * Both are revenue defects rather than tidiness, and both have happened.
     */
    const frees = lessons.filter((f) =>
      /^order:\s*1\s*$/m.test(readFileSync(join(localesDir, locale, f), "utf8")),
    );

    if (frees.length > 1) {
      errors.push(
        `Programme '${slug}' locale '${locale}' has ${frees.length} lessons at order:1 (${frees.join(", ")}). A paid lesson is being given away free.`,
      );
    } else if (frees.length === 0) {
      errors.push(
        `Programme '${slug}' locale '${locale}' has no lesson at order:1, so it has no free preview and nothing to convert on.`,
      );
    }
  }
}

for (const slug of onDisk) {
  if (!advertised.includes(slug)) {
    errors.push(`Programme '${slug}' exists on disk but is not advertised, so no learner can reach it.`);
  }
}

/**
 * The content repo keeps its own copy of the catalogue. It does not drive
 * rendering, but if the two disagree on membership then one of them is being
 * edited in isolation and the drift will eventually reach the site.
 */
if (existsSync(CONTENT_CATALOGUE)) {
  const contentSlugs = new Set((readJson(CONTENT_CATALOGUE).programs ?? []).map((p) => p.slug));
  for (const slug of advertised) {
    if (!contentSlugs.has(slug)) {
      warnings.push(`Programme '${slug}' is in data/programs.json but missing from content/programs.json.`);
    }
  }
  for (const slug of contentSlugs) {
    if (!advertised.includes(slug)) {
      warnings.push(`Programme '${slug}' is in content/programs.json but missing from data/programs.json.`);
    }
  }
}

console.log(
  `Catalogue: ${advertised.length} advertised, ${onDisk.size} on disk, private content ${proAvailable ? "available" : "UNAVAILABLE"}.`,
);

for (const w of warnings) console.log(`::warning::${w}`);
for (const e of errors) console.log(`::error::${e}`);

if (!proAvailable) {
  console.log(
    "⚠️  Private content was not available, so paid programmes could not be verified. This run proves less than a full one.",
  );
}

if (errors.length > 0) {
  console.error(`\n✖ Catalogue validation FAILED with ${errors.length} problem(s).`);
  process.exit(1);
}

console.log("✅ Catalogue validation passed.");
