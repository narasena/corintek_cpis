import { prisma } from '@/lib/prisma';
import { CreateWorkReportInput, UpdateWorkReportInput } from './types';
import { WorkReportPhotoType } from '@/generated/prisma/client';
import type { IJwtPayload } from '@/@types/auth.type';
import * as projectService from '@/features/projects/service';
import { assertValidStatusTransition } from '@/features/work-reports/status-policy';
import { createR2WorkReportSignatureStorage } from './signature-storage-r2';
import type { TWorkReportSignatureRole } from './signature';

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
      status: 'DRAFT', // Always create as DRAFT; submission requires signatures
      machines: {
        connect: machineIds?.map(id => ({ id })) || [],
      },
    },
  });
}

export async function updateWorkReport(data: UpdateWorkReportInput) {
  const { id, machineIds, ...rest } = data;

  // If transitioning to SUBMITTED, ensure required signatures exist
  if (data.status === 'SUBMITTED') {
    const existing = await prisma.workReport.findUnique({
      where: { id },
      select: {
        status: true,
        technicianSignatureUrl: true,
        clientPicSignatureUrl: true,
      },
    });

    if (!existing) {
      throw new Error('Work report tidak ditemukan');
    }

    // Only enforce if not already SUBMITTED (idempotent)
    if (existing.status !== 'SUBMITTED') {
      if (!existing.technicianSignatureUrl || !existing.clientPicSignatureUrl) {
        throw new Error('Tanda tangan teknisi dan PIC klien wajib sebelum submit');
      }
    }
  }

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
    select: {
      id: true,
      projectId: true,
      status: true,
      technicianSignatureUrl: true,
      clientPicSignatureUrl: true,
    },
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

  // Additional validation for SUBMITTED: both signatures required
  if (status === 'SUBMITTED') {
    if (!row.technicianSignatureUrl || !row.clientPicSignatureUrl) {
      throw new Error('Tanda tangan teknisi dan PIC klien wajib sebelum submit');
    }
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

export async function saveWorkReportSignature(
  workReportId: string,
  data: {
    signatureDataUrl: string;
    signedByUserId: string;
    role: TWorkReportSignatureRole;
    actorRole: string;
  }
) {
  const { signatureDataUrl, signedByUserId, role, actorRole } = data;

  // Fetch work report for projectId and status
  const workReport = await prisma.workReport.findUnique({
    where: { id: workReportId },
    select: { projectId: true, status: true },
  });

  if (!workReport) {
    throw new Error('Work report tidak ditemukan');
  }

  // Ensure work report is in DRAFT status for signing
  if (workReport.status !== 'DRAFT') {
    throw new Error('Work report sudah dikirim dan tidak bisa ditandatangani');
  }

  // Verify actor can access this project (must be assigned)
  await projectService.assertCanAccessProject(
    { id: signedByUserId, role: actorRole } as IJwtPayload,
    workReport.projectId
  );

  // Authorization: verify user has appropriate role
  if (actorRole !== 'ADMIN') {
    if (role === 'TECHNICIAN') {
      // Only internal TECHNICIAN with active assignment, or SUPERVISOR, can sign as technician
      const isSupervisor = actorRole === 'SUPERVISOR';
      let isTechnician = false;
      if (actorRole === 'TECHNICIAN') {
        const assignments = await prisma.projectAssignment.findMany({
          where: {
            userId: signedByUserId,
            projectId: workReport.projectId,
            isActive: true,
          },
          select: { role: true },
        });
        isTechnician = assignments.some(a => a.role === 'TECHNICIAN');
      }
      if (!isTechnician && !isSupervisor) {
        throw new Error('Hanya teknisi proyek atau supervisor yang dapat menandatangani');
      }
    } else {
      // CLIENT_PIC: both CLIENT_TECHNICIAN and CLIENT_SUPERVISOR are allowed
      const isClientRole =
        actorRole === 'CLIENT_TECHNICIAN' || actorRole === 'CLIENT_SUPERVISOR';
      if (!isClientRole) {
        throw new Error('Hanya PIC klien proyek atau supervisor klien yang dapat menandatangani');
      }
    }
  }

  // Upload signature to R2 storage
  const storage = createR2WorkReportSignatureStorage();
  const signatureUrl = await storage.storeSignature(
    workReport.projectId,
    workReportId,
    role,
    signatureDataUrl
  );

  // Update work report with signature URL and metadata
  const updateData =
    role === 'TECHNICIAN'
      ? {
          technicianSignatureUrl: signatureUrl,
          technicianSignedAt: new Date(),
          technicianSignedByUserId: signedByUserId,
        }
      : {
          clientPicSignatureUrl: signatureUrl,
          clientPicSignedAt: new Date(),
          clientPicSignedByUserId: signedByUserId,
        };

  await prisma.workReport.update({
    where: { id: workReportId },
    data: updateData,
  });

  return { projectId: workReport.projectId };
}
