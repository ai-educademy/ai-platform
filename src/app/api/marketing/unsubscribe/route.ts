import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";

/**
 * Records a marketing opt-out.
 *
 * POST only, on purpose. Mail clients and security scanners routinely prefetch
 * every link in a message, so a GET-based unsubscribe silently opts people out
 * of email they never asked to stop receiving. The visible page performs this
 * POST, and RFC 8058 one-click clients are handled below.
 */
export async function POST(req: NextRequest) {
  let token: string | null;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    token = typeof body?.token === "string" ? body.token : null;
  } else {
    // RFC 8058 one-click senders POST `List-Unsubscribe=One-Click` as a form.
    const form = await req.formData().catch(() => null);
    const field = form?.get("token");
    token = typeof field === "string" ? field : null;
    if (!token) token = new URL(req.url).searchParams.get("token");
  }

  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }

  try {
    // The token column is unique and unguessable, so an equality lookup is the
    // whole authorisation check. No session is required: people must be able to
    // unsubscribe without logging in.
    const updated = await db
      .update(users)
      .set({ marketingOptOutAt: new Date(), updatedAt: new Date() })
      .where(eq(users.unsubscribeToken, token))
      .returning({ email: users.email });

    // An unknown token returns the same shape as a successful opt-out.
    // Distinguishing them would turn this endpoint into an oracle for valid
    // tokens, and the caller has nothing useful to do with the difference.
    void updated;
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) return databaseUnavailable();
    console.error("[marketing/unsubscribe] failed:", error);
    return NextResponse.json({ error: "Could not process request" }, { status: 500 });
  }
}
