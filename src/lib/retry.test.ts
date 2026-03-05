/**
 * @fileoverview Unit tests for retry utility
 * @module lib/retry.test
 */

import { describe, it, expect, vi } from 'vitest';
import { withRetry } from './retry';

describe('withRetry', () => {
  it('should return result on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Persistent failure'));

    await expect(
      withRetry(fn, { maxAttempts: 3, delayMs: 10 })
    ).rejects.toThrow('Persistent failure');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const delays: number[] = [];
    const originalSetTimeout = setTimeout;
    vi.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay as number);
      return originalSetTimeout(fn, 0);
    });

    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    await withRetry(fn, {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
    });

    expect(delays).toEqual([1000, 2000]);
    vi.restoreAllMocks();
  });

  it('should not retry when shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('No retry'));
    const shouldRetry = vi.fn().mockReturnValue(false);

    await expect(
      withRetry(fn, { maxAttempts: 3, delayMs: 10, shouldRetry })
    ).rejects.toThrow('No retry');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledTimes(1);
  });

  it('should use default config when not provided', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    await withRetry(fn);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error exceptions', async () => {
    const fn = vi.fn().mockRejectedValue('string error');

    await expect(
      withRetry(fn, { maxAttempts: 2, delayMs: 10 })
    ).rejects.toThrow('string error');
  });
});
