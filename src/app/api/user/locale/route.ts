import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { safeLocale } from "@/lib/safe-locale";
import { isDatabaseNotConfigured } from "@/lib/db/not-configured";

/**
 * Records the language a signed-in learner is actually using.
 *
 * Every user row said "en" because nothing ever wrote this column outside of
 * password signup: OAuth sign-ins go through the adapter, which knows nothing
 * about locale, and switching language changed only the URL. Emails are
 * translated per user, so an unpopulated column meant every learner would be
 * written to in English regardless of the language they read the site in.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  // Anonymous visitors have nowhere to store a preference, and the locale
  // cookie already handles them. Not an error.
  if (!userId) return NextResponse.json({ saved: false });

  let requested: string;
  try {
    const body = (await request.json()) as { locale?: unknown };
    requested = safeLocale(typeof body.locale === "string" ? body.locale : undefined);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const [current] = await db
      .select({ locale: users.locale })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!current) return NextResponse.json({ saved: false });

    // Only write on an actual change. This is called on sign-in and on every
    // language switch, and most of those are no-ops.
    if (current.locale === requested) {
      return NextResponse.json({ saved: false, locale: requested });
    }

    await db.update(users).set({ locale: requested }).where(eq(users.id, userId));
    return NextResponse.json({ saved: true, locale: requested });
  } catch (error) {
    if (isDatabaseNotConfigured(error)) {
      return NextResponse.json({ saved: false });
    }
    // Recording a preference is not worth failing a page interaction over.
    console.error("[UserLocale] Failed to persist locale", error);
    return NextResponse.json({ saved: false });
  }
}
