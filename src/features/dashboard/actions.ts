'use server';

import { z } from 'zod/v4';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as dashboardService from './service';
import * as projectService from '@/features/projects/service';
import { resolveTargetProjectIds } from './utils';
import type { IJwtPayload } from '@/@types/auth.type';

async function requireActor(): Promise<IJwtPayload> {
  const user = await getCurrentUserDetails();
  if (!user) throw new Error('Unauthorized');
  return { id: user.id, email: user.email, role: user.role };
}

const GetDashboardMetricsSchema = z.object({
  projectId: z.string().uuid().optional(),
  range: z
    .object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    })
    .optional(),
});

const GetRecentPhotosSchema = z.object({
  projectId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
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

    const metrics = await dashboardService.getDashboardMetrics(
      targetProjectIds,
      validatedData.range
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

    const photos = await dashboardService.getRecentLogSheetPhotos(
      targetProjectIds,
      validatedData.limit
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
