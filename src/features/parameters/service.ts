import { prisma } from '@/lib/prisma';
import { TCreateParameter, TUpdateParameter, IParameter } from './types';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';

// =============================================================================
// Parameter Service - Business Logic
// =============================================================================

/**
 * Get all active parameters
 */
export async function getAllParameters(
  actor: IJwtPayload
): Promise<IParameter[]> {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'read');

  const parameters = await prisma.parameter.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return parameters as IParameter[];
}

/**
 * Get a single parameter by ID
 */
export async function getParameterById(
  actor: IJwtPayload,
  id: string
): Promise<IParameter | null> {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'read');

  const parameter = await prisma.parameter.findUnique({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!parameter) return null;

  return parameter as IParameter;
}

/**
 * Create a new parameter
 */
export async function createParameter(
  actor: IJwtPayload,
  data: TCreateParameter
): Promise<IParameter> {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'create');

  const parameter = await prisma.parameter.create({
    data: {
      name: data.name,
      variableName: data.variableName,
      category: data.category,
      valueType: data.valueType,
      unit: data.unit,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });

  return parameter as IParameter;
}

/**
 * Update an existing parameter
 */
export async function updateParameter(
  actor: IJwtPayload,
  data: TUpdateParameter
): Promise<IParameter> {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'update');

  const { id, ...updateData } = data;

  const parameter = await prisma.parameter.update({
    where: { id },
    data: updateData,
  });

  return parameter as IParameter;
}

/**
 * Soft delete a parameter
 */
export async function deleteParameter(
  actor: IJwtPayload,
  id: string
): Promise<IParameter> {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'delete');

  const parameter = await prisma.parameter.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return parameter as IParameter;
}
