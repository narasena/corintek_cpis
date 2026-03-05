'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

/**
 * Hook configuration for search param sync
 */
interface IUseSearchParamConfig {
  /** Param name in URL */
  paramName?: string;
  /** Debounce delay for URL updates */
  debounceMs?: number;
  /** Whether to replace history or push */
  replace?: boolean;
}

/**
 * Hook return type
 */
interface IUseSearchParamReturn {
  /** Current value from URL */
  value: string;
  /** Set value (updates URL) */
  setValue: (value: string) => void;
  /** Clear value (removes from URL) */
  clearValue: () => void;
}

/**
 * Hook: useSearchParam
 * Responsibility: Sync state with URL search parameter
 * Pattern: Two-way binding with URL for shareable links
 *
 * @param config - Hook configuration
 * @returns Value and setters synced with URL
 */
export function useSearchParam(
  config: IUseSearchParamConfig = {}
): IUseSearchParamReturn {
  const { paramName = 'search', debounceMs = 300, replace = true } = config;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getValueFromUrl = useCallback((): string => {
    return searchParams?.get(paramName) ?? '';
  }, [searchParams, paramName]);

  const [value, setValueState] = useState<string>(getValueFromUrl);

  useEffect(() => {
    setValueState(getValueFromUrl());
  }, [getValueFromUrl]);

  const updateUrl = useCallback(
    (newValue: string) => {
      if (!searchParams) return;
      const params = new URLSearchParams(searchParams);
      if (newValue) {
        params.set(paramName, newValue);
      } else {
        params.delete(paramName);
      }
      const url = `${pathname}?${params.toString()}`;
      if (replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
    [searchParams, paramName, pathname, router, replace]
  );

  const setValue = useCallback(
    (newValue: string) => {
      setValueState(newValue);
      const timeoutId = setTimeout(() => {
        updateUrl(newValue);
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    },
    [debounceMs, updateUrl]
  );

  const clearValue = useCallback(() => {
    setValueState('');
    updateUrl('');
  }, [updateUrl]);

  return {
    value,
    setValue,
    clearValue,
  };
}
