import { prisma } from '@/lib/prisma';
import { TCreateParameter, TUpdateParameter, IParameter } from './types';

// =============================================================================
// Parameter Service - Business Logic
// =============================================================================

/**
 * Get all active parameters
 */
export async function getAllParameters(): Promise<IParameter[]> {
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
export async function getParameterById(id: string): Promise<IParameter | null> {
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
  data: TCreateParameter
): Promise<IParameter> {
  const parameter = await prisma.parameter.create({
    data: {
      name: data.name,
      variableName: data.variableName,
      category: data.category,
      valueType: data.valueType,
      unit: data.unit,
      minValue: data.minValue,
      maxValue: data.maxValue,
      rawWaterMinValue: data.rawWaterMinValue,
      rawWaterMaxValue: data.rawWaterMaxValue,
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
  data: TUpdateParameter
): Promise<IParameter> {
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
export async function deleteParameter(id: string): Promise<IParameter> {
  const parameter = await prisma.parameter.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return parameter as IParameter;
}
