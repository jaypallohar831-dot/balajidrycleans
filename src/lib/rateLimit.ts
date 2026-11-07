/**
 * rateLimit.ts — IP-based rate limiting via Supabase rate_limits table.
 * ──────────────────────────────────────────────────────────────────────
 * 5 requests per 10 minutes per hashed IP, per route key.
 *
 * Uses Supabase rate_limits table when configured, with an in-memory
 * fallback for local dev / tests when Supabase is not reachable.
 */

import { createHash } from "crypto";
import { getServiceClient } from "@/lib/supabase/server";

export const MAX_REQUESTS = 5;
export const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// In-memory fallback tracker: key = `${ipHash}:${routeKey}`, value = timestamp[]
const memoryStore = new Map<string, number[]>();

/** Clean memory store for tests */
export function resetMemoryRateLimit() {
  memoryStore.clear();
}

/** SHA-256 hash of the IP so we never store raw IPs. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function checkMemoryRateLimit(key: string, now: number): boolean {
  const timestamps = memoryStore.get(key) || [];
  const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS) {
    memoryStore.set(key, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  memoryStore.set(key, validTimestamps);
  return true;
}

/**
 * Check and consume a rate-limit token.
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export async function checkRateLimit(
  ip: string,
  routeKey: string
): Promise<boolean> {
  const ipHash = hashIp(ip);
  const cacheKey = `${ipHash}:${routeKey}`;
  const now = Date.now();

  // If Supabase credentials are not configured, use in-memory rate limiting
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT")
  ) {
    return checkMemoryRateLimit(cacheKey, now);
  }

  try {
    const db = getServiceClient();
    const windowStart = new Date(now - WINDOW_MS).toISOString();

    const { count, error: countErr } = await db
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("route_key", routeKey)
      .gte("created_at", windowStart);

    if (countErr) {
      console.error("Rate limit count error:", countErr.message);
      return checkMemoryRateLimit(cacheKey, now);
    }

    if ((count ?? 0) >= MAX_REQUESTS) {
      return false;
    }

    const { error: insertErr } = await db
      .from("rate_limits")
      .insert({ ip_hash: ipHash, route_key: routeKey });

    if (insertErr) {
      console.error("Rate limit insert error:", insertErr.message);
    }

    return true;
  } catch (err) {
    console.error("Rate limit check fallback to memory:", err);
    return checkMemoryRateLimit(cacheKey, now);
  }
}

/**
 * Extract client IP from Next.js request headers.
 * Checks x-forwarded-for first (proxied), then x-real-ip.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();

  return "127.0.0.1";
}
