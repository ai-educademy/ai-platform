import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";
import { runProUpgradeCampaign } from "@/lib/campaigns/pro-upgrade";

/**
 * Admin-only trigger for the Pro upgrade campaign.
 *
 * Defaults to a dry run. A caller must pass `dryRun: false` explicitly to send
 * anything, so no combination of a mistyped or empty body can mail customers.
 */
export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  const body = await req.json().catch(() => ({}));
  const dryRun = body?.dryRun !== false;
  const limit = Number.isInteger(body?.limit) && body.limit > 0 ? body.limit : undefined;
  const testEmail = typeof body?.testEmail === "string" ? body.testEmail : undefined;

  // A real send needs a second, explicit confirmation. The flag is easy to set
  // deliberately and hard to set by accident.
  if (!dryRun && !testEmail && body?.confirm !== "SEND") {
    return NextResponse.json(
      { error: 'Refusing to send. Pass confirm: "SEND" together with dryRun: false.' },
      { status: 400 },
    );
  }

  try {
    const result = await runProUpgradeCampaign({ dryRun, limit, testEmail });
    return NextResponse.json(result);
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[admin/campaign] failed:", error);
    return NextResponse.json({ error: "Campaign run failed" }, { status: 500 });
  }
}
