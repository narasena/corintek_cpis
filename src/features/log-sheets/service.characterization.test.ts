import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { IJwtPayload } from '@/@types/auth.type';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    logSheet: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    logSheetEntry: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    logSheetMachine: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    logSheetPhoto: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    chemicalUsage: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    projectAssignment: {
      findFirst: vi.fn(),
    },
    machine: {
      findMany: vi.fn(),
    },
    parameter: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    chemical: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: {
    LOG_SHEETS: 'LOG_SHEETS',
    REPORTS: 'REPORTS',
  },
}));

vi.mock('@/features/projects/service', () => ({
  assertCanAccessProject: vi.fn(),
  getAccessibleProjectIds: vi.fn(),
}));

vi.mock('@/features/log-sheets/log-sheet-locking', () => ({
  getLogSheetEditState: vi.fn(),
}));

vi.mock('@/features/log-sheets/log-sheet-status', () => ({
  decideLogSheetStatusTransition: vi.fn(),
}));

vi.mock('@/features/log-sheets/approval-validation', () => ({
  validateLogSheetApprovalDetail: vi.fn(),
}));

vi.mock('@/features/log-sheets/utils', () => ({
  makeEntryKey: vi.fn((p, m, r) => `${p}:${m ?? 'null'}:${r}`),
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

vi.mock('@/features/parameters/limits-utils', () => ({
  applyProjectOverridesToParameters: vi.fn(params => params),
}));

import { prisma } from '@/lib/prisma';
import {
  createLogSheet,
  updateLogSheet,
  updateLogSheetStatus,
  deleteLogSheet,
  getLogSheetDetail,
  getLogSheetsByProject,
  getAllLogSheets,
  getLogSheetActiveMachines,
  upsertLogSheetMachines,
  getLogSheetProjectId,
  assertCanCreateLogSheet,
  saveLogSheetSignature,
  validateLogSheetForSubmission,
  validateLogSheetForApproval,
  upsertLogSheetEntries,
  upsertLogSheetPhotos,
  upsertLogSheetChemicalUsages,
} from '@/features/log-sheets/service';

import { ensureAccess } from '@/lib/rbac';
import { assertCanAccessProject } from '@/features/projects/service';
import { getLogSheetEditState } from '@/features/log-sheets/log-sheet-locking';
import { decideLogSheetStatusTransition } from '@/features/log-sheets/log-sheet-status';
import { validateLogSheetApprovalDetail } from '@/features/log-sheets/approval-validation';

const mockPrisma = prisma as unknown as {
  logSheet: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  logSheetEntry: {
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
  logSheetMachine: {
    findMany: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
  logSheetPhoto: {
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  chemicalUsage: {
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  projectAssignment: {
    findFirst: ReturnType<typeof vi.fn>;
  };
  machine: {
    findMany: ReturnType<typeof vi.fn>;
  };
  parameter: {
    findMany: ReturnType<typeof vi.fn>;
  };
  user: {
    findMany: ReturnType<typeof vi.fn>;
  };
  chemical: {
    findMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

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

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.user.findMany.mockResolvedValue([]);
  mockPrisma.chemical.findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('createLogSheet (characterization)', () => {
  it('creates log sheet with minimal required data', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      date: new Date('2024-01-15'),
      notes: null,
      status: 'DRAFT',
    };

    mockPrisma.logSheet.create.mockResolvedValue(mockLogSheet);

    const result = await createLogSheet({
      projectId: anotherUUID,
      date: new Date('2024-01-15'),
    });

    expect(mockPrisma.logSheet.create).toHaveBeenCalledWith({
      data: {
        projectId: anotherUUID,
        date: new Date('2024-01-15'),
        notes: null,
        replacedByUserId: null,
        status: 'DRAFT',
      },
    });
    expect(result).toEqual(mockLogSheet);
  });

  it('creates log sheet with notes and replacedByUserId', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      date: new Date('2024-01-15'),
      notes: 'Some notes',
      replacedByUserId: validUUID,
      status: 'DRAFT',
    };

    mockPrisma.logSheet.create.mockResolvedValue(mockLogSheet);

    const result = await createLogSheet({
      projectId: anotherUUID,
      date: new Date('2024-01-15'),
      notes: 'Some notes',
      replacedByUserId: validUUID,
    });

    expect(mockPrisma.logSheet.create).toHaveBeenCalledWith({
      data: {
        projectId: anotherUUID,
        date: new Date('2024-01-15'),
        notes: 'Some notes',
        replacedByUserId: validUUID,
        status: 'DRAFT',
      },
    });
    expect(result.notes).toBe('Some notes');
  });

  it('converts undefined notes to null', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      date: new Date('2024-01-15'),
      notes: null,
      status: 'DRAFT',
    };

    mockPrisma.logSheet.create.mockResolvedValue(mockLogSheet);

    await createLogSheet({
      projectId: anotherUUID,
      date: new Date('2024-01-15'),
      notes: undefined,
    });

    expect(mockPrisma.logSheet.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: null }),
      })
    );
  });
});

describe('getLogSheetsByProject (characterization)', () => {
  it('returns log sheets for project', async () => {
    const mockLogSheets = [
      {
        id: validUUID,
        projectId: anotherUUID,
        date: new Date(),
        notes: null,
        status: 'DRAFT',
      },
    ];

    mockPrisma.logSheet.findMany.mockResolvedValue(mockLogSheets);

    const result = await getLogSheetsByProject(anotherUUID);

    expect(mockPrisma.logSheet.findMany).toHaveBeenCalledWith({
      where: {
        projectId: anotherUUID,
        deletedAt: null,
      },
      select: expect.any(Object),
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    expect(result).toEqual(mockLogSheets);
  });

  it('returns empty array when no log sheets exist', async () => {
    mockPrisma.logSheet.findMany.mockResolvedValue([]);

    const result = await getLogSheetsByProject(anotherUUID);

    expect(result).toEqual([]);
  });
});

describe('getAllLogSheets (characterization)', () => {
  it('returns all log sheets without project filter', async () => {
    const mockLogSheets = [
      {
        id: validUUID,
        projectId: anotherUUID,
        date: new Date(),
        notes: null,
        status: 'DRAFT',
        project: { name: 'Project 1', client: { name: 'Client 1' } },
      },
    ];

    mockPrisma.logSheet.findMany.mockResolvedValue(mockLogSheets);

    const result = await getAllLogSheets();

    expect(mockPrisma.logSheet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
      })
    );
    expect(result).toEqual(mockLogSheets);
  });

  it('filters by projectIds when provided', async () => {
    const projectIds = [validUUID, anotherUUID];
    mockPrisma.logSheet.findMany.mockResolvedValue([]);

    await getAllLogSheets(projectIds);

    expect(mockPrisma.logSheet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          projectId: { in: projectIds },
        },
      })
    );
  });
});

describe('getLogSheetProjectId (characterization)', () => {
  it('returns projectId when log sheet exists', async () => {
    mockPrisma.logSheet.findFirst.mockResolvedValue({ projectId: anotherUUID });

    const result = await getLogSheetProjectId(validUUID);

    expect(result).toBe(anotherUUID);
  });

  it('returns null when log sheet not found', async () => {
    mockPrisma.logSheet.findFirst.mockResolvedValue(null);

    const result = await getLogSheetProjectId(validUUID);

    expect(result).toBeNull();
  });

  it('filters out deleted log sheets', async () => {
    mockPrisma.logSheet.findFirst.mockResolvedValue(null);

    await getLogSheetProjectId(validUUID);

    expect(mockPrisma.logSheet.findFirst).toHaveBeenCalledWith({
      where: { id: validUUID, deletedAt: null },
      select: { projectId: true },
    });
  });
});

describe('getLogSheetActiveMachines (characterization)', () => {
  it('returns machine IDs', async () => {
    mockPrisma.logSheetMachine.findMany.mockResolvedValue([
      { machineId: validUUID },
      { machineId: anotherUUID },
    ]);

    const result = await getLogSheetActiveMachines(validUUID);

    expect(result).toEqual([validUUID, anotherUUID]);
  });

  it('returns empty array when no machines', async () => {
    mockPrisma.logSheetMachine.findMany.mockResolvedValue([]);

    const result = await getLogSheetActiveMachines(validUUID);

    expect(result).toEqual([]);
  });
});

describe('deleteLogSheet (characterization)', () => {
  it('soft deletes log sheet by setting deletedAt', async () => {
    const mockDeleted = {
      id: validUUID,
      projectId: anotherUUID,
      deletedAt: new Date(),
    };

    mockPrisma.logSheet.update.mockResolvedValue(mockDeleted);

    const result = await deleteLogSheet(validUUID);

    expect(mockPrisma.logSheet.update).toHaveBeenCalledWith({
      where: { id: validUUID },
      data: { deletedAt: expect.any(Date) },
    });
    expect(result.deletedAt).toBeInstanceOf(Date);
  });

  it('does not check if log sheet exists before delete', async () => {
    mockPrisma.logSheet.update.mockResolvedValue({});

    await deleteLogSheet(validUUID);

    expect(mockPrisma.logSheet.findFirst).not.toHaveBeenCalled();
  });
});

describe('assertCanCreateLogSheet (characterization)', () => {
  it('allows ADMIN without project assignment', async () => {
    const actor = createMockActor({ role: 'ADMIN' });

    await expect(
      assertCanCreateLogSheet(actor, anotherUUID)
    ).resolves.not.toThrow();
    expect(mockPrisma.projectAssignment.findFirst).not.toHaveBeenCalled();
  });

  it('allows SUPERVISOR with PROJECT_PIC assignment', async () => {
    const actor = createMockActor({ role: 'SUPERVISOR' });
    mockPrisma.projectAssignment.findFirst.mockResolvedValue({ id: validUUID });

    await expect(
      assertCanCreateLogSheet(actor, anotherUUID)
    ).resolves.not.toThrow();

    expect(mockPrisma.projectAssignment.findFirst).toHaveBeenCalledWith({
      where: {
        userId: actor.id,
        projectId: anotherUUID,
        role: 'PROJECT_PIC',
        isActive: true,
      },
      select: { id: true },
    });
  });

  it('allows TECHNICIAN with TECHNICIAN assignment', async () => {
    const actor = createMockActor({ role: 'TECHNICIAN' });
    mockPrisma.projectAssignment.findFirst.mockResolvedValue({ id: validUUID });

    await expect(
      assertCanCreateLogSheet(actor, anotherUUID)
    ).resolves.not.toThrow();

    expect(mockPrisma.projectAssignment.findFirst).toHaveBeenCalledWith({
      where: {
        userId: actor.id,
        projectId: anotherUUID,
        role: 'TECHNICIAN',
        isActive: true,
      },
      select: { id: true },
    });
  });

  it('rejects SUPERVISOR without PROJECT_PIC assignment', async () => {
    const actor = createMockActor({ role: 'SUPERVISOR' });
    mockPrisma.projectAssignment.findFirst.mockResolvedValue(null);

    await expect(assertCanCreateLogSheet(actor, anotherUUID)).rejects.toThrow(
      'Unauthorized'
    );
  });

  it('rejects TECHNICIAN without TECHNICIAN assignment', async () => {
    const actor = createMockActor({ role: 'TECHNICIAN' });
    mockPrisma.projectAssignment.findFirst.mockResolvedValue(null);

    await expect(assertCanCreateLogSheet(actor, anotherUUID)).rejects.toThrow(
      'Unauthorized'
    );
  });

  it('rejects unassigned roles (REPORTING, DIRECTOR, CLIENT_*)', async () => {
    const reportingActor = createMockActor({ role: 'REPORTING' });
    mockPrisma.projectAssignment.findFirst.mockResolvedValue(null);

    await expect(
      assertCanCreateLogSheet(reportingActor, anotherUUID)
    ).rejects.toThrow('Unauthorized');
  });
});

describe('updateLogSheet (characterization)', () => {
  it('calls assertLogSheetEditable before update', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
      locked: false,
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue({
      ...logSheetRow,
      notes: 'Updated',
    });
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

    await updateLogSheet(actor, { id: validUUID, notes: 'Updated' });

    expect(mockPrisma.logSheet.findFirst).toHaveBeenCalled();
  });

  it('converts undefined notes to null on update', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
      locked: false,
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue(logSheetRow);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

    await updateLogSheet(actor, { id: validUUID, notes: undefined });

    expect(mockPrisma.logSheet.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: null }),
      })
    );
  });
});

describe('updateLogSheetStatus (characterization)', () => {
  it('returns unchanged log sheet when status is same as current', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

    await updateLogSheetStatus(actor, validUUID, 'DRAFT');

    expect(decideLogSheetStatusTransition).not.toHaveBeenCalled();
    expect(mockPrisma.logSheet.update).not.toHaveBeenCalled();
  });

  it('calls decideLogSheetStatusTransition for status change', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue({
      ...logSheetRow,
      status: 'SUBMITTED',
    });
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(decideLogSheetStatusTransition).mockReturnValue({
      ok: true,
      requiresApprovalValidation: false,
    });
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetStatus(actor, validUUID, 'SUBMITTED');

    expect(decideLogSheetStatusTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        current: 'DRAFT',
        target: 'SUBMITTED',
      })
    );
  });

  it('throws error when transition is not allowed', async () => {
    const actor = createMockActor({ role: 'TECHNICIAN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'APPROVED',
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(decideLogSheetStatusTransition).mockReturnValue({
      ok: false,
      error: 'Invalid transition',
    });
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await expect(
      updateLogSheetStatus(actor, validUUID, 'DRAFT')
    ).rejects.toThrow('Invalid transition');
  });

  it('calls validateLogSheetForApproval when requiresApprovalValidation is true', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'SUBMITTED',
    };

    const mockLogSheetWithRelations = {
      id: validUUID,
      projectId: anotherUUID,
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst
      .mockResolvedValueOnce(logSheetRow)
      .mockResolvedValueOnce(mockLogSheetWithRelations);
    mockPrisma.logSheet.update.mockResolvedValue({
      ...logSheetRow,
      status: 'APPROVED',
    });
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(decideLogSheetStatusTransition).mockReturnValue({
      ok: true,
      requiresApprovalValidation: true,
    });
    vi.mocked(ensureAccess).mockImplementation(() => {});
    vi.mocked(validateLogSheetApprovalDetail).mockImplementation(() => {});

    await updateLogSheetStatus(actor, validUUID, 'APPROVED');

    expect(validateLogSheetApprovalDetail).toHaveBeenCalled();
  });

  it('throws when validateLogSheetForApproval finds errors (requiresApprovalValidation: true path)', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'SUBMITTED',
    };

    const mockLogSheetWithRelations = {
      id: validUUID,
      projectId: anotherUUID,
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst
      .mockResolvedValueOnce(logSheetRow)
      .mockResolvedValueOnce(mockLogSheetWithRelations);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(decideLogSheetStatusTransition).mockReturnValue({
      ok: true,
      requiresApprovalValidation: true,
    });
    vi.mocked(ensureAccess).mockImplementation(() => {});
    vi.mocked(validateLogSheetApprovalDetail).mockImplementation(() => {
      throw new Error('Validasi approval gagal: Missing required entries');
    });

    await expect(
      updateLogSheetStatus(actor, validUUID, 'APPROVED')
    ).rejects.toThrow('Validasi approval gagal: Missing required entries');

    expect(mockPrisma.logSheet.update).not.toHaveBeenCalled();
  });

  it('sets submittedAt and submittedByUserId when transitioning to SUBMITTED', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue({});
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(decideLogSheetStatusTransition).mockReturnValue({
      ok: true,
      requiresApprovalValidation: false,
    });
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetStatus(actor, validUUID, 'SUBMITTED');

    expect(mockPrisma.logSheet.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'SUBMITTED',
          submittedAt: expect.any(Date),
          submittedByUserId: actor.id,
        }),
      })
    );
  });

  it('sets approvedAt and approvedByUserId when transitioning to APPROVED', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'SUBMITTED',
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue({});
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(decideLogSheetStatusTransition).mockReturnValue({
      ok: true,
      requiresApprovalValidation: false,
    });
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await updateLogSheetStatus(actor, validUUID, 'APPROVED');

    expect(mockPrisma.logSheet.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'APPROVED',
          approvedAt: expect.any(Date),
          approvedByUserId: actor.id,
        }),
      })
    );
  });

  it('throws "Log sheet tidak ditemukan" when log sheet not found', async () => {
    const actor = createMockActor();
    mockPrisma.logSheet.findFirst.mockResolvedValue(null);
    vi.mocked(ensureAccess).mockImplementation(() => {});

    await expect(
      updateLogSheetStatus(actor, validUUID, 'SUBMITTED')
    ).rejects.toThrow('Log sheet tidak ditemukan');
  });

  it('validates approval even when requiresApprovalValidation is true and data is invalid', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'SUBMITTED',
    };

    const mockLogSheetWithRelations = {
      id: validUUID,
      projectId: anotherUUID,
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst
      .mockResolvedValueOnce(logSheetRow)
      .mockResolvedValueOnce(mockLogSheetWithRelations);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(decideLogSheetStatusTransition).mockReturnValue({
      ok: true,
      requiresApprovalValidation: true,
    });
    vi.mocked(ensureAccess).mockImplementation(() => {});
    vi.mocked(validateLogSheetApprovalDetail).mockImplementation(() => {
      throw new Error('Entry untuk parameter pH belum diisi');
    });

    await expect(
      updateLogSheetStatus(actor, validUUID, 'APPROVED')
    ).rejects.toThrow('Entry untuk parameter pH belum diisi');
  });
});

describe('saveLogSheetSignature (characterization)', () => {
  it('saves TECHNICIAN signature with correct fields', async () => {
    const actor = createMockActor({ role: 'TECHNICIAN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
    };
    const signatureUrl = 'https://example.com/signature.webp';

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue({});
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    mockPrisma.projectAssignment.findFirst.mockResolvedValue({ id: validUUID });

    await saveLogSheetSignature(actor, validUUID, 'TECHNICIAN', signatureUrl);

    expect(mockPrisma.logSheet.update).toHaveBeenCalledWith({
      where: { id: validUUID },
      data: {
        technicianSignatureUrl: signatureUrl,
        technicianSignedAt: expect.any(Date),
        technicianSignedByUserId: actor.id,
      },
    });
  });

  it('saves CLIENT_PIC signature with correct fields', async () => {
    const actor = createMockActor({ role: 'CLIENT_SUPERVISOR' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
    };
    const signatureUrl = 'https://example.com/signature.webp';

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue({});
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    mockPrisma.projectAssignment.findFirst.mockResolvedValue({ id: validUUID });

    await saveLogSheetSignature(actor, validUUID, 'CLIENT_PIC', signatureUrl);

    expect(mockPrisma.logSheet.update).toHaveBeenCalledWith({
      where: { id: validUUID },
      data: {
        clientPicSignatureUrl: signatureUrl,
        clientPicSignedAt: expect.any(Date),
        clientPicSignedByUserId: actor.id,
      },
    });
  });

  it('allows ADMIN to sign without project assignment', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheet.update.mockResolvedValue({});
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

    await expect(
      saveLogSheetSignature(actor, validUUID, 'TECHNICIAN', 'url')
    ).resolves.not.toThrow();

    expect(mockPrisma.projectAssignment.findFirst).not.toHaveBeenCalled();
  });

  it('rejects signature on non-DRAFT log sheet', async () => {
    const actor = createMockActor({ role: 'TECHNICIAN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'SUBMITTED',
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

    await expect(
      saveLogSheetSignature(actor, validUUID, 'TECHNICIAN', 'url')
    ).rejects.toThrow('Log sheet sudah dikirim dan tidak bisa ditandatangani');
  });
});

describe('upsertLogSheetMachines (characterization)', () => {
  it('adds new machines and removes old ones in transaction', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
      locked: false,
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheetMachine.findMany.mockResolvedValue([
      { machineId: 'old-machine' },
    ]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

    const txMock = {
      logSheetMachine: {
        deleteMany: vi.fn().mockResolvedValue({}),
        createMany: vi.fn().mockResolvedValue({}),
      },
      logSheetEntry: {
        updateMany: vi.fn().mockResolvedValue({}),
      },
    };
    mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

    await upsertLogSheetMachines(actor, validUUID, [
      'new-machine-1',
      'new-machine-2',
    ]);

    expect(txMock.logSheetMachine.deleteMany).toHaveBeenCalledWith({
      where: { logSheetId: validUUID, machineId: { in: ['old-machine'] } },
    });
    expect(txMock.logSheetEntry.updateMany).toHaveBeenCalledWith({
      where: {
        logSheetId: validUUID,
        machineId: { in: ['old-machine'] },
        deletedAt: null,
      },
      data: { deletedAt: expect.any(Date) },
    });
    expect(txMock.logSheetMachine.createMany).toHaveBeenCalled();
  });

  it('soft-deletes entries for removed machines', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
      locked: false,
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheetMachine.findMany.mockResolvedValue([
      { machineId: 'to-remove' },
    ]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

    const txMock = {
      logSheetMachine: {
        deleteMany: vi.fn().mockResolvedValue({}),
        createMany: vi.fn().mockResolvedValue({}),
      },
      logSheetEntry: {
        updateMany: vi.fn().mockResolvedValue({}),
      },
    };
    mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

    await upsertLogSheetMachines(actor, validUUID, []);

    expect(txMock.logSheetEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          machineId: { in: ['to-remove'] },
        }),
        data: { deletedAt: expect.any(Date) },
      })
    );
  });
});

describe('upsertLogSheetEntries (characterization)', () => {
  it('calls assertLogSheetEditable before processing', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
      locked: false,
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheetEntry.findMany.mockResolvedValue([]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

    const txMock = {
      logSheetEntry: {
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
    };
    mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

    await upsertLogSheetEntries(actor, validUUID, []);

    expect(mockPrisma.logSheet.findFirst).toHaveBeenCalled();
  });
});

describe('upsertLogSheetPhotos (characterization)', () => {
  it('soft-deletes photos not in the input list', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
      locked: false,
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.logSheetPhoto.findMany.mockResolvedValue([
      { id: 'photo-1', deletedAt: null },
      { id: 'photo-2', deletedAt: null },
    ]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

    const txMock = {
      logSheetPhoto: {
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({ id: 'new-photo' }),
      },
    };
    mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

    await upsertLogSheetPhotos(actor, validUUID, [
      { type: 'BEFORE', url: 'https://example.com/new.jpg' },
    ]);

    expect(txMock.logSheetPhoto.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'photo-1' },
        data: { deletedAt: expect.any(Date) },
      })
    );
  });
});

describe('upsertLogSheetChemicalUsages (characterization)', () => {
  it('skips usages with amount <= 0 (SURPRISING: silent skip, no error)', async () => {
    const actor = createMockActor({ role: 'ADMIN' });
    const logSheetRow = {
      id: validUUID,
      projectId: anotherUUID,
      status: 'DRAFT',
      locked: false,
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
    mockPrisma.chemicalUsage.findMany.mockResolvedValue([]);
    vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
    vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

    const txMock = {
      chemicalUsage: {
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({ id: 'new' }),
      },
    };
    mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

    await upsertLogSheetChemicalUsages(actor, validUUID, [
      { chemicalId: validUUID, amount: 0 },
      { chemicalId: validUUID, amount: -5 },
      { chemicalId: validUUID, amount: 10 },
    ]);

    expect(txMock.chemicalUsage.create).toHaveBeenCalledTimes(1);
    expect(txMock.chemicalUsage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 10 }),
      })
    );
  });
});

describe('validateLogSheetForSubmission (characterization)', () => {
  it('requires technician signature and client signature', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: null,
      clientPicSignatureUrl: null,
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([]);

    await expect(validateLogSheetForSubmission(validUUID)).rejects.toThrow(
      'Tanda tangan teknisi belum diisi'
    );
  });

  it('rejects entry value below minValue (boundary: min - 1)', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 5,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'Temperature',
        variableName: 'TEMP',
        category: 'COOLING_WATER',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 10,
        maxValue: 100,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
    ]);

    await expect(validateLogSheetForSubmission(validUUID)).rejects.toThrow(
      'di bawah minimum'
    );
  });

  it('rejects entry value above maxValue (boundary: max + 1)', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 101,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'Temperature',
        variableName: 'TEMP',
        category: 'COOLING_WATER',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 10,
        maxValue: 100,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
    ]);

    await expect(validateLogSheetForSubmission(validUUID)).rejects.toThrow(
      'di atas maksimum'
    );
  });

  it('accepts entry value at exact minValue boundary', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 10,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'Temperature',
        variableName: 'TEMP',
        category: 'COOLING_WATER',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 10,
        maxValue: 100,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
    ]);

    await expect(
      validateLogSheetForSubmission(validUUID)
    ).resolves.not.toThrow();
  });

  it('accepts entry value at exact maxValue boundary', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 100,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'Temperature',
        variableName: 'TEMP',
        category: 'COOLING_WATER',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 10,
        maxValue: 100,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
    ]);

    await expect(
      validateLogSheetForSubmission(validUUID)
    ).resolves.not.toThrow();
  });

  it('uses rawWaterMinValue/rawWaterMaxValue for RAW_WATER role entries', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'RAW_WATER',
          valueType: 'NUMBER',
          numericValue: 5,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'pH',
        variableName: 'PH',
        category: 'COOLING_WATER',
        valueType: 'NUMBER',
        unit: '',
        minValue: 7,
        maxValue: 9,
        rawWaterMinValue: 6,
        rawWaterMaxValue: 8,
        displayOrder: 1,
      },
    ]);

    await expect(validateLogSheetForSubmission(validUUID)).rejects.toThrow(
      'di bawah minimum 6'
    );
  });

  it('silently skips validation when parameter not found in lookup (SURPRISING BEHAVIOR)', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'non-existent-param',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 999999,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([]);

    await expect(
      validateLogSheetForSubmission(validUUID)
    ).resolves.not.toThrow();
  });

  it('silently skips NaN numeric values in range validation (SURPRISING BEHAVIOR)', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: NaN,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'Temperature',
        variableName: 'TEMP',
        category: 'COOLING_WATER',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 10,
        maxValue: 100,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
    ]);

    await expect(
      validateLogSheetForSubmission(validUUID)
    ).resolves.not.toThrow();
  });

  it('skips validation for null numericValue', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: null,
          boolValue: null,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'Temperature',
        variableName: 'TEMP',
        category: 'COOLING_WATER',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 10,
        maxValue: 100,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
    ]);

    await expect(
      validateLogSheetForSubmission(validUUID)
    ).resolves.not.toThrow();
  });

  it('skips validation for non-NUMBER valueTypes (BOOLEAN, TEXT)', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      technicianSignatureUrl: 'https://example.com/signature.webp',
      clientPicSignatureUrl: 'https://example.com/signature.webp',
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [
        {
          id: 'entry-1',
          logSheetId: validUUID,
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'BOOLEAN',
          numericValue: null,
          boolValue: true,
          textValue: null,
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'entry-2',
          logSheetId: validUUID,
          parameterId: 'param-2',
          machineId: null,
          role: 'VALUE',
          valueType: 'TEXT',
          numericValue: null,
          boolValue: null,
          textValue: 'Some text',
          fileUrl: null,
          checkedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([
      {
        id: 'param-1',
        name: 'Is Running',
        variableName: 'IS_RUNNING',
        category: 'GENERAL_CONDITION',
        valueType: 'BOOLEAN',
        unit: null,
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
      {
        id: 'param-2',
        name: 'Notes',
        variableName: 'NOTES',
        category: 'GENERAL_CONDITION',
        valueType: 'TEXT',
        unit: null,
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 2,
      },
    ]);

    await expect(
      validateLogSheetForSubmission(validUUID)
    ).resolves.not.toThrow();
  });
});

describe('validateLogSheetForApproval (characterization)', () => {
  it('calls getLogSheetDetail and validateLogSheetApprovalDetail', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [],
      photos: [],
      chemicalUsages: [],
    };

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue([]);
    mockPrisma.parameter.findMany.mockResolvedValue([]);

    try {
      await validateLogSheetForApproval(validUUID);
    } catch {
      // Expected to fail validation, but we're testing the call flow
    }

    expect(mockPrisma.logSheet.findFirst).toHaveBeenCalled();
  });
});

describe('getLogSheetDetail (characterization)', () => {
  it('throws "Log sheet tidak ditemukan" when not found', async () => {
    mockPrisma.logSheet.findFirst.mockResolvedValue(null);

    await expect(getLogSheetDetail(validUUID)).rejects.toThrow(
      'Log sheet tidak ditemukan'
    );
  });

  it('uses all active machines as fallback when activeMachines is empty', async () => {
    const mockLogSheet = {
      id: validUUID,
      projectId: anotherUUID,
      activeMachines: [],
      project: {
        id: anotherUUID,
        name: 'Project',
        client: { name: 'Client' },
        parameterOverrides: [],
        assignments: [],
      },
      entries: [],
      photos: [],
      chemicalUsages: [],
    };

    const mockMachines = [
      { id: 'chiller-1', unitNumber: 1, type: 'CHILLER' },
      { id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' },
    ];

    mockPrisma.logSheet.findFirst.mockResolvedValue(mockLogSheet);
    mockPrisma.machine.findMany.mockResolvedValue(mockMachines);
    mockPrisma.parameter.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.chemical.findMany.mockResolvedValue([]);

    const result = await getLogSheetDetail(validUUID);

    expect(result.activeMachineIds.chillers).toEqual(['chiller-1']);
    expect(result.activeMachineIds.coolingTowers).toEqual(['ct-1']);
  });
});

describe('Transaction Rollback (P1 Critical)', () => {
  describe('upsertLogSheetMachines rollback', () => {
    it('rolls back machine deletion when createMany fails', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheetMachine.findMany.mockResolvedValue([
        { machineId: 'old-machine' },
      ]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        logSheetMachine: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          createMany: vi.fn().mockRejectedValue(new Error('Database error')),
        },
        logSheetEntry: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async fn => {
        return fn(txMock);
      });

      await expect(
        upsertLogSheetMachines(actor, validUUID, ['new-machine'])
      ).rejects.toThrow('Database error');

      expect(txMock.logSheetMachine.deleteMany).toHaveBeenCalled();
      expect(txMock.logSheetMachine.createMany).toHaveBeenCalled();
    });

    it('rolls back when entry soft-delete fails', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheetMachine.findMany.mockResolvedValue([
        { machineId: 'to-remove-1' },
      ]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        logSheetMachine: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          createMany: vi.fn().mockResolvedValue({}),
        },
        logSheetEntry: {
          updateMany: vi
            .fn()
            .mockRejectedValue(new Error('Entry update failed')),
        },
      };

      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await expect(
        upsertLogSheetMachines(actor, validUUID, [])
      ).rejects.toThrow('Entry update failed');
    });
  });

  describe('upsertLogSheetEntries rollback', () => {
    it('rolls back partial entry updates on failure', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheetEntry.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      let createCallCount = 0;
      const txMock = {
        logSheetEntry: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockImplementation(() => {
            createCallCount++;
            if (createCallCount === 1) {
              return Promise.resolve({ id: 'entry-1' });
            }
            return Promise.reject(new Error('Second entry failed'));
          }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      const entries = [
        {
          parameterId: 'param-1',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 10,
        },
        {
          parameterId: 'param-2',
          machineId: null,
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 20,
        },
      ];

      await expect(
        upsertLogSheetEntries(actor, validUUID, entries as any)
      ).rejects.toThrow('Second entry failed');

      expect(txMock.logSheetEntry.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('upsertLogSheetPhotos rollback', () => {
    it('rolls back photo creation on partial failure', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheetPhoto.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      let createCallCount = 0;
      const txMock = {
        logSheetPhoto: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockImplementation(() => {
            createCallCount++;
            if (createCallCount <= 2) {
              return Promise.resolve({ id: `photo-${createCallCount}` });
            }
            return Promise.reject(new Error('Photo creation failed'));
          }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      const photos = [
        { type: 'BEFORE', url: 'https://example.com/1.jpg' },
        { type: 'BEFORE', url: 'https://example.com/2.jpg' },
        { type: 'AFTER', url: 'https://example.com/3.jpg' },
      ];

      await expect(
        upsertLogSheetPhotos(actor, validUUID, photos as any)
      ).rejects.toThrow('Photo creation failed');
    });

    it('rolls back when soft-delete of removed photos fails', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheetPhoto.findMany.mockResolvedValue([
        { id: 'photo-1', deletedAt: null },
        { id: 'photo-2', deletedAt: null },
      ]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        logSheetPhoto: {
          update: vi.fn().mockImplementation(({ data }) => {
            if (data.deletedAt) {
              return Promise.reject(new Error('Soft delete failed'));
            }
            return Promise.resolve({});
          }),
          create: vi.fn().mockResolvedValue({ id: 'new-photo' }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await expect(
        upsertLogSheetPhotos(actor, validUUID, [
          { type: 'BEFORE', url: 'https://example.com/new.jpg' },
        ])
      ).rejects.toThrow('Soft delete failed');
    });
  });

  describe('upsertLogSheetChemicalUsages rollback', () => {
    it('rolls back chemical usage creation on failure', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.chemicalUsage.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      let createCallCount = 0;
      const txMock = {
        chemicalUsage: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockImplementation(() => {
            createCallCount++;
            if (createCallCount === 1) {
              return Promise.resolve({ id: 'usage-1' });
            }
            return Promise.reject(new Error('Chemical creation failed'));
          }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      const usages = [
        { chemicalId: validUUID, amount: 10 },
        { chemicalId: validUUID, amount: 20 },
      ];

      await expect(
        upsertLogSheetChemicalUsages(actor, validUUID, usages)
      ).rejects.toThrow('Chemical creation failed');
    });

    it('rolls back when removing old chemical usages fails', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.chemicalUsage.findMany.mockResolvedValue([
        { id: 'old-usage', deletedAt: null },
      ]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        chemicalUsage: {
          update: vi.fn().mockImplementation(({ data }) => {
            if (data.deletedAt) {
              return Promise.reject(new Error('Cannot remove old usage'));
            }
            return Promise.resolve({});
          }),
          create: vi.fn().mockResolvedValue({ id: 'new-usage' }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await expect(
        upsertLogSheetChemicalUsages(actor, validUUID, [
          { chemicalId: validUUID, amount: 10 },
        ])
      ).rejects.toThrow('Cannot remove old usage');
    });
  });
});

describe('P2 - Important Tests', () => {
  describe('upsertLogSheetChemicalUsages - chemical amount validation (P2-5)', () => {
    it('filters out negative amounts silently (no error thrown)', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.chemicalUsage.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        chemicalUsage: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 'new-usage' }),
        },
      };
      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await upsertLogSheetChemicalUsages(actor, validUUID, [
        { chemicalId: validUUID, amount: -10 },
      ]);

      expect(txMock.chemicalUsage.create).not.toHaveBeenCalled();
    });

    it('filters out zero amounts silently (no error thrown)', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.chemicalUsage.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        chemicalUsage: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 'new-usage' }),
        },
      };
      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await upsertLogSheetChemicalUsages(actor, validUUID, [
        { chemicalId: validUUID, amount: 0 },
      ]);

      expect(txMock.chemicalUsage.create).not.toHaveBeenCalled();
    });

    it('processes positive amounts correctly', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.chemicalUsage.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        chemicalUsage: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 'new-usage' }),
        },
      };
      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await upsertLogSheetChemicalUsages(actor, validUUID, [
        { chemicalId: validUUID, amount: 10 },
      ]);

      expect(txMock.chemicalUsage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 10 }),
        })
      );
    });

    it('processes mixed inputs (filters negatives and zero, keeps positives)', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.chemicalUsage.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        chemicalUsage: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 'new-usage' }),
        },
      };
      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await upsertLogSheetChemicalUsages(actor, validUUID, [
        { chemicalId: 'chem-1', amount: -5 },
        { chemicalId: 'chem-2', amount: 0 },
        { chemicalId: 'chem-3', amount: 10 },
        { chemicalId: 'chem-4', amount: 20 },
      ]);

      expect(txMock.chemicalUsage.create).toHaveBeenCalledTimes(2);
      expect(txMock.chemicalUsage.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({ chemicalId: 'chem-3', amount: 10 }),
        })
      );
      expect(txMock.chemicalUsage.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({ chemicalId: 'chem-4', amount: 20 }),
        })
      );
    });

    it('handles very small positive amounts (0.001)', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.chemicalUsage.findMany.mockResolvedValue([]);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      const txMock = {
        chemicalUsage: {
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 'new-usage' }),
        },
      };
      mockPrisma.$transaction.mockImplementation(async fn => fn(txMock));

      await upsertLogSheetChemicalUsages(actor, validUUID, [
        { chemicalId: validUUID, amount: 0.001 },
      ]);

      expect(txMock.chemicalUsage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 0.001 }),
        })
      );
    });
  });

  describe('assertLogSheetEditable - admin override edge cases (P2-6)', () => {
    it('allows ADMIN with allowAdminOverride on SUBMITTED log sheet', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'SUBMITTED',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      await updateLogSheet(
        actor,
        { id: validUUID, notes: 'test' },
        { allowAdminOverride: true }
      );

      expect(mockPrisma.logSheet.update).toHaveBeenCalled();
    });

    it('rejects ADMIN without allowAdminOverride on SUBMITTED log sheet', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'SUBMITTED',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('LOCKED_SUBMITTED');

      await expect(
        updateLogSheet(
          actor,
          { id: validUUID, notes: 'test' },
          { allowAdminOverride: false }
        )
      ).rejects.toThrow('Log sheet sudah dikirim dan tidak bisa diubah');
    });

    it('rejects TECHNICIAN even with allowAdminOverride on SUBMITTED', async () => {
      const actor = createMockActor({ role: 'TECHNICIAN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'SUBMITTED',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      mockPrisma.projectAssignment.findFirst.mockResolvedValue({
        id: validUUID,
      });
      vi.mocked(getLogSheetEditState).mockReturnValue('LOCKED_SUBMITTED');

      await expect(
        updateLogSheet(
          actor,
          { id: validUUID, notes: 'test' },
          { allowAdminOverride: true }
        )
      ).rejects.toThrow('Log sheet sudah dikirim dan tidak bisa diubah');
    });

    it('allows ADMIN with allowAdminOverride on APPROVED log sheet', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'APPROVED',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('EDITABLE');

      await updateLogSheet(
        actor,
        { id: validUUID, notes: 'test' },
        { allowAdminOverride: true }
      );

      expect(mockPrisma.logSheet.update).toHaveBeenCalled();
    });

    it('rejects edit on locked log sheet regardless of override', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
        locked: true,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('LOCKED_APPROVED');

      await expect(
        updateLogSheet(
          actor,
          { id: validUUID, notes: 'test' },
          { allowAdminOverride: true }
        )
      ).rejects.toThrow('Log sheet sudah disetujui');
    });

    it('defaults allowAdminOverride to false when not provided', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'SUBMITTED',
        locked: false,
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(getLogSheetEditState).mockReturnValue('LOCKED_SUBMITTED');

      await expect(
        updateLogSheet(actor, { id: validUUID, notes: 'test' })
      ).rejects.toThrow('Log sheet sudah dikirim dan tidak bisa diubah');
    });
  });

  describe('assertCanSignLogSheet - CLIENT_PIC paths (P2-7)', () => {
    it('allows CLIENT_TECHNICIAN with CLIENT_PIC assignment to sign as CLIENT_PIC', async () => {
      const actor = createMockActor({ role: 'CLIENT_TECHNICIAN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheet.update.mockResolvedValue({});
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      mockPrisma.projectAssignment.findFirst.mockResolvedValue({
        id: validUUID,
      });

      await saveLogSheetSignature(
        actor,
        validUUID,
        'CLIENT_PIC',
        'https://example.com/sig.webp'
      );

      expect(mockPrisma.logSheet.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          clientPicSignatureUrl: 'https://example.com/sig.webp',
          clientPicSignedAt: expect.any(Date),
          clientPicSignedByUserId: actor.id,
        },
      });
    });

    it('allows CLIENT_SUPERVISOR with CLIENT_PIC assignment to sign as CLIENT_PIC', async () => {
      const actor = createMockActor({ role: 'CLIENT_SUPERVISOR' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheet.update.mockResolvedValue({});
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      mockPrisma.projectAssignment.findFirst.mockResolvedValue({
        id: validUUID,
      });

      await saveLogSheetSignature(
        actor,
        validUUID,
        'CLIENT_PIC',
        'https://example.com/sig.webp'
      );

      expect(mockPrisma.logSheet.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: {
          clientPicSignatureUrl: 'https://example.com/sig.webp',
          clientPicSignedAt: expect.any(Date),
          clientPicSignedByUserId: actor.id,
        },
      });
    });

    it('rejects CLIENT_TECHNICIAN without CLIENT_PIC assignment', async () => {
      const actor = createMockActor({ role: 'CLIENT_TECHNICIAN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      mockPrisma.projectAssignment.findFirst.mockResolvedValue(null);

      await expect(
        saveLogSheetSignature(
          actor,
          validUUID,
          'CLIENT_PIC',
          'https://example.com/sig.webp'
        )
      ).rejects.toThrow('Hanya PIC klien proyek atau supervisor klien yang dapat menandatangani');
    });

    it('allows CLIENT_SUPERVISOR without CLIENT_PIC assignment (fallback)', async () => {
      const actor = createMockActor({ role: 'CLIENT_SUPERVISOR' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheet.update.mockResolvedValue({});
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      mockPrisma.projectAssignment.findFirst.mockResolvedValue(null);

      // Should succeed without requiring CLIENT_PIC assignment
      await saveLogSheetSignature(
        actor,
        validUUID,
        'CLIENT_PIC',
        'https://example.com/sig.webp'
      );

      expect(mockPrisma.logSheet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: validUUID },
          data: {
            clientPicSignatureUrl: 'https://example.com/sig.webp',
            clientPicSignedAt: expect.any(Date),
            clientPicSignedByUserId: actor.id,
          },
        })
      );
    });

    it('rejects TECHNICIAN trying to sign as CLIENT_PIC', async () => {
      const actor = createMockActor({ role: 'TECHNICIAN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

      await expect(
        saveLogSheetSignature(
          actor,
          validUUID,
          'CLIENT_PIC',
          'https://example.com/sig.webp'
        )
      ).rejects.toThrow('Hanya PIC klien proyek atau supervisor klien yang dapat menandatangani');
    });

    it('rejects SUPERVISOR trying to sign as CLIENT_PIC', async () => {
      const actor = createMockActor({ role: 'SUPERVISOR' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

      await expect(
        saveLogSheetSignature(
          actor,
          validUUID,
          'CLIENT_PIC',
          'https://example.com/sig.webp'
        )
      ).rejects.toThrow('Hanya PIC klien proyek atau supervisor klien yang dapat menandatangani');
    });

    it('allows ADMIN to sign as CLIENT_PIC without project assignment check', async () => {
      const actor = createMockActor({ role: 'ADMIN' });
      const logSheetRow = {
        id: validUUID,
        projectId: anotherUUID,
        status: 'DRAFT',
      };

      mockPrisma.logSheet.findFirst.mockResolvedValue(logSheetRow);
      mockPrisma.logSheet.update.mockResolvedValue({});
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

      await expect(
        saveLogSheetSignature(
          actor,
          validUUID,
          'CLIENT_PIC',
          'https://example.com/sig.webp'
        )
      ).resolves.not.toThrow();

      expect(mockPrisma.projectAssignment.findFirst).not.toHaveBeenCalled();
    });
  });
});
