/**
 * Lightweight in-memory rate limiter for serverless environments.
 *
 * Security limitation: this state is local to the current Node.js process. A
 * serverless redeploy, cold start, or another lambda instance starts with an
 * empty Map, so this cannot be the only abuse control for high-risk endpoints.
 * A shared store is the durable fix, but this project is keeping the local
 * limiter for now because adding a paid external store is out of scope.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
const MAX_ENTRIES = 10_000;
let lastCleanup = Date.now();

function pruneStore(now = Date.now()) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }

  if (store.size <= MAX_ENTRIES) return;
  const expiredOrOldest = [...store.entries()]
    .sort(([, a], [, b]) => a.resetAt - b.resetAt)
    .slice(0, store.size - MAX_ENTRIES);
  for (const [key] of expiredOrOldest) {
    store.delete(key);
  }
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  ip: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const configuredLimit = Number.isFinite(config.limit) ? config.limit : 0;
  const configuredWindowSeconds = Number.isFinite(config.windowSeconds)
    ? config.windowSeconds
    : 1;
  const failSafeResult = {
    success: false,
    limit: Math.max(0, configuredLimit),
    remaining: 0,
    resetAt: now + Math.max(1, configuredWindowSeconds) * 1000,
  };

  try {
    if (!ip || configuredLimit < 1 || configuredWindowSeconds < 1) {
      return failSafeResult;
    }

    pruneStore(now);

    const key = `${ip}`;
    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + configuredWindowSeconds * 1000;
      store.set(key, { count: 1, resetAt });
      return {
        success: true,
        limit: configuredLimit,
        remaining: configuredLimit - 1,
        resetAt,
      };
    }

    entry.count++;

    if (entry.count > configuredLimit) {
      return {
        success: false,
        limit: configuredLimit,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    return {
      success: true,
      limit: configuredLimit,
      remaining: configuredLimit - entry.count,
      resetAt: entry.resetAt,
    };
  } catch (error) {
    console.error("[RateLimit] Failed closed:", error);
    return failSafeResult;
  }
}

export function getClientIp(req: Request): string {
  const vercelForwardedFor = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  // Next.js documents x-forwarded-for as the deployment-provided client IP
  // header. Only the first hop is used so a client-supplied comma list cannot
  // choose a later spoofed value for the rate-limit key.
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export function resetRateLimitForTests(): void {
  if (process.env.NODE_ENV !== "test") return;
  store.clear();
  lastCleanup = Date.now();
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

/** Pre-configured limits for different endpoint types */
export const RATE_LIMITS = {
  /** AI endpoints (Gemini API): costly, strict limit */
  ai: { limit: 10, windowSeconds: 60 },
  /** Form submissions: moderate limit */
  form: { limit: 20, windowSeconds: 60 },
  /** Newsletter signup: strict to prevent spam */
  newsletter: { limit: 5, windowSeconds: 300 },
  /** General API: relaxed */
  general: { limit: 60, windowSeconds: 60 },
  /** Lesson comments: moderate spam prevention */
  comment: { limit: 5, windowSeconds: 60 },
  /** Auth endpoints: strict to prevent brute force */
  auth: { limit: 5, windowSeconds: 300 },
  /** Lead magnet download: strict to prevent abuse */
  leadMagnet: { limit: 5, windowSeconds: 300 },
} as const;
