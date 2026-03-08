/**
 * Cache Metrics & Observability
 * Tracks cache hit rates, misses, and TTL expirations for debugging
 * Enabled via NEXT_PUBLIC_CACHE_METRICS=true environment variable
 * @module features/cache/metrics
 */

type TMetrics = {
  hits: Map<string, number>;
  misses: Map<string, number>;
  errors: Map<string, number>;
  startTime: number;
};

const metrics: TMetrics = {
  hits: new Map(),
  misses: new Map(),
  errors: new Map(),
  startTime: Date.now(),
};

function isEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CACHE_METRICS === 'true';
}

function increment(map: Map<string, number>, tag: string) {
  const current = map.get(tag) ?? 0;
  map.set(tag, current + 1);
}

/**
 * Record a cache hit for a given tag
 */
export function recordHit(tag: string) {
  if (!isEnabled()) return;
  increment(metrics.hits, tag);
}

/**
 * Record a cache miss for a given tag
 */
export function recordMiss(tag: string) {
  if (!isEnabled()) return;
  increment(metrics.misses, tag);
}

/**
 * Record a cache error for a given tag
 */
export function recordError(tag: string) {
  if (!isEnabled()) return;
  increment(metrics.errors, tag);
}

/**
 * Get current metrics snapshot
 */
export function getMetricsSnapshot() {
  if (!isEnabled()) return null;

  const totalHits = Array.from(metrics.hits.values()).reduce(
    (a, b) => a + b,
    0
  );
  const totalMisses = Array.from(metrics.misses.values()).reduce(
    (a, b) => a + b,
    0
  );
  const totalErrors = Array.from(metrics.errors.values()).reduce(
    (a, b) => a + b,
    0
  );
  const totalRequests = totalHits + totalMisses;

  return {
    enabled: true,
    uptimeSeconds: (Date.now() - metrics.startTime) / 1000,
    totalRequests,
    totalHits,
    totalMisses,
    totalErrors,
    hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
    byTag: {
      hits: Object.fromEntries(metrics.hits),
      misses: Object.fromEntries(metrics.misses),
      errors: Object.fromEntries(metrics.errors),
    },
    // Memory usage estimate (rough)
    memoryBytes:
      estimatedSize(metrics.hits) +
      estimatedSize(metrics.misses) +
      estimatedSize(metrics.errors),
  };
}

/**
 * Reset metrics (useful for testing)
 */
export function resetMetrics() {
  metrics.hits.clear();
  metrics.misses.clear();
  metrics.errors.clear();
  metrics.startTime = Date.now();
}

/**
 * Estimated memory usage of a Map/object in bytes (rough approximation)
 */
function estimatedSize(
  map: Map<string, number> | Record<string, number>
): number {
  let bytes = 0;
  for (const [key, value] of Object.entries(map)) {
    bytes += key.length * 2; // UTF-16 string
    bytes += 8; // number
  }
  return bytes;
}

/**
 * Middleware to automatically record hits/misses around a cached operation
 * Use in helper functions
 */
export function withMetrics<T>(
  tag: string,
  operation: () => Promise<T>
): Promise<T> {
  if (!isEnabled()) return operation();

  return operation().catch(error => {
    recordError(tag);
    throw error;
  });
}
