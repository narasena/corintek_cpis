import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  IAuthContext,
  IWorkReportSnapshot,
  IWorkReportSignature,
  IWorkReportRepository,
  IWorkReportSigningPolicy,
  IWorkReportValidationService,
  ISignatureStorage,
} from './signature';
import { createWorkReportSignatureService } from './signature';

function createActor(overrides?: Partial<IAuthContext>): IAuthContext {
  return {
    userId: 'user-1',
    role: 'TECHNICIAN',
    email: 'user@example.com',
    ...overrides,
  };
}

function createReport(
  overrides?: Partial<IWorkReportSnapshot>
): IWorkReportSnapshot {
  return {
    id: 'wr-1',
    projectId: 'project-1',
    status: 'DRAFT',
    technicianSignature: null,
    clientPicSignature: null,
    ...overrides,
  };
}

describe('createWorkReportSignatureService.signWorkReport', () => {
  let repo: IWorkReportRepository;
  let signingPolicy: IWorkReportSigningPolicy;
  let validationService: IWorkReportValidationService;
  let storage: ISignatureStorage;

  beforeEach(() => {
    repo = {
      getByIdForSignature: vi.fn(),
      saveSignature: vi.fn(),
      updateStatus: vi.fn(),
    };

    signingPolicy = {
      assertCanSign: vi.fn(),
    };

    validationService = {
      assertValidForSubmission: vi.fn(),
      assertValidForApproval: vi.fn(),
    };

    storage = {
      storeSignature: vi.fn(),
    };
  });

  it('saves signature and returns updated report on success', async () => {
    const actor = createActor();
    const report = createReport();

    (repo.getByIdForSignature as any).mockResolvedValue(report);
    (storage.storeSignature as any).mockResolvedValue(
      'https://example.com/signature.png'
    );

    const updatedReport: IWorkReportSnapshot = {
      ...report,
      technicianSignature: {
        workReportId: report.id,
        role: 'TECHNICIAN',
        signerUserId: actor.userId,
        signatureUrl: 'https://example.com/signature.png',
        signedAt: new Date(),
      },
    };

    (repo.saveSignature as any).mockResolvedValue(updatedReport);

    const service = createWorkReportSignatureService({
      workReportRepository: repo,
      signingPolicy,
      validationService,
      signatureStorage: storage,
    });

    const result = await service.signWorkReport({
      actor,
      workReportId: report.id,
      role: 'TECHNICIAN',
      dataUrl: 'data:image/png;base64,AAA',
    });

    expect(repo.getByIdForSignature).toHaveBeenCalledWith(report.id);
    expect(signingPolicy.assertCanSign).toHaveBeenCalledWith(
      actor,
      report,
      'TECHNICIAN'
    );
    expect(storage.storeSignature).toHaveBeenCalledWith(
      report.projectId,
      report.id,
      'TECHNICIAN',
      'data:image/png;base64,AAA'
    );

    const savedSignature = (repo.saveSignature as any).mock
      .calls[0][0] as IWorkReportSignature;

    expect(savedSignature.workReportId).toBe(report.id);
    expect(savedSignature.role).toBe('TECHNICIAN');
    expect(savedSignature.signerUserId).toBe(actor.userId);
    expect(savedSignature.signatureUrl).toBe(
      'https://example.com/signature.png'
    );
    expect(savedSignature.signedAt).toBeInstanceOf(Date);

    expect(result.report).toBe(updatedReport);
  });

  it('throws when work report is not found', async () => {
    const actor = createActor();

    (repo.getByIdForSignature as any).mockResolvedValue(null);

    const service = createWorkReportSignatureService({
      workReportRepository: repo,
      signingPolicy,
      validationService,
      signatureStorage: storage,
    });

    await expect(
      service.signWorkReport({
        actor,
        workReportId: 'missing-id',
        role: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,AAA',
      })
    ).rejects.toThrow('Work report tidak ditemukan');
  });

  it('propagates policy errors from assertCanSign', async () => {
    const actor = createActor();
    const report = createReport();

    (repo.getByIdForSignature as any).mockResolvedValue(report);
    (signingPolicy.assertCanSign as any).mockRejectedValue(
      new Error('Forbidden')
    );

    const service = createWorkReportSignatureService({
      workReportRepository: repo,
      signingPolicy,
      validationService,
      signatureStorage: storage,
    });

    await expect(
      service.signWorkReport({
        actor,
        workReportId: report.id,
        role: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,AAA',
      })
    ).rejects.toThrow('Forbidden');
  });

  it('propagates storage errors from storeSignature', async () => {
    const actor = createActor();
    const report = createReport();

    (repo.getByIdForSignature as any).mockResolvedValue(report);
    (storage.storeSignature as any).mockRejectedValue(
      new Error('Upload failed')
    );

    const service = createWorkReportSignatureService({
      workReportRepository: repo,
      signingPolicy,
      validationService,
      signatureStorage: storage,
    });

    await expect(
      service.signWorkReport({
        actor,
        workReportId: report.id,
        role: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,AAA',
      })
    ).rejects.toThrow('Upload failed');
  });
});
