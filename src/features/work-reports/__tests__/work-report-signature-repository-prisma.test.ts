import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createPrismaWorkReportSignatureRepository } from '../work-report-signature-repository-prisma';
import type { IWorkReportSignature } from '../signature';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      workReport: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

const prismaMock = vi.mocked(await import('@/lib/prisma').then(m => m.prisma));

function createSignature(
  overrides: Partial<IWorkReportSignature> = {}
): IWorkReportSignature {
  return {
    workReportId: 'wr-1',
    role: 'TECHNICIAN',
    signerUserId: 'user-1',
    signatureUrl: 'https://example.com/signature.png',
    signedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('createPrismaWorkReportSignatureRepository.saveSignature', () => {
  beforeEach(() => {
    prismaMock.workReport.findFirst.mockReset();
    prismaMock.workReport.update.mockReset();
  });

  it('throws when work report does not exist', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue(null);

    const repo = createPrismaWorkReportSignatureRepository();
    await expect(repo.saveSignature(createSignature())).rejects.toThrowError(
      'Work report tidak ditemukan'
    );
  });

  it('persists technician signature and returns snapshot', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue({ id: 'wr-1' });

    const updatedRow = {
      id: 'wr-1',
      projectId: 'project-1',
      status: 'DRAFT',
      technicianSignatureUrl: 'https://example.com/tech.png',
      technicianSignedAt: new Date('2024-01-01T00:00:00.000Z'),
      technicianSignedByUserId: 'user-1',
      clientPicSignatureUrl: null,
      clientPicSignedAt: null,
      clientPicSignedByUserId: null,
    };

    prismaMock.workReport.update.mockResolvedValue(updatedRow);

    const signature = createSignature({
      role: 'TECHNICIAN',
      signatureUrl: updatedRow.technicianSignatureUrl,
      signedAt: updatedRow.technicianSignedAt,
      signerUserId: updatedRow.technicianSignedByUserId,
    });

    const repo = createPrismaWorkReportSignatureRepository();
    const snapshot = await repo.saveSignature(signature);

    expect(prismaMock.workReport.update).toHaveBeenCalledWith({
      where: { id: 'wr-1' },
      data: {
        technicianSignatureUrl: updatedRow.technicianSignatureUrl,
        technicianSignedAt: updatedRow.technicianSignedAt,
        technicianSignedByUserId: updatedRow.technicianSignedByUserId,
      },
      select: expect.any(Object),
    });

    expect(snapshot).toEqual({
      id: 'wr-1',
      projectId: 'project-1',
      status: 'DRAFT',
      technicianSignature: {
        workReportId: 'wr-1',
        role: 'TECHNICIAN',
        signerUserId: 'user-1',
        signatureUrl: 'https://example.com/tech.png',
        signedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      clientPicSignature: null,
    });
  });

  it('persists client PIC signature and returns snapshot', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue({ id: 'wr-1' });

    const updatedRow = {
      id: 'wr-1',
      projectId: 'project-1',
      status: 'SUBMITTED',
      technicianSignatureUrl: null,
      technicianSignedAt: null,
      technicianSignedByUserId: null,
      clientPicSignatureUrl: 'https://example.com/client.png',
      clientPicSignedAt: new Date('2024-02-01T00:00:00.000Z'),
      clientPicSignedByUserId: 'user-2',
    };

    prismaMock.workReport.update.mockResolvedValue(updatedRow);

    const signature = createSignature({
      role: 'CLIENT_PIC',
      signatureUrl: updatedRow.clientPicSignatureUrl,
      signedAt: updatedRow.clientPicSignedAt,
      signerUserId: updatedRow.clientPicSignedByUserId,
    });

    const repo = createPrismaWorkReportSignatureRepository();
    const snapshot = await repo.saveSignature(signature);

    expect(prismaMock.workReport.update).toHaveBeenCalledWith({
      where: { id: 'wr-1' },
      data: {
        clientPicSignatureUrl: updatedRow.clientPicSignatureUrl,
        clientPicSignedAt: updatedRow.clientPicSignedAt,
        clientPicSignedByUserId: updatedRow.clientPicSignedByUserId,
      },
      select: expect.any(Object),
    });

    expect(snapshot).toEqual({
      id: 'wr-1',
      projectId: 'project-1',
      status: 'SUBMITTED',
      technicianSignature: null,
      clientPicSignature: {
        workReportId: 'wr-1',
        role: 'CLIENT_PIC',
        signerUserId: 'user-2',
        signatureUrl: 'https://example.com/client.png',
        signedAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    });
  });

  it('returns both signatures when both are present', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue({ id: 'wr-1' });

    const updatedRow = {
      id: 'wr-1',
      projectId: 'project-1',
      status: 'SUBMITTED',
      technicianSignatureUrl: 'https://example.com/tech.png',
      technicianSignedAt: new Date('2024-01-01T00:00:00.000Z'),
      technicianSignedByUserId: 'user-1',
      clientPicSignatureUrl: 'https://example.com/client.png',
      clientPicSignedAt: new Date('2024-02-01T00:00:00.000Z'),
      clientPicSignedByUserId: 'user-2',
    };

    prismaMock.workReport.update.mockResolvedValue(updatedRow);

    const signature = createSignature({
      role: 'CLIENT_PIC',
      signatureUrl: updatedRow.clientPicSignatureUrl,
      signedAt: updatedRow.clientPicSignedAt,
      signerUserId: updatedRow.clientPicSignedByUserId,
    });

    const repo = createPrismaWorkReportSignatureRepository();
    const snapshot = await repo.saveSignature(signature);

    expect(snapshot.technicianSignature).toEqual({
      workReportId: 'wr-1',
      role: 'TECHNICIAN',
      signerUserId: 'user-1',
      signatureUrl: 'https://example.com/tech.png',
      signedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(snapshot.clientPicSignature).toEqual({
      workReportId: 'wr-1',
      role: 'CLIENT_PIC',
      signerUserId: 'user-2',
      signatureUrl: 'https://example.com/client.png',
      signedAt: new Date('2024-02-01T00:00:00.000Z'),
    });
  });
});

describe('createPrismaWorkReportSignatureRepository.updateStatus', () => {
  beforeEach(() => {
    prismaMock.workReport.findFirst.mockReset();
    prismaMock.workReport.update.mockReset();
  });

  it('throws when work report does not exist', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue(null);

    const repo = createPrismaWorkReportSignatureRepository();
    await expect(repo.updateStatus('wr-1', 'SUBMITTED')).rejects.toThrowError(
      'Work report tidak ditemukan'
    );
  });

  it('updates status and returns snapshot', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue({ id: 'wr-1' });

    const updatedRow = {
      id: 'wr-1',
      projectId: 'project-1',
      status: 'APPROVED',
      technicianSignatureUrl: 'https://example.com/tech.png',
      technicianSignedAt: new Date('2024-01-01T00:00:00.000Z'),
      technicianSignedByUserId: 'user-1',
      clientPicSignatureUrl: 'https://example.com/client.png',
      clientPicSignedAt: new Date('2024-02-01T00:00:00.000Z'),
      clientPicSignedByUserId: 'user-2',
    };

    prismaMock.workReport.update.mockResolvedValue(updatedRow);

    const repo = createPrismaWorkReportSignatureRepository();
    const snapshot = await repo.updateStatus(
      'wr-1',
      'APPROVED',
      null,
      'approver-1'
    );

    expect(prismaMock.workReport.update).toHaveBeenCalledWith({
      where: { id: 'wr-1' },
      data: expect.objectContaining({
        status: 'APPROVED',
        approvedByUserId: 'approver-1',
      }),
      select: expect.any(Object),
    });

    expect(snapshot).toEqual({
      id: 'wr-1',
      projectId: 'project-1',
      status: 'APPROVED',
      technicianSignature: {
        workReportId: 'wr-1',
        role: 'TECHNICIAN',
        signerUserId: 'user-1',
        signatureUrl: 'https://example.com/tech.png',
        signedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      clientPicSignature: {
        workReportId: 'wr-1',
        role: 'CLIENT_PIC',
        signerUserId: 'user-2',
        signatureUrl: 'https://example.com/client.png',
        signedAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    });
  });

  it('updates status without approval fields when not APPROVED', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue({ id: 'wr-1' });

    const updatedRow = {
      id: 'wr-1',
      projectId: 'project-1',
      status: 'SUBMITTED',
      technicianSignatureUrl: null,
      technicianSignedAt: null,
      technicianSignedByUserId: null,
      clientPicSignatureUrl: null,
      clientPicSignedAt: null,
      clientPicSignedByUserId: null,
    };

    prismaMock.workReport.update.mockResolvedValue(updatedRow);

    const repo = createPrismaWorkReportSignatureRepository();
    const snapshot = await repo.updateStatus('wr-1', 'SUBMITTED', null, null);

    expect(prismaMock.workReport.update).toHaveBeenCalledWith({
      where: { id: 'wr-1' },
      data: { status: 'SUBMITTED' },
      select: expect.any(Object),
    });

    expect(snapshot.status).toBe('SUBMITTED');
  });

  it('does not set approval fields when approvedByUserId is missing', async () => {
    prismaMock.workReport.findFirst.mockResolvedValue({ id: 'wr-1' });

    const updatedRow = {
      id: 'wr-1',
      projectId: 'project-1',
      status: 'APPROVED',
      technicianSignatureUrl: null,
      technicianSignedAt: null,
      technicianSignedByUserId: null,
      clientPicSignatureUrl: null,
      clientPicSignedAt: null,
      clientPicSignedByUserId: null,
    };

    prismaMock.workReport.update.mockResolvedValue(updatedRow);

    const repo = createPrismaWorkReportSignatureRepository();
    await repo.updateStatus('wr-1', 'APPROVED', null, undefined);

    expect(prismaMock.workReport.update).toHaveBeenCalledWith({
      where: { id: 'wr-1' },
      data: { status: 'APPROVED' },
      select: expect.any(Object),
    });
  });
});
