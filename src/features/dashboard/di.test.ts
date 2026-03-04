/**
 * Dashboard DI Container Tests
 * @module features/dashboard/di.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  composeDashboardModule,
  composeTestDashboardModule,
  initializeDashboardContainer,
  getActivityService,
  getProjectAccessService,
  getActivityRepository,
  resetDashboardContainer,
  type IActivityRepository,
  type IProjectAccessService,
} from './di';

describe('composeTestDashboardModule', () => {
  it('should create module with mock repository returning empty arrays', async () => {
    const { activityRepository, activityService } =
      composeTestDashboardModule();

    const logSheets = await activityRepository.queryLogSheetActivities(
      [],
      new Date(),
      10
    );
    const workReports = await activityRepository.queryWorkReportActivities(
      [],
      new Date(),
      10
    );

    expect(logSheets).toEqual([]);
    expect(workReports).toEqual([]);
  });

  it('should create module with custom mock repository', async () => {
    const mockLogSheet = {
      id: 'ls-1',
      date: new Date(),
      status: 'SUBMITTED',
      submittedAt: new Date(),
      approvedAt: null,
      submittedBy: {
        id: 'u1',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: null,
      },
      approvedBy: null,
      project: { id: 'p1', name: 'Project A' },
    };

    const { activityRepository } = composeTestDashboardModule({
      activityRepository: {
        queryLogSheetActivities: vi.fn().mockResolvedValue([mockLogSheet]),
      },
    });

    const result = await activityRepository.queryLogSheetActivities(
      [],
      new Date(),
      10
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(mockLogSheet);
  });

  it('should create module with custom project access service', async () => {
    const mockAssertFn = vi.fn().mockRejectedValue(new Error('Access Denied'));

    const { projectAccessService } = composeTestDashboardModule({
      projectAccessService: {
        assertCanAccessProject: mockAssertFn,
      },
    });

    await expect(
      projectAccessService.assertCanAccessProject(
        { id: 'u1', email: 'test@test.com', role: 'TECHNICIAN' },
        'proj-1'
      )
    ).rejects.toThrow('Access Denied');
  });
});

describe('Global Container', () => {
  beforeEach(() => {
    resetDashboardContainer();
  });

  it('should throw error when accessing service before initialization', () => {
    expect(() => getActivityService()).toThrow(
      '[Dashboard DI] Container not initialized'
    );
  });

  it('should return service after initialization', () => {
    const mockPrisma = {} as any;
    initializeDashboardContainer(mockPrisma);

    const service = getActivityService();
    expect(service).toBeDefined();
    expect(typeof service.getRecentActivities).toBe('function');
  });

  it('should return same instance on multiple calls (singleton)', () => {
    const mockPrisma = {} as any;
    initializeDashboardContainer(mockPrisma);

    const service1 = getActivityService();
    const service2 = getActivityService();

    expect(service1).toBe(service2);
  });

  it('should warn on double initialization', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockPrisma = {} as any;

    initializeDashboardContainer(mockPrisma);
    initializeDashboardContainer(mockPrisma);

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Dashboard DI] Container already initialized'
    );
    consoleSpy.mockRestore();
  });

  it('should reset container properly', () => {
    const mockPrisma = {} as any;
    initializeDashboardContainer(mockPrisma);
    resetDashboardContainer();

    expect(() => getActivityService()).toThrow(
      '[Dashboard DI] Container not initialized'
    );
  });
});

describe('ActivityService Integration with Mocks', () => {
  it('should filter activities by project IDs', async () => {
    const mockLogSheet = {
      id: 'ls-1',
      date: new Date(),
      status: 'SUBMITTED',
      submittedAt: new Date(),
      approvedAt: null,
      submittedBy: {
        id: 'u1',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: null,
      },
      approvedBy: null,
      project: { id: 'p1', name: 'Project A' },
    };

    const mockWorkReport = {
      id: 'wr-1',
      createdAt: new Date(),
      zone: 'Zone A',
      project: { id: 'p2', name: 'Project B' },
    };

    const { activityService } = composeTestDashboardModule({
      activityRepository: {
        queryLogSheetActivities: vi.fn().mockResolvedValue([mockLogSheet]),
        queryWorkReportActivities: vi.fn().mockResolvedValue([mockWorkReport]),
      },
    });

    const result = await activityService.getRecentActivities({
      actor: { id: 'u1', email: 'test@test.com', role: 'ADMIN' },
      projectIds: ['p1', 'p2'],
      timeRange: '7d',
      limit: 15,
    });

    expect(result.activities).toHaveLength(2);
    expect(result.appliedRange).toBe('7d');
    expect(result.hasMore).toBe(false);
  });

  it('should handle empty results gracefully', async () => {
    const { activityService } = composeTestDashboardModule();

    const result = await activityService.getRecentActivities({
      actor: { id: 'u1', email: 'test@test.com', role: 'ADMIN' },
      timeRange: '7d',
      limit: 15,
    });

    expect(result.activities).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
    expect(result.totalEstimate).toBe(0);
  });

  it('should limit results and indicate hasMore', async () => {
    const mockLogSheets = Array.from({ length: 20 }, (_, i) => ({
      id: `ls-${i}`,
      date: new Date(),
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - i * 1000),
      approvedAt: null,
      submittedBy: {
        id: 'u1',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: null,
      },
      approvedBy: null,
      project: { id: 'p1', name: 'Project A' },
    }));

    const { activityService } = composeTestDashboardModule({
      activityRepository: {
        queryLogSheetActivities: vi.fn().mockResolvedValue(mockLogSheets),
        queryWorkReportActivities: vi.fn().mockResolvedValue([]),
      },
    });

    const result = await activityService.getRecentActivities({
      actor: { id: 'u1', email: 'test@test.com', role: 'ADMIN' },
      timeRange: '7d',
      limit: 15,
    });

    expect(result.activities).toHaveLength(15);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBeDefined();
  });

  it('should return config for different roles', async () => {
    const { activityService } = composeTestDashboardModule();

    const adminConfig = await activityService.getDashboardConfig('ADMIN');
    expect(adminConfig.defaultTimeRange).toBe('30d');
    expect(adminConfig.scope).toBe('ALL');

    const technicianConfig =
      await activityService.getDashboardConfig('TECHNICIAN');
    expect(technicianConfig.defaultTimeRange).toBe('7d');
    expect(technicianConfig.scope).toBe('ASSIGNED');
  });
});
