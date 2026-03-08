import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ---------------------------------------------------------------------
// ENV CONFIG — Must be set BEFORE any code imports that read it
// ---------------------------------------------------------------------
process.env.NEXT_PUBLIC_CACHE_METRICS = 'true';
const originalEnv = process.env.NEXT_PUBLIC_CACHE_METRICS;

// ---------------------------------------------------------------------
// MOCK SETUP — Must come BEFORE any imports that use these modules
// ---------------------------------------------------------------------

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: {} as any }));

vi.mock('../parameters/service', () => ({
  getAllParameters: vi.fn(),
  getParameterById: vi.fn(),
  createParameter: vi.fn(),
  updateParameter: vi.fn(),
  deleteParameter: vi.fn(),
}));

vi.mock('../clients/service', () => ({
  getAllClients: vi.fn(),
  getClientById: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}));

vi.mock('../projects/service', () => ({
  getProjects: vi.fn(),
  getDashboardProjects: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  setProjectAssignments: vi.fn(),
  assertCanAccessProject: vi.fn(),
  getAccessibleProjectIds: vi.fn(),
}));

vi.mock('../users/service', () => ({
  getAllUsers: vi.fn(),
  getTechniciansList: vi.fn(),
  getUserById: vi.fn(),
  getCurrentUserProfile: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

vi.mock('../dashboard/service', () => ({
  getDashboardMetrics: vi.fn(),
  getRecentLogSheetPhotos: vi.fn(),
}));

vi.mock('../dashboard/di', () => ({
  composeDashboardModule: vi.fn(() => ({
    activityService: { getRecentActivities: vi.fn() as any },
    projectAccessService: {},
    activityRepository: {},
  })),
}));

vi.mock('@/lib/rbac', () => ({
  canAccess: vi.fn(() => true),
  RbacResource: { USERS_ADMIN: 'users_admin', LOG_SHEETS: 'log_sheets' },
}));

// ---------------------------------------------------------------------
// IMPPORTS — After mocks are defined
// ---------------------------------------------------------------------

import { prisma } from '@/lib/prisma';
import { cacheTag, cacheLife, revalidateTag } from 'next/cache';

import {
  initializeCacheContainer,
  getCacheContainer,
  resetCacheContainer,
} from './di';
import {
  recordHit,
  recordMiss,
  recordError,
  getMetricsSnapshot,
  resetMetrics,
  withMetrics,
} from './metrics';
import { ECacheTag } from './tags';

import * as parametersModule from '../parameters/service';
import * as clientsModule from '../clients/service';
import * as projectsModule from '../projects/service';
import * as usersModule from '../users/service';
import * as dashboardModule from '../dashboard/service';

const mockCacheTagFn = vi.mocked(cacheTag);
const mockCacheLifeFn = vi.mocked(cacheLife);
const mockRevalidateTagFn = vi.mocked(revalidateTag);

const mocks = {
  parameters: {
    getAllParameters: parametersModule.getAllParameters as any,
    getParameterById: parametersModule.getParameterById as any,
    createParameter: parametersModule.createParameter as any,
    updateParameter: parametersModule.updateParameter as any,
    deleteParameter: parametersModule.deleteParameter as any,
  },
  clients: {
    getAllClients: clientsModule.getAllClients as any,
    getClientById: clientsModule.getClientById as any,
    createClient: clientsModule.createClient as any,
    updateClient: clientsModule.updateClient as any,
    deleteClient: clientsModule.deleteClient as any,
  },
  projects: {
    getProjects: projectsModule.getProjects as any,
    getDashboardProjects: projectsModule.getDashboardProjects as any,
    getProjectById: projectsModule.getProjectById as any,
    createProject: projectsModule.createProject as any,
    updateProject: projectsModule.updateProject as any,
    setProjectAssignments: projectsModule.setProjectAssignments as any,
  },
  users: {
    getAllUsers: usersModule.getAllUsers as any,
    getTechniciansList: usersModule.getTechniciansList as any,
    getUserById: usersModule.getUserById as any,
    getCurrentUserProfile: usersModule.getCurrentUserProfile as any,
    createUser: usersModule.createUser as any,
    updateUser: usersModule.updateUser as any,
    deleteUser: usersModule.deleteUser as any,
  },
  dashboard: {
    getDashboardMetrics: dashboardModule.getDashboardMetrics as any,
    getRecentLogSheetPhotos: dashboardModule.getRecentLogSheetPhotos as any,
  },
};

// ---------------------------------------------------------------------
// TESTS
// ---------------------------------------------------------------------

describe('Cache Integration', () => {
  const actor = { sub: 'user1', role: 'admin' } as any;

  beforeEach(() => {
    resetCacheContainer();
    resetMetrics();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CACHE_METRICS = 'true';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_CACHE_METRICS = originalEnv;
  });

  describe('Container Initialization', () => {
    it('creates all 5 services', () => {
      initializeCacheContainer(prisma);
      const c = getCacheContainer();
      expect(c.parameters).toBeDefined();
      expect(c.clients).toBeDefined();
      expect(c.projects).toBeDefined();
      expect(c.users).toBeDefined();
      expect(c.dashboard).toBeDefined();
    });

    it('is idempotent (same instance)', () => {
      initializeCacheContainer(prisma);
      const c1 = getCacheContainer();
      initializeCacheContainer(prisma);
      const c2 = getCacheContainer();
      expect(c1).toBe(c2);
    });

    it('throws when not initialized', () => {
      expect(() => getCacheContainer()).toThrow('not initialized');
    });

    it('reset clears container', () => {
      initializeCacheContainer(prisma);
      resetCacheContainer();
      expect(() => getCacheContainer()).toThrow('not initialized');
    });
  });

  describe('Cache Tagging', () => {
    beforeEach(() => {
      initializeCacheContainer(prisma);
    });

    it('parameters uses PARAMETERS tag', async () => {
      const container = getCacheContainer();
      mocks.parameters.getAllParameters.mockResolvedValue([{ id: 'p1' }]);
      await container.parameters.getAllParameters(actor);
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.PARAMETERS);
    });

    it('clients uses CLIENTS tag', async () => {
      const container = getCacheContainer();
      mocks.clients.getAllClients.mockResolvedValue([{ id: 'c1' }]);
      await container.clients.getAllClients(actor);
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.CLIENTS);
    });

    it('projects uses PROJECTS and PROJECTS_DASHBOARD tags', async () => {
      const container = getCacheContainer();
      mocks.projects.getProjects.mockResolvedValue([{ id: 'p1' }]);
      await container.projects.getProjects(actor);
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.PROJECTS);

      mockCacheTagFn.mockClear();
      mocks.projects.getDashboardProjects.mockResolvedValue([{ id: 'pd1' }]);
      await container.projects.getDashboardProjects(actor);
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.PROJECTS_DASHBOARD);
    });

    it('users uses USERS and USERS_TECHNICIANS tags', async () => {
      const container = getCacheContainer();
      mocks.users.getAllUsers.mockResolvedValue([{ id: 'u1' }]);
      await container.users.getAllUsers(actor);
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.USERS);

      mockCacheTagFn.mockClear();
      mocks.users.getTechniciansList.mockResolvedValue([{ id: 't1' }]);
      await container.users.getTechniciansList(actor);
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.USERS_TECHNICIANS);
    });

    it('dashboard uses correct tags and TTL profiles', async () => {
      const container = getCacheContainer();
      mocks.dashboard.getDashboardMetrics.mockResolvedValue({ total: 100 });
      await container.dashboard.getDashboardMetrics();
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.DASHBOARD_METRICS);
      expect(mockCacheLifeFn).toHaveBeenCalledWith('hours');

      mockCacheTagFn.mockClear();
      mockCacheLifeFn.mockClear();

      mocks.dashboard.getRecentLogSheetPhotos.mockResolvedValue([]);
      await container.dashboard.getRecentLogSheetPhotos();
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.DASHBOARD_PHOTOS);
      expect(mockCacheLifeFn).toHaveBeenCalledWith('minutes');
    });

    it('getCurrentUserProfile uses USERS tag', async () => {
      const container = getCacheContainer();
      mocks.users.getCurrentUserProfile.mockResolvedValue({
        id: 'u1',
        name: 'Test',
      } as any);
      await container.users.getCurrentUserProfile('u1');
      expect(mockCacheTagFn).toHaveBeenCalledWith(ECacheTag.USERS);
    });
  });

  describe('Write Bypass', () => {
    beforeEach(() => {
      initializeCacheContainer(prisma);
    });

    it('create methods bypass cache', async () => {
      const container = getCacheContainer();
      mocks.clients.createClient.mockResolvedValue({ id: 'new' });
      await container.clients.createClient(actor, { name: 'Test' } as any);
      expect(mockCacheTagFn).not.toHaveBeenCalled();
    });

    it('update methods bypass cache', async () => {
      const container = getCacheContainer();
      mocks.projects.updateProject.mockResolvedValue({ id: 'p1' });
      await container.projects.updateProject(actor, {
        id: 'p1',
        name: 'New',
      } as any);
      expect(mockCacheTagFn).not.toHaveBeenCalled();
    });

    it('delete methods bypass cache', async () => {
      const container = getCacheContainer();
      mocks.parameters.deleteParameter.mockResolvedValue({ success: true });
      await container.parameters.deleteParameter(actor, 'p1');
      expect(mockCacheTagFn).not.toHaveBeenCalled();
    });
  });

  describe('Invalidation API', () => {
    it('revalidateTag function is available and callable', () => {
      expect(typeof revalidateTag).toBe('function');
      // Should not throw
      (revalidateTag as any)(ECacheTag.PARAMETERS);
      expect(mockRevalidateTagFn).toHaveBeenCalled();
    });

    it('revalidateTag can be called with different tags', () => {
      mockRevalidateTagFn.mockClear();
      (revalidateTag as any)(ECacheTag.CLIENTS);
      expect(mockRevalidateTagFn).toHaveBeenCalled();
    });
  });

  describe('Metrics', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CACHE_METRICS = 'true';
      resetMetrics();
    });

    it('tracks hits, misses, errors by tag', () => {
      recordHit('clients');
      recordHit('clients');
      recordMiss('users');
      recordError('projects');

      const s = getMetricsSnapshot();
      expect(s?.byTag.hits['clients']).toBe(2);
      expect(s?.byTag.misses['users']).toBe(1);
      expect(s?.byTag.errors['projects']).toBe(1);
      expect(s?.totalRequests).toBe(3);
    });

    it('returns null when disabled', () => {
      process.env.NEXT_PUBLIC_CACHE_METRICS = 'false';
      expect(getMetricsSnapshot()).toBeNull();
    });

    it('reset clears all counters', () => {
      recordHit('t1');
      recordMiss('t2');
      expect(getMetricsSnapshot()?.totalHits).toBe(1);
      resetMetrics();
      const s = getMetricsSnapshot();
      expect(s?.totalHits).toBe(0);
      expect(s?.totalMisses).toBe(0);
    });

    it('withMetrics catches and records errors', async () => {
      const err = new Error('fail');
      await expect(
        withMetrics('tag', async () => {
          throw err;
        })
      ).rejects.toThrow('fail');
      const s = getMetricsSnapshot();
      expect(s?.byTag.errors['tag']).toBe(1);
    });

    it('snapshot includes hit rate calculation', () => {
      recordHit('t');
      recordHit('t');
      recordMiss('t');
      const s = getMetricsSnapshot();
      expect(s?.hitRate).toBeCloseTo(0.666, 2);
    });
  });

  describe('Error Propagation', () => {
    beforeEach(() => {
      initializeCacheContainer(prisma);
    });

    it('cached read errors propagate', async () => {
      const container = getCacheContainer();
      mocks.clients.getClientById.mockRejectedValue(new Error('DB error'));
      await expect(
        container.clients.getClientById(actor, 'c1')
      ).rejects.toThrow('DB error');
    });

    it('write errors log with prefix and rethrow', async () => {
      const container = getCacheContainer();
      mocks.parameters.updateParameter.mockRejectedValue(
        new Error('Update failed')
      );
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await expect(
        container.parameters.updateParameter(actor, { id: 'p1' } as any)
      ).rejects.toThrow('Update failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CPIS-ERROR]'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
