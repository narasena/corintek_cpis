'use server';

import { revalidatePath } from 'next/cache';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import { parameterLimitProfileService } from './service';
import {
  CreateParameterLimitProfileSchema,
  UpdateParameterLimitProfileSchema,
  UpsertParameterLimitsBatchSchema,
  CopyFromMasterDefaultsSchema,
  GetParameterLimitProfilesFilterSchema,
} from './types';
import { z } from 'zod/v4';

// =============================================================================
// Parameter Limit Profile Actions
// =============================================================================

/**
 * Retrieves all parameter limit profiles.
 */
export const getProfilesAction = actionFactory.protected(
  async ({ input, actor }) => {
    return parameterLimitProfileService.getProfiles(actor, input);
  },
  {
    schema: GetParameterLimitProfilesFilterSchema.optional(),
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'read' } },
  }
);

/**
 * Retrieves a single profile with all its limits.
 */
export const getProfileWithLimitsAction = actionFactory.protected(
  async ({ input, actor }) => {
    return parameterLimitProfileService.getProfileWithLimits(actor, input);
  },
  {
    schema: z.string().uuid('ID profil tidak valid'),
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'read' } },
  }
);

/**
 * Creates a new parameter limit profile.
 */
export const createProfileAction = actionFactory.protected(
  async ({ input, actor }) => {
    const result = await parameterLimitProfileService.createProfile(actor, input);

    revalidatePath('/parameters');
    if (input.isDefault) {
      revalidatePath('/projects');
    }

    return result;
  },
  {
    schema: CreateParameterLimitProfileSchema,
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'create' } },
  }
);

/**
 * Updates an existing parameter limit profile.
 */
export const updateProfileAction = actionFactory.protected(
  async ({ input, actor }) => {
    const profile = await parameterLimitProfileService.updateProfile(actor, input);

    revalidatePath('/parameters');
    revalidatePath(`/parameters/profiles/${input.id}`);
    if ('isDefault' in input) {
      revalidatePath('/projects');
    }

    return profile;
  },
  {
    schema: UpdateParameterLimitProfileSchema,
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'update' } },
  }
);

/**
 * Deletes a parameter limit profile.
 */
export const deleteProfileAction = actionFactory.protected(
  async ({ input, actor }) => {
    const result = await parameterLimitProfileService.deleteProfile(actor, input);

    revalidatePath('/parameters');
    revalidatePath('/projects');

    return result;
  },
  {
    schema: z.string().uuid('ID profil tidak valid'),
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'delete' } },
  }
);

/**
 * Batch upserts parameter limits within a profile.
 */
export const upsertProfileLimitsAction = actionFactory.protected(
  async ({ input, actor }) => {
    const result = await parameterLimitProfileService.upsertProfileLimits(
      actor,
      input
    );

    revalidatePath(`/parameters/profiles/${input.profileId}`);

    return result;
  },
  {
    schema: UpsertParameterLimitsBatchSchema,
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'update' } },
  }
);

/**
 * Copies limits from default profile to a new profile.
 */
export const copyFromDefaultProfileAction = actionFactory.protected(
  async ({ input, actor }) => {
    const result = await parameterLimitProfileService.copyFromMasterDefaults(
      actor,
      input
    );

    revalidatePath(`/parameters/profiles/${input.profileId}`);

    return result;
  },
  {
    schema: CopyFromMasterDefaultsSchema,
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'update' } },
  }
);

/**
 * Retrieves profile usage statistics.
 */
export const getProfileStatsAction = actionFactory.protected(
  async ({ input, actor }) => {
    return parameterLimitProfileService.getProfileStats(actor, input);
  },
  {
    schema: z.string().uuid('ID profil tidak valid'),
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'read' } },
  }
);

/**
 * Retrieves profiles for project form selector.
 */
export const getProfilesForSelectAction = actionFactory.protected(
  async ({ actor }) => {
    const profiles = await parameterLimitProfileService.getProfiles(actor);
    return profiles.map(p => ({
      id: p.id,
      name: p.name,
      isDefault: p.isDefault,
    }));
  },
  {
    metadata: { rbac: { resource: RbacResource.PARAMETERS, capability: 'read' } },
  }
);
