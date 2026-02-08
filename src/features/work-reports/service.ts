import { prisma } from '@/lib/prisma';
import { CreateWorkReportInput, UpdateWorkReportInput } from './types';
import { WorkReportPhotoType } from '@/generated/prisma/client';

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
