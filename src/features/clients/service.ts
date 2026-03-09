import { prisma } from '@/lib/prisma';
import { TClientCreateInput, TClientUpdateInput } from '@/@types/client.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';

/**
 * Create a new client
 */
export async function createClient(
  actor: IJwtPayload,
  data: TClientCreateInput
) {
  ensureAccess(actor.role, RbacResource.CLIENTS, 'create');

  // Check for existing client with same name (including soft-deleted)
  const existingClient = await prisma.client.findFirst({
    where: {
      name: data.name,
    },
  });

  if (existingClient) {
    if (existingClient.deletedAt) {
      throw new Error(
        'Klien yang dihapus dengan nama ini sudah ada. Silakan gunakan nama lain, atau hubungi admin untuk memulihkan data.'
      );
    }
    throw new Error('Klien dengan nama ini sudah ada');
  }

  const client = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phoneNumber: data.phoneNumber ?? null,
      address: data.address ?? null,
      website: data.website ?? null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      website: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  return client;
}

/**
 * Get all non-deleted clients
 */
export async function getAllClients(actor: IJwtPayload) {
  ensureAccess(actor.role, RbacResource.CLIENTS, 'read');

  const clients = await prisma.client.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      website: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return clients;
}

/**
 * Get a single client by ID
 */
export async function getClientById(actor: IJwtPayload, id: string) {
  ensureAccess(actor.role, RbacResource.CLIENTS, 'read');

  const client = await prisma.client.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      website: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  if (!client) {
    throw new Error('Klien tidak ditemukan');
  }

  if (client.deletedAt) {
    throw new Error('Klien telah dihapus');
  }

  return client;
}

/**
 * Update client information
 */
export async function updateClient(
  actor: IJwtPayload,
  id: string,
  data: TClientUpdateInput
) {
  ensureAccess(actor.role, RbacResource.CLIENTS, 'update');

  // Check if client exists
  const existingClient = await prisma.client.findUnique({
    where: { id },
  });

  if (!existingClient) {
    throw new Error('Klien tidak ditemukan');
  }

  if (existingClient.deletedAt) {
    throw new Error('Tidak dapat memperbarui klien yang telah dihapus');
  }

  // Check name uniqueness if being updated
  if (data.name && data.name !== existingClient.name) {
    const duplicateClient = await prisma.client.findFirst({
      where: {
        name: data.name,
        NOT: { id },
        deletedAt: null,
      },
    });

    if (duplicateClient) {
      throw new Error('Nama klien sudah digunakan');
    }
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.website !== undefined && { website: data.website }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      website: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  return client;
}

/**
 * Soft delete a client by setting deletedAt timestamp
 */
export async function deleteClient(actor: IJwtPayload, id: string) {
  ensureAccess(actor.role, RbacResource.CLIENTS, 'delete');

  // Check if client exists
  const existingClient = await prisma.client.findUnique({
    where: { id },
  });

  if (!existingClient) {
    throw new Error('Klien tidak ditemukan');
  }

  if (existingClient.deletedAt) {
    throw new Error('Klien sudah dihapus');
  }

  await prisma.client.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return { success: true };
}
