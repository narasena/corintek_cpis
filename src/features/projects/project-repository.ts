import { prisma } from '@/lib/prisma';

export interface IProjectRepository {
  findById(id: string): Promise<unknown | null>;
  findManyByIds(ids: string[]): Promise<unknown[]>;
}

class PrismaProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<unknown | null> {
    try {
      return await prisma.project.findUnique({ where: { id } });
    } catch (error) {
      console.error('[CPIS-ERROR] Projects.Repository.FindById:', error);
      throw error;
    }
  }

  async findManyByIds(ids: string[]): Promise<unknown[]> {
    if (!ids.length) return [];

    try {
      return await prisma.project.findMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      console.error('[CPIS-ERROR] Projects.Repository.FindManyByIds:', error);
      throw error;
    }
  }
}

export function getProjectRepository(): IProjectRepository {
  return new PrismaProjectRepository();
}
