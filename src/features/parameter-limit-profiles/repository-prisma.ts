import { prisma } from '@/lib/prisma';
import type { TParameterCategory } from '@/features/parameters/types';
import type {
  IParameterLimitProfile,
  IParameterLimitProfileRepository,
  IProfileWithLimits,
  IParameterLimit,
  TCreateParameterLimitProfile,
  TParameterLimitInput,
} from './types';

// =============================================================================
// Mapping Functions
// =============================================================================

function mapRowToProfile(row: {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): IParameterLimitProfile {
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
  profileId: string;
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
    profileId: row.profileId,
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

export function createPrismaParameterLimitProfileRepository(): IParameterLimitProfileRepository {
  return {
    // -------------------------------------------------------------------------
    // Profile CRUD
    // -------------------------------------------------------------------------

    async findAll() {
      const rows = await prisma.parameterLimitProfile.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });
      return rows.map(mapRowToProfile);
    },

    async findById(id) {
      const row = await prisma.parameterLimitProfile.findUnique({
        where: { id },
      });
      if (!row || row.deletedAt) return null;
      return mapRowToProfile(row);
    },

    async findByIdWithLimits(id) {
      const row = await prisma.parameterLimitProfile.findUnique({
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
        profile: mapRowToProfile(row),
        limits: row.limits.map(limit => ({
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

    async findDefaultProfile() {
      const row = await prisma.parameterLimitProfile.findFirst({
        where: { isDefault: true, deletedAt: null },
      });
      if (!row) return null;
      return mapRowToProfile(row);
    },

    async create(data) {
      const row = await prisma.parameterLimitProfile.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          isDefault: data.isDefault ?? false,
        },
      });
      return mapRowToProfile(row);
    },

    async update(id, data) {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description ?? null;
      if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

      const row = await prisma.parameterLimitProfile.update({
        where: { id },
        data: updateData,
      });
      return mapRowToProfile(row);
    },

    async softDelete(id) {
      await prisma.parameterLimitProfile.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    },

    // -------------------------------------------------------------------------
    // Profile Uniqueness Checks
    // -------------------------------------------------------------------------

    async findByName(name) {
      const row = await prisma.parameterLimitProfile.findFirst({
        where: { name, deletedAt: null },
      });
      if (!row) return null;
      return mapRowToProfile(row);
    },

    async findOtherDefault(excludeId) {
      const row = await prisma.parameterLimitProfile.findFirst({
        where: { isDefault: true, deletedAt: null, id: { not: excludeId } },
      });
      if (!row) return null;
      return mapRowToProfile(row);
    },

    async countOtherDefaults(excludeId) {
      return prisma.parameterLimitProfile.count({
        where: { isDefault: true, deletedAt: null, id: { not: excludeId } },
      });
    },

    async unsetAllDefaults() {
      await prisma.parameterLimitProfile.updateMany({
        where: { isDefault: true, deletedAt: null },
        data: { isDefault: false },
      });
    },

    // -------------------------------------------------------------------------
    // Limits CRUD
    // -------------------------------------------------------------------------

    async findLimitsByProfileId(profileId) {
      const rows = await prisma.parameterLimit.findMany({
        where: { profileId },
      });
      return rows.map(mapRowToParameterLimit);
    },

    async upsertLimit(profileId, limit) {
      const existing = await prisma.parameterLimit.findUnique({
        where: {
          profileId_parameterId: {
            profileId,
            parameterId: limit.parameterId,
          },
        },
      });

      if (existing) {
        await prisma.parameterLimit.update({
          where: {
            profileId_parameterId: {
              profileId,
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
        await prisma.parameterLimit.create({
          data: {
            profileId,
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

    async upsertLimitsBatch(profileId, limits) {
      const existingLimits = await prisma.parameterLimit.findMany({
        where: { profileId },
        select: { parameterId: true },
      });
      const existingParameterIds = new Set(
        existingLimits.map(l => l.parameterId)
      );

      let created = 0;
      let updated = 0;

      await prisma.$transaction(async tx => {
        for (const limit of limits) {
          if (existingParameterIds.has(limit.parameterId)) {
            await tx.parameterLimit.update({
              where: {
                profileId_parameterId: {
                  profileId,
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
                profileId,
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

    async deleteLimitsByProfileId(profileId) {
      await prisma.parameterLimit.deleteMany({
        where: { profileId },
      });
    },

    // -------------------------------------------------------------------------
    // Project Relationships
    // -------------------------------------------------------------------------

    async findProjectsUsingProfile(profileId) {
      return prisma.project.findMany({
        where: { parameterLimitProfileId: profileId, deletedAt: null },
        select: { id: true },
      });
    },

    async reassignProjectsToProfile(fromProfileId, toProfileId) {
      const projects = await prisma.project.findMany({
        where: { parameterLimitProfileId: fromProfileId, deletedAt: null },
        select: { id: true },
      });
      const projectIds = projects.map(p => p.id);

      if (projectIds.length > 0) {
        await prisma.project.updateMany({
          where: { id: { in: projectIds } },
          data: { parameterLimitProfileId: toProfileId },
        });
      }

      return projectIds;
    },

    async countProjectsUsingProfile(profileId) {
      return prisma.project.count({
        where: { parameterLimitProfileId: profileId, deletedAt: null },
      });
    },

    // -------------------------------------------------------------------------
    // Master Parameter Data
    // -------------------------------------------------------------------------

    async findAllActiveParameters() {
      const rows = await prisma.parameter.findMany({
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
        },
        orderBy: { displayOrder: 'asc' },
      });

      return rows as Array<{
        id: string;
        name: string;
        variableName: string;
        unit: string | null;
        category: TParameterCategory;
        displayOrder: number;
      }>;
    },

    async findParametersWithLimits() {
      const rows = await prisma.parameter.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          hasLimits: true,
          valueType: 'NUMBER',
        },
        select: {
          id: true,
          name: true,
          variableName: true,
          unit: true,
          category: true,
          displayOrder: true,
        },
        orderBy: { displayOrder: 'asc' },
      });

      return rows as Array<{
        id: string;
        name: string;
        variableName: string;
        unit: string | null;
        category: TParameterCategory;
        displayOrder: number;
      }>;
    },

    // -------------------------------------------------------------------------
    // Statistics
    // -------------------------------------------------------------------------

    async countLimitsInProfile(profileId) {
      return prisma.parameterLimit.count({
        where: { profileId },
      });
    },
  };
}
