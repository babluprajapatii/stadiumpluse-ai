/**
 * In-Memory Token Bucket Rate Limiter for Client & Edge Middleware.
 * Prevents brute-force attacks, API abuse, and rapid authentication attempts.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  limit?: number;        // Maximum tokens in bucket (default: 10)
  intervalMs?: number;   // Window interval in ms (default: 60000ms = 1 min)
}

export function checkRateLimit(key: string, options: RateLimitOptions = {}): { allowed: boolean; remaining: number; resetMs: number } {
  const limit = options.limit ?? 10;
  const intervalMs = options.intervalMs ?? 60000;
  const now = Date.now();

  const entry = store.get(key) || { tokens: limit, lastRefill: now };

  // Refill tokens based on elapsed time
  const timePassed = now - entry.lastRefill;
  if (timePassed > intervalMs) {
    entry.tokens = limit;
    entry.lastRefill = now;
  }

  if (entry.tokens > 0) {
    entry.tokens -= 1;
    store.set(key, entry);
    return {
      allowed: true,
      remaining: entry.tokens,
      resetMs: Math.max(0, intervalMs - (now - entry.lastRefill)),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetMs: Math.max(0, intervalMs - (now - entry.lastRefill)),
  };
}

export function clearRateLimitStore(): void {
  store.clear();
}
