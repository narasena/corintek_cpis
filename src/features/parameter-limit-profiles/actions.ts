'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ok, err, unauthorized, type ActionResult } from '@/lib/action-helpers';
import { parameterLimitProfileService } from './service';
import {
  CreateParameterLimitProfileSchema,
  UpdateParameterLimitProfileSchema,
  UpsertParameterLimitsBatchSchema,
  CopyFromMasterDefaultsSchema,
  GetParameterLimitProfilesFilterSchema,
} from './types';
import type {
  IParameterLimitProfile,
  IProfileWithLimits,
  IProfileStats,
  ICreateProfileResult,
  IDeleteProfileResult,
  IUpsertLimitsResult,
  TCreateParameterLimitProfile,
  TUpdateParameterLimitProfile,
  TUpsertParameterLimitsBatch,
  TGetParameterLimitProfilesFilter,
  TCopyFromMasterDefaults,
} from './types';

// =============================================================================
// Parameter Limit Profile Actions
// =============================================================================

const LOG_PREFIX = '[CPIS-ERROR] ParameterLimitProfiles';

/**
 * Retrieves all parameter limit profiles.
 */
export async function getProfilesAction(
  filters?: TGetParameterLimitProfilesFilter
): Promise<ActionResult<IParameterLimitProfile[]>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validatedFilters = filters
      ? GetParameterLimitProfilesFilterSchema.parse(filters)
      : undefined;
    const profiles = await parameterLimitProfileService.getProfiles(
      actor,
      validatedFilters
    );
    return ok(profiles);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetProfiles:`, error);
    return err(error, 'Gagal mengambil daftar profil');
  }
}

/**
 * Retrieves a single profile with all its limits.
 */
export async function getProfileWithLimitsAction(
  id: string
): Promise<ActionResult<IProfileWithLimits>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const profile = await parameterLimitProfileService.getProfileWithLimits(
      actor,
      id
    );
    return ok(profile);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetProfileWithLimits:`, error);
    return err(error, 'Gagal mengambil detail profil');
  }
}

/**
 * Creates a new parameter limit profile.
 */
export async function createProfileAction(
  data: TCreateParameterLimitProfile
): Promise<ActionResult<ICreateProfileResult>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = CreateParameterLimitProfileSchema.parse(data);
    const result = await parameterLimitProfileService.createProfile(
      actor,
      validated
    );

    revalidatePath('/parameters');
    if (data.isDefault) {
      revalidatePath('/projects');
    }

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.CreateProfile:`, error);
    return err(error, 'Gagal membuat profil');
  }
}

/**
 * Updates an existing parameter limit profile.
 */
export async function updateProfileAction(
  data: TUpdateParameterLimitProfile
): Promise<ActionResult<IParameterLimitProfile>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = UpdateParameterLimitProfileSchema.parse(data);
    const profile = await parameterLimitProfileService.updateProfile(
      actor,
      validated
    );

    revalidatePath('/parameters');
    revalidatePath(`/parameters/profiles/${data.id}`);
    if ('isDefault' in validated) {
      revalidatePath('/projects');
    }

    return ok(profile);
  } catch (error) {
    console.error(`${LOG_PREFIX}.UpdateProfile:`, error);
    return err(error, 'Gagal memperbarui profil');
  }
}

/**
 * Deletes a parameter limit profile.
 */
export async function deleteProfileAction(
  id: string
): Promise<ActionResult<IDeleteProfileResult>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const result = await parameterLimitProfileService.deleteProfile(actor, id);

    revalidatePath('/parameters');
    revalidatePath('/projects');

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.DeleteProfile:`, error);
    return err(error, 'Gagal menghapus profil');
  }
}

/**
 * Batch upserts parameter limits within a profile.
 */
export async function upsertProfileLimitsAction(
  data: TUpsertParameterLimitsBatch
): Promise<ActionResult<IUpsertLimitsResult>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = UpsertParameterLimitsBatchSchema.parse(data);
    const result = await parameterLimitProfileService.upsertProfileLimits(
      actor,
      validated
    );

    revalidatePath(`/parameters/profiles/${data.profileId}`);

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.UpsertProfileLimits:`, error);
    return err(error, 'Gagal menyimpan batas parameter');
  }
}

/**
 * Copies limits from default profile to a new profile.
 */
export async function copyFromDefaultProfileAction(
  data: TCopyFromMasterDefaults
): Promise<ActionResult<{ copied: number }>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const validated = CopyFromMasterDefaultsSchema.parse(data);
    const result = await parameterLimitProfileService.copyFromMasterDefaults(
      actor,
      validated
    );

    revalidatePath(`/parameters/profiles/${data.profileId}`);

    return ok(result);
  } catch (error) {
    console.error(`${LOG_PREFIX}.CopyFromDefaultProfile:`, error);
    return err(error, 'Gagal menyalin batas default');
  }
}

/**
 * Retrieves profile usage statistics.
 */
export async function getProfileStatsAction(
  id: string
): Promise<ActionResult<IProfileStats>> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const stats = await parameterLimitProfileService.getProfileStats(actor, id);
    return ok(stats);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetProfileStats:`, error);
    return err(error, 'Gagal mengambil statistik profil');
  }
}

/**
 * Retrieves profiles for project form selector.
 */
export async function getProfilesForSelectAction(): Promise<
  ActionResult<Array<Pick<IParameterLimitProfile, 'id' | 'name' | 'isDefault'>>>
> {
  const actor = await getCurrentUser();
  if (!actor) return unauthorized();

  try {
    const profiles = await parameterLimitProfileService.getProfiles(actor);
    const selectOptions = profiles.map(p => ({
      id: p.id,
      name: p.name,
      isDefault: p.isDefault,
    }));
    return ok(selectOptions);
  } catch (error) {
    console.error(`${LOG_PREFIX}.GetProfilesForSelect:`, error);
    return err(error, 'Gagal mengambil daftar profil');
  }
}
