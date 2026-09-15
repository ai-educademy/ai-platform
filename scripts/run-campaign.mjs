#!/usr/bin/env node
/**
 * Runs the Pro upgrade campaign from the command line.
 *
 * The campaign is otherwise only reachable through the admin panel, which needs
 * an interactive signed-in session. This runner executes the same
 * `runProUpgradeCampaign` function against the same code path, so there is no
 * second implementation to drift.
 *
 * Secrets are read from the macOS Keychain when not already in the environment,
 * so no connection string or API key is written to disk or passed as an
 * argument. Store them once, typed at the prompt:
 *
 *   security add-generic-password -a "$USER" -s copilot/aieducademy-database-url -w
 *   security add-generic-password -a "$USER" -s copilot/aieducademy-resend-key -w
 *
 * Usage:
 *
 *   node scripts/run-campaign.mjs                      # dry run, sends nothing
 *   node scripts/run-campaign.mjs --test you@mail.com  # one rehearsal message
 *   node scripts/run-campaign.mjs --send --confirm SEND --limit 5
 *   node scripts/run-campaign.mjs --send --confirm SEND
 *
 * A real send requires BOTH --send and --confirm SEND. Marketing mail cannot be
 * recalled, so the destructive action is never the one you get by accident or
 * by rerunning a shell history entry with one flag changed.
 */
import { execFileSync } from "node:child_process";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rmSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The bundle is emitted into src/lib because the email translator resolves its
 * message bundles with a dynamic `../../messages/<locale>.json` import. esbuild
 * rewrites that relative path against the OUTPUT file, so the output has to sit
 * at the same depth as the source or every locale lookup silently falls back to
 * English.
 */
const BUNDLE = join(ROOT, "src", "lib", ".campaign-runner.bundle.mjs");

function fromKeychain(service) {
  try {
    return execFileSync("security", ["find-generic-password", "-s", service, "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function loadSecret(envVar, service, { required }) {
  if (process.env[envVar]) return true;
  const value = fromKeychain(service);
  if (value) {
    process.env[envVar] = value;
    // The value itself is never printed, not even its length.
    console.log(`Loaded ${envVar} from Keychain item "${service}".`);
    return true;
  }
  if (required) {
    console.error(
      `\n${envVar} is not set and Keychain item "${service}" was not found.\n` +
        `Store it, typing the value at the prompt so it stays out of shell history:\n\n` +
        `  security add-generic-password -a "$USER" -s ${service} -w\n`,
    );
    process.exit(1);
  }
  return false;
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
    ? process.argv[i + 1]
    : undefined;
}
const flag = (name) => process.argv.includes(`--${name}`);

const wantsSend = flag("send");
const testEmail = arg("test");
const limitRaw = arg("limit");
const limit = limitRaw ? Number(limitRaw) : undefined;

if (limitRaw !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
  console.error(`--limit must be a positive integer, got "${limitRaw}".`);
  process.exit(64);
}

if (wantsSend && !testEmail && arg("confirm") !== "SEND") {
  console.error(
    "\nRefusing to send.\n\n" +
      "A real campaign send needs an explicit confirmation as well as --send:\n\n" +
      "  node scripts/run-campaign.mjs --send --confirm SEND\n\n" +
      "Run without --send first to see how many people it would contact.\n",
  );
  process.exit(64);
}

loadSecret("DATABASE_URL", "copilot/aieducademy-database-url", { required: true });

// A dry run never contacts the mail provider, so it must not demand the key.
const needsMailer = wantsSend || Boolean(testEmail);
loadSecret("RESEND_API_KEY", "copilot/aieducademy-resend-key", { required: needsMailer });
loadSecret("RESEND_FROM_EMAIL", "copilot/aieducademy-resend-from", { required: false });

if (!process.env.NEXT_PUBLIC_APP_URL) process.env.NEXT_PUBLIC_APP_URL = "https://aieducademy.org";

try {
  await build({
    entryPoints: [join(ROOT, "src", "lib", "campaigns", "pro-upgrade.ts")],
    outfile: BUNDLE,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    packages: "external",
    alias: { "@": join(ROOT, "src") },
    logLevel: "error",
  });

  const { runProUpgradeCampaign, PRO_UPGRADE_CAMPAIGN } = await import(BUNDLE);

  const mode = testEmail ? `test send to ${testEmail}` : wantsSend ? "REAL SEND" : "dry run";
  console.log(`\nCampaign: ${PRO_UPGRADE_CAMPAIGN}`);
  console.log(`Mode:     ${mode}${limit ? ` (limit ${limit})` : ""}\n`);

  const result = await runProUpgradeCampaign({
    dryRun: !wantsSend && !testEmail,
    limit,
    testEmail,
  });

  console.log(`eligible:     ${result.eligible}`);
  console.log(`already sent: ${result.alreadySent}`);
  console.log(`sent:         ${result.sent}`);
  console.log(`failed:       ${result.failed}`);
  if (result.sampleRecipients.length) {
    const masked = result.sampleRecipients.map((e) => {
      const [local, domain] = String(e).split("@");
      return `${local.slice(0, 2)}***@${domain}`;
    });
    console.log(`sample:       ${masked.join(", ")}`);
  }
  if (result.errors.length) {
    console.log("\nerrors:");
    for (const e of result.errors.slice(0, 20)) console.log(`  - ${e}`);
    if (result.errors.length > 20) console.log(`  ... and ${result.errors.length - 20} more`);
  }

  if (result.dryRun) {
    console.log("\nNothing was sent. Re-run with --send --confirm SEND to contact these people.");
  }

  // Deliberately not process.exit(): that terminates immediately and would skip
  // the finally block, leaving the generated bundle behind in src/lib.
  process.exitCode = result.failed > 0 ? 1 : 0;
} finally {
  rmSync(BUNDLE, { force: true });
  rmSync(`${BUNDLE}.map`, { force: true });
}
