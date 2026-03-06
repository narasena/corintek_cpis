/**
 * @fileoverview Unit tests for CountCache
 * @module lib/count-cache.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountCache } from './count-cache';

describe('CountCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should cache value for specified TTL', async () => {
    const cache = new CountCache<number>(5000);
    const compute = vi.fn().mockResolvedValue(42);

    const result1 = await cache.getOrCompute('key', compute);
    const result2 = await cache.getOrCompute('key', compute);

    expect(result1).toBe(42);
    expect(result2).toBe(42);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should recompute after TTL expires', async () => {
    const cache = new CountCache<number>(5000);
    const compute = vi
      .fn()
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(100);

    await cache.getOrCompute('key', compute);
    vi.advanceTimersByTime(6000);
    const result = await cache.getOrCompute('key', compute);

    expect(result).toBe(100);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('should handle different keys independently', async () => {
    const cache = new CountCache<number>(5000);

    const result1 = await cache.getOrCompute('key1', async () => 42);
    const result2 = await cache.getOrCompute('key2', async () => 100);

    expect(result1).toBe(42);
    expect(result2).toBe(100);
  });

  it('should invalidate specific key', async () => {
    const cache = new CountCache<number>(5000);
    const compute = vi
      .fn()
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(100);

    await cache.getOrCompute('key', compute);
    cache.invalidate('key');
    const result = await cache.getOrCompute('key', compute);

    expect(result).toBe(100);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('should clear all cached values', async () => {
    const cache = new CountCache<number>(5000);
    const compute = vi
      .fn()
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(100);

    await cache.getOrCompute('key', compute);
    cache.clear();
    const result = await cache.getOrCompute('key', compute);

    expect(result).toBe(100);
  });

  it('should propagate compute errors', async () => {
    const cache = new CountCache<number>(5000);
    const compute = vi.fn().mockRejectedValue(new Error('DB Error'));

    await expect(cache.getOrCompute('key', compute)).rejects.toThrow(
      'DB Error'
    );
  });

  it('should use default TTL of 5000ms', async () => {
    const cache = new CountCache<number>();
    const compute = vi
      .fn()
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(100);

    await cache.getOrCompute('key', compute);
    vi.advanceTimersByTime(4000);
    const result = await cache.getOrCompute('key', compute);

    expect(result).toBe(42);
    expect(compute).toHaveBeenCalledTimes(1);
  });
});
