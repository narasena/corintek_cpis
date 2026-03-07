/**
 * Cached Dashboard Service - Delegates to original service with caching
 * @module features/dashboard/CachedDashboardService
 */

import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';
import {
  getDashboardMetrics as originalGetDashboardMetrics,
  getRecentLogSheetPhotos as originalGetRecentLogSheetPhotos,
} from './service';
import { composeDashboardModule } from './di';
import { prisma } from '@/lib/prisma';
import type { IActivityService } from './di';
import type { IDashboardMetric } from './service';
import type {
  IGetRecentActivitiesInput,
  IGetRecentActivitiesResult,
} from './types';

export class CachedDashboardService {
  constructor(
    private readonly getDashboardMetricsImpl: typeof originalGetDashboardMetrics,
    private readonly getRecentLogSheetPhotosImpl: typeof originalGetRecentLogSheetPhotos,
    private readonly activityService: IActivityService
  ) {}

  async getDashboardMetrics(
    projectIds?: string[],
    range?: { start: Date; end: Date }
  ): Promise<IDashboardMetric[]> {
    'use cache';
    cacheTag(ECacheTag.DASHBOARD_METRICS);
    cacheLife(CACHE_LIFE.DEFAULT);
    try {
      return await this.getDashboardMetricsImpl(projectIds, range);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedDashboardService.getDashboardMetrics:',
        error
      );
      throw error;
    }
  }

  async getRecentLogSheetPhotos(
    projectIds?: string[],
    limit: number = 50
  ): Promise<unknown[]> {
    'use cache';
    cacheTag(ECacheTag.DASHBOARD_PHOTOS);
    cacheLife(CACHE_LIFE.SHORT);
    try {
      return await this.getRecentLogSheetPhotosImpl(projectIds, limit);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedDashboardService.getRecentLogSheetPhotos:',
        error
      );
      throw error;
    }
  }

  async getRecentActivities(
    input: IGetRecentActivitiesInput
  ): Promise<IGetRecentActivitiesResult> {
    'use cache';
    cacheTag(ECacheTag.DASHBOARD_ACTIVITIES);
    cacheLife(CACHE_LIFE.SHORT);
    try {
      return await this.activityService.getRecentActivities(input);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedDashboardService.getRecentActivities:',
        error
      );
      throw error;
    }
  }
}

export function createCachedDashboardService(): CachedDashboardService {
  const comp = composeDashboardModule(prisma);
  return new CachedDashboardService(
    originalGetDashboardMetrics,
    originalGetRecentLogSheetPhotos,
    comp.activityService
  );
}
