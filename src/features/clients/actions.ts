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
import { actionFactory } from '@/features/auth/di';
import { z } from 'zod/v4';
import { RbacResource } from '@/lib/rbac';

/**
 * Server Action: Create a new client
 */
export const createClientAction = actionFactory.protected(
  async ({ input, actor }) => {
    const client = await createClient(actor, input);
    revalidatePath('/clients');
    return client;
  },
  {
    schema: clientCreateSchema,
    metadata: { rbac: { resource: RbacResource.CLIENTS, capability: 'create' } },
  }
);

/**
 * Server Action: Get all clients
 */
export const getAllClientsAction = actionFactory.protected(
  async ({ actor }) => {
    return getAllClients(actor);
  },
  {
    metadata: { rbac: { resource: RbacResource.CLIENTS, capability: 'read' } },
  }
);

/**
 * Server Action: Get client by ID
 */
export const getClientByIdAction = actionFactory.protected(
  async ({ input, actor }) => {
    return getClientById(actor, input);
  },
  {
    schema: z.string().min(1, 'ID klien tidak valid'),
    metadata: { rbac: { resource: RbacResource.CLIENTS, capability: 'read' } },
  }
);

/**
 * Server Action: Update client
 */
export const updateClientAction = actionFactory.protected(
  async ({ input, actor }) => {
    const client = await updateClient(actor, input.id, input.data);
    revalidatePath('/clients');
    revalidatePath(`/clients/${input.id}`);
    return client;
  },
  {
    schema: z.object({
      id: z.string().min(1, 'ID klien tidak valid'),
      data: clientUpdateSchema,
    }),
    metadata: { rbac: { resource: RbacResource.CLIENTS, capability: 'update' } },
  }
);

/**
 * Server Action: Delete client (soft delete)
 */
export const deleteClientAction = actionFactory.protected(
  async ({ input, actor }) => {
    await deleteClient(actor, input);
    revalidatePath('/clients');
    return { id: input };
  },
  {
    schema: z.string().min(1, 'ID klien tidak valid'),
    metadata: { rbac: { resource: RbacResource.CLIENTS, capability: 'delete' } },
  }
);
