import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getFunnelSummary } from "@/lib/funnel";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

export async function GET() {
  const check = await requireAdmin();
  if (!check.authorized) return check.response;

  try {
    return NextResponse.json(await getFunnelSummary(7));
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[admin/funnel] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
