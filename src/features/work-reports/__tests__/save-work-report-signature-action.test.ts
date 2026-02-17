import { describe, it, expect, vi, beforeEach } from 'vitest';

import { saveWorkReportSignatureAction } from '../actions';
import {
  createWorkReportSignatureModule,
  type TWorkReportSignatureRole,
} from '../signature';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth-helpers', () => ({
  getCurrentUserDetails: vi.fn(),
}));

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: { WORK_REPORTS: 'WORK_REPORTS' },
}));

vi.mock('../signature', () => {
  const actual = vi.importActual('../signature') as any;
  return {
    ...actual,
    createWorkReportSignatureModule: vi.fn(),
  };
});

const getCurrentUserDetailsMock = vi.mocked(
  await import('@/lib/auth-helpers').then(m => m.getCurrentUserDetails)
);

const ensureAccessMock = vi.mocked(
  await import('@/lib/rbac').then(m => m.ensureAccess)
);

const createModuleMock = vi.mocked(
  await import('../signature').then(m => m.createWorkReportSignatureModule)
);

function createSignatureModuleStub(projectId = 'project-1') {
  return {
    signatureService: {
      signWorkReport: vi.fn().mockResolvedValue({
        report: { id: 'wr-1', projectId },
      }),
    },
  } as unknown as ReturnType<typeof createWorkReportSignatureModule>;
}

describe('saveWorkReportSignatureAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Unauthorized when actor is missing', async () => {
    getCurrentUserDetailsMock.mockResolvedValue(null);

    const result = await saveWorkReportSignatureAction({
      workReportId: 'wr-1',
      signatureRole: 'TECHNICIAN' as TWorkReportSignatureRole,
      dataUrl: 'data:image/png;base64,AAA',
    });

    expect(result).toEqual({ success: false, message: 'Unauthorized' });
  });

  it('calls domain service and revalidates paths on success', async () => {
    getCurrentUserDetailsMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'TECHNICIAN',
    });

    const moduleStub = createSignatureModuleStub('project-123');
    createModuleMock.mockReturnValue(moduleStub);

    const result = await saveWorkReportSignatureAction({
      workReportId: 'wr-1',
      signatureRole: 'TECHNICIAN' as TWorkReportSignatureRole,
      dataUrl: 'data:image/png;base64,AAA',
    });

    expect(ensureAccessMock).toHaveBeenCalledWith(
      'TECHNICIAN',
      'WORK_REPORTS',
      'update'
    );

    expect(moduleStub.signatureService.signWorkReport).toHaveBeenCalledWith({
      actor: {
        userId: 'user-1',
        role: 'TECHNICIAN',
        email: 'user@example.com',
      },
      workReportId: 'wr-1',
      role: 'TECHNICIAN',
      dataUrl: 'data:image/png;base64,AAA',
    });

    expect(result).toEqual({ success: true });
  });

  it('returns validation error message when input is invalid', async () => {
    getCurrentUserDetailsMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'TECHNICIAN',
    });

    const result = await saveWorkReportSignatureAction({
      workReportId: 'not-a-uuid',
      signatureRole: 'TECHNICIAN' as TWorkReportSignatureRole,
      dataUrl: 'invalid-data-url',
    });

    expect(result.success).toBe(false);
    expect(typeof result.message).toBe('string');
  });

  it('propagates domain error message when signWorkReport throws', async () => {
    getCurrentUserDetailsMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'TECHNICIAN',
    });

    const moduleStub = createSignatureModuleStub('project-123');
    moduleStub.signatureService.signWorkReport = vi
      .fn()
      .mockRejectedValue(new Error('Domain error'));
    createModuleMock.mockReturnValue(moduleStub);

    const result = await saveWorkReportSignatureAction({
      workReportId: 'wr-1',
      signatureRole: 'TECHNICIAN' as TWorkReportSignatureRole,
      dataUrl: 'data:image/png;base64,AAA',
    });

    expect(result).toEqual({
      success: false,
      message: 'Domain error',
    });
  });
});
