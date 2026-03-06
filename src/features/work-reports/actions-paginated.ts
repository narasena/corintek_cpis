'use server';

/**
 * @fileoverview Work Report Actions with DI and pagination support for CG-02
 * @module features/work-reports/actions-paginated
 * @responsibility Server actions with DI-based service resolution
 */

import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { initializeContainer, getWorkReportService } from '@/lib/di';

// Ensure DI container is initialized
initializeContainer();

/**
 * Response type for paginated work report actions
 */
type TPaginatedWorkReportResponse =
  | { success: true; data: unknown }
  | { success: false; error: string };

/**
 * Get paginated work reports for a project
 * High-level module depends only on IWorkReportService (abstraction)
 */
export async function getWorkReportsByProjectPaginatedAction(
  projectId: string,
  page: number,
  limit: number
): Promise<TPaginatedWorkReportResponse> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Resolve service from DI container (depends on abstraction)
    const service = getWorkReportService();

    const result = await service.getWorkReportsByProject(projectId, {
      page,
      limit,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.ListPaginated:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to load work reports',
    };
  }
}

/**
 * Get work report count for a project
 */
export async function getWorkReportCountAction(
  projectId: string
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  try {
    // Resolve service from DI container
    const service = getWorkReportService();
    const count = await service.countWorkReportsByProject(projectId);

    return { success: true, count };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Count:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to count work reports',
    };
  }
}
