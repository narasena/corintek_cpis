'use server';

/**
 * @fileoverview Log Sheet Actions with DI and pagination support for CG-02
 * @module features/log-sheets/actions-paginated
 * @responsibility Server actions with DI-based service resolution
 */

import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { initializeContainer, getLogSheetService } from '@/lib/di';

// Ensure DI container is initialized
initializeContainer();

/**
 * Response type for paginated log sheet actions
 */
type TPaginatedLogSheetResponse =
  | { success: true; data: unknown }
  | { success: false; error: string };

/**
 * Get paginated log sheets for a project
 * High-level module depends only on ILogSheetService (abstraction)
 */
export async function getLogSheetsByProjectPaginatedAction(
  projectId: string,
  page: number,
  limit: number
): Promise<TPaginatedLogSheetResponse> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Resolve service from DI container (depends on abstraction)
    const service = getLogSheetService();

    const result = await service.getLogSheetsByProject(projectId, {
      page,
      limit,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.ListPaginated:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to load log sheets',
    };
  }
}

/**
 * Get paginated global log sheets (for admin views)
 */
export async function getAllLogSheetsPaginatedAction(
  page: number,
  limit: number,
  projectIds?: string[]
): Promise<
  { success: true; data: unknown } | { success: false; error: string }
> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Resolve service from DI container
    const service = getLogSheetService();

    const result = await service.getAllLogSheets(user, projectIds, {
      page,
      limit,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.ListAllPaginated:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to load log sheets',
    };
  }
}

/**
 * Get log sheet count for a project
 */
export async function getLogSheetCountAction(
  projectId: string
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  try {
    // Resolve service from DI container
    const service = getLogSheetService();
    const count = await service.countLogSheetsByProject(projectId);

    return { success: true, count };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.Count:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to count log sheets',
    };
  }
}
