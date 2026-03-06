/**
 * @fileoverview Request deduplication utility
 * @module lib/request-deduper
 * @responsibility Prevent duplicate in-flight requests
 */

/**
 * Request deduper for async operations
 * @responsibility Ensure only one request per key is in flight
 */
export class RequestDeduper<T> {
  private inFlight = new Map<string, Promise<T>>();

  async dedupe(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = fn().finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, promise);
    return promise;
  }

  hasPending(key: string): boolean {
    return this.inFlight.has(key);
  }

  getPendingCount(): number {
    return this.inFlight.size;
  }

  cancelAll(): void {
    this.inFlight.clear();
  }
}
