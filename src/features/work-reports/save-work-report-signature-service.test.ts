import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock projects service before importing service
vi.mock('@/features/projects/service', () => ({
  assertCanAccessProject: vi.fn(),
}));

vi.mock('./signature-storage-r2', () => ({
  createR2WorkReportSignatureStorage: vi.fn(() => ({
    storeSignature: vi.fn(() => 'https://storage/signature.png'),
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    workReport: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    projectAssignment: {
      findMany: vi.fn(),
    },
  },
}));

import { saveWorkReportSignature } from './service';
import { prisma } from '@/lib/prisma';
import { assertCanAccessProject } from '@/features/projects/service';
import { createR2WorkReportSignatureStorage } from './signature-storage-r2';

describe('saveWorkReportSignature service', () => {
  const workReportId = 'wr-1';
  const projectId = 'proj-1';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
  });

  it('allows CLIENT_SUPERVISOR to sign as CLIENT_PIC (fallback)', async () => {
    vi.mocked(prisma.workReport.findUnique).mockResolvedValue({
      id: workReportId,
      projectId,
      status: 'DRAFT' as const,
    });

    const result = await saveWorkReportSignature(workReportId, {
      signatureDataUrl: 'data:image/png;base64,ABC',
      signedByUserId: 'user-123',
      role: 'CLIENT_PIC',
      actorRole: 'CLIENT_SUPERVISOR',
    });

    expect(result).toEqual({ projectId });
  });

  it('allows CLIENT_TECHNICIAN to sign as CLIENT_PIC without CLIENT_PIC assignment', async () => {
    vi.mocked(prisma.workReport.findUnique).mockResolvedValue({
      id: workReportId,
      projectId,
      status: 'DRAFT' as const,
    });
    vi.mocked(prisma.projectAssignment.findMany).mockResolvedValue([]); // no assignment at all

    const result = await saveWorkReportSignature(workReportId, {
      signatureDataUrl: 'data:image/png;base64,ABC',
      signedByUserId: 'user-123',
      role: 'CLIENT_PIC',
      actorRole: 'CLIENT_TECHNICIAN',
    });

    expect(result).toEqual({ projectId });
  });

  it('denies TECHNICIAN without active TECHNICIAN assignment', async () => {
    vi.mocked(prisma.workReport.findUnique).mockResolvedValue({
      id: workReportId,
      projectId,
      status: 'DRAFT' as const,
    });
    vi.mocked(prisma.projectAssignment.findMany).mockResolvedValue([]); // no assignment

    await expect(
      saveWorkReportSignature(workReportId, {
        signatureDataUrl: 'data:image/png;base64,ABC',
        signedByUserId: 'user-123',
        role: 'TECHNICIAN',
        actorRole: 'TECHNICIAN',
      })
    ).rejects.toThrow('Hanya teknisi proyek atau supervisor yang dapat menandatangani');
  });

  it('allows TECHNICIAN with active TECHNICIAN assignment', async () => {
    vi.mocked(prisma.workReport.findUnique).mockResolvedValue({
      id: workReportId,
      projectId,
      status: 'DRAFT' as const,
    });
    vi.mocked(prisma.projectAssignment.findMany).mockResolvedValue([
      { role: 'TECHNICIAN' as const },
    ]);

    const result = await saveWorkReportSignature(workReportId, {
      signatureDataUrl: 'data:image/png;base64,ABC',
      signedByUserId: 'user-123',
      role: 'TECHNICIAN',
      actorRole: 'TECHNICIAN',
    });

    expect(result).toEqual({ projectId });
  });

  it('allows SUPERVISOR to sign as TECHNICIAN without assignment', async () => {
    vi.mocked(prisma.workReport.findUnique).mockResolvedValue({
      id: workReportId,
      projectId,
      status: 'DRAFT' as const,
    });

    const result = await saveWorkReportSignature(workReportId, {
      signatureDataUrl: 'data:image/png;base64,ABC',
      signedByUserId: 'user-123',
      role: 'TECHNICIAN',
      actorRole: 'SUPERVISOR',
    });

    expect(result).toEqual({ projectId });
    expect(prisma.workReport.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          technicianSignatureUrl: 'https://storage/signature.png',
          technicianSignedAt: expect.any(Date),
          technicianSignedByUserId: 'user-123',
        },
      })
    );
  });

  it('denies CLIENT_TECHNICIAN from signing as TECHNICIAN', async () => {
    vi.mocked(prisma.workReport.findUnique).mockResolvedValue({
      id: workReportId,
      projectId,
      status: 'DRAFT' as const,
    });

    await expect(
      saveWorkReportSignature(workReportId, {
        signatureDataUrl: 'data:image/png;base64,ABC',
        signedByUserId: 'user-123',
        role: 'TECHNICIAN',
        actorRole: 'CLIENT_TECHNICIAN',
      })
    ).rejects.toThrow('Hanya teknisi proyek atau supervisor yang dapat menandatangani');
  });

  it('allows ADMIN to sign any role (bypass)', async () => {
    vi.mocked(prisma.workReport.findUnique).mockResolvedValue({
      id: workReportId,
      projectId,
      status: 'DRAFT' as const,
    });

    const result = await saveWorkReportSignature(workReportId, {
      signatureDataUrl: 'data:image/png;base64,ABC',
      signedByUserId: 'admin-1',
      role: 'TECHNICIAN',
      actorRole: 'ADMIN',
    });

    expect(result).toEqual({ projectId });
  });
});
