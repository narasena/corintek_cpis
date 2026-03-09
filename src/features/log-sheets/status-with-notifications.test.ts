import { describe, it, expect, beforeEach, vi } from 'vitest';

import { updateLogSheetStatusWithNotifications } from './status-with-notifications';
import type { IJwtPayload } from '@/@types/auth.type';
import type { ILogSheetDetailView } from './service';
import type { ILogSheet } from './types';

vi.mock('./service', () => {
  return {
    validateLogSheetForSubmission: vi.fn(),
    getLogSheetDetail: vi.fn(),
    updateLogSheetStatus: vi.fn(),
  };
});

vi.mock('./log-sheet-notifications', () => {
  return {
    notifyLimitBreachesOnSubmission: vi.fn(),
    getTechnicianUserIds: (detail: any) =>
      detail.project.assignments
        .filter((a: any) => a.role === 'TECHNICIAN')
        .map((a: any) => a.user.id),
  };
});

const serviceMock = await import('./service');
const notificationsMock = await import('./log-sheet-notifications');

function createActor(): IJwtPayload {
  return { id: 'user-1', email: 'user@example.com', role: 'TECHNICIAN' };
}

function createDetail(
  assignments: ILogSheetDetailView['project']['assignments']
) {
  return {
    logSheet: {
      id: 'ls-1',
      projectId: 'proj-1',
    },
    project: {
      id: 'proj-1',
      name: 'Project',
      clientName: 'Client',
      assignments,
    },
  } as unknown as ILogSheetDetailView;
}

function createLogSheet(): ILogSheet {
  return {
    id: 'ls-1',
    projectId: 'proj-1',
    date: new Date(),
    notes: null,
    status: 'SUBMITTED',
    locked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    technicianSignatureUrl: null,
    technicianSignedAt: null,
    technicianSignedByUserId: null,
    clientPicSignatureUrl: null,
    clientPicSignedAt: null,
    clientPicSignedByUserId: null,
    submittedAt: null,
    submittedByUserId: null,
    approvedAt: null,
    approvedByUserId: null,
    replacedByUserId: null,
  };
}

describe('updateLogSheetStatusWithNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates directly to updateLogSheetStatus when status is not SUBMITTED', async () => {
    const actor = createActor();

    const logSheet = createLogSheet();
    (
      serviceMock.updateLogSheetStatus as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(logSheet);

    const result = await updateLogSheetStatusWithNotifications(actor, {
      id: 'ls-1',
      status: 'APPROVED',
    });

    expect(serviceMock.validateLogSheetForSubmission).not.toHaveBeenCalled();
    expect(serviceMock.getLogSheetDetail).not.toHaveBeenCalled();
    expect(
      notificationsMock.notifyLimitBreachesOnSubmission
    ).not.toHaveBeenCalled();
    expect(serviceMock.updateLogSheetStatus).toHaveBeenCalledWith(
      actor,
      'ls-1',
      'APPROVED'
    );
    expect(result).toBe(logSheet);
  });

  it('validates, notifies, and updates status when submitting', async () => {
    const actor = createActor();
    const detail = createDetail([
      {
        role: 'TECHNICIAN',
        user: { id: 'tech-1', firstName: 'Tech', lastName: null },
      },
      {
        role: 'PROJECT_PIC',
        user: { id: 'pic-1', firstName: 'Pic', lastName: null },
      },
    ]);

    (
      serviceMock.getLogSheetDetail as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(detail);
    const logSheet = createLogSheet();
    (
      serviceMock.updateLogSheetStatus as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(logSheet);

    const result = await updateLogSheetStatusWithNotifications(actor, {
      id: 'ls-1',
      status: 'SUBMITTED',
    });

    expect(serviceMock.validateLogSheetForSubmission).toHaveBeenCalledWith(
      'ls-1'
    );
    expect(serviceMock.getLogSheetDetail).toHaveBeenCalledWith('ls-1');
    expect(
      notificationsMock.notifyLimitBreachesOnSubmission
    ).toHaveBeenCalledWith({
      evaluatorUserId: actor.id,
      technicianUserIds: ['tech-1'],
      detail,
    });
    expect(serviceMock.updateLogSheetStatus).toHaveBeenCalledWith(
      actor,
      'ls-1',
      'SUBMITTED'
    );
    expect(result).toBe(logSheet);
  });

  it('handles submission when there are no technician assignments', async () => {
    const actor = createActor();
    const detail = createDetail([]);

    (
      serviceMock.getLogSheetDetail as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(detail);
    const logSheet = createLogSheet();
    (
      serviceMock.updateLogSheetStatus as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(logSheet);

    const result = await updateLogSheetStatusWithNotifications(actor, {
      id: 'ls-1',
      status: 'SUBMITTED',
    });

    expect(serviceMock.validateLogSheetForSubmission).toHaveBeenCalledWith(
      'ls-1'
    );
    expect(serviceMock.getLogSheetDetail).toHaveBeenCalledWith('ls-1');
    expect(
      notificationsMock.notifyLimitBreachesOnSubmission
    ).toHaveBeenCalledWith({
      evaluatorUserId: actor.id,
      technicianUserIds: [],
      detail,
    });
    expect(serviceMock.updateLogSheetStatus).toHaveBeenCalledWith(
      actor,
      'ls-1',
      'SUBMITTED'
    );
    expect(result).toBe(logSheet);
  });

  it('propagates errors from validateLogSheetForSubmission', async () => {
    const actor = createActor();
    const error = new Error('Validation failed');
    (
      serviceMock.validateLogSheetForSubmission as unknown as ReturnType<
        typeof vi.fn
      >
    ).mockRejectedValue(error);

    await expect(
      updateLogSheetStatusWithNotifications(actor, {
        id: 'ls-1',
        status: 'SUBMITTED',
      })
    ).rejects.toThrow(error.message);

    expect(serviceMock.getLogSheetDetail).toHaveBeenCalledWith('ls-1');
    expect(serviceMock.validateLogSheetForSubmission).toHaveBeenCalledWith(
      'ls-1'
    );
    expect(
      notificationsMock.notifyLimitBreachesOnSubmission
    ).not.toHaveBeenCalled();
    expect(serviceMock.updateLogSheetStatus).not.toHaveBeenCalled();
  });
});
