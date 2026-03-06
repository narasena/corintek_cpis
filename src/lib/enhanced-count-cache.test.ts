/**
 * @fileoverview Unit tests for EnhancedCountCache
 * @module lib/enhanced-count-cache.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedCountCache } from './enhanced-count-cache';

describe('EnhancedCountCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should cache value with TTL', async () => {
    const cache = new EnhancedCountCache<number>({ ttlMs: 5000 });
    const compute = vi.fn().mockResolvedValue(42);

    const result1 = await cache.getOrCompute('key', compute);
    const result2 = await cache.getOrCompute('key', compute);

    expect(result1).toBe(42);
    expect(result2).toBe(42);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should enforce size limit', async () => {
    const cache = new EnhancedCountCache<number>({ ttlMs: 5000, maxSize: 2 });

    await cache.getOrCompute('key1', async () => 1);
    await cache.getOrCompute('key2', async () => 2);
    await cache.getOrCompute('key3', async () => 3);

    expect(cache.getSize()).toBe(2);
  });

  it('should warm cache with multiple keys', async () => {
    const cache = new EnhancedCountCache<number>({ ttlMs: 5000 });
    const compute = vi.fn().mockResolvedValue(100);

    await cache.warmCache(['a', 'b', 'c'], compute);

    expect(compute).toHaveBeenCalledTimes(3);
    expect(cache.getSize()).toBe(3);
  });

  it('should evict oldest entry when size limit reached', async () => {
    const cache = new EnhancedCountCache<number>({ ttlMs: 5000, maxSize: 2 });

    await cache.getOrCompute('key1', async () => 1);
    await cache.getOrCompute('key2', async () => 2);
    await cache.getOrCompute('key3', async () => 3);

    expect(cache.getSize()).toBe(2);
  });

  it('should invalidate specific key', async () => {
    const cache = new EnhancedCountCache<number>({ ttlMs: 5000 });
    const compute = vi
      .fn()
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(100);

    await cache.getOrCompute('key', compute);
    cache.invalidate('key');
    const result = await cache.getOrCompute('key', compute);

    expect(result).toBe(100);
  });

  it('should clear all entries', async () => {
    const cache = new EnhancedCountCache<number>({ ttlMs: 5000 });

    await cache.getOrCompute('key1', async () => 1);
    await cache.getOrCompute('key2', async () => 2);
    cache.clear();

    expect(cache.getSize()).toBe(0);
  });

  it('should use default values when config not provided', async () => {
    const cache = new EnhancedCountCache<number>();
    const compute = vi.fn().mockResolvedValue(42);

    await cache.getOrCompute('key', compute);
    expect(cache.getSize()).toBe(1);
  });
});
