import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq, and, ne } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { authUsers } from "@/lib/db/auth-schema";
import { sendWelcomeEmail, sendAdminNotification } from "@/lib/email";
import { cookies } from "next/headers";
import { safeLocale } from "@/lib/safe-locale";
import { refreshTokenRole } from "@/lib/auth-role";
import { trackEvent } from "@/lib/funnel";

if (!process.env.AUTH_SECRET) {
  console.warn(
    "⚠️  AUTH_SECRET is not set. Authentication will not work in production."
  );
}

const providers = [];
if (process.env.AUTH_GITHUB_ID) providers.push(GitHub);
if (process.env.AUTH_GOOGLE_ID) providers.push(Google);

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = (credentials.email as string).toLowerCase().trim();
      const password = credentials.password as string;

      // Selected column by column on purpose. An unqualified `select()` pulls
      // every column declared in code, so signing in would break the moment a
      // new column is declared ahead of its migration reaching production.
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          role: users.role,
          password: users.password,
          emailVerified: users.emailVerified,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.password) return null;

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      if (!user.emailVerified) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      };
    },
  })
);

/**
 * The language the visitor is currently reading the site in.
 *
 * next-intl's middleware keeps NEXT_LOCALE in step with the URL, so this is
 * the only locale signal available during an OAuth callback: the provider
 * tells us nothing about language, and the adapter creates the user row
 * without it. Reading the cookie here is what stops every Google and GitHub
 * account being recorded, and emailed, as English.
 */
async function localeFromRequest(): Promise<string> {
  try {
    const store = await cookies();
    return safeLocale(store.get("NEXT_LOCALE")?.value);
  } catch {
    // Outside a request context (there is none for some background calls).
    return "en";
  }
}

const adapter = process.env.DATABASE_URL
  ? DrizzleAdapter(db, {
      usersTable: authUsers,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    })
  : undefined;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin?verify=1",
  },
  events: {
    async signIn({ user }) {
      // Keeps the stored language current for people who signed up before the
      // column existed, or who signed up through a provider. Only writes on a
      // genuine change.
      if (!user?.id) return;
      const locale = await localeFromRequest();
      trackEvent("signin", { userId: user.id, locale, path: "/signin" });
      try {
        await db
          .update(users)
          .set({ locale })
          .where(and(eq(users.id, user.id), ne(users.locale, locale)));
      } catch (err) {
        // Never block a sign-in over a preference.
        console.error("[Auth] Locale sync failed:", err);
      }
    },
    async createUser({ user }) {
      if (user.email) {
        const locale = await localeFromRequest();
        if (locale !== "en" && user.id) {
          // The adapter inserts the row without a locale, so it lands on the
          // "en" default. Correct it before the welcome email goes out.
          await db
            .update(users)
            .set({ locale })
            .where(eq(users.id, user.id))
            .catch((err) => console.error("[Auth] Locale set failed:", err));
        }
        trackEvent("signup_completed", { userId: user.id, locale, path: "/signup" });
        sendWelcomeEmail(user.email, locale, user.name || undefined).catch((err) =>
          console.error("[Auth] Welcome email failed:", err)
        );
        sendAdminNotification(
          "New user signed up! 🎉",
          `<p><strong>Name:</strong> ${user.name || "—"}</p>
           <p><strong>Email:</strong> ${user.email}</p>
           <p><strong>Time:</strong> ${new Date().toUTCString()}</p>`
        ).catch((err) => console.error("[Auth] Admin notification failed:", err));
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "free";
        token.roleCheckedAt = Date.now();
        return token;
      }

      return refreshTokenRole(token, trigger, async (userId) => {
        const [row] = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        return row?.role ?? null;
      });
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      if (token?.role) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
