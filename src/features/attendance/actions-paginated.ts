'use server';

/**
 * @fileoverview Attendance Actions with DI and pagination support for CG-02
 * @module features/attendance/actions-paginated
 * @responsibility Server actions with DI-based service resolution
 */

import { z } from 'zod/v4';
import { getCurrentUserDetails } from '@/features/auth/lib/user-context';
import { initializeContainer, getAttendanceService } from '@/lib/di';
import { attendanceListFiltersSchema, paginationInputSchema } from './types';
import type { TAttendanceListFilters } from './types';

// Ensure DI container is initialized
initializeContainer();

/**
 * Response type for paginated attendance actions
 */
type TPaginatedAttendanceResponse =
  | { success: true; data: unknown }
  | { success: false; error: string };

const getAttendanceListSchema = z.object({
  filters: attendanceListFiltersSchema,
  pagination: paginationInputSchema,
});

/**
 * Validate pagination input
 */
function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

/**
 * Get paginated attendance list
 * High-level module depends only on IAttendanceService (abstraction)
 */
export async function getAttendanceListPaginatedAction(input: {
  filters: TAttendanceListFilters;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<TPaginatedAttendanceResponse> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Validate input
    const validation = validateInput(getAttendanceListSchema, {
      filters: input.filters,
      pagination: {
        page: input.page,
        limit: input.limit,
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
      },
    });
    if (!validation.success) return { success: false, error: validation.error };

    // Resolve service from DI container (depends on abstraction)
    const service = getAttendanceService();
    const result = await service.listAttendance(
      user,
      validation.data.filters,
      validation.data.pagination
    );

    return { success: true, data: result };
  } catch (error) {
    console.error('[CPIS-ERROR] Attendance.ListPaginated:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to load attendance',
    };
  }
}

/**
 * Get attendance count (for statistics)
 */
export async function getAttendanceCountAction(
  filters: TAttendanceListFilters
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  try {
    const user = await getCurrentUserDetails();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Resolve service from DI container
    const service = getAttendanceService();
    const count = await service.countAttendance(filters);

    return { success: true, count };
  } catch (error) {
    console.error('[CPIS-ERROR] Attendance.Count:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to count attendance',
    };
  }
}
