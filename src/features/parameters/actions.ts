'use server';

import { revalidatePath } from 'next/cache';
import * as parameterService from './service';
import { getCurrentUser } from '@/lib/auth-helpers';
import {
  CreateParameterSchema,
  UpdateParameterSchema,
  TCreateParameter,
  TUpdateParameter,
} from './types';

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
    const parameters = await parameterService.getAllParameters(actor);
    return { success: true, data: parameters };
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
    const parameter = await parameterService.createParameter(actor, validatedData);

    revalidatePath('/parameters');
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
    const parameter = await parameterService.updateParameter(actor, validatedData);

    revalidatePath('/parameters');
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
    await parameterService.deleteParameter(actor, id);

    revalidatePath('/parameters');
    return { success: true };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Parameters.Delete:', error);
    return {
      success: false,
      error: error.message || 'Gagal menghapus parameter',
    };
  }
}
