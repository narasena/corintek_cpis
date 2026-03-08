/**
 * Cached Dashboard Service - Delegates to original service with caching
 * @module features/dashboard/CachedDashboardService
 */

import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
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

// Cached function wrappers (outside class)
async function getDashboardMetricsCached(
  impl: typeof originalGetDashboardMetrics,
  projectIds?: string[],
  range?: { start: Date; end: Date }
) {
  'use cache';
  cacheTag(ECacheTag.DASHBOARD_METRICS);
  cacheLife('hours');
  return await impl(projectIds, range);
}

async function getRecentLogSheetPhotosCached(
  impl: typeof originalGetRecentLogSheetPhotos,
  projectIds?: string[],
  limit: number = 50
) {
  'use cache';
  cacheTag(ECacheTag.DASHBOARD_PHOTOS);
  cacheLife('minutes');
  return await impl(projectIds, limit);
}

async function getRecentActivitiesCached(
  activityService: IActivityService,
  input: IGetRecentActivitiesInput
) {
  'use cache';
  cacheTag(ECacheTag.DASHBOARD_ACTIVITIES);
  cacheLife('minutes');
  return await activityService.getRecentActivities(input);
}

export class CachedDashboardService {
  constructor(
    private readonly getDashboardMetricsImpl: typeof originalGetDashboardMetrics,
    private readonly getRecentLogSheetPhotosImpl: typeof originalGetRecentLogSheetPhotos,
    private readonly activityService: IActivityService
  ) {}

  async getDashboardMetrics(
    projectIds?: string[],
    range?: { start: Date; end: Date }
  ) {
    return await getDashboardMetricsCached(
      this.getDashboardMetricsImpl,
      projectIds,
      range
    );
  }

  async getRecentLogSheetPhotos(projectIds?: string[], limit: number = 50) {
    return await getRecentLogSheetPhotosCached(
      this.getRecentLogSheetPhotosImpl,
      projectIds,
      limit
    );
  }

  async getRecentActivities(input: IGetRecentActivitiesInput) {
    return await getRecentActivitiesCached(this.activityService, input);
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
