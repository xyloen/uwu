interface RateLimitEntry { count: number; resetAt: number; }

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60000);

export interface RateLimitConfig { windowMs: number; maxRequests: number; }

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
};

export function checkRateLimit(key: string, config: RateLimitConfig = DEFAULT_CONFIG) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count++;
  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

export const AUTH_RATE_LIMIT: RateLimitConfig = { windowMs: 900000, maxRequests: 10 };
export const TENANT_RATE_LIMIT: RateLimitConfig = { windowMs: 60000, maxRequests: 200 };
