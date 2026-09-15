import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserPlan, canAccessPremium } from "@/lib/subscription";
import { isDatabaseNotConfigured } from "@/lib/db-guard";

/**
 * The current viewer's plan, for deciding whether to show upgrade prompts.
 *
 * The session token cannot answer this. `role` is written into the JWT at sign
 * in, but the Stripe webhook promotes the user in the database, so a token
 * minted before checkout still says "free". Reading it would show "Upgrade to
 * Pro" to somebody who had just paid, which is the worst possible moment to
 * get it wrong.
 *
 * Signed out is answered as free rather than 401: the caller only wants to know
 * whether to show an upgrade prompt, and an anonymous visitor should see one.
 */
export async function GET() {
  const noCache = { headers: { "Cache-Control": "private, no-store" } };

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ plan: "free", isPro: false }, noCache);
    }

    const plan = await getUserPlan(session.user.id);
    return NextResponse.json({ plan, isPro: canAccessPremium(plan) }, noCache);
  } catch (error) {
    // Never fail a page over a promotional banner. Degrading to "not Pro" at
    // worst shows an upgrade prompt to a subscriber; degrading the other way
    // would hide the only upgrade path on the site.
    if (!isDatabaseNotConfigured(error)) {
      console.error("[api/subscription/status] failed:", error);
    }
    return NextResponse.json({ plan: "free", isPro: false }, noCache);
  }
}
