/**
 * @fileoverview Rate limiter for request protection
 * @module lib/rate-limiter
 * @responsibility Prevent abuse by limiting request rate per key
 */

interface IRateLimitEntry {
  timestamps: number[];
}

/**
 * Rate limiter configuration
 */
interface IRateLimiterConfig {
  maxRequests?: number;
  windowMs?: number;
}

/**
 * Simple sliding window rate limiter
 * @responsibility Track and limit request rates
 */
export class RateLimiter {
  private requests = new Map<string, IRateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: IRateLimiterConfig = {}) {
    this.maxRequests = config.maxRequests ?? 100;
    this.windowMs = config.windowMs ?? 60000;
  }

  checkLimit(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const entry = this.requests.get(key);
    const timestamps = entry?.timestamps.filter(t => t > windowStart) ?? [];

    if (timestamps.length >= this.maxRequests) {
      return false;
    }

    timestamps.push(now);
    this.requests.set(key, { timestamps });
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const entry = this.requests.get(key);
    const timestamps = entry?.timestamps.filter(t => t > windowStart) ?? [];
    return Math.max(0, this.maxRequests - timestamps.length);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  resetAll(): void {
    this.requests.clear();
  }
}
