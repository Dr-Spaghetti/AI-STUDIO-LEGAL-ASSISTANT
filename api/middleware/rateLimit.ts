// ============================================
// Rate Limiting Middleware
// ============================================
// Simple in-memory rate limiting for Vercel Serverless
// For production scale, use Vercel KV or Upstash Redis

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix for the rate limit key
}

// In-memory store (resets on cold start - use Redis for persistence)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different endpoint types
export const RateLimitConfigs = {
  // Standard API endpoints
  standard: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 60,       // 60 requests per minute
  },
  // Chat/AI endpoints (more expensive)
  ai: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 20,       // 20 requests per minute
  },
  // Webhook endpoints
  webhook: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 100,      // 100 requests per minute
  },
  // Auth/sensitive endpoints
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 10,            // 10 requests per 15 minutes
  },
} as const;

/**
 * Get client identifier from request
 */
function getClientKey(req: VercelRequest, prefix: string = ''): string {
  // Try various headers for client IP
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] as string ||
      'unknown';

  // Include tenant ID if available for per-tenant limits
  const tenantId = req.body?.tenantId || req.query?.tenantId || 'global';

  return `${prefix}:${tenantId}:${ip}`;
}

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Check rate limit and return result
 */
export function checkRateLimit(
  req: VercelRequest,
  config: RateLimitConfig = RateLimitConfigs.standard
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const key = getClientKey(req, config.keyPrefix || 'ratelimit');
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Create new entry or reset if window expired
  if (!entry || entry.resetTime <= now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Apply rate limit to response
 * Returns true if request should proceed, false if rate limited
 */
export function applyRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig = RateLimitConfigs.standard
): boolean {
  const result = checkRateLimit(req, config);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetTime.toString());

  if (!result.allowed) {
    res.setHeader('Retry-After', result.retryAfter!.toString());
    res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    });
    return false;
  }

  return true;
}

/**
 * Wrapper to create a rate-limited handler
 */
export function withRateLimit<T extends (req: VercelRequest, res: VercelResponse) => Promise<void>>(
  handler: T,
  config: RateLimitConfig = RateLimitConfigs.standard
): T {
  return (async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    if (!applyRateLimit(req, res, config)) {
      return;
    }
    return handler(req, res);
  }) as T;
}

export default applyRateLimit;
