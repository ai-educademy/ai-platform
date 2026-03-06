import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { addContact, getContacts } from "@/lib/resendContacts";

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

    const normalised = email.toLowerCase();
    const result = await addContact(normalised);

    if (result === "duplicate") {
      return NextResponse.json(
        { success: true, message: "Already subscribed!" },
        { status: 200 }
      );
    }

    await sendWelcomeEmail(normalised);

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
    const contacts = await getContacts();
    return NextResponse.json({ total: contacts.length, subscribers: contacts });
  } catch (error) {
    console.error("Newsletter GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
