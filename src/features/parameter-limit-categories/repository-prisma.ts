import { prisma } from '@/lib/prisma';
import type {
  IParameterLimitCategory,
  IParameterLimitCategoryRepository,
  ICategoryWithLimits,
  IParameterLimit,
  IParameterWithLimits,
  TCreateParameterLimitCategory,
  TParameterLimitInput,
} from './types';

// =============================================================================
// Mapping Functions
// =============================================================================

function mapRowToCategory(row: {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): IParameterLimitCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

function mapRowToParameterLimit(row: {
  id: string;
  categoryId: string;
  parameterId: string;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
  createdAt: Date;
  updatedAt: Date;
}): IParameterLimit {
  return {
    id: row.id,
    categoryId: row.categoryId,
    parameterId: row.parameterId,
    minValue: row.minValue,
    maxValue: row.maxValue,
    rawWaterMinValue: row.rawWaterMinValue,
    rawWaterMaxValue: row.rawWaterMaxValue,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// =============================================================================
// Prisma Repository Factory
// =============================================================================

export function createPrismaParameterLimitCategoryRepository(): IParameterLimitCategoryRepository {
  return {
    // -------------------------------------------------------------------------
    // Category CRUD
    // -------------------------------------------------------------------------

    async findAll() {
      const rows = await (prisma as any).parameterLimitCategory.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });
      return rows.map(mapRowToCategory);
    },

    async findById(id) {
      const row = await (prisma as any).parameterLimitCategory.findUnique({
        where: { id },
      });
      if (!row || row.deletedAt) return null;
      return mapRowToCategory(row);
    },

    async findByIdWithLimits(id) {
      const row = await (prisma as any).parameterLimitCategory.findUnique({
        where: { id },
        include: {
          limits: {
            include: {
              parameter: {
                select: {
                  id: true,
                  name: true,
                  variableName: true,
                  unit: true,
                  category: true,
                  displayOrder: true,
                },
              },
            },
            orderBy: {
              parameter: {
                displayOrder: 'asc',
              },
            },
          },
        },
      });

      if (!row || row.deletedAt) return null;

      return {
        category: mapRowToCategory(row),
        limits: row.limits.map((limit: any) => ({
          ...mapRowToParameterLimit(limit),
          parameterName: limit.parameter.name,
          parameterVariableName: limit.parameter.variableName,
          parameterUnit: limit.parameter.unit,
          parameterCategory: limit.parameter.category,
          parameterDisplayOrder: limit.parameter.displayOrder,
        })),
        totalLimits: row.limits.length,
      };
    },

    async findDefaultCategory() {
      const row = await (prisma as any).parameterLimitCategory.findFirst({
        where: { isDefault: true, deletedAt: null },
      });
      if (!row) return null;
      return mapRowToCategory(row);
    },

    async create(data) {
      const row = await (prisma as any).parameterLimitCategory.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          isDefault: data.isDefault ?? false,
        },
      });
      return mapRowToCategory(row);
    },

    async update(id, data) {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description ?? null;
      if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

      const row = await (prisma as any).parameterLimitCategory.update({
        where: { id },
        data: updateData,
      });
      return mapRowToCategory(row);
    },

    async softDelete(id) {
      await (prisma as any).parameterLimitCategory.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    },

    // -------------------------------------------------------------------------
    // Category Uniqueness Checks
    // -------------------------------------------------------------------------

    async findByName(name) {
      const row = await (prisma as any).parameterLimitCategory.findFirst({
        where: { name, deletedAt: null },
      });
      if (!row) return null;
      return mapRowToCategory(row);
    },

    async findOtherDefault(excludeId) {
      const row = await (prisma as any).parameterLimitCategory.findFirst({
        where: { isDefault: true, deletedAt: null, id: { not: excludeId } },
      });
      if (!row) return null;
      return mapRowToCategory(row);
    },

    async countOtherDefaults(excludeId) {
      return (prisma as any).parameterLimitCategory.count({
        where: { isDefault: true, deletedAt: null, id: { not: excludeId } },
      });
    },

    async unsetAllDefaults() {
      await (prisma as any).parameterLimitCategory.updateMany({
        where: { isDefault: true, deletedAt: null },
        data: { isDefault: false },
      });
    },

    // -------------------------------------------------------------------------
    // Limits CRUD
    // -------------------------------------------------------------------------

    async findLimitsByCategoryId(categoryId) {
      const rows = await (prisma as any).parameterLimit.findMany({
        where: { categoryId },
      });
      return rows.map(mapRowToParameterLimit);
    },

    async upsertLimit(categoryId, limit) {
      const existing = await (prisma as any).parameterLimit.findUnique({
        where: {
          categoryId_parameterId: {
            categoryId,
            parameterId: limit.parameterId,
          },
        },
      });

      if (existing) {
        await (prisma as any).parameterLimit.update({
          where: {
            categoryId_parameterId: {
              categoryId,
              parameterId: limit.parameterId,
            },
          },
          data: {
            minValue: limit.minValue ?? null,
            maxValue: limit.maxValue ?? null,
            rawWaterMinValue: limit.rawWaterMinValue ?? null,
            rawWaterMaxValue: limit.rawWaterMaxValue ?? null,
          },
        });
        return { created: false };
      } else {
        await (prisma as any).parameterLimit.create({
          data: {
            categoryId,
            parameterId: limit.parameterId,
            minValue: limit.minValue ?? null,
            maxValue: limit.maxValue ?? null,
            rawWaterMinValue: limit.rawWaterMinValue ?? null,
            rawWaterMaxValue: limit.rawWaterMaxValue ?? null,
          },
        });
        return { created: true };
      }
    },

    async upsertLimitsBatch(categoryId, limits) {
      const existingLimits = await (prisma as any).parameterLimit.findMany({
        where: { categoryId },
        select: { parameterId: true },
      });
      const existingParameterIds = new Set(
        existingLimits.map((l: any) => l.parameterId)
      );

      let created = 0;
      let updated = 0;

      await (prisma as any).$transaction(async (tx: any) => {
        for (const limit of limits) {
          if (existingParameterIds.has(limit.parameterId)) {
            await tx.parameterLimit.update({
              where: {
                categoryId_parameterId: {
                  categoryId,
                  parameterId: limit.parameterId,
                },
              },
              data: {
                minValue: limit.minValue ?? null,
                maxValue: limit.maxValue ?? null,
                rawWaterMinValue: limit.rawWaterMinValue ?? null,
                rawWaterMaxValue: limit.rawWaterMaxValue ?? null,
              },
            });
            updated++;
          } else {
            await tx.parameterLimit.create({
              data: {
                categoryId,
                parameterId: limit.parameterId,
                minValue: limit.minValue ?? null,
                maxValue: limit.maxValue ?? null,
                rawWaterMinValue: limit.rawWaterMinValue ?? null,
                rawWaterMaxValue: limit.rawWaterMaxValue ?? null,
              },
            });
            created++;
          }
        }
      });

      return { created, updated };
    },

    async deleteLimitsByCategoryId(categoryId) {
      await (prisma as any).parameterLimit.deleteMany({
        where: { categoryId },
      });
    },

    // -------------------------------------------------------------------------
    // Project Relationships
    // -------------------------------------------------------------------------

    async findProjectsUsingCategory(categoryId) {
      return (prisma as any).project.findMany({
        where: { parameterLimitCategoryId: categoryId, deletedAt: null },
        select: { id: true },
      });
    },

    async reassignProjectsToCategory(fromCategoryId, toCategoryId) {
      const projects = await (prisma as any).project.findMany({
        where: { parameterLimitCategoryId: fromCategoryId, deletedAt: null },
        select: { id: true },
      });
      const projectIds = projects.map((p: any) => p.id);

      if (projectIds.length > 0) {
        await (prisma as any).project.updateMany({
          where: { id: { in: projectIds } },
          data: { parameterLimitCategoryId: toCategoryId },
        });
      }

      return projectIds;
    },

    async countProjectsUsingCategory(categoryId) {
      return (prisma as any).project.count({
        where: { parameterLimitCategoryId: categoryId, deletedAt: null },
      });
    },

    // -------------------------------------------------------------------------
    // Master Parameter Data
    // -------------------------------------------------------------------------

    async findAllActiveParametersWithLimits() {
      const rows = await (prisma as any).parameter.findMany({
        where: {
          deletedAt: null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          variableName: true,
          unit: true,
          category: true,
          displayOrder: true,
          minValue: true,
          maxValue: true,
          rawWaterMinValue: true,
          rawWaterMaxValue: true,
        },
        orderBy: { displayOrder: 'asc' },
      });

      return rows as IParameterWithLimits[];
    },

    // -------------------------------------------------------------------------
    // Statistics
    // -------------------------------------------------------------------------

    async countLimitsInCategory(categoryId) {
      return (prisma as any).parameterLimit.count({
        where: { categoryId },
      });
    },
  };
}
