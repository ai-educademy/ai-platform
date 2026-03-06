import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/fileStore";

// TODO: Add rate limiting for production

const FILE = "analytics-events.json";

interface AnalyticsEvent {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json(
        { success: false, message: "event is required" },
        { status: 400 }
      );
    }

    if (data && typeof data !== "object") {
      return NextResponse.json(
        { success: false, message: "data must be an object" },
        { status: 400 }
      );
    }

    const entry: AnalyticsEvent = {
      event,
      data: data || {},
      timestamp: new Date().toISOString(),
    };

    const events = await readJsonFile<AnalyticsEvent[]>(FILE, []);
    events.push(entry);
    await writeJsonFile(FILE, events);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
