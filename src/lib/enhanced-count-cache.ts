/**
 * @fileoverview Enhanced CountCache with size limit and warming
 * @module lib/enhanced-count-cache
 * @responsibility TTL + size-limited cache with warming capability
 */

interface ICacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Enhanced cache configuration
 */
interface IEnhancedCacheConfig {
  ttlMs?: number;
  maxSize?: number;
}

/**
 * Enhanced CountCache with size limit and warming
 * @responsibility Memory-safe caching with prefetch capability
 */
export class EnhancedCountCache<T> {
  private cache = new Map<string, ICacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxSize: number;

  constructor(config: IEnhancedCacheConfig = {}) {
    this.ttlMs = config.ttlMs ?? 5000;
    this.maxSize = config.maxSize ?? 100;
  }

  async getOrCompute(key: string, compute: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.ttlMs) {
      return cached.value;
    }

    this.enforceSizeLimit();
    const value = await compute();
    this.cache.set(key, { value, timestamp: now });
    return value;
  }

  async warmCache(
    keys: string[],
    compute: (key: string) => Promise<T>
  ): Promise<void> {
    await Promise.all(
      keys.map(key => this.getOrCompute(key, () => compute(key)))
    );
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private enforceSizeLimit(): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  getSize(): number {
    return this.cache.size;
  }
}
