/**
 * @fileoverview Unit tests for RequestDeduper
 * @module lib/request-deduper.test
 */

import { describe, it, expect, vi } from 'vitest';
import { RequestDeduper } from './request-deduper';

describe('RequestDeduper', () => {
  it('should execute unique requests', async () => {
    const deduper = new RequestDeduper<string>();
    const fn = vi.fn().mockResolvedValue('result');

    const result = await deduper.dedupe('key1', fn);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should dedupe concurrent requests with same key', async () => {
    const deduper = new RequestDeduper<string>();
    const fn = vi.fn().mockResolvedValue('result');

    const [r1, r2] = await Promise.all([
      deduper.dedupe('key1', fn),
      deduper.dedupe('key1', fn),
    ]);

    expect(r1).toBe('result');
    expect(r2).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should allow new request after completion', async () => {
    const deduper = new RequestDeduper<string>();
    const fn = vi.fn().mockResolvedValue('result');

    await deduper.dedupe('key1', fn);
    await deduper.dedupe('key1', fn);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should track pending requests', async () => {
    const deduper = new RequestDeduper<string>();
    const deferred = { resolve: (_v: string) => {}, reject: (_e: Error) => {} };

    const promise = deduper.dedupe(
      'key1',
      () =>
        new Promise((res, rej) => {
          deferred.resolve = res;
          deferred.reject = rej;
        })
    );

    expect(deduper.hasPending('key1')).toBe(true);
    expect(deduper.getPendingCount()).toBe(1);

    deferred.resolve('done');
    await promise;

    expect(deduper.hasPending('key1')).toBe(false);
  });

  it('should handle request errors', async () => {
    const deduper = new RequestDeduper<string>();
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(deduper.dedupe('key1', fn)).rejects.toThrow('fail');
    expect(deduper.hasPending('key1')).toBe(false);
  });

  it('should cancel all pending', async () => {
    const deduper = new RequestDeduper<string>();

    deduper.dedupe('key1', () => new Promise(() => {}));
    deduper.dedupe('key2', () => new Promise(() => {}));

    expect(deduper.getPendingCount()).toBe(2);

    deduper.cancelAll();

    expect(deduper.getPendingCount()).toBe(0);
  });
});
