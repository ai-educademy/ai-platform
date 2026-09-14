import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isDatabaseNotConfigured, databaseUnavailable } from "@/lib/db-guard";
import { safeLocale, localeBasePath } from "@/lib/safe-locale";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    // Never trust the locale from the body: it is interpolated into return_url.
    let rawLocale: unknown;
    try {
      rawLocale = (await req.json())?.locale;
    } catch {
      rawLocale = undefined;
    }
    const locale = safeLocale(rawLocale);
    const basePath = localeBasePath(locale);

    const [user] = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aieducademy.org"}${basePath}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    if (isDatabaseNotConfigured(err)) return databaseUnavailable();
    console.error("[stripe/portal] error:", err);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
