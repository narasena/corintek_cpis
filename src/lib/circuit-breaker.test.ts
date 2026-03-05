/**
 * @fileoverview Unit tests for CircuitBreaker
 * @module lib/circuit-breaker.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should execute successfully when closed', async () => {
    const cb = new CircuitBreaker();
    const fn = vi.fn().mockResolvedValue('success');

    const result = await cb.execute(fn);

    expect(result).toBe('success');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('should open after failure threshold', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
    });
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(cb.execute(fn)).rejects.toThrow('fail');
    await expect(cb.execute(fn)).rejects.toThrow('fail');
    await expect(cb.execute(fn)).rejects.toThrow('fail');
    await expect(cb.execute(fn)).rejects.toThrow('Circuit breaker is OPEN');

    expect(cb.getState()).toBe('OPEN');
  });

  it('should transition to half-open after reset timeout', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 1000,
    });

    await expect(
      cb.execute(() => Promise.reject(new Error('fail')))
    ).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    vi.advanceTimersByTime(1000);

    const fn = vi.fn().mockResolvedValue('success');
    const result = await cb.execute(fn);

    expect(result).toBe('success');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('should reset to closed after successful half-open call', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 1000,
    });

    await expect(
      cb.execute(() => Promise.reject(new Error('fail')))
    ).rejects.toThrow();
    vi.advanceTimersByTime(1000);

    await cb.execute(() => Promise.resolve('success'));
    expect(cb.getState()).toBe('CLOSED');
  });

  it('should track half-open calls and return to closed on success', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 1000,
      halfOpenMaxCalls: 2,
    });

    await expect(
      cb.execute(() => Promise.reject(new Error('fail')))
    ).rejects.toThrow();
    vi.advanceTimersByTime(1000);

    // First half-open call - success should close circuit
    await cb.execute(() => Promise.resolve('success'));
    expect(cb.getState()).toBe('CLOSED');

    // After closing, more calls should be allowed
    await cb.execute(() => Promise.resolve('success'));
    await cb.execute(() => Promise.resolve('success'));
  });
});
