/**
 * @fileoverview Circuit Breaker pattern for resilience
 * @module lib/circuit-breaker
 * @responsibility Prevent cascade failures by stopping requests to failing services
 */

interface ICircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

/**
 * Circuit breaker configuration
 */
interface ICircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  halfOpenMaxCalls?: number;
}

/**
 * Circuit breaker for async operations
 * @responsibility Stop cascade failures by opening circuit after threshold
 */
export class CircuitBreaker {
  private state: ICircuitBreakerState = {
    failures: 0,
    lastFailure: 0,
    state: 'CLOSED',
  };
  private halfOpenCalls = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenMaxCalls: number;

  constructor(config: ICircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.resetTimeoutMs = config.resetTimeoutMs ?? 30000;
    this.halfOpenMaxCalls = config.halfOpenMaxCalls ?? 3;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (!this.shouldAttemptReset()) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state.state = 'HALF_OPEN';
    }

    if (
      this.state.state === 'HALF_OPEN' &&
      this.halfOpenCalls >= this.halfOpenMaxCalls
    ) {
      throw new Error('Circuit breaker is HALF_OPEN - max calls exceeded');
    }

    if (this.state.state === 'HALF_OPEN') {
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.state.lastFailure >= this.resetTimeoutMs;
  }

  private onSuccess(): void {
    if (this.state.state === 'HALF_OPEN') {
      this.state = { failures: 0, lastFailure: 0, state: 'CLOSED' };
      this.halfOpenCalls = 0;
    }
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailure = Date.now();

    if (this.state.failures >= this.failureThreshold) {
      this.state.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state.state;
  }
}
