import { prisma } from '@/lib/prisma';
import type {
  IWorkReportRepository,
  IWorkReportSnapshot,
  IWorkReportSignature,
  TWorkReportStatus,
} from './signature';

type WorkReportSignatureRow = {
  id: string;
  projectId: string;
  status: TWorkReportStatus;
  technicianSignatureUrl: string | null;
  technicianSignedAt: Date | null;
  technicianSignedByUserId: string | null;
  clientPicSignatureUrl: string | null;
  clientPicSignedAt: Date | null;
  clientPicSignedByUserId: string | null;
};

const workReportSignatureSelect = {
  id: true,
  projectId: true,
  status: true,
  technicianSignatureUrl: true,
  technicianSignedAt: true,
  technicianSignedByUserId: true,
  clientPicSignatureUrl: true,
  clientPicSignedAt: true,
  clientPicSignedByUserId: true,
} as const;

function mapRowToSnapshot(row: WorkReportSignatureRow): IWorkReportSnapshot {
  let technicianSignature: IWorkReportSignature | null = null;
  if (
    row.technicianSignatureUrl &&
    row.technicianSignedAt &&
    row.technicianSignedByUserId
  ) {
    technicianSignature = {
      workReportId: row.id,
      role: 'TECHNICIAN',
      signerUserId: row.technicianSignedByUserId,
      signatureUrl: row.technicianSignatureUrl,
      signedAt: row.technicianSignedAt,
    };
  }

  let clientPicSignature: IWorkReportSignature | null = null;
  if (
    row.clientPicSignatureUrl &&
    row.clientPicSignedAt &&
    row.clientPicSignedByUserId
  ) {
    clientPicSignature = {
      workReportId: row.id,
      role: 'CLIENT_PIC',
      signerUserId: row.clientPicSignedByUserId,
      signatureUrl: row.clientPicSignatureUrl,
      signedAt: row.clientPicSignedAt,
    };
  }

  return {
    id: row.id,
    projectId: row.projectId,
    status: row.status,
    technicianSignature,
    clientPicSignature,
  };
}

function buildSignatureUpdateData(signature: IWorkReportSignature) {
  if (signature.role === 'TECHNICIAN') {
    return {
      technicianSignatureUrl: signature.signatureUrl,
      technicianSignedAt: signature.signedAt,
      technicianSignedByUserId: signature.signerUserId,
    };
  }

  return {
    clientPicSignatureUrl: signature.signatureUrl,
    clientPicSignedAt: signature.signedAt,
    clientPicSignedByUserId: signature.signerUserId,
  };
}

export function createPrismaWorkReportSignatureRepository(): IWorkReportRepository {
  return {
    async getByIdForSignature(id) {
      const row = await prisma.workReport.findFirst({
        where: { id, deletedAt: null },
        select: workReportSignatureSelect,
      });

      if (!row) {
        return null;
      }

      return mapRowToSnapshot({
        ...(row as WorkReportSignatureRow),
        status: row.status as TWorkReportStatus,
      });
    },

    async saveSignature(signature) {
      const existing = await prisma.workReport.findFirst({
        where: { id: signature.workReportId, deletedAt: null },
        select: { id: true },
      });

      if (!existing) {
        throw new Error('Work report tidak ditemukan');
      }

      const updated = await prisma.workReport.update({
        where: { id: signature.workReportId },
        data: buildSignatureUpdateData(signature),
        select: workReportSignatureSelect,
      });

      return mapRowToSnapshot({
        ...(updated as WorkReportSignatureRow),
        status: updated.status as TWorkReportStatus,
      });
    },

    async updateStatus(
      id,
      status,
      _submittedByUserId,
      approvedByUserId
    ): Promise<IWorkReportSnapshot> {
      const existing = await prisma.workReport.findFirst({
        where: { id, deletedAt: null },
        select: { id: true },
      });

      if (!existing) {
        throw new Error('Work report tidak ditemukan');
      }

      const data: Record<string, unknown> = { status };
      if (status === 'APPROVED' && approvedByUserId) {
        data.approvedAt = new Date();
        data.approvedByUserId = approvedByUserId;
      }

      const updated = await prisma.workReport.update({
        where: { id },
        data,
        select: workReportSignatureSelect,
      });

      return mapRowToSnapshot({
        ...(updated as WorkReportSignatureRow),
        status: updated.status as TWorkReportStatus,
      });
    },
  };
}
