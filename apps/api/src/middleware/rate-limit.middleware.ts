import { Context, Next } from "hono";

/**
 * Simple in-memory rate limiter
 *
 * For production, use Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Every minute

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  keyGenerator?: (c: Context) => string;
  message?: string;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyGenerator = (c) => c.req.header("x-forwarded-for") || "anonymous",
    message = "Too many requests, please try again later",
  } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    // Set rate limit headers
    c.header("X-RateLimit-Limit", max.toString());
    c.header("X-RateLimit-Remaining", Math.max(0, max - entry.count).toString());
    c.header("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000).toString());

    if (entry.count > max) {
      c.header("Retry-After", Math.ceil((entry.resetAt - now) / 1000).toString());
      return c.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message,
          },
        },
        429
      );
    }

    await next();
  };
}

/**
 * Stricter rate limit for code execution
 */
export const executionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 executions per minute
  keyGenerator: (c) => {
    const user = c.get("user");
    return user?.id || c.req.header("x-forwarded-for") || "anonymous";
  },
  message: "Too many code execution requests. Please wait before trying again.",
});

/**
 * Standard API rate limit
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (c) => {
    const user = c.get("user");
    return user?.id || c.req.header("x-forwarded-for") || "anonymous";
  },
});

/**
 * Auth rate limit (stricter)
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "anonymous",
  message: "Too many authentication attempts. Please try again later.",
});
