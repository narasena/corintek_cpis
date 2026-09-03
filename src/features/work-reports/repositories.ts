import { prisma } from '@/lib/prisma';

export async function findDuplicateInProject({
  projectId,
  date,
}: {
  projectId: string;
  date: Date;
}) {
  return await prisma.workReport.findFirst({
    where: {
      deletedAt: null,
      projectId,
      date,
    },
  });
}
