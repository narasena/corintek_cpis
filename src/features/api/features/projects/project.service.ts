import { NextRequest } from 'next/server';
import { Prisma } from '../../generated/prisma';
import { prisma } from '../../connection/prisma';
import { AppError } from '@/lib/app-error';
import { IPersonnelGroup, TPersonnelDetail } from '@/types/project.type';

export async function fetchInternalPersonnelsService(req: NextRequest) {
  try {
    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
      role: {
        in: ['SUPERVISOR', 'TECHNICIAN'],
      },
    };

    const allPersonnels = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const groupedPersonnels = allPersonnels.reduce((acc, user) => {
      // Note: TypeScript should infer 'role' and other fields from 'user'
      // because it comes from the prisma.user.findMany result.
      const { role, ...personnelDetails } = user;

      // 1. Find the existing group
      // The type of 'acc' is now correctly inferred as PersonnelGroup[]
      let group = acc.find(item => item.role === role);

      // 2. If the group doesn't exist, create it and add it to the accumulator
      if (!group) {
        group = {
          role: role,
          personnels: [],
        };
        acc.push(group);
      }

      // 3. Push the user details to the group's personnels array
      // Since 'group' is guaranteed to be an object (either found or newly created),
      // the error 'group' is possibly 'undefined' is solved.
      group.personnels.push(personnelDetails as TPersonnelDetail);

      return acc;
      // 🔑 Crucial fix: Cast the initial empty array to the desired output type (PersonnelGroup[])
    }, [] as IPersonnelGroup[]);
    // ⭐️ FIX: Sort the grouped array to put 'SUPERVISOR' first
    groupedPersonnels.sort((a, b) => {
      // If 'a' is SUPERVISOR, it should come first (return -1)
      if (a.role === 'SUPERVISOR') {
        return -1;
      }
      // If 'b' is SUPERVISOR, it should come after 'a' (return 1)
      if (b.role === 'SUPERVISOR') {
        return 1;
      }
      // Otherwise, keep the order (return 0) or use default string comparison
      return 0; // Or a.role.localeCompare(b.role) if you have more than two roles
    });

    return groupedPersonnels;
  } catch (error) {
    console.error('Error fetching internal personnels:', error);
    throw new AppError({
      status: 500,
      message: 'Error fetching internal personnels',
      isExpose: true,
    });
  }
}
