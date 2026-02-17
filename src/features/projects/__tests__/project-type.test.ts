import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CreateProjectSchema,
  type TCreateProject,
} from '@/features/projects/types';
import { createProject, updateProject } from '@/features/projects/service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => {
  const project = {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  };

  const tx = {
    project,
    machine: {
      createMany: vi.fn(),
    },
  };

  return {
    prisma: {
      project,
      machine: tx.machine,
      $transaction: (fn: (innerTx: typeof tx) => Promise<unknown>) => fn(tx),
    },
  };
});

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: {
    PROJECTS_ADMIN: 'PROJECTS_ADMIN',
  },
}));

describe('Project type and parent linkage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults projectType to UTAMA and parentProjId to null on create', async () => {
    const input = CreateProjectSchema.parse({
      clientId: crypto.randomUUID(),
      name: 'Main Project',
      startDate: new Date().toISOString(),
    });

    (
      prisma.project.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 'p1',
      clientId: input.clientId,
      name: input.name,
      projectType: input.projectType,
      parentProjId: null,
    });

    await createProject(
      { id: 'u1', role: 'ADMIN' } as never,
      input as TCreateProject
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectType: 'UTAMA',
          parentProjId: null,
        }),
      })
    );
  });

  it('creates ADDENDUM with parentProjId when provided', async () => {
    const parentId = crypto.randomUUID();
    const input = CreateProjectSchema.parse({
      clientId: crypto.randomUUID(),
      name: 'Addendum Project',
      startDate: new Date().toISOString(),
      projectType: 'ADDENDUM',
      parentProjId: parentId,
    });

    (
      prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: parentId,
      clientId: input.clientId,
      projectType: 'UTAMA',
    });

    (
      prisma.project.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 'p2',
      clientId: input.clientId,
      name: input.name,
      projectType: input.projectType,
      parentProjId: parentId,
    });

    await createProject(
      { id: 'u1', role: 'ADMIN' } as never,
      input as TCreateProject
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectType: 'ADDENDUM',
          parentProjId: parentId,
        }),
      })
    );
  });

  it('leaves parentProjId unchanged when omitted on update', async () => {
    (
      prisma.project.update as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 'p3',
      clientId: 'c1',
      name: 'Existing Project',
      projectType: 'ADDENDUM',
      parentProjId: 'parent-1',
    });

    await updateProject(
      { id: 'u1', role: 'ADMIN' } as never,
      { id: 'p3', name: 'Renamed Project' } as never
    );

    expect(prisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          parentProjId: expect.anything(),
        }),
      })
    );
  });

  it('clears parentProjId when explicitly set to null on update', async () => {
    (
      prisma.project.update as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 'p4',
      clientId: 'c1',
      name: 'Project Without Parent',
      projectType: 'UTAMA',
      parentProjId: null,
    });

    await updateProject(
      { id: 'u1', role: 'ADMIN' } as never,
      { id: 'p4', parentProjId: null } as never
    );

    expect(prisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parentProjId: null,
        }),
      })
    );
  });

  it('rejects invalid parentProjId format at validation layer', () => {
    expect(() =>
      CreateProjectSchema.parse({
        clientId: crypto.randomUUID(),
        name: 'Invalid Parent',
        startDate: new Date().toISOString(),
        projectType: 'ADDENDUM',
        parentProjId: 'not-a-uuid',
      })
    ).toThrow();
  });
});
