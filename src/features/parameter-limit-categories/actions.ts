'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ok, err, unauthorized, type ActionResult } from '@/lib/action-helpers';
import { parameterLimitCategoryService } from './service';
import {
  CreateParameterLimitCategorySchema,
  UpdateParameterLimitCategorySchema,
  UpsertParameterLimitsBatchSchema,
  CopyFromMasterDefaultsSchema,
  GetParameterLimitCategoriesFilterSchema,
} from './types';
import type {
  IParameterLimitCategory,
  ICategoryWithLimits,
  ICategoryStats,
  ICreateCategoryResult,
  IDeleteCategoryResult,
  IUpsertLimitsResult,
  TCreateParameterLimitCategory,
  TUpdateParameterLimitCategory,
  TUpsertParameterLimitsBatch,
  TGetParameterLimitCategoriesFilter,
  TCopyFromMasterDefaults,
} from './types';

// =============================================================================
// Parameter Limit Category Actions
// =============================================================================

const LOG_PREFIX = '[CPIS-ERROR] ParameterLimitCategories';

/**
 * Retrieves all parameter limit categories.
 */
export async function getCategoriesAction(
  filters?: TGetParameterLimitCategoriesFilter
): Promise<ActionResult<IParameterLimitCategory[]>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validatedFilters = filters
      ? GetParameterLimitCategoriesFilterSchema.parse(filters)
      : undefined;
    const categories = await parameterLimitCategoryService.getCategories(
      actor,
      validatedFilters
    );
    return ok(categories);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetCategories:`, error);
    return err(error, 'Gagal mengambil daftar kategori');
  }
}

/**
 * Retrieves a single category with all its limits.
 */
export async function getCategoryWithLimitsAction(
  id: string
): Promise<ActionResult<ICategoryWithLimits>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const category = await parameterLimitCategoryService.getCategoryWithLimits(
      actor,
      id
    );
    return ok(category);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetCategoryWithLimits:`, error);
    return err(error, 'Gagal mengambil detail kategori');
  }
}

/**
 * Creates a new parameter limit category.
 */
export async function createCategoryAction(
  data: TCreateParameterLimitCategory
): Promise<ActionResult<ICreateCategoryResult>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = CreateParameterLimitCategorySchema.parse(data);
    const result = await parameterLimitCategoryService.createCategory(
      actor,
      validated
    );

    revalidatePath('/admin/parameter-limits');
    if (data.isDefault) {
      revalidatePath('/projects');
    }

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.CreateCategory:`, error);
    return err(error, 'Gagal membuat kategori');
  }
}

/**
 * Updates an existing parameter limit category.
 */
export async function updateCategoryAction(
  data: TUpdateParameterLimitCategory
): Promise<ActionResult<IParameterLimitCategory>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = UpdateParameterLimitCategorySchema.parse(data);
    const category = await parameterLimitCategoryService.updateCategory(
      actor,
      validated
    );

    revalidatePath('/admin/parameter-limits');
    revalidatePath(`/admin/parameter-limits/${data.id}`);
    if ('isDefault' in validated) {
      revalidatePath('/projects');
    }

    return ok(category);
  } catch (error) {
    console.error(`${LOG_PREFIX}.UpdateCategory:`, error);
    return err(error, 'Gagal memperbarui kategori');
  }
}

/**
 * Deletes a parameter limit category.
 */
export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<IDeleteCategoryResult>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const result = await parameterLimitCategoryService.deleteCategory(
      actor,
      id
    );

    revalidatePath('/admin/parameter-limits');
    revalidatePath('/projects');

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.DeleteCategory:`, error);
    return err(error, 'Gagal menghapus kategori');
  }
}

/**
 * Batch upserts parameter limits within a category.
 */
export async function upsertCategoryLimitsAction(
  data: TUpsertParameterLimitsBatch
): Promise<ActionResult<IUpsertLimitsResult>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = UpsertParameterLimitsBatchSchema.parse(data);
    const result = await parameterLimitCategoryService.upsertCategoryLimits(
      actor,
      validated
    );

    revalidatePath(`/admin/parameter-limits/${data.categoryId}`);

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.UpsertCategoryLimits:`, error);
    return err(error, 'Gagal menyimpan batas parameter');
  }
}

/**
 * Copies limits from master parameter defaults to a category.
 */
export async function copyFromMasterDefaultsAction(
  data: TCopyFromMasterDefaults
): Promise<ActionResult<{ copied: number }>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = CopyFromMasterDefaultsSchema.parse(data);
    const result = await parameterLimitCategoryService.copyFromMasterDefaults(
      actor,
      validated
    );

    revalidatePath(`/admin/parameter-limits/${data.categoryId}`);

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.CopyFromMasterDefaults:`, error);
    return err(error, 'Gagal menyalin batas default');
  }
}

/**
 * Retrieves category usage statistics.
 */
export async function getCategoryStatsAction(
  id: string
): Promise<ActionResult<ICategoryStats>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const stats = await parameterLimitCategoryService.getCategoryStats(
      actor,
      id
    );
    return ok(stats);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetCategoryStats:`, error);
    return err(error, 'Gagal mengambil statistik kategori');
  }
}

/**
 * Retrieves categories for project form selector.
 */
export async function getCategoriesForSelectAction(): Promise<
  ActionResult<
    Array<Pick<IParameterLimitCategory, 'id' | 'name' | 'isDefault'>>
  >
> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const categories = await parameterLimitCategoryService.getCategories(actor);
    const selectOptions = categories.map(c => ({
      id: c.id,
      name: c.name,
      isDefault: c.isDefault,
    }));
    return ok(selectOptions);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetCategoriesForSelect:`, error);
    return err(error, 'Gagal mengambil daftar kategori');
  }
}
