import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/fileStore";

// TODO: Add rate limiting for production

const FILE = "newsletter-subscribers.json";

interface Subscriber {
  email: string;
  subscribedAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const subscribers = await readJsonFile<Subscriber[]>(FILE, []);

    if (subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { success: true, message: "Already subscribed!" },
        { status: 200 }
      );
    }

    subscribers.push({ email: email.toLowerCase(), subscribedAt: new Date().toISOString() });
    await writeJsonFile(FILE, subscribers);

    return NextResponse.json(
      { success: true, message: "Subscribed!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subscribers = await readJsonFile<Subscriber[]>(FILE, []);
    return NextResponse.json({ total: subscribers.length, subscribers });
  } catch (error) {
    console.error("Newsletter GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
