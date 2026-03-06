import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { IJwtPayload } from '@/@types/auth.type';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/features/log-sheets/service', () => ({
  getLogSheetsByProject: vi.fn(),
  getAllLogSheets: vi.fn(),
  createLogSheet: vi.fn(),
  updateLogSheet: vi.fn(),
  updateLogSheetStatus: vi.fn(),
  deleteLogSheet: vi.fn(),
  getLogSheetDetail: vi.fn(),
  getLogSheetProjectId: vi.fn(),
  upsertLogSheetEntries: vi.fn(),
  upsertLogSheetPhotos: vi.fn(),
  upsertLogSheetChemicalUsages: vi.fn(),
  upsertLogSheetMachines: vi.fn(),
  saveLogSheetSignature: vi.fn(),
  validateLogSheetForSubmission: vi.fn(),
  assertCanCreateLogSheet: vi.fn(),
}));

vi.mock('@/features/projects/service', () => ({
  assertCanAccessProject: vi.fn(),
  getAccessibleProjectIds: vi.fn(),
}));

vi.mock('@/features/auth/lib/user-context', () => ({
  getCurrentUserDetails: vi.fn(),
  requireActor: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    logSheet: { findUnique: vi.fn(), delete: vi.fn() },
    // Add other models if needed
  },
}));

vi.mock('@/lib/auth-helpers', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
  };
});

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: {
    LOG_SHEETS: 'LOG_SHEETS',
    REPORTS: 'REPORTS',
  },
}));

vi.mock('@/features/log-sheets/utils', () => ({
  isLogSheetEntryEmpty: vi.fn(entry => {
    if (entry.fileUrl) return false;
    if (entry.valueType === 'NUMBER') {
      return entry.numericValue === null || entry.numericValue === undefined;
    }
    if (entry.valueType === 'BOOLEAN') {
      return entry.boolValue === null || entry.boolValue === undefined;
    }
    if (entry.valueType === 'TEXT') {
      return (
        entry.textValue === null ||
        entry.textValue === undefined ||
        entry.textValue.trim() === ''
      );
    }
    return true;
  }),
}));

const originalFetch = global.fetch;

import { revalidatePath } from 'next/cache';
import * as logSheetService from '@/features/log-sheets/service';
import * as projectService from '@/features/projects/service';
import * as authHelpers from '@/lib/auth-helpers';
import * as userContext from '@/features/auth/lib/user-context';

import {
  getLogSheetsByProjectAction,
  getAllLogSheetsAction,
  createLogSheetAction,
  updateLogSheetAction,
  updateLogSheetAdminOverrideAction,
  updateLogSheetStatusAction,
  submitLogSheetAction,
  approveLogSheetAction,
  deleteLogSheetAction,
  getLogSheetDetailAction,
  saveLogSheetEntriesAction,
  saveLogSheetPhotosAction,
  saveLogSheetChemicalsAction,
  saveLogSheetMachinesAction,
  saveLogSheetSignatureAction,
  uploadLogSheetImageAction,
} from '@/features/log-sheets/actions';

import { ensureAccess } from '@/lib/rbac';

const mockRevalidatePath = revalidatePath as any;
const mockLogSheetService = logSheetService as any;
const mockProjectService = projectService as any;
const mockAuthHelpers = authHelpers as any;
const mockUserContext = userContext as any;

const validUUID = '123e4567-e89b-12d3-a456-426614174000';
const anotherUUID = '223e4567-e89b-12d3-a456-426614174001';

function createMockActor(overrides?: Partial<IJwtPayload>): IJwtPayload {
  return {
    id: validUUID,
    email: 'test@example.com',
    role: 'TECHNICIAN',
    ...overrides,
  };
}

import { AuthenticationError } from '@/lib/auth-helpers';
import {
  getCurrentUserDetails,
  requireActor,
} from '@/features/auth/lib/user-context';

function mockUser(role: string = 'TECHNICIAN') {
  const payload = {
    id: validUUID,
    email: 'test@example.com',
    role,
  };
  mockUserContext.getCurrentUserDetails.mockResolvedValue(payload);
  mockUserContext.requireActor.mockResolvedValue(payload);
}

function mockGuest() {
  mockUserContext.getCurrentUserDetails.mockResolvedValue(null);
  mockUserContext.requireActor.mockRejectedValue(new AuthenticationError());
}

beforeAll(() => {
  vi.stubEnv('DATABASE_URL', 'postgresql://user:password@localhost:5432/db');
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
  global.fetch = originalFetch;
});

describe('getLogSheetsByProjectAction (characterization)', () => {
  it('returns success with log sheets for valid project', async () => {
    mockUser('TECHNICIAN');
    const mockLogSheets = [{ id: validUUID, projectId: anotherUUID }];
    mockLogSheetService.getLogSheetsByProject.mockResolvedValue(mockLogSheets);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await getLogSheetsByProjectAction(anotherUUID);

    expect(result).toEqual({ success: true, data: mockLogSheets });
  });

  it('returns error for invalid projectId format', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await getLogSheetsByProjectAction('invalid-uuid');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error when user not authenticated', async () => {
    mockGuest();

    const result = await getLogSheetsByProjectAction(anotherUUID);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });
});

describe('getAllLogSheetsAction (characterization)', () => {
  it('returns all log sheets for user with access', async () => {
    mockUser('ADMIN');
    const mockLogSheets = [{ id: validUUID }];
    mockLogSheetService.getAllLogSheets.mockResolvedValue(mockLogSheets);
    mockProjectService.getAccessibleProjectIds.mockResolvedValue([anotherUUID]);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await getAllLogSheetsAction();

    expect(result).toEqual({ success: true, data: mockLogSheets });
  });

  it('calls getAccessibleProjectIds to filter results', async () => {
    mockUser('SUPERVISOR');
    mockLogSheetService.getAllLogSheets.mockResolvedValue([]);
    mockProjectService.getAccessibleProjectIds.mockResolvedValue([anotherUUID]);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await getAllLogSheetsAction();

    expect(mockProjectService.getAccessibleProjectIds).toHaveBeenCalled();
  });
});

describe('createLogSheetAction (characterization)', () => {
  it('creates log sheet and revalidates paths', async () => {
    mockUser('TECHNICIAN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.createLogSheet.mockResolvedValue(mockLogSheet);
    mockLogSheetService.assertCanCreateLogSheet.mockResolvedValue(undefined);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await createLogSheetAction({
      projectId: anotherUUID,
      date: '2024-01-15',
    });

    expect(result).toEqual({ success: true, data: mockLogSheet });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/log-sheets');
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/log-sheets/${anotherUUID}`
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/my-projects/${anotherUUID}`
    );
  });

  it('validates required fields', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await createLogSheetAction({});

    expect(result.success).toBe(false);
  });
});

describe('updateLogSheetAction (characterization)', () => {
  it('STRIPS status field from update data (SURPRISING BEHAVIOR)', async () => {
    mockUser('ADMIN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.updateLogSheet.mockResolvedValue(mockLogSheet);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetAction({
      id: validUUID,
      notes: 'Updated',
      status: 'SUBMITTED',
    });

    const callArgs = mockLogSheetService.updateLogSheet.mock.calls[0];
    expect(callArgs[1]).toMatchObject({
      id: validUUID,
      notes: 'Updated',
      status: undefined,
    });
  });

  it('revalidates multiple paths after update', async () => {
    mockUser('ADMIN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.updateLogSheet.mockResolvedValue(mockLogSheet);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetAction({ id: validUUID, notes: 'Updated' });

    expect(mockRevalidatePath).toHaveBeenCalledTimes(4);
  });
});

describe('updateLogSheetAdminOverrideAction (characterization)', () => {
  it('requires ADMIN role explicitly', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await updateLogSheetAdminOverrideAction({ id: validUUID });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('passes allowAdminOverride option for ADMIN user', async () => {
    mockUser('ADMIN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.updateLogSheet.mockResolvedValue(mockLogSheet);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetAdminOverrideAction({
      id: validUUID,
      notes: 'Override',
    });

    expect(mockLogSheetService.updateLogSheet).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { allowAdminOverride: true }
    );
  });
});

describe('updateLogSheetStatusAction (characterization)', () => {
  it('validates log sheet before SUBMITTED transition', async () => {
    mockUser('TECHNICIAN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.updateLogSheetStatus.mockResolvedValue(mockLogSheet);
    mockLogSheetService.getLogSheetDetail.mockResolvedValue({
      id: validUUID,
      entries: [],
      project: { assignments: [] },
    });
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetStatusAction({ id: validUUID, status: 'SUBMITTED' });

    expect(
      mockLogSheetService.validateLogSheetForSubmission
    ).toHaveBeenCalledWith(validUUID);
  });

  it('does not validate for APPROVED transition directly', async () => {
    mockUser('ADMIN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.updateLogSheetStatus.mockResolvedValue(mockLogSheet);
    mockLogSheetService.getLogSheetDetail.mockResolvedValue({
      id: validUUID,
      entries: [],
      project: { assignments: [] },
    });
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetStatusAction({ id: validUUID, status: 'APPROVED' });

    expect(
      mockLogSheetService.validateLogSheetForSubmission
    ).not.toHaveBeenCalled();
  });
});

describe('submitLogSheetAction (characterization)', () => {
  it('delegates to updateLogSheetStatusAction with SUBMITTED status', async () => {
    mockUser('TECHNICIAN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.updateLogSheetStatus.mockResolvedValue(mockLogSheet);
    mockLogSheetService.getLogSheetDetail.mockResolvedValue({
      id: validUUID,
      entries: [],
      project: { assignments: [] },
    });
    mockLogSheetService.validateLogSheetForSubmission.mockResolvedValue(
      undefined
    );
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await submitLogSheetAction(validUUID);

    expect(mockLogSheetService.updateLogSheetStatus).toHaveBeenCalledWith(
      expect.anything(),
      validUUID,
      'SUBMITTED'
    );
  });
});

describe('approveLogSheetAction (characterization)', () => {
  it('delegates to updateLogSheetStatusAction with APPROVED status', async () => {
    mockUser('ADMIN');
    const mockLogSheet = { id: validUUID, projectId: anotherUUID };
    mockLogSheetService.updateLogSheetStatus.mockResolvedValue(mockLogSheet);
    mockLogSheetService.getLogSheetDetail.mockResolvedValue({
      id: validUUID,
      entries: [],
      project: { assignments: [] },
    });
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await approveLogSheetAction(validUUID);

    expect(mockLogSheetService.updateLogSheetStatus).toHaveBeenCalledWith(
      expect.anything(),
      validUUID,
      'APPROVED'
    );
  });
});

describe('deleteLogSheetAction (characterization)', () => {
  it('soft deletes log sheet', async () => {
    mockUser('ADMIN');
    mockLogSheetService.deleteLogSheet.mockResolvedValue({
      projectId: anotherUUID,
    });
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await deleteLogSheetAction(validUUID);

    expect(result).toEqual({ success: true });
    expect(mockLogSheetService.deleteLogSheet).toHaveBeenCalledWith(validUUID);
  });

  it('validates UUID format', async () => {
    mockUser('ADMIN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await deleteLogSheetAction('invalid-uuid');

    expect(result.success).toBe(false);
  });
});

describe('getLogSheetDetailAction (characterization)', () => {
  it('returns detail with viewerRole', async () => {
    mockUser('TECHNICIAN');
    const mockDetail = {
      logSheet: { id: validUUID },
      project: { id: anotherUUID },
      entries: [],
      parameters: [],
    };
    mockLogSheetService.getLogSheetDetail.mockResolvedValue(mockDetail);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await getLogSheetDetailAction(validUUID);

    expect(result.success).toBe(true);
    expect((result as any).data.viewerRole).toBe('TECHNICIAN');
  });
});

describe('saveLogSheetEntriesAction (characterization)', () => {
  it('skips empty entries before validation (SURPRISING: empty check before schema)', async () => {
    mockUser('TECHNICIAN');
    mockLogSheetService.upsertLogSheetEntries.mockResolvedValue(undefined);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});
    const { isLogSheetEntryEmpty } = await import(
      '@/features/log-sheets/utils'
    );
    vi.mocked(isLogSheetEntryEmpty).mockReturnValue(true);

    await saveLogSheetEntriesAction({
      logSheetId: validUUID,
      entries: [
        { parameterId: anotherUUID, valueType: 'NUMBER', numericValue: null },
      ],
    });

    expect(isLogSheetEntryEmpty).toHaveBeenCalled();
  });

  it('passes adminOverride option for ADMIN users', async () => {
    mockUser('ADMIN');
    mockLogSheetService.upsertLogSheetEntries.mockResolvedValue(undefined);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});
    const { isLogSheetEntryEmpty } = await import(
      '@/features/log-sheets/utils'
    );
    vi.mocked(isLogSheetEntryEmpty).mockReturnValue(false);

    await saveLogSheetEntriesAction({
      logSheetId: validUUID,
      adminOverride: true,
      entries: [
        { parameterId: anotherUUID, valueType: 'NUMBER', numericValue: 1 },
      ],
    });

    expect(mockLogSheetService.upsertLogSheetEntries).toHaveBeenCalledWith(
      expect.anything(),
      validUUID,
      expect.anything(),
      { allowAdminOverride: true }
    );
  });

  it('ignores adminOverride for non-ADMIN users', async () => {
    mockUser('TECHNICIAN');
    mockLogSheetService.upsertLogSheetEntries.mockResolvedValue(undefined);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});
    const { isLogSheetEntryEmpty } = await import(
      '@/features/log-sheets/utils'
    );
    vi.mocked(isLogSheetEntryEmpty).mockReturnValue(false);

    await saveLogSheetEntriesAction({
      logSheetId: validUUID,
      adminOverride: true,
      entries: [
        { parameterId: anotherUUID, valueType: 'NUMBER', numericValue: 1 },
      ],
    });

    expect(mockLogSheetService.upsertLogSheetEntries).toHaveBeenCalledWith(
      expect.anything(),
      validUUID,
      expect.anything(),
      { allowAdminOverride: false }
    );
  });
});

describe('saveLogSheetPhotosAction (characterization)', () => {
  it('validates logSheetId as UUID', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetPhotosAction({
      logSheetId: 'invalid',
      photos: [],
    });

    expect(result.success).toBe(false);
  });

  it('validates photo URL format', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetPhotosAction({
      logSheetId: validUUID,
      photos: [{ type: 'BEFORE', url: 'not-a-url' }],
    });

    expect(result.success).toBe(false);
  });
});

describe('saveLogSheetChemicalsAction (characterization)', () => {
  it('validates chemical usage schema', async () => {
    mockUser('TECHNICIAN');
    mockLogSheetService.upsertLogSheetChemicalUsages.mockResolvedValue(
      undefined
    );
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await saveLogSheetChemicalsAction({
      logSheetId: validUUID,
      usages: [{ chemicalId: anotherUUID, amount: 10 }],
    });

    expect(mockLogSheetService.upsertLogSheetChemicalUsages).toHaveBeenCalled();
  });
});

describe('saveLogSheetMachinesAction (characterization)', () => {
  it('validates machineIds as UUIDs', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetMachinesAction({
      logSheetId: validUUID,
      machineIds: ['invalid'],
    });

    expect(result.success).toBe(false);
  });

  it('accepts empty machineIds array', async () => {
    mockUser('TECHNICIAN');
    mockLogSheetService.upsertLogSheetMachines.mockResolvedValue(undefined);
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetMachinesAction({
      logSheetId: validUUID,
      machineIds: [],
    });

    expect(result.success).toBe(true);
  });
});

describe('saveLogSheetSignatureAction (characterization)', () => {
  it('validates dataUrl format with regex', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetSignatureAction({
      logSheetId: validUUID,
      signatureRole: 'TECHNICIAN',
      dataUrl: 'invalid-format',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid dataUrl with png mime type', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetSignatureAction({
      logSheetId: validUUID,
      signatureRole: 'TECHNICIAN',
      dataUrl: 'data:image/png;base64,abc123',
    });

    expect(result.success).toBe(false);
    expect(result.error).not.toBe('Format tanda tangan tidak valid');
  });

  it('accepts valid dataUrl with jpeg mime type', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetSignatureAction({
      logSheetId: validUUID,
      signatureRole: 'TECHNICIAN',
      dataUrl: 'data:image/jpeg;base64,abc123',
    });

    expect(result.success).toBe(false);
    expect(result.error).not.toBe('Format tanda tangan tidak valid');
  });

  it('accepts valid dataUrl with webp mime type', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const result = await saveLogSheetSignatureAction({
      logSheetId: validUUID,
      signatureRole: 'TECHNICIAN',
      dataUrl: 'data:image/webp;base64,abc123',
    });

    expect(result.success).toBe(false);
    expect(result.error).not.toBe('Format tanda tangan tidak valid');
  });
});

describe('uploadLogSheetImageAction (characterization)', () => {
  it('requires FormData with file', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const formData = new FormData();
    const result = await uploadLogSheetImageAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('No file uploaded');
  });

  it('requires projectId and logSheetId in FormData', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const formData = new FormData();
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const result = await uploadLogSheetImageAction(formData);

    expect(result.success).toBe(false);
  });

  it('validates projectId and logSheetId match', async () => {
    mockUser('TECHNICIAN');
    mockLogSheetService.getLogSheetProjectId.mockResolvedValue(
      'different-project'
    );
    mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    const formData = new FormData();
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', file);
    formData.append('projectId', anotherUUID);
    formData.append('logSheetId', validUUID);

    const result = await uploadLogSheetImageAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });
});

describe('Error handling pattern (characterization)', () => {
  it('returns error object with message for all actions', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {
      throw new Error('Test error');
    });

    const result = await getLogSheetsByProjectAction(anotherUUID);

    expect(result).toEqual({
      success: false,
      error: 'Test error',
    });
  });

  it('catches unknown errors and returns generic message', async () => {
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {
      throw 'string error';
    });

    const result = await getLogSheetsByProjectAction(anotherUUID);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Gagal');
  });

  it('logs errors to console with [CPIS-ERROR] prefix', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUser('TECHNICIAN');
    vi.mocked(ensureAccess).mockImplementation(() => {
      throw new Error('Test error');
    });

    await getLogSheetsByProjectAction(anotherUUID);

    expect(consoleSpy).toHaveBeenCalledWith('[CPIS-ERROR]', expect.any(Error));

    consoleSpy.mockRestore();
  });
});

describe('R2 Upload Failure Tests (P1 Critical)', () => {
  describe('saveLogSheetSignatureAction R2 failures', () => {
    beforeEach(() => {
      vi.stubEnv('R2_WORKER_URL', 'https://r2-worker.example.com');
      vi.stubEnv('R2_AUTH_SECRET', 'test-secret');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('returns error when R2 fetch fails with network error', async () => {
      mockUser('TECHNICIAN');
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

      const result = await saveLogSheetSignatureAction({
        logSheetId: validUUID,
        signatureRole: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,abc123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network timeout');
    });

    it('returns error when R2 returns non-OK status (500)', async () => {
      mockUser('TECHNICIAN');
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const result = await saveLogSheetSignatureAction({
        logSheetId: validUUID,
        signatureRole: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,abc123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Upload failed');
    });

    it('returns error when R2 returns 403 Forbidden', async () => {
      mockUser('TECHNICIAN');
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
      });

      const result = await saveLogSheetSignatureAction({
        logSheetId: validUUID,
        signatureRole: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,abc123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Upload failed');
    });

    it('returns error when R2_WORKER_URL is missing', async () => {
      vi.unstubAllEnvs();
      mockUser('TECHNICIAN');
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      const result = await saveLogSheetSignatureAction({
        logSheetId: validUUID,
        signatureRole: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,abc123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing R2 credentials');
    });

    it('returns error when R2_AUTH_SECRET is missing', async () => {
      vi.stubEnv('R2_WORKER_URL', 'https://r2-worker.example.com');
      vi.stubEnv('R2_AUTH_SECRET', '');
      mockUser('TECHNICIAN');
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      const result = await saveLogSheetSignatureAction({
        logSheetId: validUUID,
        signatureRole: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,abc123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing R2 credentials');
    });

    it('saves signature successfully when R2 upload succeeds', async () => {
      mockUser('TECHNICIAN');
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      mockLogSheetService.saveLogSheetSignature.mockResolvedValue({
        id: validUUID,
      });
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const result = await saveLogSheetSignatureAction({
        logSheetId: validUUID,
        signatureRole: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,abc123',
      });

      expect(result.success).toBe(true);
      expect((result as any).data.url).toContain('r2-worker.example.com');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('r2-worker.example.com'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-secret',
          }),
        })
      );
    });

    it('returns error when log sheet not found', async () => {
      mockUser('TECHNICIAN');
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(null);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      const result = await saveLogSheetSignatureAction({
        logSheetId: validUUID,
        signatureRole: 'TECHNICIAN',
        dataUrl: 'data:image/png;base64,abc123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Log sheet tidak ditemukan');
    });
  });

  describe('uploadLogSheetImageAction R2 failures', () => {
    beforeEach(() => {
      vi.stubEnv('R2_WORKER_URL', 'https://r2-worker.example.com');
      vi.stubEnv('R2_AUTH_SECRET', 'test-secret');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('returns error when R2 fetch fails with network error', async () => {
      mockUser('TECHNICIAN');
      mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('projectId', anotherUUID);
      formData.append('logSheetId', validUUID);

      const result = await uploadLogSheetImageAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection refused');
    });

    it('returns error when R2 returns 503 Service Unavailable', async () => {
      mockUser('TECHNICIAN');
      mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Service Unavailable',
      });

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('projectId', anotherUUID);
      formData.append('logSheetId', validUUID);

      const result = await uploadLogSheetImageAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Upload failed');
    });

    it('returns error when R2 credentials are missing', async () => {
      vi.unstubAllEnvs();
      mockUser('TECHNICIAN');
      mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('projectId', anotherUUID);
      formData.append('logSheetId', validUUID);

      const result = await uploadLogSheetImageAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing R2 credentials');
    });

    it('uploads image successfully when R2 succeeds', async () => {
      mockUser('TECHNICIAN');
      mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('projectId', anotherUUID);
      formData.append('logSheetId', validUUID);

      const result = await uploadLogSheetImageAction(formData);

      expect(result.success).toBe(true);
      expect((result as any).data.url).toContain('r2-worker.example.com');
    });

    it('sanitizes filename to prevent path traversal', async () => {
      mockUser('TECHNICIAN');
      mockProjectService.assertCanAccessProject.mockResolvedValue(undefined);
      mockLogSheetService.getLogSheetProjectId.mockResolvedValue(anotherUUID);
      vi.mocked(ensureAccess).mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const formData = new FormData();
      const file = new File(['test'], '../../../malicious.jpg', {
        type: 'image/jpeg',
      });
      formData.append('file', file);
      formData.append('projectId', anotherUUID);
      formData.append('logSheetId', validUUID);

      const result = await uploadLogSheetImageAction(formData);

      expect(result.success).toBe(true);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).not.toContain('../');
    });
  });
});
