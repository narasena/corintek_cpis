/**
 * @fileoverview Retry utility with exponential backoff
 * @module lib/retry
 * @responsibility Execute functions with retry logic
 */

/**
 * Retry configuration options
 */
interface IRetryConfig {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Execute function with retry logic
 * @responsibility Retry failed operations with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: IRetryConfig = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = config;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));

      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
}
