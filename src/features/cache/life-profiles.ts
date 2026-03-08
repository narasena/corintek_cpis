/**
 * Centralized cache TTL (time-to-live) profiles
 * Values are in seconds.
 *
 * These profiles correspond to the cacheLife configuration in next.config.ts.
 * Use these constants instead of inline objects to ensure consistency.
 */
export const CACHE_LIFE = {
  DEFAULT: { stale: 900, revalidate: 900 }, // 15 minutes
  SHORT: { stale: 60, revalidate: 300 }, // 1min stale, 5min revalidate
  HOURS: { stale: 1800, revalidate: 3600 }, // 30min stale, 1h revalidate
} as const;
