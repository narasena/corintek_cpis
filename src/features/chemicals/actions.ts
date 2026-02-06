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
} from './service';
import { revalidatePath } from 'next/cache';

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
  try {
    // Validate input
    const validatedData = chemicalCreateSchema.parse(input);

    // Call service
    const chemical = await createChemical(validatedData);

    // Revalidate chemical list pages
    revalidatePath('/chemicals');

    return {
      success: true,
      data: chemical,
    };
  } catch (error) {
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
  try {
    const chemicals = await getAllChemicals();
    return {
      success: true,
      data: chemicals,
    };
  } catch (error) {
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
  try {
    // Validate input
    const validatedData = chemicalUpdateSchema.parse(input);

    // Call service
    const chemical = await updateChemical(validatedData);

    // Revalidate chemical list pages
    revalidatePath('/chemicals');

    return {
      success: true,
      data: chemical,
    };
  } catch (error) {
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
  try {
    if (!id) throw new Error('ID required');

    await deleteChemical(id);

    revalidatePath('/chemicals');

    return {
      success: true,
      data: true,
    };
  } catch (error) {
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
  try {
    const chemicals = await getAllChemicals();

    return {
      success: true,
      data: chemicals,
    };
  } catch (error) {
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
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID chemical tidak valid');
    }

    const chemical = await getChemicalById(id);

    return {
      success: true,
      data: chemical,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data chemical',
    };
  }
}
