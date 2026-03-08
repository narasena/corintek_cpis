/**
 * Dependency Injection Container for Cached Services
 * @module features/cache/di
 *
 * Composition root for all caching-optimized services.
 * This file wires together:
 * - Cached service instances
 * - Their dependencies (original service modules, repositories, etc.)
 *
 * No business logic here — only dependency resolution.
 */

import { PrismaClient } from '@/generated/prisma/client';

// Import cached service classes
import { CachedParameterService } from '../parameters/CachedParameterService';
import { CachedClientService } from '../clients/CachedClientService';
import { CachedProjectService } from '../projects/CachedProjectService';
import { CachedUserService } from '../users/CachedUserService';
import { createCachedDashboardService } from '../dashboard/CachedDashboardService';
import type { CachedDashboardService } from '../dashboard/CachedDashboardService';

// ============================================================================
// Container Interface
// ============================================================================

/**
 * Export interface for all cached services
 * High-level modules (actions, pages) should depend on these abstractions
 */
export interface ICacheContainer {
  /** Parameter domain cached service */
  parameters: CachedParameterService;
  /** Client domain cached service */
  clients: CachedClientService;
  /** Project domain cached service */
  projects: CachedProjectService;
  /** User domain cached service */
  users: CachedUserService;
  /** Dashboard cached service (uses global dashboard DI) */
  dashboard: CachedDashboardService;
}

// ============================================================================
// Composition Root
// ============================================================================

/**
 * Internal container storage
 */
let container: ICacheContainer | null = null;

/**
 * Initialize the DI container with required infrastructure
 *
 * Call this once at application startup (e.g., in root layout or server startup)
 *
 * @param prisma - PrismaClient instance (shared)
 */
export function initializeCacheContainer(prisma: PrismaClient): void {
  if (container) {
    console.warn('[Cache DI] Container already initialized — skipping');
    return;
  }

  // Create cached service instances (no constructor args needed)
  const parameters = new CachedParameterService();
  const clients = new CachedClientService();
  const projects = new CachedProjectService();
  const users = new CachedUserService();
  const dashboard = createCachedDashboardService();

  container = {
    parameters,
    clients,
    projects,
    users,
    dashboard,
  };

  console.log('[Cache DI] Container initialized with cached services');
}

/**
 * Get the initialized container
 *
 * @throws Error if container not initialized
 */
export function getCacheContainer(): ICacheContainer {
  if (!container) {
    throw new Error(
      '[Cache DI] Container not initialized. Call initializeCacheContainer(prisma) first.'
    );
  }
  return container;
}

/**
 * Reset container (useful for testing)
 */
export function resetCacheContainer(): void {
  container = null;
}
