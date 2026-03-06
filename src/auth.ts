import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

if (!process.env.AUTH_SECRET) {
  console.warn(
    "⚠️  AUTH_SECRET is not set. Authentication will not work in production."
  );
}

const providers = [];
if (process.env.AUTH_GITHUB_ID) providers.push(GitHub);
if (process.env.AUTH_GOOGLE_ID) providers.push(Google);
const resendKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY;
if (resendKey) {
  providers.push(
    Resend({
      apiKey: resendKey,
      from: process.env.AUTH_EMAIL_FROM || "Open AI School <noreply@openaischool.dev>",
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin?verify=1",
  },
  callbacks: {
    session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
