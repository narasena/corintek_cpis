'use server';

import { z } from 'zod/v4';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import { getCacheContainer } from '@/features/cache/di';
import { withMetrics } from '../cache/metrics';
import * as projectService from '@/features/projects/service';
import { resolveTargetProjectIds } from './utils';
import type { IJwtPayload } from '@/@types/auth.type';
import type { IGetRecentActivitiesActionResult } from './types';
import { getVisibleActivityTypes } from './config';
import { prisma } from '@/lib/prisma';
import { ECacheTag } from '../cache/tags';

async function requireActor(): Promise<IJwtPayload> {
  const user = await getCurrentUserDetails();
  if (!user) throw new Error('Unauthorized');
  return { id: user.id, email: user.email, role: user.role };
}

const GetDashboardMetricsSchema = z.object({
  projectId: z.string().uuid().optional(),
  range: z.object({ start: z.coerce.date(), end: z.coerce.date() }).optional(),
});

const GetRecentPhotosSchema = z.object({
  projectId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

const GetRecentActivitiesSchema = z.object({
  projectId: z.string().uuid().optional(),
  timeRange: z.enum(['7d', '30d']).default('7d'),
  limit: z.number().int().min(1).max(50).default(15),
  cursor: z.string().optional(),
});

export async function getDashboardMetricsAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.DASHBOARD, 'read');

    const validatedData = GetDashboardMetricsSchema.parse(data || {});
    const targetProjectIds = await resolveTargetProjectIds(
      actor,
      validatedData.projectId,
      {
        assertCanAccessProject: projectService.assertCanAccessProject,
        getAccessibleProjectIds: projectService.getAccessibleProjectIds,
      }
    );
    if (targetProjectIds === 'empty') return { success: true, data: [] };

    const { dashboard } = getCacheContainer();
    const metrics = await withMetrics(ECacheTag.DASHBOARD_METRICS, async () =>
      dashboard.getDashboardMetrics(targetProjectIds, validatedData.range)
    );
    return { success: true, data: metrics };
  } catch (error) {
    console.error('[CPIS-ERROR] Dashboard.GetMetrics:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data metrics dashboard',
    };
  }
}

export async function getRecentPhotosAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.DASHBOARD, 'read');

    const validatedData = GetRecentPhotosSchema.parse(data || {});
    const targetProjectIds = await resolveTargetProjectIds(
      actor,
      validatedData.projectId,
      {
        assertCanAccessProject: projectService.assertCanAccessProject,
        getAccessibleProjectIds: projectService.getAccessibleProjectIds,
      }
    );
    if (targetProjectIds === 'empty') return { success: true, data: [] };

    const { dashboard } = getCacheContainer();
    const photos = await withMetrics(ECacheTag.DASHBOARD_PHOTOS, async () =>
      dashboard.getRecentLogSheetPhotos(targetProjectIds, validatedData.limit)
    );
    return { success: true, data: photos };
  } catch (error) {
    console.error('[CPIS-ERROR] Dashboard.GetRecentPhotos:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil foto terbaru dashboard',
    };
  }
}

export async function getRecentActivitiesAction(
  data: unknown
): Promise<IGetRecentActivitiesActionResult> {
  try {
    const validated = GetRecentActivitiesSchema.parse(data || {});
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.DASHBOARD, 'read');

    const targetIds = await resolveTargetProjectIds(
      actor,
      validated.projectId,
      {
        assertCanAccessProject: projectService.assertCanAccessProject,
        getAccessibleProjectIds: projectService.getAccessibleProjectIds,
      }
    );

    if (targetIds === 'empty') {
      return {
        success: true,
        data: { activities: [], hasMore: false, nextCursor: null },
      };
    }

    const { dashboard } = getCacheContainer();
    const result = await withMetrics(ECacheTag.DASHBOARD_ACTIVITIES, async () =>
      dashboard.getRecentActivities({
        actor,
        projectIds: targetIds ?? undefined,
        timeRange: validated.timeRange,
        limit: validated.limit,
        types: getVisibleActivityTypes(actor.role),
      })
    );

    return {
      success: true,
      data: {
        activities: result.activities,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      },
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Dashboard.GetRecentActivities:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil aktivitas terbaru',
    };
  }
}
