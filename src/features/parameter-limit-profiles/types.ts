import { z } from 'zod/v4';
import type { TParameterCategory } from '@/features/parameters/types';
import type { IJwtPayload } from '@/@types/auth.type';

// =============================================================================
// Zod Validation Schemas
// =============================================================================

/**
 * Schema for creating a new parameter limit profile.
 * Profile name must be unique across all profiles.
 */
export const CreateParameterLimitProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama profil wajib diisi')
    .max(100, 'Nama profil maksimal 100 karakter'),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
});

/**
 * Schema for updating an existing parameter limit profile.
 * All fields are optional; only provided fields will be updated.
 */
export const UpdateParameterLimitProfileSchema =
  CreateParameterLimitProfileSchema.partial().extend({
    id: z.string().uuid('ID profil tidak valid'),
  });

/**
 * Schema for a single parameter limit within a profile.
 * Maps a parameter to its min/max limits (both regular and raw water).
 */
export const ParameterLimitSchema = z.object({
  parameterId: z.string().uuid('Parameter ID tidak valid'),
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  rawWaterMinValue: z.number().nullable().optional(),
  rawWaterMaxValue: z.number().nullable().optional(),
});

/**
 * Schema for batch upserting parameter limits within a profile.
 * Validates min <= max constraint for all limits.
 */
export const UpsertParameterLimitsBatchSchema = z
  .object({
    profileId: z.string().uuid('Profile ID tidak valid'),
    limits: z
      .array(ParameterLimitSchema)
      .min(1, 'Minimal satu limit wajib diisi'),
  })
  .refine(
    data => {
      return data.limits.every(limit => {
        if (
          limit.minValue !== null &&
          limit.maxValue !== null &&
          limit.minValue !== undefined &&
          limit.maxValue !== undefined
        ) {
          return limit.minValue <= limit.maxValue;
        }
        if (
          limit.rawWaterMinValue !== null &&
          limit.rawWaterMaxValue !== null &&
          limit.rawWaterMinValue !== undefined &&
          limit.rawWaterMaxValue !== undefined
        ) {
          return limit.rawWaterMinValue <= limit.rawWaterMaxValue;
        }
        return true;
      });
    },
    { message: 'Nilai minimum tidak boleh lebih besar dari maksimum' }
  );

/**
 * Schema for querying profiles with optional filters.
 */
export const GetParameterLimitProfilesFilterSchema = z.object({
  includeDefault: z.boolean().optional(),
  includeLimits: z.boolean().optional(),
});

/**
 * Schema for copying limits from master parameter defaults.
 * Used to initialize a new profile with standard values.
 */
export const CopyFromMasterDefaultsSchema = z.object({
  profileId: z.string().uuid('Profile ID tidak valid'),
  overwriteExisting: z.boolean().default(false),
});

// =============================================================================
// Inferred TypeScript Types
// =============================================================================

/** Input type for creating a parameter limit profile */
export type TCreateParameterLimitProfile = z.infer<
  typeof CreateParameterLimitProfileSchema
>;

/** Input type for updating a parameter limit profile */
export type TUpdateParameterLimitProfile = z.infer<
  typeof UpdateParameterLimitProfileSchema
>;

/** Input type for a single parameter limit */
export type TParameterLimitInput = z.infer<typeof ParameterLimitSchema>;

/** Input type for batch upserting parameter limits */
export type TUpsertParameterLimitsBatch = z.infer<
  typeof UpsertParameterLimitsBatchSchema
>;

/** Filter options for querying profiles */
export type TGetParameterLimitProfilesFilter = z.infer<
  typeof GetParameterLimitProfilesFilterSchema
>;

/** Input type for copying from master defaults */
export type TCopyFromMasterDefaults = z.infer<
  typeof CopyFromMasterDefaultsSchema
>;

// =============================================================================
// Domain Interfaces
// =============================================================================

/**
 * Represents a parameter limit profile (template).
 * Profiles group limit configurations for reuse across projects.
 *
 * @example
 * // Default profile seeded from master parameters
 * { name: "Standard", isDefault: true, description: "Default limits from master data" }
 *
 * // Client-specific profile
 * { name: "Client XYZ Cooling Tower", isDefault: false, description: "Custom limits for Client XYZ" }
 */
export interface IParameterLimitProfile {
  /** Unique identifier (UUID) */
  id: string;

  /** Display name - must be unique across profiles */
  name: string;

  /** Optional description for admin reference */
  description: string | null;

  /**
   * Whether this is the system default profile.
   * Only one profile can be default at a time.
   * New projects without explicit profile selection use the default.
   */
  isDefault: boolean;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Soft delete timestamp - null if active */
  deletedAt: Date | null;
}

/**
 * Represents a single limit configuration within a profile.
 * Links a parameter to its min/max bounds for a specific profile context.
 */
export interface IParameterLimit {
  /** Unique identifier (UUID) */
  id: string;

  /** Reference to the parent profile */
  profileId: string;

  /** Reference to the parameter being limited */
  parameterId: string;

  /** Minimum acceptable value (null = no lower bound) */
  minValue: number | null;

  /** Maximum acceptable value (null = no upper bound) */
  maxValue: number | null;

  /** Minimum acceptable raw water value (for COOLING_WATER_QUALITY) */
  rawWaterMinValue: number | null;

  /** Maximum acceptable raw water value (for COOLING_WATER_QUALITY) */
  rawWaterMaxValue: number | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Composite view of a profile with its associated limits.
 * Used for UI display and limit resolution.
 */
export interface IProfileWithLimits {
  /** The profile metadata */
  profile: IParameterLimitProfile;

  /**
   * All parameter limits within this profile.
   * Includes parameter details for display.
   */
  limits: Array<
    IParameterLimit & {
      /** Parameter display name */
      parameterName: string;
      /** Parameter variable name (unique identifier) */
      parameterVariableName: string;
      /** Unit of measurement (e.g., "°C", "ppm") */
      parameterUnit: string | null;
      /** Parameter grouping category (condenser, evaporator, etc.) */
      parameterCategory: TParameterCategory;
      /** Display order for sorting in UI */
      parameterDisplayOrder: number;
    }
  >;

  /** Total count of limits (for pagination metadata) */
  totalLimits: number;
}

/**
 * Limits grouped by ParameterCategory for UI rendering.
 * Enables hierarchical display: Category → ParameterGroups → Limits.
 */
export interface ILimitsGroupedByCategory {
  /** Parameter group identifier (e.g., UNIT_CONDENSOR) */
  group: TParameterCategory;

  /** Display label for the group (localized) */
  groupLabel: string;

  /** Limits within this group */
  limits: Array<IProfileWithLimits['limits'][number]>;
}

/**
 * Resolved effective limits for a parameter.
 * Result of the limit resolution chain (Override > Profile > Default).
 */
export interface IEffectiveLimits {
  /** Parameter being limited */
  parameterId: string;

  /** Source of the resolved limits */
  source: 'OVERRIDE' | 'PROFILE' | 'DEFAULT';

  /** Effective minimum value */
  minValue: number | null;

  /** Effective maximum value */
  maxValue: number | null;

  /** Effective raw water minimum */
  rawWaterMinValue: number | null;

  /** Effective raw water maximum */
  rawWaterMaxValue: number | null;
}

/**
 * Context required for limit resolution.
 * Passed to limit resolution utilities.
 */
export interface ILimitResolutionContext {
  /** Project's selected limit profile (if any) */
  profileId?: string | null;

  /** Pre-fetched profile limits map (parameterId → limit) */
  profileLimitsMap?: Map<string, IParameterLimit>;

  /** Project-specific overrides (highest priority) */
  overrides: Array<{
    parameterId: string;
    minValue: number | null;
    maxValue: number | null;
    rawWaterMinValue: number | null;
    rawWaterMaxValue: number | null;
  }>;
}

/**
 * Statistics for a profile (for admin dashboard).
 */
export interface IProfileStats {
  /** Profile ID */
  profileId: string;

  /** Number of parameters with defined limits */
  parametersWithLimits: number;

  /** Number of projects using this profile */
  projectsUsingCount: number;

  /** Whether this profile can be deleted (no projects using it) */
  canDelete: boolean;
}

// =============================================================================
// Service Result Types
// =============================================================================

/**
 * Result of a profile creation operation.
 */
export interface ICreateProfileResult {
  profile: IParameterLimitProfile;
  /** Whether limits were auto-seeded from master defaults */
  seededFromMaster: boolean;
}

/**
 * Result of a profile deletion operation.
 */
export interface IDeleteProfileResult {
  /** ID of the deleted profile */
  deletedId: string;

  /**
   * Projects that were reassigned to default profile.
   * Empty if no projects were using the deleted profile.
   */
  reassignedProjectIds: string[];
}

/**
 * Result of batch limit upsert operation.
 */
export interface IUpsertLimitsResult {
  /** Number of limits created */
  created: number;

  /** Number of limits updated */
  updated: number;

  /** IDs of affected parameters */
  affectedParameterIds: string[];
}

// =============================================================================
// Repository Interfaces (for Dependency Injection)
// =============================================================================

/**
 * Repository interface for parameter limit profile persistence.
 * Abstracts database operations for testability and loose coupling.
 */
export interface IParameterLimitProfileRepository {
  // Profile CRUD
  findAll(): Promise<IParameterLimitProfile[]>;
  findById(id: string): Promise<IParameterLimitProfile | null>;
  findByIdWithLimits(id: string): Promise<IProfileWithLimits | null>;
  findDefaultProfile(): Promise<IParameterLimitProfile | null>;
  create(data: TCreateParameterLimitProfile): Promise<IParameterLimitProfile>;
  update(
    id: string,
    data: Partial<TCreateParameterLimitProfile>
  ): Promise<IParameterLimitProfile>;
  softDelete(id: string): Promise<void>;

  // Profile uniqueness checks
  findByName(name: string): Promise<IParameterLimitProfile | null>;
  findOtherDefault(excludeId: string): Promise<IParameterLimitProfile | null>;
  countOtherDefaults(excludeId: string): Promise<number>;
  unsetAllDefaults(): Promise<void>;

  // Limits CRUD
  findLimitsByProfileId(profileId: string): Promise<IParameterLimit[]>;
  upsertLimit(
    profileId: string,
    limit: TParameterLimitInput
  ): Promise<{ created: boolean }>;
  upsertLimitsBatch(
    profileId: string,
    limits: TParameterLimitInput[]
  ): Promise<{ created: number; updated: number }>;
  deleteLimitsByProfileId(profileId: string): Promise<void>;

  // Project relationships
  findProjectsUsingProfile(profileId: string): Promise<Array<{ id: string }>>;
  reassignProjectsToProfile(
    fromProfileId: string,
    toProfileId: string | null
  ): Promise<string[]>;
  countProjectsUsingProfile(profileId: string): Promise<number>;

  // Master parameter data
  findAllActiveParameters(): Promise<
    Array<{
      id: string;
      name: string;
      variableName: string;
      unit: string | null;
      category: TParameterCategory;
      displayOrder: number;
    }>
  >;

  // Statistics
  countLimitsInProfile(profileId: string): Promise<number>;
}

/**
 * RBAC interface for access control.
 */
export interface IRbacService {
  ensureAccess(role: string, resource: string, capability: string): void;
}

/**
 * Service interface for parameter limit profile operations.
 */
export interface IParameterLimitProfileService {
  getProfiles(
    actor: IJwtPayload,
    filters?: TGetParameterLimitProfilesFilter
  ): Promise<IParameterLimitProfile[]>;
  getProfileWithLimits(
    actor: IJwtPayload,
    id: string
  ): Promise<IProfileWithLimits>;
  createProfile(
    actor: IJwtPayload,
    data: TCreateParameterLimitProfile
  ): Promise<ICreateProfileResult>;
  updateProfile(
    actor: IJwtPayload,
    data: TUpdateParameterLimitProfile
  ): Promise<IParameterLimitProfile>;
  deleteProfile(actor: IJwtPayload, id: string): Promise<IDeleteProfileResult>;
  upsertProfileLimits(
    actor: IJwtPayload,
    data: TUpsertParameterLimitsBatch
  ): Promise<IUpsertLimitsResult>;
  copyFromMasterDefaults(
    actor: IJwtPayload,
    data: TCopyFromMasterDefaults
  ): Promise<{ copied: number }>;
  getProfileLimitsMap(
    profileId: string | null
  ): Promise<Map<string, IParameterLimit>>;
  getProfileStats(actor: IJwtPayload, id: string): Promise<IProfileStats>;
  getOrCreateDefaultProfile(): Promise<IProfileWithLimits>;
}

/**
 * Dependencies for ParameterLimitProfileService.
 */
export interface IParameterLimitProfileServiceDeps {
  repository: IParameterLimitProfileRepository;
  rbac: IRbacService;
}
