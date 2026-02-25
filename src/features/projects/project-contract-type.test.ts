import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CreateProjectSchema,
  type TCreateProject,
} from '@/features/projects/types';
import { createProject } from '@/features/projects/service';
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

describe('Project contractType behavior on createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults contractType to DIRECT when omitted', async () => {
    const input = CreateProjectSchema.parse({
      clientId: crypto.randomUUID(),
      name: 'Project Without Explicit Contract Type',
      startDate: new Date().toISOString(),
    });

    (
      prisma.project.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 'p-direct-default',
      clientId: input.clientId,
      name: input.name,
      contractType: input.contractType,
    });

    await createProject(
      { id: 'u1', role: 'ADMIN' } as never,
      input as TCreateProject
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contractType: 'DIRECT',
        }),
      })
    );
  });

  it('uses provided SUBCONTRACT contractType when specified', async () => {
    const input = CreateProjectSchema.parse({
      clientId: crypto.randomUUID(),
      name: 'Subcontract Project',
      startDate: new Date().toISOString(),
      contractType: 'SUBCONTRACT',
    });

    (
      prisma.project.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 'p-subcontract',
      clientId: input.clientId,
      name: input.name,
      contractType: input.contractType,
    });

    await createProject(
      { id: 'u1', role: 'ADMIN' } as never,
      input as TCreateProject
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contractType: 'SUBCONTRACT',
        }),
      })
    );
  });

  it('rejects invalid contractType at validation layer', () => {
    expect(() =>
      CreateProjectSchema.parse({
        clientId: crypto.randomUUID(),
        name: 'Invalid Contract Type',
        startDate: new Date().toISOString(),
        contractType: 'INVALID',
      })
    ).toThrow();
  });
});
