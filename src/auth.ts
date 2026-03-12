import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

if (!process.env.AUTH_SECRET) {
  console.warn(
    "⚠️  AUTH_SECRET is not set. Authentication will not work in production."
  );
}

const providers = [];
if (process.env.AUTH_GITHUB_ID) providers.push(GitHub);
if (process.env.AUTH_GOOGLE_ID) providers.push(Google);

const adapter = process.env.DATABASE_URL
  ? DrizzleAdapter(db, {
      usersTable: users,
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "free";
      }
      return token;
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
