import { NextResponse } from "next/server";
import Redis from "ioredis";

const KEY = "page-views:total";

let redis: Redis | null = null;

function getRedis() {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
  });
  redis.on("error", () => {});
  return redis;
}

export async function GET() {
  try {
    const client = getRedis();
    if (!client) return NextResponse.json({ views: null });

    const count = await client.incr(KEY);

    return NextResponse.json(
      { views: count },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json({ views: null });
  }
}
