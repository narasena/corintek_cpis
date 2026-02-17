import { prisma } from '@/lib/prisma';
import { CreateWorkReportInput, UpdateWorkReportInput } from './types';
import { WorkReportPhotoType } from '@/generated/prisma/client';
import type { IJwtPayload } from '@/@types/auth.type';
import * as projectService from '@/features/projects/service';
import { assertValidStatusTransition } from '@/features/work-reports/status-policy';

export async function getWorkReportsByProject(projectId: string) {
  return await prisma.workReport.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    include: {
      machines: true,
      photos: {
        where: { deletedAt: null },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}

export async function getWorkReportById(id: string) {
  return await prisma.workReport.findUnique({
    where: { id },
    include: {
      project: true,
      machines: true,
      photos: {
        where: { deletedAt: null },
      },
    },
  });
}

export async function createWorkReport(data: CreateWorkReportInput) {
  const { machineIds, ...rest } = data;
  return await prisma.workReport.create({
    data: {
      ...rest,
      status: rest.status ?? 'DRAFT',
      machines: {
        connect: machineIds?.map(id => ({ id })) || [],
      },
    },
  });
}

export async function updateWorkReport(data: UpdateWorkReportInput) {
  const { id, machineIds, ...rest } = data;
  return await prisma.workReport.update({
    where: { id },
    data: {
      ...rest,
      machines: {
        set: [], // Clear existing relations
        connect: machineIds?.map(id => ({ id })) || [],
      },
    },
  });
}

export async function updateWorkReportStatus(
  actor: IJwtPayload,
  id: string,
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED'
) {
  const row = await prisma.workReport.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, projectId: true, status: true },
  });

  if (!row) {
    throw new Error('Work report tidak ditemukan');
  }

  await projectService.assertCanAccessProject(actor, row.projectId);

  const isProjectPic =
    actor.role === 'ADMIN'
      ? true
      : !!(await prisma.projectAssignment.findFirst({
          where: {
            projectId: row.projectId,
            userId: actor.id,
            isActive: true,
            role: 'PROJECT_PIC',
          },
          select: { id: true },
        }));

  const current = row.status as any;

  if (status === current) {
    return await prisma.workReport.findFirst({ where: { id: row.id } });
  }
  assertValidStatusTransition(current, status, { isProjectPic });

  return await prisma.workReport.update({
    where: { id: row.id },
    data: {
      status,
      ...(status === 'APPROVED'
        ? { approvedAt: new Date(), approvedByUserId: actor.id }
        : {}),
    },
  });
}

export async function deleteWorkReport(id: string) {
  return await prisma.workReport.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function addWorkReportPhoto(
  workReportId: string,
  url: string,
  caption?: string,
  type: WorkReportPhotoType = 'GENERAL'
) {
  return await prisma.workReportPhoto.create({
    data: {
      workReportId,
      url,
      caption,
      type,
    },
  });
}

export async function deleteWorkReportPhoto(id: string) {
  return await prisma.workReportPhoto.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
