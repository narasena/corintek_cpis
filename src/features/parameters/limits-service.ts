import { prisma } from '@/lib/prisma';
import { ParameterCategory, ValueType } from '@/generated/prisma/client';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import type {
  IParameterLimitMasterItem,
  TParameterLimitListInput,
  TUpdateParameterLimitInput,
  TUpdateParameterLimitBatchInput,
} from './types';

function buildWhere(filters?: TParameterLimitListInput) {
  const where: {
    parameter: {
      deletedAt: null;
      category?: ParameterCategory;
      valueType?: ValueType;
      isActive?: boolean;
    };
  } = { parameter: { deletedAt: null } };
  if (filters?.category)
    where.parameter.category = filters.category as ParameterCategory;
  if (filters?.valueType)
    where.parameter.valueType = filters.valueType as ValueType;
  if (filters?.isActive !== undefined)
    where.parameter.isActive = filters.isActive;
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

async function updateParameterLimitCore(input: TUpdateParameterLimitInput) {
  assertValidLimit(input);
  const data = buildUpdateData(input);
  if (Object.keys(data).length === 0) {
    throw new Error('Tidak ada nilai limit yang diubah');
  }

  // Find the default profile first
  const defaultProfile = await prisma.parameterLimitProfile.findFirst({
    where: { isDefault: true, deletedAt: null },
  });

  if (!defaultProfile) {
    throw new Error(
      'Tidak ada profil default. Silakan buat profil default terlebih dahulu.'
    );
  }

  // Update or create the limit
  const existingLimit = await prisma.parameterLimit.findFirst({
    where: {
      profileId: defaultProfile.id,
      parameterId: input.parameterId,
    },
  });

  if (existingLimit) {
    return prisma.parameterLimit.update({
      where: { id: existingLimit.id },
      data,
    });
  } else {
    return prisma.parameterLimit.create({
      data: {
        profileId: defaultProfile.id,
        parameterId: input.parameterId,
        ...data,
      },
    });
  }
}

export async function getParameterLimits(
  actor: IJwtPayload,
  filters?: TParameterLimitListInput
): Promise<IParameterLimitMasterItem[]> {
  ensureAccess(actor.role, RbacResource.MASTER_DATA, 'read');

  // Find the default profile with its limits
  const defaultProfileWithLimits = await prisma.parameterLimitProfile.findFirst(
    {
      where: { isDefault: true, deletedAt: null },
      include: {
        limits: {
          orderBy: { parameter: { displayOrder: 'asc' } },
          include: {
            parameter: true,
          },
        },
      },
    }
  );

  // If no default profile, return empty array
  if (!defaultProfileWithLimits) {
    return [];
  }

  // Fetch only numeric parameters to get display order
  const parameters = await prisma.parameter.findMany({
    where: {
      ...buildWhere(filters).parameter,
      valueType: 'NUMBER',
    },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  // Create a map of variableName -> parameter (to match old limits to new params)
  const paramByVariableName = new Map(parameters.map(p => [p.variableName, p]));

  // Check if we need to migrate (if limits have old parameter IDs that don't match)
  const limitsWithOldIds = defaultProfileWithLimits.limits.filter(
    limit => !paramByVariableName.has(limit.parameter.variableName)
  );

  if (limitsWithOldIds.length > 0) {
    // Migrate limits to new parameter IDs
    for (const limit of limitsWithOldIds) {
      const newParam = paramByVariableName.get(limit.parameter.variableName);
      if (newParam) {
        await prisma.parameterLimit.update({
          where: { id: limit.id },
          data: { parameterId: newParam.id },
        });
      }
    }

    // Re-fetch parameters and limits after migration
    const refreshedLimits = await prisma.parameterLimit.findMany({
      where: { profileId: defaultProfileWithLimits.id },
    });

    // Create new map from refreshed limits
    const limitMap = new Map(
      refreshedLimits.map(limit => [limit.parameterId, limit])
    );

    return parameters.map(param => {
      const limit = limitMap.get(param.id);
      return {
        parameterId: param.id,
        name: param.name,
        variableName: param.variableName,
        category: param.category,
        valueType: param.valueType,
        unit: param.unit,
        minValue: limit?.minValue ?? null,
        maxValue: limit?.maxValue ?? null,
        rawWaterMinValue: limit?.rawWaterMinValue ?? null,
        rawWaterMaxValue: limit?.rawWaterMaxValue ?? null,
        displayOrder: param.displayOrder,
        isActive: param.isActive,
      };
    });
  }

  // Create a map of parameterId -> limit (no migration needed)
  const limitMap = new Map(
    defaultProfileWithLimits.limits.map(limit => [limit.parameterId, limit])
  );

  // Map parameters to include their limits
  return parameters.map(param => {
    const limit = limitMap.get(param.id);
    return {
      parameterId: param.id,
      name: param.name,
      variableName: param.variableName,
      category: param.category,
      valueType: param.valueType,
      unit: param.unit,
      minValue: limit?.minValue ?? null,
      maxValue: limit?.maxValue ?? null,
      rawWaterMinValue: limit?.rawWaterMinValue ?? null,
      rawWaterMaxValue: limit?.rawWaterMaxValue ?? null,
      displayOrder: param.displayOrder,
      isActive: param.isActive,
    };
  });
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

  // Find the default profile first
  const defaultProfile = await prisma.parameterLimitProfile.findFirst({
    where: { isDefault: true, deletedAt: null },
  });

  if (!defaultProfile) {
    throw new Error(
      'Tidak ada profil default. Silakan buat profil default terlebih dahulu.'
    );
  }

  const updates = input.items.map(item => {
    assertValidLimit(item);
    const data = buildUpdateData(item);
    if (Object.keys(data).length === 0) {
      throw new Error('Tidak ada nilai limit yang diubah');
    }
    return prisma.parameterLimit.upsert({
      where: {
        profileId_parameterId: {
          profileId: defaultProfile.id,
          parameterId: item.parameterId,
        },
      },
      update: data,
      create: {
        profileId: defaultProfile.id,
        parameterId: item.parameterId,
        ...data,
      },
    });
  });
  return prisma.$transaction(updates);
}
