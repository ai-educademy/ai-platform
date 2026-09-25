/**
 * Runs the Pro upgrade campaign from a terminal, without an admin session.
 *
 *   npx tsx scripts/run-campaign.ts                       dry run (default)
 *   npx tsx scripts/run-campaign.ts --test you@domain     one real email to you
 *   npx tsx scripts/run-campaign.ts --send --confirm=SEND [--limit=N]
 *
 * Needs DATABASE_URL, and RESEND_API_KEY plus RESEND_FROM_EMAIL for any send.
 * Sending is irreversible and reaches real customers, so it requires both
 * --send and --confirm=SEND; anything less is a dry run.
 */
import { runProUpgradeCampaign } from "@/lib/campaigns/pro-upgrade";

function arg(name: string): string | undefined {
  const hit = process.argv.find(
    (a) => a === `--${name}` || a.startsWith(`--${name}=`),
  );
  if (!hit) return undefined;
  if (hit.includes("=")) return hit.slice(hit.indexOf("=") + 1);
  const next = process.argv[process.argv.indexOf(hit) + 1];
  return next && !next.startsWith("--") ? next : "";
}

const testEmail = arg("test") || undefined;
const wantsSend = arg("send") !== undefined;
const confirmed = arg("confirm") === "SEND";
const limitArg = arg("limit");
const limit = limitArg ? Number.parseInt(limitArg, 10) : undefined;

if (wantsSend && !confirmed) {
  console.error("Refusing to send. Add --confirm=SEND together with --send.");
  process.exit(1);
}

const dryRun = !testEmail && !(wantsSend && confirmed);

async function main() {
  const result = await runProUpgradeCampaign({ dryRun, limit, testEmail });
  console.info(
    JSON.stringify(
      {
        ...result,
        // Never print full recipient addresses to a terminal or CI log.
        sampleRecipients: result.sampleRecipients.map((e) =>
          e.replace(/^(.{2}).*@/, "$1***@"),
        ),
      },
      null,
      2,
    ),
  );
  process.exit(result.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Campaign run failed:", error);
  process.exit(1);
});
