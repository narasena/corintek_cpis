import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedProjectService } from './CachedProjectService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('./service', () => ({
  getProjects: vi.fn(),
  getDashboardProjects: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  setProjectAssignments: vi.fn(),
  assertCanAccessProject: vi.fn(),
  getAccessibleProjectIds: vi.fn(),
  getProjectAssignments: vi.fn(),
  deleteProject: vi.fn(),
  upsertProjectParameterOverride: vi.fn(),
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);
import * as service from './service';

describe('CachedProjectService', () => {
  let serviceInstance: CachedProjectService;

  const actor = { id: 'u1', email: 'e@e.com', role: 'ADMIN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    serviceInstance = new CachedProjectService();
  });

  describe('read methods (cached)', () => {
    it('getProjects caches with PROJECTS tag (HOURS TTL)', async () => {
      vi.mocked(service.getProjects).mockResolvedValue([]);
      await serviceInstance.getProjects(actor);
      expect(mockCacheTag).toHaveBeenCalledWith('projects');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
    });

    it('getDashboardProjects caches with PROJECTS_DASHBOARD tag (SHORT TTL)', async () => {
      vi.mocked(service.getDashboardProjects).mockResolvedValue([]);
      await serviceInstance.getDashboardProjects(actor);
      expect(mockCacheTag).toHaveBeenCalledWith('projects-dashboard');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 60,
        revalidate: 300,
      });
    });

    it('getProjectById caches with PROJECTS tag (HOURS TTL)', async () => {
      vi.mocked(service.getProjectById).mockResolvedValue({} as any);
      await serviceInstance.getProjectById(actor, 'p1');
      expect(mockCacheTag).toHaveBeenCalledWith('projects');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
    });
  });

  describe('write methods (non-cached)', () => {
    it('createProject does not cache', async () => {
      vi.mocked(service.createProject).mockResolvedValue({});
      await serviceInstance.createProject(actor, {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('updateProject does not cache', async () => {
      vi.mocked(service.updateProject).mockResolvedValue({});
      await serviceInstance.updateProject(actor, {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('setProjectAssignments does not cache', async () => {
      vi.mocked(service.setProjectAssignments).mockResolvedValue([]);
      await serviceInstance.setProjectAssignments(actor, 'p1', []);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('assertCanAccessProject propagates errors', async () => {
      vi.mocked(service.assertCanAccessProject).mockRejectedValue(
        new Error('Unauthorized')
      );
      await expect(
        serviceInstance.assertCanAccessProject(actor, 'p1')
      ).rejects.toThrow('Unauthorized');
    });

    it('getAccessibleProjectIds propagates errors', async () => {
      vi.mocked(service.getAccessibleProjectIds).mockRejectedValue(
        new Error('DB error')
      );
      await expect(
        serviceInstance.getAccessibleProjectIds(actor)
      ).rejects.toThrow('DB error');
    });

    it('deleteProject does not cache', async () => {
      vi.mocked(service.deleteProject).mockResolvedValue({});
      await serviceInstance.deleteProject(actor, 'p1');
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('upsertProjectParameterOverride does not cache', async () => {
      vi.mocked(service.upsertProjectParameterOverride).mockResolvedValue({});
      await serviceInstance.upsertProjectParameterOverride(actor, {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('getProjectById returns null when not found', async () => {
      vi.mocked(service.getProjectById).mockResolvedValue(null);
      const result = await serviceInstance.getProjectById(actor, 'p1');
      expect(result).toBeNull();
    });
  });
});
