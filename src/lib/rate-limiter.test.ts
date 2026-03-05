/**
 * @fileoverview Unit tests for RateLimiter
 * @module lib/rate-limiter.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  it('should allow requests under limit', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });

    expect(limiter.checkLimit('user1')).toBe(true);
    expect(limiter.checkLimit('user1')).toBe(true);
    expect(limiter.checkLimit('user1')).toBe(true);
    expect(limiter.checkLimit('user1')).toBe(true);
    expect(limiter.checkLimit('user1')).toBe(true);
  });

  it('should block requests over limit', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

    limiter.checkLimit('user1');
    limiter.checkLimit('user1');

    expect(limiter.checkLimit('user1')).toBe(false);
  });

  it('should reset after window expires', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

    limiter.checkLimit('user1');
    limiter.checkLimit('user1');
    expect(limiter.checkLimit('user1')).toBe(false);

    vi.advanceTimersByTime(61000);

    expect(limiter.checkLimit('user1')).toBe(true);
  });

  it('should track different keys independently', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

    limiter.checkLimit('user1');
    limiter.checkLimit('user1');

    expect(limiter.checkLimit('user2')).toBe(true);
  });

  it('should report remaining requests', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });

    expect(limiter.getRemainingRequests('user1')).toBe(5);
    limiter.checkLimit('user1');
    expect(limiter.getRemainingRequests('user1')).toBe(4);
  });

  it('should reset specific key', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

    limiter.checkLimit('user1');
    limiter.checkLimit('user1');
    limiter.reset('user1');

    expect(limiter.checkLimit('user1')).toBe(true);
  });
});
