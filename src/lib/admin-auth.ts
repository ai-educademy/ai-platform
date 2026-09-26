import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  try {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (user?.role !== "admin") {
      return {
        authorized: false as const,
        response: NextResponse.json(
          { error: "Admin access required" },
          { status: 403 },
        ),
      };
    }
  } catch (error) {
    console.error("[AdminAuth] Role lookup failed:", error);
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { authorized: true as const, session };
}
