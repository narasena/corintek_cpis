import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedProjectService } from './CachedProjectService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);

describe('CachedProjectService', () => {
  let service: CachedProjectService;
  let mockService: any;

  const actor = { id: 'u1', email: 'e@e.com', role: 'ADMIN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getProjects: vi.fn(),
      getDashboardProjects: vi.fn(),
      getProjectById: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      setProjectAssignments: vi.fn(),
      assertCanAccessProject: vi.fn(),
      getAccessibleProjectIds: vi.fn(),
    };
    service = new CachedProjectService(mockService);
  });

  describe('read methods', () => {
    it('getProjects caches with PROJECTS tag (DEFAULT TTL)', async () => {
      mockService.getProjects.mockResolvedValue([]);
      await service.getProjects(actor);
      expect(mockCacheTag).toHaveBeenCalledWith('projects');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 900,
        revalidate: 900,
      });
    });

    it('getDashboardProjects caches with PROJECTS_DASHBOARD tag (SHORT TTL)', async () => {
      mockService.getDashboardProjects.mockResolvedValue([]);
      await service.getDashboardProjects(actor);
      expect(mockCacheTag).toHaveBeenCalledWith('projects-dashboard');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 60,
        revalidate: 300,
      });
    });

    it('getProjectById caches with PROJECTS tag', async () => {
      mockService.getProjectById.mockResolvedValue({} as any);
      await service.getProjectById(actor, 'p1');
      expect(mockCacheTag).toHaveBeenCalledWith('projects');
    });
  });

  describe('write methods', () => {
    it('createProject does not cache', async () => {
      mockService.createProject.mockResolvedValue({});
      await service.createProject(actor, {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('updateProject does not cache', async () => {
      mockService.updateProject.mockResolvedValue({});
      await service.updateProject(actor, {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('setProjectAssignments does not cache', async () => {
      mockService.setProjectAssignments.mockResolvedValue([]);
      await service.setProjectAssignments(actor, 'p1', []);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('getProjectById returns null when not found', async () => {
      mockService.getProjectById.mockResolvedValue(null);
      const result = await service.getProjectById(actor, 'p1');
      expect(result).toBeNull();
    });

    it('assertCanAccessProject propagates authorization errors', async () => {
      mockService.assertCanAccessProject.mockRejectedValue(
        new Error('Unauthorized')
      );
      await expect(service.assertCanAccessProject(actor, 'p1')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });
});
