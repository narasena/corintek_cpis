import { prisma } from '@/lib/prisma';
import {
  TChemicalCreateInput,
  TChemicalUpdateInput,
} from '@/@types/chemical.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';

/**
 * Create a new chemical
 */
export async function createChemical(
  actor: IJwtPayload,
  data: TChemicalCreateInput
) {
  ensureAccess(actor.role, RbacResource.CHEMICALS, 'create');

  // Check for existing chemical with same name
  const existingChemical = await prisma.chemical.findFirst({
    where: {
      name: data.name,
    },
  });

  if (existingChemical) {
    if (existingChemical.deletedAt) {
      throw new Error(
        'Chemical with this name already exists but was deleted. Please contact admin to restore.'
      );
    }
    throw new Error('Chemical with this name already exists');
  }

  const chemical = await prisma.chemical.create({
    data: {
      name: data.name,
      unit: data.unit ?? null,
      description: data.description ?? null,
      category: data.category,
    },
  });

  return chemical;
}

/**
 * Update a chemical
 */
export async function updateChemical(
  actor: IJwtPayload,
  data: TChemicalUpdateInput
) {
  ensureAccess(actor.role, RbacResource.CHEMICALS, 'update');

  const existingChemical = await prisma.chemical.findUnique({
    where: {
      id: data.id,
    },
  });

  if (!existingChemical) {
    throw new Error('Chemical not found');
  }

  // If name is changing, check for duplicates
  if (data.name && data.name !== existingChemical.name) {
    const duplicate = await prisma.chemical.findFirst({
      where: {
        name: data.name,
        id: { not: data.id },
      },
    });

    if (duplicate) {
      throw new Error('Chemical with this name already exists');
    }
  }

  const chemical = await prisma.chemical.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      unit: data.unit,
      description: data.description,
      category: data.category,
    },
  });

  return chemical;
}

/**
 * Delete a chemical (soft delete)
 */
export async function deleteChemical(actor: IJwtPayload, id: string) {
  ensureAccess(actor.role, RbacResource.CHEMICALS, 'delete');

  const chemical = await prisma.chemical.findUnique({
    where: { id },
  });

  if (!chemical) {
    throw new Error('Chemical not found');
  }

  await prisma.chemical.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return true;
}

/**
 * Get all non-deleted chemicals
 */
export async function getAllChemicals(actor: IJwtPayload) {
  ensureAccess(actor.role, RbacResource.CHEMICALS, 'read');

  const chemicals = await prisma.chemical.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return chemicals;
}

export async function getChemicalsForLogSheet(actor: IJwtPayload) {
  try {
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'read');

    const chemicals = await prisma.chemical.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return chemicals ?? [];
  } catch (error) {
    console.error('[CPIS-ERROR] Chemicals.getChemicalsForLogSheet:', error);
    throw error;
  }
}

/**
 * Get a single chemical by ID
 */
export async function getChemicalById(actor: IJwtPayload, id: string) {
  ensureAccess(actor.role, RbacResource.CHEMICALS, 'read');

  const chemical = await prisma.chemical.findUnique({
    where: {
      id,
    },
  });

  if (!chemical) {
    throw new Error('Chemical not found');
  }

  if (chemical.deletedAt) {
    throw new Error('Chemical has been deleted');
  }

  return chemical;
}
