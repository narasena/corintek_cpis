import { prisma } from '@/lib/prisma';

export async function findDuplicateInProject({
  projectId,
  date,
}: {
  projectId: string;
  date: Date;
}) {
  // Query whole-day range to match both old records (any timestamp) and new (midnight)
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + 86_400_000);
  return await prisma.workReport.findFirst({
    where: {
      deletedAt: null,
      projectId,
      date: { gte: startOfDay, lt: endOfDay },
    },
  });
}
