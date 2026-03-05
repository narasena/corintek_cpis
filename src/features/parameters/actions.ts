'use server';

import { revalidatePath } from 'next/cache';
import * as parameterService from './service';
import * as limitService from './limits-service';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import {
  CreateParameterSchema,
  ParameterLimitListInputSchema,
  UpdateParameterSchema,
  UpdateParameterLimitBatchInputSchema,
  UpdateParameterLimitInputSchema,
} from './types';
import { z } from 'zod/v4';

// =============================================================================
// Parameter Actions - Server Actions Entry Point
// =============================================================================

/**
 * Helper to handle Prisma unique constraint violations for parameters
 */
function handleParameterError(error: any, fallback: string): never {
  const isUniqueConstraintViolation =
    error.code === 'P2002' ||
    error.message?.includes('Unique constraint failed');

  const isAboutVariableName =
    error.meta?.target?.includes('variableName') ||
    error.message?.includes('variableName');

  if (isUniqueConstraintViolation && isAboutVariableName) {
    throw new Error(
      'Parameter dengan nama variabel yang sama sudah pernah dibuat dan dihapus. Hubungi admin untuk restore atau buat nama variabel baru.'
    );
  }

  throw error;
}

/**
 * Get all parameters action
 */
export const getParametersAction = actionFactory.protected(
  async ({ actor }) => {
    return parameterService.getAllParameters(actor);
  },
  {
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'read' } },
  }
);

/**
 * Create parameter action
 */
export const createParameterAction = actionFactory.protected(
  async ({ input, actor }) => {
    try {
      const parameter = await parameterService.createParameter(actor, input);
      revalidatePath('/parameters');
      return parameter;
    } catch (error: any) {
      console.error('[CPIS-ERROR] Parameters.Create:', error);
      handleParameterError(error, 'Gagal membuat parameter');
    }
  },
  {
    schema: CreateParameterSchema,
    metadata: {
      rbac: { resource: RbacResource.PARAMETERS, capability: 'create' },
    },
  }
);

/**
 * Update parameter action
 */
export const updateParameterAction = actionFactory.protected(
  async ({ input, actor }) => {
    try {
      const parameter = await parameterService.updateParameter(actor, input);
      revalidatePath('/parameters');
      return parameter;
    } catch (error: any) {
      console.error('[CPIS-ERROR] Parameters.Update:', error);
      handleParameterError(error, 'Gagal memperbarui parameter');
    }
  },
  {
    schema: UpdateParameterSchema,
    metadata: {
      rbac: { resource: RbacResource.PARAMETERS, capability: 'update' },
    },
  }
);

/**
 * Delete parameter action
 */
export const deleteParameterAction = actionFactory.protected(
  async ({ input, actor }) => {
    await parameterService.deleteParameter(actor, input);
    revalidatePath('/parameters');
    return { success: true };
  },
  {
    schema: z.string().min(1, 'ID parameter wajib diisi'),
    metadata: {
      rbac: { resource: RbacResource.PARAMETERS, capability: 'delete' },
    },
  }
);

/**
 * Get parameter limits action
 */
export const getParameterLimitsAction = actionFactory.protected(
  async ({ input, actor }) => {
    return limitService.getParameterLimits(actor, input);
  },
  {
    schema: ParameterLimitListInputSchema.optional(),
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'read' } },
  }
);

/**
 * Update a single parameter limit
 */
export const updateParameterLimitAction = actionFactory.protected(
  async ({ input, actor }) => {
    const data = await limitService.updateParameterLimit(actor, input);
    revalidatePath('/parameters/limits');
    return data;
  },
  {
    schema: UpdateParameterLimitInputSchema,
    metadata: {
      rbac: { resource: RbacResource.PARAMETERS, capability: 'update' },
    },
  }
);

/**
 * Update multiple parameter limits in batch
 */
export const updateParameterLimitBatchAction = actionFactory.protected(
  async ({ input, actor }) => {
    const data = await limitService.updateParameterLimitBatch(actor, input);
    revalidatePath('/parameters/limits');
    return data;
  },
  {
    schema: UpdateParameterLimitBatchInputSchema,
    metadata: {
      rbac: { resource: RbacResource.PARAMETERS, capability: 'update' },
    },
  }
);

/**
 * Check if a parameter has existing limits in any profile
 */
export const checkParameterHasLimitsAction = actionFactory.protected(
  async ({ input, actor }) => {
    return limitService.checkParameterHasLimits(actor, input);
  },
  {
    schema: z.string().min(1, 'ID parameter wajib diisi'),
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'read' } },
  }
);
