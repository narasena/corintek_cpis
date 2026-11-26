/**
 * Regression tests for P0 authorization hardening of work-report Server Actions.
 * Covers cross-project access denial and APPROVED status injection.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/features/auth/lib/user-context', () => ({
  requireActor: vi.fn(),
  getCurrentUserDetails: vi.fn(),
}));

vi.mock('@/features/projects/service', () => ({
  assertCanAccessProject: vi.fn(),
}));

vi.mock('@/features/work-reports/service', () => ({
  getWorkReportById: vi.fn(),
  getWorkReportsByProject: vi.fn(),
  createWorkReport: vi.fn(),
  updateWorkReport: vi.fn(),
  deleteWorkReport: vi.fn(),
  deleteWorkReportPhoto: vi.fn(),
  updateWorkReportStatus: vi.fn(),
  saveWorkReportSignature: vi.fn(),
  addWorkReportPhoto: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    workReportPhoto: { findUnique: vi.fn() },
  },
}));

import { requireActor } from '@/features/auth/lib/user-context';
import { assertCanAccessProject } from '@/features/projects/service';
import * as service from '@/features/work-reports/service';
import { prisma } from '@/lib/prisma';
import {
  getWorkReportByIdAction,
  getWorkReportsByProjectAction,
  updateWorkReportAction,
  deleteWorkReportAction,
  deleteWorkReportPhotoAction,
  createWorkReportAction,
  approveWorkReportAction,
} from './actions';

const PROJECT_A = '123e4567-e89b-12d3-a456-426614174000';
const PROJECT_B = '223e4567-e89b-12d3-a456-426614174001';
const REPORT_ID = '323e4567-e89b-12d3-a456-426614174002';
const PHOTO_ID = '423e4567-e89b-12d3-a456-426614174003';

const mockActor = {
  id: '523e4567-e89b-12d3-a456-426614174004',
  email: 'pic@example.com',
  role: 'SUPERVISOR',
};

function makeWorkReport(overrides: Record<string, unknown> = {}) {
  return {
    id: REPORT_ID,
    projectId: PROJECT_A,
    status: 'DRAFT',
    deletedAt: null,
    ...overrides,
  };
}

function makeFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base = {
    projectId: PROJECT_A,
    date: '2026-01-15',
    situation: 'Normal',
    workDone: 'Pengecekan',
    workResult: 'Baik',
    status: 'DRAFT',
    ...overrides,
  };
  for (const [key, value] of Object.entries(base)) {
    fd.append(key, value);
  }
  return fd;
}

describe('work-report action authorization (P0 regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActor).mockResolvedValue(mockActor as never);
  });

  describe('getWorkReportByIdAction', () => {
    it('denies retrieval when actor cannot access the report project', async () => {
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport({ projectId: PROJECT_B }) as never
      );
      vi.mocked(assertCanAccessProject).mockRejectedValue(
        new Error('Unauthorized')
      );

      const res = await getWorkReportByIdAction(REPORT_ID);

      expect(res.success).toBe(false);
      expect(assertCanAccessProject).toHaveBeenCalledWith(mockActor, PROJECT_B);
    });

    it('returns the report when actor can access the project', async () => {
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport() as never
      );
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

      const res = await getWorkReportByIdAction(REPORT_ID);

      expect(res.success).toBe(true);
      expect(assertCanAccessProject).toHaveBeenCalledWith(mockActor, PROJECT_A);
    });
  });

  describe('getWorkReportsByProjectAction', () => {
    it('denies listing for an inaccessible project', async () => {
      vi.mocked(assertCanAccessProject).mockRejectedValue(
        new Error('Unauthorized')
      );

      const res = await getWorkReportsByProjectAction(PROJECT_B);

      expect(res.success).toBe(false);
      expect(assertCanAccessProject).toHaveBeenCalledWith(mockActor, PROJECT_B);
      expect(service.getWorkReportsByProject).not.toHaveBeenCalled();
    });
  });

  describe('updateWorkReportAction', () => {
    it('denies cross-project update using server-resolved project id', async () => {
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport({ projectId: PROJECT_B }) as never
      );
      vi.mocked(assertCanAccessProject).mockRejectedValue(
        new Error('Unauthorized')
      );

      const res = await updateWorkReportAction(makeFormData());

      expect(res.success).toBe(false);
      expect(assertCanAccessProject).toHaveBeenCalledWith(mockActor, PROJECT_B);
      expect(service.updateWorkReport).not.toHaveBeenCalled();
    });

    it('rejects APPROVED status injected through FormData', async () => {
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport() as never
      );
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);

      const fd = makeFormData({ status: 'APPROVED' });
      fd.append('id', REPORT_ID);

      const res = await updateWorkReportAction(fd);

      expect(res.success).toBe(false);
      expect(service.updateWorkReport).not.toHaveBeenCalled();
    });

    it('forces server-resolved projectId even if client sends another project', async () => {
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport({ projectId: PROJECT_A }) as never
      );
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(service.updateWorkReport).mockResolvedValue(
        makeWorkReport({ projectId: PROJECT_A }) as never
      );

      const fd = makeFormData({ projectId: PROJECT_B });
      fd.append('id', REPORT_ID);
      await updateWorkReportAction(fd);

      expect(service.updateWorkReport).toHaveBeenCalledWith(
        expect.objectContaining({ id: REPORT_ID, projectId: PROJECT_A })
      );
    });
  });

  describe('deleteWorkReportAction', () => {
    it('denies cross-project deletion', async () => {
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport({ projectId: PROJECT_B }) as never
      );
      vi.mocked(assertCanAccessProject).mockRejectedValue(
        new Error('Unauthorized')
      );

      const res = await deleteWorkReportAction(REPORT_ID);

      expect(res.success).toBe(false);
      expect(service.deleteWorkReport).not.toHaveBeenCalled();
    });
  });

  describe('deleteWorkReportPhotoAction', () => {
    it('denies cross-project photo deletion', async () => {
      vi.mocked(prisma.workReportPhoto.findUnique).mockResolvedValue({
        workReportId: REPORT_ID,
      } as never);
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport({ projectId: PROJECT_B }) as never
      );
      vi.mocked(assertCanAccessProject).mockRejectedValue(
        new Error('Unauthorized')
      );

      const fd = new FormData();
      fd.append('photoId', PHOTO_ID);
      fd.append('workReportId', REPORT_ID);
      fd.append('projectId', PROJECT_A);

      const res = await deleteWorkReportPhotoAction(fd);

      expect(res.success).toBe(false);
      expect(assertCanAccessProject).toHaveBeenCalledWith(mockActor, PROJECT_B);
      expect(service.deleteWorkReportPhoto).not.toHaveBeenCalled();
    });

    it('deletes photo when actor can access the report project', async () => {
      vi.mocked(prisma.workReportPhoto.findUnique).mockResolvedValue({
        workReportId: REPORT_ID,
      } as never);
      vi.mocked(service.getWorkReportById).mockResolvedValue(
        makeWorkReport() as never
      );
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(service.deleteWorkReportPhoto).mockResolvedValue({} as never);

      const fd = new FormData();
      fd.append('photoId', PHOTO_ID);
      fd.append('workReportId', REPORT_ID);

      const res = await deleteWorkReportPhotoAction(fd);

      expect(res.success).toBe(true);
      expect(service.deleteWorkReportPhoto).toHaveBeenCalledWith(PHOTO_ID);
    });
  });

  describe('createWorkReportAction', () => {
    it('denies creation against an inaccessible project', async () => {
      vi.mocked(assertCanAccessProject).mockRejectedValue(
        new Error('Unauthorized')
      );

      const res = await createWorkReportAction(
        makeFormData({ projectId: PROJECT_B })
      );

      expect(res.success).toBe(false);
      expect(assertCanAccessProject).toHaveBeenCalledWith(mockActor, PROJECT_B);
      expect(service.createWorkReport).not.toHaveBeenCalled();
    });

    it('creates report for accessible project', async () => {
      vi.mocked(assertCanAccessProject).mockResolvedValue(undefined);
      vi.mocked(service.createWorkReport).mockResolvedValue(
        makeWorkReport() as never
      );

      const res = await createWorkReportAction(makeFormData());

      expect(res.success).toBe(true);
      expect(service.createWorkReport).toHaveBeenCalled();
    });
  });

  describe('approval workflow remains functional', () => {
    it('approve action routes through the dedicated status workflow', async () => {
      vi.mocked(service.updateWorkReportStatus).mockResolvedValue(
        makeWorkReport({ status: 'APPROVED' }) as never
      );

      const res = await approveWorkReportAction(REPORT_ID);

      expect(res.success).toBe(true);
      expect(service.updateWorkReportStatus).toHaveBeenCalledWith(
        mockActor,
        REPORT_ID,
        'APPROVED'
      );
      expect(service.updateWorkReport).not.toHaveBeenCalled();
    });
  });
});
