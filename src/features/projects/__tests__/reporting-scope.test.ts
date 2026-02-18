import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectReportingScope } from '@/features/projects/reporting-scope';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => {
  const project = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  };

  return {
    prisma: {
      project,
    },
  };
});

describe('getProjectReportingScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when project does not exist', async () => {
    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(null);

    const result = await getProjectReportingScope('missing-id');

    expect(result).toBeNull();
  });

  it('returns null when project is soft-deleted', async () => {
    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'p1',
        projectType: 'UTAMA',
        parentProjId: null,
        deletedAt: new Date(),
      });

    const result = await getProjectReportingScope('p1');

    expect(result).toBeNull();
  });

  it('returns utama and its addenda when project is UTAMA', async () => {
    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'utama-1',
        projectType: 'UTAMA',
        parentProjId: null,
        deletedAt: null,
      });

    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: 'add-1',
          projectType: 'ADDENDUM',
          parentProjId: 'utama-1',
          deletedAt: null,
        },
        {
          id: 'add-2',
          projectType: 'ADDENDUM',
          parentProjId: 'utama-1',
          deletedAt: null,
        },
      ]);

    const result = await getProjectReportingScope('utama-1');

    expect(result).toEqual({
      rootProjectId: 'utama-1',
      projectIds: ['utama-1', 'add-1', 'add-2'],
    });
  });

  it('returns only project when addendum has no parent', async () => {
    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'add-orphan',
        projectType: 'ADDENDUM',
        parentProjId: null,
        deletedAt: null,
      });

    const result = await getProjectReportingScope('add-orphan');

    expect(result).toEqual({
      rootProjectId: 'add-orphan',
      projectIds: ['add-orphan'],
    });
  });

  it('falls back to addendum only when parent is missing or deleted', async () => {
    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'add-1',
        projectType: 'ADDENDUM',
        parentProjId: 'utama-missing',
        deletedAt: null,
      })
      .mockResolvedValueOnce(null);

    const resultMissingParent = await getProjectReportingScope('add-1');

    expect(resultMissingParent).toEqual({
      rootProjectId: 'add-1',
      projectIds: ['add-1'],
    });

    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'add-2',
        projectType: 'ADDENDUM',
        parentProjId: 'utama-deleted',
        deletedAt: null,
      })
      .mockResolvedValueOnce({
        id: 'utama-deleted',
        projectType: 'UTAMA',
        parentProjId: null,
        deletedAt: new Date(),
      });

    const resultDeletedParent = await getProjectReportingScope('add-2');

    expect(resultDeletedParent).toEqual({
      rootProjectId: 'add-2',
      projectIds: ['add-2'],
    });
  });

  it('returns family rooted at utama when project is addendum with siblings', async () => {
    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'add-1',
        projectType: 'ADDENDUM',
        parentProjId: 'utama-1',
        deletedAt: null,
      })
      .mockResolvedValueOnce({
        id: 'utama-1',
        projectType: 'UTAMA',
        parentProjId: null,
        deletedAt: null,
      });

    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: 'add-1',
          projectType: 'ADDENDUM',
          parentProjId: 'utama-1',
          deletedAt: null,
        },
        {
          id: 'add-2',
          projectType: 'ADDENDUM',
          parentProjId: 'utama-1',
          deletedAt: null,
        },
      ]);

    const result = await getProjectReportingScope('add-1');

    expect(result).toEqual({
      rootProjectId: 'utama-1',
      projectIds: ['utama-1', 'add-1', 'add-2'],
    });
  });

  it('logs and rethrows on unexpected error', async () => {
    const error = new Error('Unexpected failure');
    (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(error);

    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await expect(getProjectReportingScope('p1')).rejects.toThrow(error);

    expect(consoleSpy).toHaveBeenCalledWith(
      '[CPIS-ERROR] Projects.ReportingScope.Get:',
      error
    );

    consoleSpy.mockRestore();
  });
}

