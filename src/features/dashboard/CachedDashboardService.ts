/**
 * Cached Dashboard Service - Delegates to original service with caching
 * @module features/dashboard/CachedDashboardService
 */

import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';
import { getDashboardMetrics } from './service';
import { getRecentLogSheetPhotos } from './service';
import { getActivityService } from './di';
import type { IDashboardMetric } from './service';
import type {
  IGetRecentActivitiesInput,
  IGetRecentActivitiesResult,
} from './types';

// Cached wrapper for metrics
async function getDashboardMetricsCached(
  projectIds?: string[],
  range?: { start: Date; end: Date }
): Promise<IDashboardMetric[]> {
  'use cache';
  cacheTag(ECacheTag.DASHBOARD_METRICS);
  cacheLife(CACHE_LIFE.DEFAULT);
  return await getDashboardMetrics(projectIds, range);
}

// Cached wrapper for photos
async function getRecentLogSheetPhotosCached(
  projectIds?: string[],
  limit: number = 50
) {
  'use cache';
  cacheTag(ECacheTag.DASHBOARD_PHOTOS);
  cacheLife(CACHE_LIFE.SHORT);
  return await getRecentLogSheetPhotos(projectIds, limit);
}

// Cached wrapper for activities - uses global dashboard container
async function getRecentActivitiesCached(
  input: IGetRecentActivitiesInput
): Promise<IGetRecentActivitiesResult> {
  'use cache';
  cacheTag(ECacheTag.DASHBOARD_ACTIVITIES);
  cacheLife(CACHE_LIFE.SHORT);
  const activityService = getActivityService();
  return await activityService.getRecentActivities(input);
}

/**
 * Cached Dashboard Service
 * Methods are thin wrappers around cached functions.
 */
export class CachedDashboardService {
  async getDashboardMetrics(
    projectIds?: string[],
    range?: { start: Date; end: Date }
  ): Promise<IDashboardMetric[]> {
    return await getDashboardMetricsCached(projectIds, range);
  }

  async getRecentLogSheetPhotos(projectIds?: string[], limit: number = 50) {
    return await getRecentLogSheetPhotosCached(projectIds, limit);
  }

  async getRecentActivities(
    input: IGetRecentActivitiesInput
  ): Promise<IGetRecentActivitiesResult> {
    return await getRecentActivitiesCached(input);
  }
}

export function createCachedDashboardService(): CachedDashboardService {
  return new CachedDashboardService();
}
