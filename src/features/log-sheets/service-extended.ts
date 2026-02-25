import { prisma } from '@/lib/prisma';

export async function fetchAllTechnicians() {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: ['TECHNICIAN', 'SUPERVISOR'] },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
    orderBy: [{ firstName: 'asc' }],
  });
  return users;
}

export async function fetchAllChemicals() {
  const chemicals = await prisma.chemical.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      unit: true,
    },
    orderBy: [{ name: 'asc' }],
  });
  return chemicals;
}
