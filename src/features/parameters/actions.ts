'use server';

import { revalidatePath } from 'next/cache';
import * as parameterService from './service';
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
  try {
    const parameters = await parameterService.getAllParameters();
    return { success: true, data: parameters };
  } catch (error: any) {
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
  try {
    const validatedData = CreateParameterSchema.parse(data);
    const parameter = await parameterService.createParameter(validatedData);

    revalidatePath('/parameters');
    return { success: true, data: parameter };
  } catch (error: any) {
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
  // DEBUG: Log incoming data
  console.log('[DEBUG] updateParameterAction received data:', data);
  console.log('[DEBUG] updateParameterAction data.id:', data.id);
  console.log('[DEBUG] updateParameterAction id type:', typeof data.id);
  
  try {
    const validatedData = UpdateParameterSchema.parse(data);
    console.log('[DEBUG] Validation passed, validatedData:', validatedData);
    const parameter = await parameterService.updateParameter(validatedData);

    revalidatePath('/parameters');
    return { success: true, data: parameter };
  } catch (error: any) {
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
  try {
    await parameterService.deleteParameter(id);

    revalidatePath('/parameters');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal menghapus parameter',
    };
  }
}
