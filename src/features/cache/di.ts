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

// Import original service modules (concrete dependencies)
import * as parameterService from '../parameters/service';
import * as clientService from '../clients/service';
import * as projectService from '../projects/service';
import * as userService from '../users/service';
import {
  getDashboardMetrics,
  getRecentLogSheetPhotos,
} from '../dashboard/service';

// Import cached service classes
import { CachedParameterService } from '../parameters/CachedParameterService';
import { CachedClientService } from '../clients/CachedClientService';
import { CachedProjectService } from '../projects/CachedProjectService';
import { CachedUserService } from '../users/CachedUserService';
import { CachedDashboardService } from '../dashboard/CachedDashboardService';

// Import DI helpers for dashboard
import { composeDashboardModule } from '../dashboard/di';
import type { IActivityService } from '../dashboard/di';

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
  /** Dashboard cached service (requires ActivityService) */
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
 *
 * @example
 * ```typescript
 * // In app/layout.tsx or a startup script
 * import { prisma } from '@/lib/prisma';
 * import { initializeCacheContainer } from '@/features/cache/di';
 *
 * initializeCacheContainer(prisma);
 * ```
 */
export function initializeCacheContainer(prisma: PrismaClient): void {
  if (container) {
    console.warn('[Cache DI] Container already initialized — skipping');
    return;
  }

  // Compose dashboard module to get ActivityService dependency
  const dashboardComposition = composeDashboardModule(prisma);
  const activityService: IActivityService =
    dashboardComposition.activityService;

  // Create cached service instances (injecting original service modules)
  const parameters = new CachedParameterService(parameterService);
  const clients = new CachedClientService(clientService);
  const projects = new CachedProjectService(projectService);
  const users = new CachedUserService(userService);
  const dashboard = new CachedDashboardService(
    getDashboardMetrics,
    getRecentLogSheetPhotos,
    activityService
  );

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
 *
 * @example
 * ```typescript
 * // In a server action or server component
 * const { parameters } = getCacheContainer();
 * const data = await parameters.getAllParameters(actor);
 * ```
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
