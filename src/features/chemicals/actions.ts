'use server';

import {
  chemicalCreateSchema,
  chemicalUpdateSchema,
  TChemicalCreateInput,
  TChemicalUpdateInput,
  TChemical,
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
import { getCurrentUser } from '@/lib/auth-helpers';

type TActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server Action: Create a new chemical
 */
export async function createChemicalAction(
  input: TChemicalCreateInput
): Promise<TActionResponse<TChemical>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    // Validate input
    const validatedData = chemicalCreateSchema.parse(input);

    // Call service
    const chemical = await createChemical(actor, validatedData);

    // Revalidate chemical list pages
    revalidatePath('/chemicals');

    return {
      success: true,
      data: chemical,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Chemicals.Create:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat chemical',
    };
  }
}

/**
 * Server Action: Get all chemicals
 */
export async function getChemicalsAction(): Promise<
  TActionResponse<TChemical[]>
> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const chemicals = await getChemicalsForLogSheet(actor);
    return {
      success: true,
      data: chemicals || [],
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Chemicals.getChemicalsAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data chemical',
    };
  }
}

/**
 * Server Action: Update a chemical
 */
export async function updateChemicalAction(
  input: TChemicalUpdateInput
): Promise<TActionResponse<TChemical>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    // Validate input
    const validatedData = chemicalUpdateSchema.parse(input);

    // Call service
    const chemical = await updateChemical(actor, validatedData);

    // Revalidate chemical list pages
    revalidatePath('/chemicals');

    return {
      success: true,
      data: chemical,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Chemicals.Update:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal mengupdate chemical',
    };
  }
}

/**
 * Server Action: Delete a chemical
 */
export async function deleteChemicalAction(
  id: string
): Promise<TActionResponse<boolean>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id) throw new Error('ID required');

    await deleteChemical(actor, id);

    revalidatePath('/chemicals');

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Chemicals.Delete:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menghapus chemical',
    };
  }
}

/**
 * Server Action: Get all chemicals
 */
export async function getAllChemicalsAction(): Promise<
  TActionResponse<TChemical[]>
> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const chemicals = await getAllChemicals(actor);

    return {
      success: true,
      data: chemicals,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Chemicals.ListAll:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data chemical',
    };
  }
}

/**
 * Server Action: Get chemical by ID
 */
export async function getChemicalByIdAction(
  id: string
): Promise<TActionResponse<TChemical>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID chemical tidak valid');
    }

    const chemical = await getChemicalById(actor, id);

    return {
      success: true,
      data: chemical,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Chemicals.GetById:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data chemical',
    };
  }
}
