import { prisma } from '@/lib/prisma';
import {
  TChemicalCreateInput,
  TChemicalUpdateInput,
} from '@/@types/chemical.type';

/**
 * Create a new chemical
 */
export async function createChemical(data: TChemicalCreateInput) {
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
export async function updateChemical(data: TChemicalUpdateInput) {
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
export async function deleteChemical(id: string) {
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
export async function getAllChemicals() {
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

/**
 * Get a single chemical by ID
 */
export async function getChemicalById(id: string) {
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
