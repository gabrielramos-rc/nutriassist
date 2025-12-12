import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: This works for single instance. For production scale, use Upstash Redis.
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitConfig {
  limit: number; // Max requests
  windowMs: number; // Time window in milliseconds
}

// Rate limit configurations by route type
export const RATE_LIMITS = {
  chat: { limit: 20, windowMs: 60000 }, // 20 requests per minute (LLM calls are expensive)
  api: { limit: 60, windowMs: 60000 }, // 60 requests per minute for other APIs
  upload: { limit: 10, windowMs: 60000 }, // 10 uploads per minute
} as const;

function getClientIp(request: NextRequest): string {
  // Try various headers for client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0];
    return firstIp?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a default (shouldn't happen in production)
  return "unknown";
}

export function checkRateLimit(
  request: NextRequest,
  routeType: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanupExpiredEntries();

  const config: RateLimitConfig = RATE_LIMITS[routeType];
  const ip = getClientIp(request);
  const key = `${routeType}:${ip}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.limit) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(resetIn / 1000).toString(),
        "X-RateLimit-Reset": Math.ceil(resetIn / 1000).toString(),
      },
    }
  );
}

// Helper to add rate limit headers to successful responses
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetIn: number
): NextResponse {
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", Math.ceil(resetIn / 1000).toString());
  return response;
}
