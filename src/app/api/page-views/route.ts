import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const KEY = "page-views:total";

export const runtime = "edge";

export async function GET() {
  try {
    const count = await kv.incr(KEY);
    return NextResponse.json(
      { views: count },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    // KV not configured — gracefully degrade
    return NextResponse.json({ views: null });
  }
}
