'use client';

import { useState, useEffect } from 'react';

/**
 * Hook configuration for debounced value
 */
interface IUseDebouncedValueConfig<T> {
  /** Value to debounce */
  value: T;
  /** Delay in milliseconds */
  delay: number;
}

/**
 * Hook return type
 */
interface IUseDebouncedValueReturn<T> {
  /** Current debounced value */
  debouncedValue: T;
  /** Whether value is pending (not yet debounced) */
  isPending: boolean;
}

/**
 * Hook: useDebouncedValue
 * Responsibility: Debounce a value by specified delay
 *
 * @param config - Hook configuration
 * @returns Debounced value and pending state
 */
export function useDebouncedValue<T>(
  config: IUseDebouncedValueConfig<T>
): IUseDebouncedValueReturn<T> {
  const { value, delay } = config;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    // Only set pending if value actually changed
    if (value === debouncedValue) {
      return;
    }
    setIsPending(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay, debouncedValue]);

  return {
    debouncedValue,
    isPending,
  };
}
