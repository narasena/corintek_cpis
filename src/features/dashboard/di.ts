/**
 * Dashboard Module - Dependency Injection Container
 * @module features/dashboard/di
 *
 * Composition root for the dashboard module.
 * All dependencies are wired here using pure DI (no framework).
 */

import type { PrismaClient } from '@/generated/prisma/client';
import type { IProjectAccessServices } from './utils';
import type {
  IDashboardConfig,
  IGetRecentActivitiesInput,
  IGetRecentActivitiesResult,
} from './types';
import type { TRbacRole } from '@/lib/rbac';
import { ActivityService } from './service';
import * as projectService from '@/features/projects/service';

// ============================================================================
// Abstractions (Interfaces)
// ============================================================================

/**
 * Interface for the activity service - high level module depends on this
 */
export interface IActivityService {
  getRecentActivities(
    input: IGetRecentActivitiesInput
  ): Promise<IGetRecentActivitiesResult>;
  getDashboardConfig(role: TRbacRole): Promise<IDashboardConfig>;
}

/**
 * Interface for activity repository/data access
 */
export interface IActivityRepository {
  queryLogSheetActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ): Promise<unknown[]>;
  queryWorkReportActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ): Promise<unknown[]>;
}

/**
 * Interface for project access service
 */
export interface IProjectAccessService {
  assertCanAccessProject(
    actor: { id: string; email: string; role: string },
    projectId: string
  ): Promise<void>;
  getAccessibleProjectIds(actor: {
    id: string;
    email: string;
    role: string;
  }): Promise<string[] | undefined | null>;
}

// ============================================================================
// Concrete Implementations
// ============================================================================

class PrismaActivityRepository implements IActivityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async queryLogSheetActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ): Promise<unknown[]> {
    const where: any = {
      deletedAt: null,
      OR: [{ submittedAt: { gte: since } }, { approvedAt: { gte: since } }],
    };
    if (projectIds?.length) where.projectId = { in: projectIds };

    return this.prisma.logSheet.findMany({
      where,
      select: {
        id: true,
        date: true,
        status: true,
        submittedAt: true,
        approvedAt: true,
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async queryWorkReportActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ): Promise<unknown[]> {
    const where: any = {
      deletedAt: null,
      status: 'SUBMITTED',
      createdAt: { gte: since },
    };
    if (projectIds?.length) where.projectId = { in: projectIds };

    return this.prisma.workReport.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        zone: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

class ProjectAccessAdapter implements IProjectAccessService {
  async assertCanAccessProject(
    actor: { id: string; email: string; role: string },
    projectId: string
  ): Promise<void> {
    return projectService.assertCanAccessProject(
      actor as Parameters<typeof projectService.assertCanAccessProject>[0],
      projectId
    );
  }

  async getAccessibleProjectIds(actor: {
    id: string;
    email: string;
    role: string;
  }): Promise<string[] | undefined | null> {
    return projectService.getAccessibleProjectIds(
      actor as Parameters<typeof projectService.getAccessibleProjectIds>[0]
    );
  }
}

// ============================================================================
// Service Factory with DI
// ============================================================================

class ActivityServiceWithRepository implements IActivityService {
  constructor(
    private readonly repository: IActivityRepository,
    private readonly projectAccess: IProjectAccessService
  ) {}

  async getRecentActivities(
    input: IGetRecentActivitiesInput
  ): Promise<IGetRecentActivitiesResult> {
    const service = new ActivityService(this.repository, {
      assertCanAccessProject: this.projectAccess.assertCanAccessProject.bind(
        this.projectAccess
      ),
      getAccessibleProjectIds: this.projectAccess.getAccessibleProjectIds.bind(
        this.projectAccess
      ),
    });
    return service.getRecentActivities(input);
  }

  async getDashboardConfig(role: TRbacRole): Promise<IDashboardConfig> {
    const { getDashboardConfig } = await import('./config');
    return getDashboardConfig(role);
  }
}

// ============================================================================
// Composition Root
// ============================================================================

export interface IDashboardComposition {
  activityService: IActivityService;
  projectAccessService: IProjectAccessService;
  activityRepository: IActivityRepository;
}

/**
 * Composition root - wires all dependencies
 * This is the ONLY place where concrete implementations are instantiated
 */
export function composeDashboardModule(
  prisma: PrismaClient
): IDashboardComposition {
  // Infrastructure layer (concrete)
  const activityRepository: IActivityRepository = new PrismaActivityRepository(
    prisma
  );
  const projectAccessService: IProjectAccessService =
    new ProjectAccessAdapter();

  // Application layer (service with injected dependencies)
  const activityService: IActivityService = new ActivityServiceWithRepository(
    activityRepository,
    projectAccessService
  );

  return {
    activityService,
    projectAccessService,
    activityRepository,
  };
}

// ============================================================================
// Global Container (Singleton Pattern)
// ============================================================================

let container: IDashboardComposition | null = null;

/**
 * Initialize the DI container with prisma instance
 * Call this once at application startup
 */
export function initializeDashboardContainer(prisma: PrismaClient): void {
  if (container) {
    console.warn('[Dashboard DI] Container already initialized');
    return;
  }
  container = composeDashboardModule(prisma);
}

/**
 * Get the activity service from container
 * High-level modules call this - they don't know about concrete implementations
 */
export function getActivityService(): IActivityService {
  if (!container) {
    throw new Error(
      '[Dashboard DI] Container not initialized. Call initializeDashboardContainer first.'
    );
  }
  return container.activityService;
}

/**
 * Get the project access service from container
 */
export function getProjectAccessService(): IProjectAccessService {
  if (!container) {
    throw new Error(
      '[Dashboard DI] Container not initialized. Call initializeDashboardContainer first.'
    );
  }
  return container.projectAccessService;
}

/**
 * Get the activity repository from container
 */
export function getActivityRepository(): IActivityRepository {
  if (!container) {
    throw new Error(
      '[Dashboard DI] Container not initialized. Call initializeDashboardContainer first.'
    );
  }
  return container.activityRepository;
}

/**
 * Reset container (useful for testing)
 */
export function resetDashboardContainer(): void {
  container = null;
}

// ============================================================================
// Test Helpers
// ============================================================================

export interface IMockDependencies {
  activityRepository?: Partial<IActivityRepository>;
  projectAccessService?: Partial<IProjectAccessService>;
}

/**
 * Create container with mock dependencies for testing
 */
export function composeTestDashboardModule(
  mocks: IMockDependencies = {}
): IDashboardComposition {
  const activityRepository: IActivityRepository = {
    queryLogSheetActivities: async () => [],
    queryWorkReportActivities: async () => [],
    ...mocks.activityRepository,
  };

  const projectAccessService: IProjectAccessService = {
    assertCanAccessProject: async () => {},
    getAccessibleProjectIds: async () => [],
    ...mocks.projectAccessService,
  };

  const activityService: IActivityService = new ActivityServiceWithRepository(
    activityRepository,
    projectAccessService
  );

  return {
    activityService,
    projectAccessService,
    activityRepository,
  };
}
