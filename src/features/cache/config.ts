/**
 * Cache configuration helpers
 * @module features/cache/config
 *
 * Provides factory function for creating cache configuration objects
 * that can be passed to caching layers or used as documentation.
 */

import { ECacheLifeProfile, ECacheTag } from './tags';

/**
 * Configuration for cached service methods
 *
 * This interface documents the caching intent for a service method.
 * It is not used directly by Next.js cache system (which uses cacheTag/cacheLife),
 * but serves as a shared type for documentation and potential future abstraction.
 */
export interface ICacheConfig {
  /** Cache tag(s) for invalidation */
  readonly tags: ECacheTag | ECacheTag[];
  /** Cache life profile (must match profile in next.config.ts cacheLife) */
  readonly life?: ECacheLifeProfile;
  /** Force revalidation on every request (dev/debug only, not used in production) */
  readonly forceRevalidate?: boolean;
}

/**
 * Create cache configuration object
 *
 * Use this function to document caching intent next to service method signatures:
 *
 * ```typescript
 * async getAllParameters(actor: IJwtPayload): Promise<IParameter[]> {
 *   // @caching config={cacheConfig({ tags: ECacheTag.PARAMETERS, life: ECacheLifeProfile.HOURS })}
 *   cacheTag(ECacheTag.PARAMETERS);
 *   cacheLife(ECacheLifeProfile.HOURS);
 *   // ... implementation
 * }
 * ```
 *
 * @param params - Cache configuration parameters
 * @returns ICacheConfig object with normalized values
 */
export function cacheConfig(params: {
  tags: ECacheTag | ECacheTag[];
  life?: ECacheLifeProfile;
}): ICacheConfig {
  return {
    tags: Array.isArray(params.tags) ? params.tags : [params.tags],
    life: params.life ?? ECacheLifeProfile.DEFAULT,
    forceRevalidate: false,
  };
}
