/**
 * Regression tests for P0 authorization hardening of lab-analysis pages.
 * Server Components must authenticate, enforce RBAC, and verify project access
 * before rendering data.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/lib/auth-helpers', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/features/projects/service', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: { findUnique: vi.fn() },
  },
}));

vi.mock('@/features/lab-analyses/service', () => ({
  getLabAnalysesByProject: vi.fn(),
  getLabAnalysisDetail: vi.fn(),
  getCoolingWaterQualityParameters: vi.fn(),
  getEffectiveParameterLimits: vi.fn(),
}));

vi.mock('@/features/lab-analyses/components/lab-analysis-form', () => ({
  LabAnalysisForm: () => null,
}));

vi.mock('@/features/lab-analyses/components/lab-analysis-print', () => ({
  LabAnalysisPrint: () => null,
}));

vi.mock('./components/lab-analysis-list', () => ({
  LabAnalysisList: () => null,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => children,
}));

import { getCurrentUser } from '@/lib/auth-helpers';
import { getProjectById } from '@/features/projects/service';
import * as labService from '@/features/lab-analyses/service';
import { prisma } from '@/lib/prisma';

import LabAnalysesPage from '@/app/(main)/lab-analyses/[projectId]/page';
import NewLabAnalysisPage from '@/app/(main)/lab-analyses/[projectId]/new/page';
import EditLabAnalysisPage from '@/app/(main)/lab-analyses/[projectId]/[labAnalysisId]/edit/page';
import LabAnalysisPrintPage from '@/app/(main)/lab-analyses/[projectId]/[labAnalysisId]/print/page';

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174000';
const ANALYSIS_ID = '223e4567-e89b-12d3-a456-426614174001';

const technicianActor = {
  id: '323e4567-e89b-12d3-a456-426614174002',
  email: 'teknisi@example.com',
  role: 'TECHNICIAN',
};

const adminActor = {
  id: '423e4567-e89b-12d3-a456-426614174003',
  email: 'admin@example.com',
  role: 'ADMIN',
};

const labAnalysis = {
  id: ANALYSIS_ID,
  projectId: PROJECT_ID,
  columns: [],
  entries: [],
};

function makeParams(extra: Record<string, string> = {}) {
  return Promise.resolve({ projectId: PROJECT_ID, ...extra });
}

describe('lab-analysis page authorization (P0 regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(labService.getLabAnalysesByProject).mockResolvedValue([]);
    vi.mocked(labService.getLabAnalysisDetail).mockResolvedValue(
      labAnalysis as never
    );
    vi.mocked(labService.getCoolingWaterQualityParameters).mockResolvedValue(
      []
    );
    vi.mocked(labService.getEffectiveParameterLimits).mockResolvedValue(
      new Map() as never
    );
  });

  it('unauthenticated access to the project list is rejected', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(LabAnalysesPage({ params: makeParams() })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
    expect(labService.getLabAnalysesByProject).not.toHaveBeenCalled();
  });

  it('role without LAB_ANALYSES read is rejected', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(technicianActor as never);

    await expect(LabAnalysesPage({ params: makeParams() })).rejects.toThrow(
      'Unauthorized'
    );
    expect(labService.getLabAnalysesByProject).not.toHaveBeenCalled();
  });

  it('unauthorized project access is rejected', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
    vi.mocked(getProjectById).mockResolvedValue(null);

    await expect(LabAnalysesPage({ params: makeParams() })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
    expect(labService.getLabAnalysesByProject).not.toHaveBeenCalled();
  });

  it('authorized project access renders the list', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
    vi.mocked(getProjectById).mockResolvedValue({ id: PROJECT_ID } as never);

    await LabAnalysesPage({ params: makeParams() });

    expect(getProjectById).toHaveBeenCalledWith(adminActor, PROJECT_ID);
    expect(labService.getLabAnalysesByProject).toHaveBeenCalledWith(PROJECT_ID);
  });

  describe('new lab-analysis page', () => {
    it('unauthenticated access is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      await expect(
        NewLabAnalysisPage({ params: makeParams() })
      ).rejects.toThrow('NEXT_NOT_FOUND');
      expect(prisma.project.findUnique).not.toHaveBeenCalled();
    });

    it('role without LAB_ANALYSES create is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(technicianActor as never);

      await expect(
        NewLabAnalysisPage({ params: makeParams() })
      ).rejects.toThrow('Unauthorized');
    });

    it('unauthorized project access is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
      vi.mocked(getProjectById).mockResolvedValue(null);

      await expect(
        NewLabAnalysisPage({ params: makeParams() })
      ).rejects.toThrow('NEXT_NOT_FOUND');
      expect(prisma.project.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('edit lab-analysis page', () => {
    const params = () =>
      Promise.resolve({ projectId: PROJECT_ID, labAnalysisId: ANALYSIS_ID });

    it('unauthenticated access is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      await expect(EditLabAnalysisPage({ params: params() })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
    });

    it('role without LAB_ANALYSES update is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(technicianActor as never);

      await expect(EditLabAnalysisPage({ params: params() })).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('unauthorized project access is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
      vi.mocked(getProjectById).mockResolvedValue(null);

      await expect(EditLabAnalysisPage({ params: params() })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
    });

    it('analysis belonging to a different project is not found', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
      vi.mocked(getProjectById).mockResolvedValue({ id: PROJECT_ID } as never);
      vi.mocked(labService.getLabAnalysisDetail).mockResolvedValue({
        ...labAnalysis,
        projectId: 'other-project',
      } as never);

      await expect(EditLabAnalysisPage({ params: params() })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
    });

    it('authorized access renders the form', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
      vi.mocked(getProjectById).mockResolvedValue({ id: PROJECT_ID } as never);

      await EditLabAnalysisPage({ params: params() });

      expect(getProjectById).toHaveBeenCalledWith(adminActor, PROJECT_ID);
    });
  });

  describe('print page', () => {
    const params = () =>
      Promise.resolve({ projectId: PROJECT_ID, labAnalysisId: ANALYSIS_ID });

    it('unauthenticated access is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      await expect(LabAnalysisPrintPage({ params: params() })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
      expect(labService.getLabAnalysisDetail).not.toHaveBeenCalled();
    });

    it('role without LAB_ANALYSES read is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(technicianActor as never);

      await expect(LabAnalysisPrintPage({ params: params() })).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('unauthorized project access is rejected', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
      vi.mocked(getProjectById).mockResolvedValue(null);

      await expect(LabAnalysisPrintPage({ params: params() })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
      expect(labService.getLabAnalysisDetail).not.toHaveBeenCalled();
    });

    it('analysis belonging to a different project is not found', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
      vi.mocked(getProjectById).mockResolvedValue({ id: PROJECT_ID } as never);
      vi.mocked(labService.getLabAnalysisDetail).mockResolvedValue({
        ...labAnalysis,
        projectId: 'other-project',
      } as never);

      await expect(LabAnalysisPrintPage({ params: params() })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
    });

    it('authorized access renders the print view', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(adminActor as never);
      vi.mocked(getProjectById).mockResolvedValue({ id: PROJECT_ID } as never);

      await LabAnalysisPrintPage({ params: params() });

      expect(labService.getLabAnalysisDetail).toHaveBeenCalledWith(ANALYSIS_ID);
    });
  });
});
