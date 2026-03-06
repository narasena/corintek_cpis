/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() =>
      useDebouncedValue({ value: 'initial', delay: 300 })
    );

    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isPending).toBe(false);
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue({ value, delay: 300 }),
      { initialProps: { value: 'initial' } }
    );

    // Change value
    rerender({ value: 'changed' });
    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isPending).toBe(true);

    // Fast-forward past debounce delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe('changed');
    expect(result.current.isPending).toBe(false);
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue({ value, delay: 300 }),
      { initialProps: { value: 'a' } }
    );

    // Rapid changes
    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'abc' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be pending after 200ms total (due to resets)
    expect(result.current.debouncedValue).toBe('a');
    expect(result.current.isPending).toBe(true);

    // Complete the debounce after final change
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe('abc');
    expect(result.current.isPending).toBe(false);
  });

  it('handles number values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue({ value, delay: 100 }),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });
    expect(result.current.debouncedValue).toBe(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.debouncedValue).toBe(42);
  });

  it('handles object values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue({ value, delay: 100 }),
      { initialProps: { value: { count: 0 } } }
    );

    const newValue = { count: 5 };
    rerender({ value: newValue });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.debouncedValue).toBe(newValue);
  });
});
