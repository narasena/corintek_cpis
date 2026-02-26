import { z } from 'zod/v4';
import type { TParameterCategory } from '@/features/parameters/types';
import type { IJwtPayload } from '@/@types/auth.type';

// =============================================================================
// Zod Validation Schemas
// =============================================================================

/**
 * Schema for creating a new parameter limit category.
 * Category name must be unique across all categories.
 */
export const CreateParameterLimitCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nama kategori wajib diisi')
    .max(100, 'Nama kategori maksimal 100 karakter'),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
});

/**
 * Schema for updating an existing parameter limit category.
 * All fields are optional; only provided fields will be updated.
 */
export const UpdateParameterLimitCategorySchema =
  CreateParameterLimitCategorySchema.partial().extend({
    id: z.string().uuid('ID kategori tidak valid'),
  });

/**
 * Schema for a single parameter limit within a category.
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
 * Schema for batch upserting parameter limits within a category.
 * Validates min <= max constraint for all limits.
 */
export const UpsertParameterLimitsBatchSchema = z
  .object({
    categoryId: z.string().uuid('Category ID tidak valid'),
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
 * Schema for querying categories with optional filters.
 */
export const GetParameterLimitCategoriesFilterSchema = z.object({
  includeDefault: z.boolean().optional(),
  includeLimits: z.boolean().optional(),
});

/**
 * Schema for copying limits from master parameter defaults.
 * Used to initialize a new category with standard values.
 */
export const CopyFromMasterDefaultsSchema = z.object({
  categoryId: z.string().uuid('Category ID tidak valid'),
  overwriteExisting: z.boolean().default(false),
});

// =============================================================================
// Inferred TypeScript Types
// =============================================================================

/** Input type for creating a parameter limit category */
export type TCreateParameterLimitCategory = z.infer<
  typeof CreateParameterLimitCategorySchema
>;

/** Input type for updating a parameter limit category */
export type TUpdateParameterLimitCategory = z.infer<
  typeof UpdateParameterLimitCategorySchema
>;

/** Input type for a single parameter limit */
export type TParameterLimitInput = z.infer<typeof ParameterLimitSchema>;

/** Input type for batch upserting parameter limits */
export type TUpsertParameterLimitsBatch = z.infer<
  typeof UpsertParameterLimitsBatchSchema
>;

/** Filter options for querying categories */
export type TGetParameterLimitCategoriesFilter = z.infer<
  typeof GetParameterLimitCategoriesFilterSchema
>;

/** Input type for copying from master defaults */
export type TCopyFromMasterDefaults = z.infer<
  typeof CopyFromMasterDefaultsSchema
>;

// =============================================================================
// Domain Interfaces
// =============================================================================

/**
 * Represents a parameter limit category (template).
 * Categories group limit configurations for reuse across projects.
 *
 * @example
 * // Default category seeded from master parameters
 * { name: "Standard", isDefault: true, description: "Default limits from master data" }
 *
 * // Client-specific category
 * { name: "Client XYZ Cooling Tower", isDefault: false, description: "Custom limits for Client XYZ" }
 */
export interface IParameterLimitCategory {
  /** Unique identifier (UUID) */
  id: string;

  /** Display name - must be unique across categories */
  name: string;

  /** Optional description for admin reference */
  description: string | null;

  /**
   * Whether this is the system default category.
   * Only one category can be default at a time.
   * New projects without explicit category selection use the default.
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
 * Represents a single limit configuration within a category.
 * Links a parameter to its min/max bounds for a specific category context.
 */
export interface IParameterLimit {
  /** Unique identifier (UUID) */
  id: string;

  /** Reference to the parent category */
  categoryId: string;

  /** Reference to the parameter being limited */
  parameterId: string;

  /** Minimum acceptable value (null = no lower bound) */
  minValue: number | null;

  /** Maximum acceptable value (null = no upper bound) */
  maxValue: number | null;

  /** Minimum acceptable raw water value (for COOLING_WATER_QUALITY category) */
  rawWaterMinValue: number | null;

  /** Maximum acceptable raw water value (for COOLING_WATER_QUALITY category) */
  rawWaterMaxValue: number | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Composite view of a category with its associated limits.
 * Used for UI display and limit resolution.
 */
export interface ICategoryWithLimits {
  /** The category metadata */
  category: IParameterLimitCategory;

  /**
   * All parameter limits within this category.
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
  limits: Array<ICategoryWithLimits['limits'][number]>;
}

/**
 * Resolved effective limits for a parameter.
 * Result of the limit resolution chain (Override > Category > Master).
 */
export interface IEffectiveLimits {
  /** Parameter being limited */
  parameterId: string;

  /** Source of the resolved limits */
  source: 'OVERRIDE' | 'CATEGORY' | 'MASTER';

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
  /** Project's selected limit category (if any) */
  categoryId?: string | null;

  /** Pre-fetched category limits map (parameterId → limit) */
  categoryLimitsMap?: Map<string, IParameterLimit>;

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
 * Statistics for a category (for admin dashboard).
 */
export interface ICategoryStats {
  /** Category ID */
  categoryId: string;

  /** Number of parameters with defined limits */
  parametersWithLimits: number;

  /** Number of projects using this category */
  projectsUsingCount: number;

  /** Whether this category can be deleted (no projects using it) */
  canDelete: boolean;
}

// =============================================================================
// Service Result Types
// =============================================================================

/**
 * Result of a category creation operation.
 */
export interface ICreateCategoryResult {
  category: IParameterLimitCategory;
  /** Whether limits were auto-seeded from master defaults */
  seededFromMaster: boolean;
}

/**
 * Result of a category deletion operation.
 */
export interface IDeleteCategoryResult {
  /** ID of the deleted category */
  deletedId: string;

  /**
   * Projects that were reassigned to default category.
   * Empty if no projects were using the deleted category.
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
 * Parameter data with limit values (for seeding from master).
 */
export interface IParameterWithLimits {
  id: string;
  name: string;
  variableName: string;
  unit: string | null;
  category: TParameterCategory;
  displayOrder: number;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
}

/**
 * Repository interface for parameter limit category persistence.
 * Abstracts database operations for testability and loose coupling.
 */
export interface IParameterLimitCategoryRepository {
  // Category CRUD
  findAll(): Promise<IParameterLimitCategory[]>;
  findById(id: string): Promise<IParameterLimitCategory | null>;
  findByIdWithLimits(id: string): Promise<ICategoryWithLimits | null>;
  findDefaultCategory(): Promise<IParameterLimitCategory | null>;
  create(data: TCreateParameterLimitCategory): Promise<IParameterLimitCategory>;
  update(
    id: string,
    data: Partial<TCreateParameterLimitCategory>
  ): Promise<IParameterLimitCategory>;
  softDelete(id: string): Promise<void>;

  // Category uniqueness checks
  findByName(name: string): Promise<IParameterLimitCategory | null>;
  findOtherDefault(excludeId: string): Promise<IParameterLimitCategory | null>;
  countOtherDefaults(excludeId: string): Promise<number>;
  unsetAllDefaults(): Promise<void>;

  // Limits CRUD
  findLimitsByCategoryId(categoryId: string): Promise<IParameterLimit[]>;
  upsertLimit(
    categoryId: string,
    limit: TParameterLimitInput
  ): Promise<{ created: boolean }>;
  upsertLimitsBatch(
    categoryId: string,
    limits: TParameterLimitInput[]
  ): Promise<{ created: number; updated: number }>;
  deleteLimitsByCategoryId(categoryId: string): Promise<void>;

  // Project relationships
  findProjectsUsingCategory(categoryId: string): Promise<Array<{ id: string }>>;
  reassignProjectsToCategory(
    fromCategoryId: string,
    toCategoryId: string | null
  ): Promise<string[]>;
  countProjectsUsingCategory(categoryId: string): Promise<number>;

  // Master parameter data
  findAllActiveParametersWithLimits(): Promise<IParameterWithLimits[]>;

  // Statistics
  countLimitsInCategory(categoryId: string): Promise<number>;
}

/**
 * RBAC interface for access control.
 */
export interface IRbacService {
  ensureAccess(role: string, resource: string, capability: string): void;
}

/**
 * Service interface for parameter limit category operations.
 */
export interface IParameterLimitCategoryService {
  getCategories(
    actor: IJwtPayload,
    filters?: TGetParameterLimitCategoriesFilter
  ): Promise<IParameterLimitCategory[]>;
  getCategoryWithLimits(
    actor: IJwtPayload,
    id: string
  ): Promise<ICategoryWithLimits>;
  createCategory(
    actor: IJwtPayload,
    data: TCreateParameterLimitCategory
  ): Promise<ICreateCategoryResult>;
  updateCategory(
    actor: IJwtPayload,
    data: TUpdateParameterLimitCategory
  ): Promise<IParameterLimitCategory>;
  deleteCategory(
    actor: IJwtPayload,
    id: string
  ): Promise<IDeleteCategoryResult>;
  upsertCategoryLimits(
    actor: IJwtPayload,
    data: TUpsertParameterLimitsBatch
  ): Promise<IUpsertLimitsResult>;
  copyFromMasterDefaults(
    actor: IJwtPayload,
    data: TCopyFromMasterDefaults
  ): Promise<{ copied: number }>;
  getCategoryLimitsMap(
    categoryId: string | null
  ): Promise<Map<string, IParameterLimit>>;
  getCategoryStats(actor: IJwtPayload, id: string): Promise<ICategoryStats>;
  getOrCreateDefaultCategory(): Promise<ICategoryWithLimits>;
}

/**
 * Dependencies for ParameterLimitCategoryService.
 */
export interface IParameterLimitCategoryServiceDeps {
  repository: IParameterLimitCategoryRepository;
  rbac: IRbacService;
}
