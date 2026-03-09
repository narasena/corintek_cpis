import { ensureAccess, RbacResource } from '@/lib/rbac';
import type { IJwtPayload } from '@/@types/auth.type';
import type { TParameterCategory } from '@/features/parameters/types';
import type {
  IParameterLimitProfile,
  IProfileWithLimits,
  IProfileStats,
  ICreateProfileResult,
  IDeleteProfileResult,
  IUpsertLimitsResult,
  IParameterLimit,
  IParameterLimitProfileService,
  IParameterLimitProfileServiceDeps,
  IParameterLimitProfileRepository,
  IRbacService,
  TCreateParameterLimitProfile,
  TUpdateParameterLimitProfile,
  TUpsertParameterLimitsBatch,
  TGetParameterLimitProfilesFilter,
  TCopyFromMasterDefaults,
  TParameterLimitInput,
} from './types';
import { createPrismaParameterLimitProfileRepository } from './repository-prisma';

// =============================================================================
// Parameter Limit Profile Service
// =============================================================================

/**
 * Service class for parameter limit profile operations.
 * Uses constructor injection for testability and loose coupling.
 */
class ParameterLimitProfileService implements IParameterLimitProfileService {
  private readonly repository: IParameterLimitProfileRepository;
  private readonly rbac: IRbacService;

  constructor(deps: IParameterLimitProfileServiceDeps) {
    this.repository = deps.repository;
    this.rbac = deps.rbac;
  }

  // ---------------------------------------------------------------------------
  // CRUD Operations
  // ---------------------------------------------------------------------------

  async getProfiles(
    actor: IJwtPayload,
    _filters?: TGetParameterLimitProfilesFilter
  ): Promise<IParameterLimitProfile[]> {
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'read');
    return this.repository.findAll();
  }

  async getProfileWithLimits(
    actor: IJwtPayload,
    id: string
  ): Promise<IProfileWithLimits> {
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'read');
    const profile = await this.repository.findByIdWithLimits(id);
    if (!profile) {
      throw new Error('Profil tidak ditemukan');
    }
    return profile;
  }

  async createProfile(
    actor: IJwtPayload,
    data: TCreateParameterLimitProfile
  ): Promise<ICreateProfileResult> {
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'create');
    await this.validateNameUnique(data.name);

    if (data.isDefault) {
      await this.repository.unsetAllDefaults();
    }

    const profile = await this.repository.create(data);
    return { profile, seededFromMaster: false };
  }

  async updateProfile(
    actor: IJwtPayload,
    data: TUpdateParameterLimitProfile
  ): Promise<IParameterLimitProfile> {
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'update');
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

  async deleteProfile(
    actor: IJwtPayload,
    id: string
  ): Promise<IDeleteProfileResult> {
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'delete');
    await this.validateCanDelete(id);

    const defaultProfile = await this.repository.findDefaultProfile();
    const reassigned = await this.repository.reassignProjectsToProfile(
      id,
      defaultProfile?.id ?? null
    );

    await this.repository.deleteLimitsByProfileId(id);
    await this.repository.softDelete(id);

    return { deletedId: id, reassignedProjectIds: reassigned };
  }

  // ---------------------------------------------------------------------------
  // Limit Management Operations
  // ---------------------------------------------------------------------------

  async upsertProfileLimits(
    actor: IJwtPayload,
    data: TUpsertParameterLimitsBatch
  ): Promise<IUpsertLimitsResult> {
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'update');
    await this.validateExists(data.profileId);

    for (const limit of data.limits) {
      this.validateLimitValue(limit);
    }

    const result = await this.repository.upsertLimitsBatch(
      data.profileId,
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
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'update');
    await this.validateExists(data.profileId);

    // Get default profile with its limits (the "master" values)
    const defaultProfile = await this.repository.findDefaultProfile();
    if (!defaultProfile) {
      throw new Error(
        'Tidak ada profil default. Silakan buat profil default terlebih dahulu.'
      );
    }

    // Fetch limits from default profile - these are the "master" values
    const defaultProfileWithLimits = await this.repository.findByIdWithLimits(
      defaultProfile.id
    );
    if (!defaultProfileWithLimits) {
      throw new Error('Gagal mengambil data batas dari profil default.');
    }

    // Map the default profile's limits to the target profile
    // Only copy parameters that have limits defined in the default profile
    const limitsToCopy: TParameterLimitInput[] = defaultProfileWithLimits.limits
      .filter(
        limit =>
          // Only copy if at least one limit value is set
          limit.minValue !== null ||
          limit.maxValue !== null ||
          limit.rawWaterMinValue !== null ||
          limit.rawWaterMaxValue !== null
      )
      .map(limit => ({
        parameterId: limit.parameterId,
        minValue: limit.minValue,
        maxValue: limit.maxValue,
        rawWaterMinValue: limit.rawWaterMinValue,
        rawWaterMaxValue: limit.rawWaterMaxValue,
      }));

    if (!data.overwriteExisting) {
      const existing = await this.repository.findLimitsByProfileId(
        data.profileId
      );
      const existingIds = new Set(existing.map(l => l.parameterId));
      const newLimits = limitsToCopy.filter(
        l => !existingIds.has(l.parameterId)
      );

      if (newLimits.length > 0) {
        await this.repository.upsertLimitsBatch(data.profileId, newLimits);
      }
      return { copied: newLimits.length };
    }

    await this.repository.deleteLimitsByProfileId(data.profileId);

    if (limitsToCopy.length > 0) {
      await this.repository.upsertLimitsBatch(data.profileId, limitsToCopy);
    }

    return { copied: limitsToCopy.length };
  }

  async getProfileLimitsMap(
    profileId: string | null
  ): Promise<Map<string, IParameterLimit>> {
    if (!profileId) return new Map();

    const limits = await this.repository.findLimitsByProfileId(profileId);
    const map = new Map<string, IParameterLimit>();
    for (const limit of limits) {
      map.set(limit.parameterId, limit);
    }
    return map;
  }

  // ---------------------------------------------------------------------------
  // Statistics & Utility Operations
  // ---------------------------------------------------------------------------

  async getProfileStats(
    actor: IJwtPayload,
    id: string
  ): Promise<IProfileStats> {
    this.rbac.ensureAccess(actor.role, RbacResource.PARAMETERS, 'read');
    const profile = await this.validateExists(id);

    const paramsCount = await this.repository.countLimitsInProfile(id);
    const projectsCount = await this.repository.countProjectsUsingProfile(id);

    return {
      profileId: id,
      parametersWithLimits: paramsCount,
      projectsUsingCount: projectsCount,
      canDelete: projectsCount === 0 && !profile.isDefault,
    };
  }

  async getOrCreateDefaultProfile(): Promise<IProfileWithLimits> {
    const existing = await this.repository.findDefaultProfile();
    if (existing) {
      const withLimits = await this.repository.findByIdWithLimits(existing.id);
      if (withLimits) return withLimits;
    }
    return this.createDefaultProfile();
  }

  // ---------------------------------------------------------------------------
  // Private Validation Helpers
  // ---------------------------------------------------------------------------

  private async validateExists(id: string): Promise<IParameterLimitProfile> {
    const profile = await this.repository.findById(id);
    if (!profile) {
      throw new Error('Profil tidak ditemukan');
    }
    return profile;
  }

  private async validateNameUnique(
    name: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.repository.findByName(name);
    if (existing && existing.id !== excludeId) {
      throw new Error('Profil dengan nama tersebut sudah ada');
    }
  }

  private async validateCanRemoveDefault(id: string): Promise<void> {
    const otherDefaults = await this.repository.countOtherDefaults(id);
    if (otherDefaults === 0) {
      throw new Error(
        'Tidak dapat menghapus status default. Minimal harus ada satu profil default.'
      );
    }
  }

  private async validateCanDelete(id: string): Promise<IParameterLimitProfile> {
    const profile = await this.validateExists(id);
    if (profile.isDefault) {
      throw new Error(
        'Tidak dapat menghapus profil default. Tentukan profil default lain terlebih dahulu.'
      );
    }
    return profile;
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

  private mapParametersToEmptyLimits(
    parameters: Array<{
      id: string;
      name: string;
      variableName: string;
      unit: string | null;
      category: TParameterCategory;
      displayOrder: number;
    }>
  ): TParameterLimitInput[] {
    return parameters.map(p => ({
      parameterId: p.id,
      minValue: null,
      maxValue: null,
      rawWaterMinValue: null,
      rawWaterMaxValue: null,
    }));
  }

  private async createDefaultProfile(): Promise<IProfileWithLimits> {
    const profile = await this.repository.create({
      name: 'Standard',
      description: 'Default parameter limits profile',
      isDefault: true,
    });

    // Only create limit entries for parameters that have hasLimits=true
    const parameters = await this.repository.findParametersWithLimits();
    const limits = this.mapParametersToEmptyLimits(parameters);

    if (limits.length > 0) {
      await this.repository.upsertLimitsBatch(profile.id, limits);
    }

    const result = await this.repository.findByIdWithLimits(profile.id);
    if (!result) {
      throw new Error('Failed to create default profile');
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

export function createParameterLimitProfileService(
  deps?: Partial<IParameterLimitProfileServiceDeps>
): IParameterLimitProfileService {
  const repository =
    deps?.repository ?? createPrismaParameterLimitProfileRepository();
  const rbac = deps?.rbac ?? defaultRbac;

  return new ParameterLimitProfileService({ repository, rbac });
}

// =============================================================================
// Singleton Instance (for direct import)
// =============================================================================

export const parameterLimitProfileService =
  createParameterLimitProfileService();
