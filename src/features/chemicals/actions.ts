'use server';

import {
  chemicalCreateSchema,
  chemicalUpdateSchema,
} from '@/@types/chemical.type';
import {
  createChemical,
  getAllChemicals,
  getChemicalById,
  updateChemical,
  deleteChemical,
  getChemicalsForLogSheet,
} from './service';
import { revalidatePath } from 'next/cache';
import { actionFactory } from '@/features/auth/di';
import { z } from 'zod/v4';
import { RbacResource } from '@/lib/rbac';

/**
 * Server Action: Create a new chemical
 */
export const createChemicalAction = actionFactory.protected(
  async ({ input, actor }) => {
    const chemical = await createChemical(actor, input);
    revalidatePath('/chemicals');
    return chemical;
  },
  {
    schema: chemicalCreateSchema,
    metadata: {
      rbac: { resource: RbacResource.CHEMICALS, capability: 'create' },
    },
  }
);

/**
 * Server Action: Get chemicals for log sheet selection
 */
export const getChemicalsAction = actionFactory.protected(
  async ({ actor }) => {
    const chemicals = await getChemicalsForLogSheet(actor);
    return chemicals || [];
  },
  {
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'read' } },
  }
);

/**
 * Server Action: Update a chemical
 */
export const updateChemicalAction = actionFactory.protected(
  async ({ input, actor }) => {
    const chemical = await updateChemical(actor, input);
    revalidatePath('/chemicals');
    return chemical;
  },
  {
    schema: chemicalUpdateSchema,
    metadata: {
      rbac: { resource: RbacResource.CHEMICALS, capability: 'update' },
    },
  }
);

/**
 * Server Action: Delete a chemical
 */
export const deleteChemicalAction = actionFactory.protected(
  async ({ input, actor }) => {
    await deleteChemical(actor, input);
    revalidatePath('/chemicals');
    return true;
  },
  {
    schema: z.string().min(1, 'ID chemical wajib diisi'),
    metadata: {
      rbac: { resource: RbacResource.CHEMICALS, capability: 'delete' },
    },
  }
);

/**
 * Server Action: Get all chemicals (admin view)
 */
export const getAllChemicalsAction = actionFactory.protected(
  async ({ actor }) => {
    return getAllChemicals(actor);
  },
  {
    metadata: { rbac: { resource: RbacResource.CHEMICALS, capability: 'read' } },
  }
);

/**
 * Server Action: Get chemical by ID
 */
export const getChemicalByIdAction = actionFactory.protected(
  async ({ input, actor }) => {
    return getChemicalById(actor, input);
  },
  {
    schema: z.string().min(1, 'ID chemical tidak valid'),
    metadata: { rbac: { resource: RbacResource.CHEMICALS, capability: 'read' } },
  }
);
