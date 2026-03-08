'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getCacheContainer } from '@/features/cache/di';
import { withMetrics } from '../cache/metrics';
import * as limitService from './limits-service';
import { getCurrentUser } from '@/lib/auth-helpers';
import {
  CreateParameterSchema,
  ParameterLimitListInputSchema,
  UpdateParameterSchema,
  UpdateParameterLimitBatchInputSchema,
  UpdateParameterLimitInputSchema,
  TCreateParameter,
  TParameterLimitListInput,
  TUpdateParameter,
  TUpdateParameterLimitBatchInput,
  TUpdateParameterLimitInput,
} from './types';
import { ECacheTag } from '../cache/tags';

// =============================================================================
// Parameter Actions - Server Actions Entry Point
// =============================================================================

/**
 * Get all parameters action
 */
export async function getParametersAction() {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const { parameters } = getCacheContainer();
    const data = await withMetrics(ECacheTag.PARAMETERS, async () =>
      parameters.getAllParameters(actor)
    );
    return { success: true, data };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.List:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengambil data parameter',
    };
  }
}

/**
 * Create parameter action
 */
export async function createParameterAction(data: TCreateParameter) {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const validatedData = CreateParameterSchema.parse(data);
    const { parameters } = getCacheContainer();
    const parameter = await parameters.createParameter(actor, validatedData);

    // CG-05: Cache invalidation - tag-based
    revalidateTag(ECacheTag.PARAMETERS, 'max');
    revalidateTag(ECacheTag.PARAMETERS_LIMITS, 'max');
    // Fallback: revalidatePath('/parameters'); // Keep commented for safety, remove after testing

    return { success: true, data: parameter };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.Create:', error);
    // Handle Prisma unique constraint violation
    // Check both standard Prisma error object and string representation for robustness
    const isUniqueConstraintViolation =
      error.code === 'P2002' ||
      error.message?.includes('Unique constraint failed');

    const isAboutVariableName =
      error.meta?.target?.includes('variableName') ||
      error.message?.includes('variableName');

    if (isUniqueConstraintViolation && isAboutVariableName) {
      return {
        success: false,
        error:
          'Parameter dengan nama variabel yang sama sudah pernah dibuat dan dihapus. Hubungi admin untuk restore atau buat nama variabel baru.',
      };
    }

    return {
      success: false,
      error: error.message || 'Gagal membuat parameter',
    };
  }
}

/**
 * Update parameter action
 */
export async function updateParameterAction(data: TUpdateParameter) {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const validatedData = UpdateParameterSchema.parse(data);
    const { parameters } = getCacheContainer();
    const parameter = await parameters.updateParameter(actor, validatedData);

    // CG-05: Cache invalidation - tag-based
    revalidateTag(ECacheTag.PARAMETERS, 'max');
    revalidateTag(ECacheTag.PARAMETERS_LIMITS, 'max');
    // revalidatePath('/parameters'); // fallback

    return { success: true, data: parameter };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.Update:', error);
    // Handle Prisma unique constraint violation
    // Check both standard Prisma error object and string representation for robustness
    const isUniqueConstraintViolation =
      error.code === 'P2002' ||
      error.message?.includes('Unique constraint failed');

    const isAboutVariableName =
      error.meta?.target?.includes('variableName') ||
      error.message?.includes('variableName');

    if (isUniqueConstraintViolation && isAboutVariableName) {
      return {
        success: false,
        error:
          'Parameter dengan nama variabel yang sama sudah pernah dibuat dan dihapus. Hubungi admin untuk restore atau buat nama variabel baru.',
      };
    }

    return {
      success: false,
      error: error.message || 'Gagal memperbarui parameter',
    };
  }
}

/**
 * Delete parameter action
 */
export async function deleteParameterAction(id: string) {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const { parameters } = getCacheContainer();
    await parameters.deleteParameter(actor, id);

    // CG-05: Cache invalidation - tag-based
    revalidateTag(ECacheTag.PARAMETERS, 'max');
    revalidateTag(ECacheTag.PARAMETERS_LIMITS, 'max'); // Also invalidate limits
    // revalidatePath('/parameters'); // fallback

    return { success: true };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.Delete:', error);
    return {
      success: false,
      error: error.message || 'Gagal menghapus parameter',
    };
  }
}

export async function getParameterLimitsAction(
  filters?: TParameterLimitListInput
) {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };
  try {
    const validated = filters
      ? ParameterLimitListInputSchema.parse(filters)
      : undefined;
    const data = await limitService.getParameterLimits(actor, validated);
    return { success: true, data };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.LimitsList:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengambil batas parameter',
    };
  }
}

export async function updateParameterLimitAction(
  input: TUpdateParameterLimitInput
) {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };
  try {
    const validated = UpdateParameterLimitInputSchema.parse(input);
    const data = await limitService.updateParameterLimit(actor, validated);
    // CG-05: Cache invalidation for limits
    revalidateTag(ECacheTag.PARAMETERS_LIMITS, 'max');
    // revalidatePath('/parameters/limits'); // fallback
    return { success: true, data };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.LimitsUpdate:', error);
    return {
      success: false,
      error: error.message || 'Gagal memperbarui batas parameter',
    };
  }
}

export async function updateParameterLimitBatchAction(
  input: TUpdateParameterLimitBatchInput
) {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };
  try {
    const validated = UpdateParameterLimitBatchInputSchema.parse(input);
    const data = await limitService.updateParameterLimitBatch(actor, validated);
    // CG-05: Cache invalidation for limits
    revalidateTag(ECacheTag.PARAMETERS_LIMITS, 'max');
    // revalidatePath('/parameters/limits'); // fallback
    return { success: true, data };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.LimitsBatchUpdate:', error);
    return {
      success: false,
      error: error.message || 'Gagal memperbarui batas parameter',
    };
  }
}

/**
 * Check if a parameter has existing limits in any profile
 */
export async function checkParameterHasLimitsAction(parameterId: string) {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const hasLimits = await limitService.checkParameterHasLimits(
      actor,
      parameterId
    );
    return { success: true, hasLimits };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.CheckHasLimits:', error);
    return {
      success: false,
      error: error.message || 'Gagal memeriksa data limit',
    };
  }
}
