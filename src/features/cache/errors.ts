/**
 * Cache-specific error classes
 * @module features/cache/errors
 *
 * These errors are thrown by the caching layer when invariants are violated
 * or when cache operations fail. They extend standard Error with structured
 * error codes and metadata.
 */

export type TCacheErrorCode =
  | 'CACHE_KEY_SERIALIZATION_FAILED'
  | 'CACHE_TAG_TOO_LONG'
  | 'CACHE_TAG_LIMIT_EXCEEDED'
  | 'CACHE_SIZE_LIMIT_EXCEEDED'
  | 'CACHE_DISABLED'
  | 'CACHE_INVALIDATION_FAILED'
  | 'CACHE_STORAGE_ERROR';

export interface ICacheError extends Error {
  readonly code: TCacheErrorCode;
  readonly tag?: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Standard cache operation error
 *
 * Thrown when a cache operation (set/get/invalidate) fails due to:
 * - Serialization issues (non-serializable arguments)
 * - Configuration errors (tag too long, too many tags)
 * - Storage backend failures
 * - Cache disabled in config
 */
export class CacheError extends Error implements ICacheError {
  readonly code: TCacheErrorCode;
  readonly tag?: string;
  readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    code: TCacheErrorCode;
    tag?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'CacheError';
    this.code = params.code;
    this.tag = params.tag;
    this.details = params.details;
  }
}

/**
 * Invariant violation within cached function
 *
 * Thrown in development mode when cache corruption or logic errors are detected:
 * - Soft-deleted records accidentally included in cached result
 * - Non-serializable arguments passed to cached function
 * - Dynamic APIs (cookies, headers) accessed inside cached scope
 *
 * This error signals a programming error that must be fixed.
 */
export class CacheInvariantError extends Error {
  constructor(
    message: string,
    public readonly expected?: unknown,
    public readonly actual?: unknown
  ) {
    super(`[CACHE-INVARIANT] ${message}`);
    this.name = 'CacheInvariantError';
  }
}
