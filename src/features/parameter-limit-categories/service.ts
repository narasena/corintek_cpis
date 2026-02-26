import { ensureAccess, RbacResource } from '@/lib/rbac';
import type { IJwtPayload } from '@/@types/auth.type';
import type {
  IParameterLimitCategory,
  ICategoryWithLimits,
  ICategoryStats,
  ICreateCategoryResult,
  IDeleteCategoryResult,
  IUpsertLimitsResult,
  IParameterLimit,
  IParameterLimitCategoryService,
  IParameterLimitCategoryServiceDeps,
  IRbacService,
  IParameterLimitCategoryRepository,
  TCreateParameterLimitCategory,
  TUpdateParameterLimitCategory,
  TUpsertParameterLimitsBatch,
  TGetParameterLimitCategoriesFilter,
  TCopyFromMasterDefaults,
  TParameterLimitInput,
  IParameterWithLimits,
} from './types';
import { createPrismaParameterLimitCategoryRepository } from './repository-prisma';

// =============================================================================
// Parameter Limit Category Service
// =============================================================================

/**
 * Service class for parameter limit category operations.
 * Uses constructor injection for testability and loose coupling.
 */
class ParameterLimitCategoryService implements IParameterLimitCategoryService {
  private readonly repository: IParameterLimitCategoryRepository;
  private readonly rbac: IRbacService;

  constructor(deps: IParameterLimitCategoryServiceDeps) {
    this.repository = deps.repository;
    this.rbac = deps.rbac;
  }

  // ---------------------------------------------------------------------------
  // CRUD Operations
  // ---------------------------------------------------------------------------

  async getCategories(
    actor: IJwtPayload,
    _filters?: TGetParameterLimitCategoriesFilter
  ): Promise<IParameterLimitCategory[]> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'read');
    return this.repository.findAll();
  }

  async getCategoryWithLimits(
    actor: IJwtPayload,
    id: string
  ): Promise<ICategoryWithLimits> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'read');
    const category = await this.repository.findByIdWithLimits(id);
    if (!category) {
      throw new Error('Kategori tidak ditemukan');
    }
    return category;
  }

  async createCategory(
    actor: IJwtPayload,
    data: TCreateParameterLimitCategory
  ): Promise<ICreateCategoryResult> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'create');
    await this.validateNameUnique(data.name);

    if (data.isDefault) {
      await this.repository.unsetAllDefaults();
    }

    const category = await this.repository.create(data);
    return { category, seededFromMaster: false };
  }

  async updateCategory(
    actor: IJwtPayload,
    data: TUpdateParameterLimitCategory
  ): Promise<IParameterLimitCategory> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'update');
    await this.validateExists(data.id);

    if (data.name) {
      await this.validateNameUnique(data.name, data.id);
    }

    if (data.isDefault === false) {
      await this.validateCanRemoveDefault(data.id);
    }

    if (data.isDefault === true) {
      await this.repository.unsetAllDefaults();
    }

    return this.repository.update(data.id, {
      name: data.name,
      description: data.description,
      isDefault: data.isDefault,
    });
  }

  async deleteCategory(
    actor: IJwtPayload,
    id: string
  ): Promise<IDeleteCategoryResult> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'delete');
    await this.validateCanDelete(id);

    const defaultCategory = await this.repository.findDefaultCategory();
    const reassigned = await this.repository.reassignProjectsToCategory(
      id,
      defaultCategory?.id ?? null
    );

    await this.repository.deleteLimitsByCategoryId(id);
    await this.repository.softDelete(id);

    return { deletedId: id, reassignedProjectIds: reassigned };
  }

  // ---------------------------------------------------------------------------
  // Limit Management Operations
  // ---------------------------------------------------------------------------

  async upsertCategoryLimits(
    actor: IJwtPayload,
    data: TUpsertParameterLimitsBatch
  ): Promise<IUpsertLimitsResult> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'update');
    await this.validateExists(data.categoryId);

    for (const limit of data.limits) {
      this.validateLimitValue(limit);
    }

    const result = await this.repository.upsertLimitsBatch(
      data.categoryId,
      data.limits
    );

    return {
      created: result.created,
      updated: result.updated,
      affectedParameterIds: data.limits.map(l => l.parameterId),
    };
  }

  async copyFromMasterDefaults(
    actor: IJwtPayload,
    data: TCopyFromMasterDefaults
  ): Promise<{ copied: number }> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'update');
    await this.validateExists(data.categoryId);

    const parameters =
      await this.repository.findAllActiveParametersWithLimits();
    const limits = await this.mapParametersToLimits(parameters);

    if (!data.overwriteExisting) {
      const existing = await this.repository.findLimitsByCategoryId(
        data.categoryId
      );
      const existingIds = new Set(existing.map(l => l.parameterId));
      const newLimits = limits.filter(l => !existingIds.has(l.parameterId));

      if (newLimits.length > 0) {
        await this.repository.upsertLimitsBatch(data.categoryId, newLimits);
      }
      return { copied: newLimits.length };
    }

    await this.repository.deleteLimitsByCategoryId(data.categoryId);

    if (limits.length > 0) {
      await this.repository.upsertLimitsBatch(data.categoryId, limits);
    }

    return { copied: limits.length };
  }

  async getCategoryLimitsMap(
    categoryId: string | null
  ): Promise<Map<string, IParameterLimit>> {
    if (!categoryId) return new Map();

    const limits = await this.repository.findLimitsByCategoryId(categoryId);
    const map = new Map<string, IParameterLimit>();
    for (const limit of limits) {
      map.set(limit.parameterId, limit);
    }
    return map;
  }

  // ---------------------------------------------------------------------------
  // Statistics & Utility Operations
  // ---------------------------------------------------------------------------

  async getCategoryStats(
    actor: IJwtPayload,
    id: string
  ): Promise<ICategoryStats> {
    this.rbac.ensureAccess(actor.role, RbacResource.MASTER_DATA, 'read');
    const category = await this.validateExists(id);

    const paramsCount = await this.repository.countLimitsInCategory(id);
    const projectsCount = await this.repository.countProjectsUsingCategory(id);

    return {
      categoryId: id,
      parametersWithLimits: paramsCount,
      projectsUsingCount: projectsCount,
      canDelete: projectsCount === 0 && !category.isDefault,
    };
  }

  async getOrCreateDefaultCategory(): Promise<ICategoryWithLimits> {
    const existing = await this.repository.findDefaultCategory();
    if (existing) {
      const withLimits = await this.repository.findByIdWithLimits(existing.id);
      if (withLimits) return withLimits;
    }
    return this.createDefaultCategory();
  }

  // ---------------------------------------------------------------------------
  // Private Validation Helpers
  // ---------------------------------------------------------------------------

  private async validateExists(id: string): Promise<IParameterLimitCategory> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new Error('Kategori tidak ditemukan');
    }
    return category;
  }

  private async validateNameUnique(
    name: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.repository.findByName(name);
    if (existing && existing.id !== excludeId) {
      throw new Error('Kategori dengan nama tersebut sudah ada');
    }
  }

  private async validateCanRemoveDefault(id: string): Promise<void> {
    const otherDefaults = await this.repository.countOtherDefaults(id);
    if (otherDefaults === 0) {
      throw new Error(
        'Tidak dapat menghapus status default. Minimal harus ada satu kategori default.'
      );
    }
  }

  private async validateCanDelete(
    id: string
  ): Promise<IParameterLimitCategory> {
    const category = await this.validateExists(id);
    if (category.isDefault) {
      throw new Error(
        'Tidak dapat menghapus kategori default. Tentukan kategori default lain terlebih dahulu.'
      );
    }
    return category;
  }

  private validateLimitValue(limit: TParameterLimitInput): void {
    if (
      limit.minValue !== null &&
      limit.minValue !== undefined &&
      limit.maxValue !== null &&
      limit.maxValue !== undefined &&
      limit.minValue > limit.maxValue
    ) {
      throw new Error('Nilai minimum tidak boleh lebih besar dari maksimum');
    }
    if (
      limit.rawWaterMinValue !== null &&
      limit.rawWaterMinValue !== undefined &&
      limit.rawWaterMaxValue !== null &&
      limit.rawWaterMaxValue !== undefined &&
      limit.rawWaterMinValue > limit.rawWaterMaxValue
    ) {
      throw new Error(
        'Nilai raw water minimum tidak boleh lebih besar dari maksimum'
      );
    }
  }

  private async mapParametersToLimits(
    parameters: IParameterWithLimits[]
  ): Promise<TParameterLimitInput[]> {
    return parameters
      .filter(
        p =>
          p.minValue !== null ||
          p.maxValue !== null ||
          p.rawWaterMinValue !== null ||
          p.rawWaterMaxValue !== null
      )
      .map(p => ({
        parameterId: p.id,
        minValue: p.minValue,
        maxValue: p.maxValue,
        rawWaterMinValue: p.rawWaterMinValue,
        rawWaterMaxValue: p.rawWaterMaxValue,
      }));
  }

  private async createDefaultCategory(): Promise<ICategoryWithLimits> {
    const category = await this.repository.create({
      name: 'Standard',
      description: 'Default parameter limits from master data',
      isDefault: true,
    });

    const parameters =
      await this.repository.findAllActiveParametersWithLimits();
    const limits = await this.mapParametersToLimits(parameters);

    if (limits.length > 0) {
      await this.repository.upsertLimitsBatch(category.id, limits);
    }

    const result = await this.repository.findByIdWithLimits(category.id);
    if (!result) {
      throw new Error('Failed to create default category');
    }
    return result;
  }
}

// =============================================================================
// Default RBAC Implementation
// =============================================================================

const defaultRbac: IRbacService = {
  ensureAccess,
};

// =============================================================================
// Composition Root (Factory Function)
// =============================================================================

export function createParameterLimitCategoryService(
  deps?: Partial<IParameterLimitCategoryServiceDeps>
): IParameterLimitCategoryService {
  const repository =
    deps?.repository ?? createPrismaParameterLimitCategoryRepository();
  const rbac = deps?.rbac ?? defaultRbac;

  return new ParameterLimitCategoryService({ repository, rbac });
}

// =============================================================================
// Singleton Instance (for direct import)
// =============================================================================

export const parameterLimitCategoryService =
  createParameterLimitCategoryService();
