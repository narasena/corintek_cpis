'use server';

import {
  clientCreateSchema,
  clientUpdateSchema,
  TClientCreateInput,
  TClientUpdateInput,
  TClientResponse,
} from '@/@types/client.type';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from './service';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ECacheTag } from '../cache/tags';

type TActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server Action: Create a new client
 */
export async function createClientAction(
  input: TClientCreateInput
): Promise<TActionResponse<TClientResponse>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    // Validate input
    const validatedData = clientCreateSchema.parse(input);

    // Call service
    const client = await createClient(actor, validatedData);

    // CG-05: Cache invalidation - tag-based
    revalidateTag(ECacheTag.CLIENTS, 'max');
    // revalidatePath('/clients'); // fallback

    return {
      success: true,
      data: client,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Clients.Create:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat klien',
    };
  }
}

/**
 * Server Action: Get all clients
 */
export async function getAllClientsAction(): Promise<
  TActionResponse<TClientResponse[]>
> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const clients = await getAllClients(actor);

    return {
      success: true,
      data: clients,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Clients.List:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal mengambil data klien',
    };
  }
}

/**
 * Server Action: Get client by ID
 */
export async function getClientByIdAction(
  id: string
): Promise<TActionResponse<TClientResponse>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID klien tidak valid');
    }

    const client = await getClientById(actor, id);

    return {
      success: true,
      data: client,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Clients.GetById:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal mengambil data klien',
    };
  }
}

/**
 * Server Action: Update client
 */
export async function updateClientAction(
  id: string,
  input: TClientUpdateInput
): Promise<TActionResponse<TClientResponse>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID klien tidak valid');
    }

    // Validate input
    const validatedData = clientUpdateSchema.parse(input);

    // Call service
    const client = await updateClient(actor, id, validatedData);

    // CG-05: Cache invalidation - tag-based
    revalidateTag(ECacheTag.CLIENTS, 'max');
    // revalidatePath('/clients'); // fallback
    // revalidatePath(`/clients/${id}`); // fallback for detail page

    return {
      success: true,
      data: client,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Clients.Update:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memperbarui klien',
    };
  }
}

/**
 * Server Action: Delete client (soft delete)
 */
export async function deleteClientAction(id: string): Promise<TActionResponse> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID klien tidak valid');
    }

    await deleteClient(actor, id);

    // CG-05: Cache invalidation - tag-based
    revalidateTag(ECacheTag.CLIENTS, 'max');
    // revalidatePath('/clients'); // fallback

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Clients.Delete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus klien',
    };
  }
}
