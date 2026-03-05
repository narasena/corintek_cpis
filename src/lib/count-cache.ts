/**
 * @fileoverview Count cache utility for service layer
 * @module lib/count-cache
 * @responsibility TTL-based caching for expensive count queries
 */

interface ICacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Simple TTL cache for count queries
 * @responsibility Cache count results with expiration
 */
export class CountCache<T> {
  private cache = new Map<string, ICacheEntry<T>>();

  constructor(private readonly ttlMs: number = 5000) {}

  /**
   * Get cached value or compute if expired/missing
   */
  async getOrCompute(key: string, compute: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.ttlMs) {
      return cached.value;
    }

    const value = await compute();
    this.cache.set(key, { value, timestamp: now });
    return value;
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }
}
