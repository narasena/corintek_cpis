import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedDashboardService } from './CachedDashboardService';
import * as dashboardService from './service';
import * as dashboardDi from './di';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('./service', () => ({
  getDashboardMetrics: vi.fn(),
  getRecentLogSheetPhotos: vi.fn(),
}));

vi.mock('./di', () => ({
  getActivityService: vi.fn(),
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);
import { getActivityService } from './di';

describe('CachedDashboardService', () => {
  let service: CachedDashboardService;
  let mockActivityService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivityService = {
      getRecentActivities: vi.fn(),
    };
    vi.mocked(getActivityService).mockReturnValue(mockActivityService as any);
  });

  describe('getDashboardMetrics', () => {
    it('applies DASHBOARD_METRICS tag and DEFAULT TTL', async () => {
      service = new CachedDashboardService();
      vi.mocked(dashboardService.getDashboardMetrics).mockResolvedValue([]);
      await service.getDashboardMetrics();
      expect(mockCacheTag).toHaveBeenCalledWith('dashboard-metrics');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 900,
        revalidate: 900,
      });
    });

    it('forwards arguments to implementation', async () => {
      service = new CachedDashboardService();
      vi.mocked(dashboardService.getDashboardMetrics).mockResolvedValue([]);
      const start = new Date();
      const end = new Date();
      await service.getDashboardMetrics(['p1'], { start, end });
      expect(dashboardService.getDashboardMetrics).toHaveBeenCalledWith(
        ['p1'],
        expect.any(Object)
      );
    });
  });

  describe('getRecentLogSheetPhotos', () => {
    it('applies DASHBOARD_PHOTOS tag and SHORT TTL', async () => {
      service = new CachedDashboardService();
      vi.mocked(dashboardService.getRecentLogSheetPhotos).mockResolvedValue([]);
      await service.getRecentLogSheetPhotos(['p1'], 100);
      expect(mockCacheTag).toHaveBeenCalledWith('dashboard-photos');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 60,
        revalidate: 300,
      });
    });
  });

  describe('getRecentActivities', () => {
    it('applies DASHBOARD_ACTIVITIES tag and SHORT TTL', async () => {
      service = new CachedDashboardService();
      vi.mocked(mockActivityService.getRecentActivities).mockResolvedValue(
        {} as any
      );
      await service.getRecentActivities({} as any);
      expect(mockCacheTag).toHaveBeenCalledWith('dashboard-activities');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 60,
        revalidate: 300,
      });
    });

    it('retrieves activityService from global container', async () => {
      service = new CachedDashboardService();
      await service.getRecentActivities({} as any);
      expect(getActivityService).toHaveBeenCalled();
    });
  });
});
