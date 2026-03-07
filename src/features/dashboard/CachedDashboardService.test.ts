import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedDashboardService } from './CachedDashboardService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('../dashboard/di', () => ({
  composeDashboardModule: vi.fn(),
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);
import { composeDashboardModule } from '../dashboard/di';

interface IMockDashboardMetrics {}
interface IMockDashboardPhotos {}
interface IMockActivities {}

describe('CachedDashboardService', () => {
  let service: CachedDashboardService;
  let mockActivityService: any;
  const mockGetDashboardMetrics = vi.fn();
  const mockGetRecentLogSheetPhotos = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivityService = {
      getRecentActivities: vi.fn(),
    };
    vi.mocked(composeDashboardModule).mockReturnValue({
      activityService: mockActivityService,
      projectAccessService: {} as any,
      activityRepository: {} as any,
    } as any);
  });

  describe('getDashboardMetrics', () => {
    it('applies DASHBOARD_METRICS tag and DEFAULT TTL', async () => {
      service = new CachedDashboardService(
        mockGetDashboardMetrics,
        mockGetRecentLogSheetPhotos,
        mockActivityService
      );
      (mockGetDashboardMetrics as any).mockResolvedValue([]);
      await service.getDashboardMetrics();
      expect(mockCacheTag).toHaveBeenCalledWith('dashboard-metrics');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 900,
        revalidate: 900,
      });
    });

    it('forwards arguments to implementation', async () => {
      service = new CachedDashboardService(
        mockGetDashboardMetrics,
        mockGetRecentLogSheetPhotos,
        mockActivityService
      );
      (mockGetDashboardMetrics as any).mockResolvedValue([]);
      await service.getDashboardMetrics(['p1'], {
        start: new Date(),
        end: new Date(),
      });
      expect(mockGetDashboardMetrics).toHaveBeenCalledWith(
        ['p1'],
        expect.any(Object)
      );
    });
  });

  describe('getRecentLogSheetPhotos', () => {
    it('applies DASHBOARD_PHOTOS tag and SHORT TTL', async () => {
      service = new CachedDashboardService(
        mockGetDashboardMetrics,
        mockGetRecentLogSheetPhotos,
        mockActivityService
      );
      (mockGetRecentLogSheetPhotos as any).mockResolvedValue([]);
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
      service = new CachedDashboardService(
        mockGetDashboardMetrics,
        mockGetRecentLogSheetPhotos,
        mockActivityService
      );
      (mockActivityService.getRecentActivities as any).mockResolvedValue(
        {} as any
      );
      await service.getRecentActivities({} as any);
      expect(mockCacheTag).toHaveBeenCalledWith('dashboard-activities');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 60,
        revalidate: 300,
      });
    });

    it('throws without activityService', async () => {
      service = new CachedDashboardService(
        mockGetDashboardMetrics,
        mockGetRecentLogSheetPhotos,
        undefined as any
      );
      await expect(service.getRecentActivities({} as any)).rejects.toThrow(
        'ActivityService not configured'
      );
    });
  });
});
