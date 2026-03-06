/**
 * @fileoverview DI Container implementation
 * @module lib/di/container
 * @responsibility Service registration and resolution
 */

import type { DIToken } from './tokens';

/**
 * Service factory type
 */
type ServiceFactory<T> = () => T;

/**
 * Registration entry
 */
interface IRegistration<T> {
  factory: ServiceFactory<T>;
  singleton: boolean;
  instance?: T;
}

/**
 * Simple DI Container
 * @responsibility Manage service lifecycle and dependencies
 */
class DIContainer {
  private registrations = new Map<DIToken, IRegistration<unknown>>();

  /**
   * Register a service as transient (new instance per resolve)
   */
  register<T>(token: DIToken, factory: ServiceFactory<T>): void {
    this.registrations.set(token, { factory, singleton: false });
  }

  /**
   * Register a service as singleton (one instance shared)
   */
  registerSingleton<T>(token: DIToken, factory: ServiceFactory<T>): void {
    this.registrations.set(token, { factory, singleton: true });
  }

  /**
   * Register an existing instance (singleton)
   */
  registerInstance<T>(token: DIToken, instance: T): void {
    this.registrations.set(token, {
      factory: () => instance,
      singleton: true,
      instance,
    });
  }

  /**
   * Resolve a service by token
   * @throws Error if token not registered
   */
  resolve<T>(token: DIToken): T {
    const reg = this.registrations.get(token);
    if (!reg) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    if (reg.singleton) {
      if (!reg.instance) {
        reg.instance = reg.factory();
      }
      return reg.instance as T;
    }

    return reg.factory() as T;
  }

  /**
   * Check if token is registered
   */
  isRegistered(token: DIToken): boolean {
    return this.registrations.has(token);
  }
}

/**
 * Global container instance
 */
export const container = new DIContainer();
