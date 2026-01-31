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
import { revalidatePath } from 'next/cache';

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
  try {
    // Validate input
    const validatedData = clientCreateSchema.parse(input);

    // Call service
    const client = await createClient(validatedData);

    // Revalidate client list pages
    revalidatePath('/clients');

    return {
      success: true,
      data: client,
    };
  } catch (error) {
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
  try {
    const clients = await getAllClients();

    return {
      success: true,
      data: clients,
    };
  } catch (error) {
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
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID klien tidak valid');
    }

    const client = await getClientById(id);

    return {
      success: true,
      data: client,
    };
  } catch (error) {
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
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID klien tidak valid');
    }

    // Validate input
    const validatedData = clientUpdateSchema.parse(input);

    // Call service
    const client = await updateClient(id, validatedData);

    // Revalidate client pages
    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);

    return {
      success: true,
      data: client,
    };
  } catch (error) {
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
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID klien tidak valid');
    }

    await deleteClient(id);

    // Revalidate client pages
    revalidatePath('/clients');

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus klien',
    };
  }
}
