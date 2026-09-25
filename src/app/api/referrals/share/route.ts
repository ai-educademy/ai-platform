import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { trackEvent } from "@/lib/funnel";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const channel = typeof body.channel === "string" ? body.channel : "copy";
  trackEvent("referral_link_shared", { userId: session.user.id, path: "/dashboard", plan: channel });
  return NextResponse.json({ success: true });
}
