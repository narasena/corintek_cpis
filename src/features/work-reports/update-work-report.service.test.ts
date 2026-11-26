/**
 * Regression tests for the P0 hardening of updateWorkReport:
 * status whitelist, no revert from SUBMITTED/APPROVED, no arbitrary fields.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    workReport: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { updateWorkReport } from './service';

const REPORT_ID = '323e4567-e89b-12d3-a456-426614174002';

const completeReport = {
  id: REPORT_ID,
  status: 'DRAFT',
  technicianSignatureUrl: 'https://r2/t.png',
  clientPicSignatureUrl: 'https://r2/c.png',
};

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    id: REPORT_ID,
    projectId: '123e4567-e89b-12d3-a456-426614174000',
    date: new Date('2026-01-15T00:00:00Z'),
    situation: 'Normal',
    workDone: 'Pengecekan',
    workResult: 'Baik',
    machineIds: [],
    ...overrides,
  } as Parameters<typeof updateWorkReport>[0];
}

describe('updateWorkReport status guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.workReport.findFirst).mockResolvedValue(
      completeReport as never
    );
    vi.mocked(prisma.workReport.update).mockResolvedValue(
      completeReport as never
    );
  });

  it('rejects APPROVED submitted through the JSON path', async () => {
    await expect(
      updateWorkReport(baseInput({ status: 'APPROVED' }))
    ).rejects.toThrow('Status laporan tidak valid');
    expect(prisma.workReport.update).not.toHaveBeenCalled();
  });

  it('preserves APPROVED status when an edit sends DRAFT', async () => {
    vi.mocked(prisma.workReport.findFirst).mockResolvedValue({
      ...completeReport,
      status: 'APPROVED',
    } as never);

    await updateWorkReport(baseInput({ status: 'DRAFT' }));

    const written = vi.mocked(prisma.workReport.update).mock.calls[0][0]
      .data as Record<string, unknown>;
    expect(written).not.toHaveProperty('status');
  });

  it('preserves SUBMITTED status when an edit sends DRAFT', async () => {
    vi.mocked(prisma.workReport.findFirst).mockResolvedValue({
      ...completeReport,
      status: 'SUBMITTED',
    } as never);

    await updateWorkReport(baseInput({ status: 'DRAFT' }));

    const written = vi.mocked(prisma.workReport.update).mock.calls[0][0]
      .data as Record<string, unknown>;
    expect(written).not.toHaveProperty('status');
  });

  it('rejects APPROVED even if the row is already APPROVED', async () => {
    vi.mocked(prisma.workReport.findFirst).mockResolvedValue({
      ...completeReport,
      status: 'DRAFT',
    } as never);

    await expect(
      updateWorkReport(baseInput({ status: 'APPROVED' }))
    ).rejects.toThrow('Status laporan tidak valid');
  });

  it('rejects SUBMITTED without both signatures', async () => {
    vi.mocked(prisma.workReport.findFirst).mockResolvedValue({
      ...completeReport,
      technicianSignatureUrl: null,
    } as never);

    await expect(
      updateWorkReport(baseInput({ status: 'SUBMITTED' }))
    ).rejects.toThrow(/Tanda tangan/);
  });

  it('allows submitting a DRAFT with both signatures', async () => {
    await updateWorkReport(baseInput({ status: 'SUBMITTED' }));

    expect(prisma.workReport.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SUBMITTED' }),
      })
    );
  });

  it('ignores fields outside the editable whitelist', async () => {
    await updateWorkReport(
      baseInput({
        technicianSignatureUrl: 'https://evil/t.png',
        clientPicSignatureUrl: 'https://evil/c.png',
        approvedAt: new Date(),
        approvedByUserId: 'attacker',
        deletedAt: new Date(),
      } as never)
    );

    const written = vi.mocked(prisma.workReport.update).mock.calls[0][0]
      .data as Record<string, unknown>;
    expect(written).not.toHaveProperty('technicianSignatureUrl');
    expect(written).not.toHaveProperty('clientPicSignatureUrl');
    expect(written).not.toHaveProperty('approvedAt');
    expect(written).not.toHaveProperty('approvedByUserId');
    expect(written).not.toHaveProperty('deletedAt');
  });

  it('rejects updating a soft-deleted report', async () => {
    vi.mocked(prisma.workReport.findFirst).mockResolvedValue(null as never);

    await expect(updateWorkReport(baseInput())).rejects.toThrow(
      'Work report tidak ditemukan'
    );
    expect(prisma.workReport.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: REPORT_ID, deletedAt: null },
      })
    );
  });
});
