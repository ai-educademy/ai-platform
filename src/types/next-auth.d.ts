import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "free" | "pro" | "admin";
    emailVerified?: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      role: "free" | "pro" | "admin";
      emailVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "free" | "pro" | "admin";
    emailVerified?: boolean;
  }
}
