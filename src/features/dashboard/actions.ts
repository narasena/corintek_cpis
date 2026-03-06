'use server';

import { z } from 'zod/v4';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import * as dashboardService from './service';
import * as projectService from '@/features/projects/service';
import { resolveTargetProjectIds } from './utils';
import type { IGetRecentActivitiesActionResult } from './types';
import { getVisibleActivityTypes } from './config';
import { composeDashboardModule } from './di';
import { prisma } from '@/lib/prisma';

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

export const getDashboardMetricsAction = actionFactory.protected(
  async ({ input, actor }) => {
    const targetProjectIds = await resolveTargetProjectIds(actor, input.projectId, {
      assertCanAccessProject: projectService.assertCanAccessProject,
      getAccessibleProjectIds: projectService.getAccessibleProjectIds,
    });
    if (targetProjectIds === 'empty') return [];

    return dashboardService.getDashboardMetrics(targetProjectIds, input.range);
  },
  {
    schema: GetDashboardMetricsSchema,
    metadata: { rbac: { resource: RbacResource.DASHBOARD, capability: 'read' } },
  }
);

export const getRecentPhotosAction = actionFactory.protected(
  async ({ input, actor }) => {
    const targetProjectIds = await resolveTargetProjectIds(actor, input.projectId, {
      assertCanAccessProject: projectService.assertCanAccessProject,
      getAccessibleProjectIds: projectService.getAccessibleProjectIds,
    });
    if (targetProjectIds === 'empty') return [];

    return dashboardService.getRecentLogSheetPhotos(targetProjectIds, input.limit);
  },
  {
    schema: GetRecentPhotosSchema,
    metadata: { rbac: { resource: RbacResource.DASHBOARD, capability: 'read' } },
  }
);

export const getRecentActivitiesAction = actionFactory.protected(
  async ({ input, actor }) => {
    const targetIds = await resolveTargetProjectIds(actor, input.projectId, {
      assertCanAccessProject: projectService.assertCanAccessProject,
      getAccessibleProjectIds: projectService.getAccessibleProjectIds,
    });

    if (targetIds === 'empty') {
      return { 
        success: true, 
        data: { activities: [], hasMore: false, nextCursor: null } 
      };
    }

    const { activityService } = composeDashboardModule(prisma);

    const result = await activityService.getRecentActivities({
      actor,
      projectIds: targetIds ?? undefined,
      timeRange: input.timeRange,
      limit: input.limit,
      types: getVisibleActivityTypes(actor.role),
    });

    return {
      success: true,
      data: {
        activities: result.activities,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      }
    };
  },
  {
    schema: GetRecentActivitiesSchema,
    metadata: { rbac: { resource: RbacResource.DASHBOARD, capability: 'read' } },
  }
) as (data: unknown) => Promise<IGetRecentActivitiesActionResult>;
