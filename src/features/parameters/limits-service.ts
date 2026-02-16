import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import type {
  IParameter,
  IParameterLimitMasterItem,
  TParameterLimitListInput,
  TUpdateParameterLimitInput,
  TUpdateParameterLimitBatchInput,
} from './types';

function buildWhere(filters?: TParameterLimitListInput) {
  const where: {
    deletedAt: null;
    category?: string;
    valueType?: string;
    isActive?: boolean;
  } = { deletedAt: null };
  if (filters?.category) where.category = filters.category;
  if (filters?.valueType) where.valueType = filters.valueType;
  if (filters?.isActive !== undefined) where.isActive = filters.isActive;
  return where;
}

function buildUpdateData(input: TUpdateParameterLimitInput) {
  const data: Record<string, number | null> = {};
  if (input.minValue !== undefined) data.minValue = input.minValue;
  if (input.maxValue !== undefined) data.maxValue = input.maxValue;
  if (input.rawWaterMinValue !== undefined)
    data.rawWaterMinValue = input.rawWaterMinValue;
  if (input.rawWaterMaxValue !== undefined)
    data.rawWaterMaxValue = input.rawWaterMaxValue;
  return data;
}

function assertValidLimit(input: TUpdateParameterLimitInput) {
  const { minValue, maxValue, rawWaterMinValue, rawWaterMaxValue } = input;
  if (
    minValue !== undefined &&
    maxValue !== undefined &&
    minValue !== null &&
    maxValue !== null &&
    minValue > maxValue
  ) {
    throw new Error('Nilai minimum tidak boleh lebih besar dari maksimum');
  }
  if (
    rawWaterMinValue !== undefined &&
    rawWaterMaxValue !== undefined &&
    rawWaterMinValue !== null &&
    rawWaterMaxValue !== null &&
    rawWaterMinValue > rawWaterMaxValue
  ) {
    throw new Error('Nilai raw minimum tidak boleh lebih besar dari maksimum');
  }
}

function mapParameterLimitItem(
  parameter: IParameter
): IParameterLimitMasterItem {
  return {
    parameterId: parameter.id,
    name: parameter.name,
    variableName: parameter.variableName,
    category: parameter.category,
    valueType: parameter.valueType,
    unit: parameter.unit,
    minValue: parameter.minValue,
    maxValue: parameter.maxValue,
    rawWaterMinValue: parameter.rawWaterMinValue,
    rawWaterMaxValue: parameter.rawWaterMaxValue,
    displayOrder: parameter.displayOrder,
    isActive: parameter.isActive,
  };
}

async function updateParameterLimitCore(input: TUpdateParameterLimitInput) {
  assertValidLimit(input);
  const data = buildUpdateData(input);
  if (Object.keys(data).length === 0) {
    throw new Error('Tidak ada nilai limit yang diubah');
  }
  return prisma.parameter.update({
    where: { id: input.parameterId },
    data,
  });
}

export async function getParameterLimits(
  actor: IJwtPayload,
  filters?: TParameterLimitListInput
): Promise<IParameterLimitMasterItem[]> {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'read');
  const parameters = await prisma.parameter.findMany({
    where: buildWhere(filters),
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return parameters.map(mapParameterLimitItem);
}

export async function updateParameterLimit(
  actor: IJwtPayload,
  input: TUpdateParameterLimitInput
) {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'update');
  return updateParameterLimitCore(input);
}

export async function updateParameterLimitBatch(
  actor: IJwtPayload,
  input: TUpdateParameterLimitBatchInput
) {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'update');
  const updates = input.items.map(item => updateParameterLimitCore(item));
  return prisma.$transaction(updates);
}
