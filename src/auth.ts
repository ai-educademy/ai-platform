import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

if (!process.env.AUTH_SECRET) {
  console.warn(
    "⚠️  AUTH_SECRET is not set. Authentication will not work in production."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: process.env.AUTH_GITHUB_ID ? [GitHub] : [],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
