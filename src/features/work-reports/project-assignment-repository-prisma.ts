import { prisma } from '@/lib/prisma';
import type {
  IProjectAssignment,
  IProjectAssignmentRepository,
} from './signature';

export function createPrismaProjectAssignmentRepository(): IProjectAssignmentRepository {
  return {
    async getActiveAssignmentsForUserOnProject(userId, projectId) {
      const rows = await prisma.projectAssignment.findMany({
        where: {
          userId,
          projectId,
          isActive: true,
        },
        select: {
          userId: true,
          projectId: true,
          role: true,
          isActive: true,
        },
      });

      return rows as IProjectAssignment[];
    },
  };
}
