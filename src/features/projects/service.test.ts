import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getProjects, 
  getDashboardProjects, 
  getProjectById,
  getProjectAssignments,
  createProject,
  updateProject,
  deleteProject,
  setProjectAssignments,
  upsertProjectParameterOverride,
  getAccessibleProjectIds,
  assertCanAccessProject
} from './service';
import { prisma } from '@/lib/prisma';
import { ensureAccess } from '@/lib/rbac';

vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    logSheet: {
      groupBy: vi.fn(),
    },
    workReport: {
      groupBy: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    projectAssignment: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    machine: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    projectParameterOverride: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: {
    PROJECTS_LIST: 'PROJECTS_LIST',
    PROJECTS_ADMIN: 'PROJECTS_ADMIN',
  },
}));

describe('Projects Service', () => {
  const mockActor = { id: 'user-1', role: 'ADMIN' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should fetch projects for the current actor', async () => {
      const mockProjects = [{ id: 'p-1', name: 'Project 1' }];
      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);

      const result = await getProjects(mockActor as any);

      expect(result).toEqual(mockProjects);
      expect(ensureAccess).toHaveBeenCalledWith('ADMIN', 'PROJECTS_LIST', 'read');
    });
  });

  describe('getDashboardProjects', () => {
    it('should fetch dashboard cards with pending counts', async () => {
      const mockProjects = [
        { id: 'p-1', name: 'P1', status: 'ACTIVE', client: { id: 'c-1', name: 'C1' }, assignments: [] }
      ];
      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
      vi.mocked(prisma.logSheet.groupBy).mockResolvedValue([{ projectId: 'p-1', _count: { _all: 5 } }] as any);
      vi.mocked(prisma.workReport.groupBy).mockResolvedValue([{ projectId: 'p-1', _count: { _all: 2 } }] as any);

      const result = await getDashboardProjects(mockActor as any);

      expect(result[0].taskCounts.logSheetsPendingApproval).toBe(5);
      expect(result[0].taskCounts.workReportsPendingApproval).toBe(2);
    });
  });

  describe('getProjectById', () => {
    it('should fetch a single project with details', async () => {
      const mockProject = { id: 'p-1', name: 'Project 1', machines: [] };
      vi.mocked(prisma.project.findFirst).mockResolvedValue(mockProject as any);

      const result = await getProjectById(mockActor as any, 'p-1');

      expect(result).toEqual(mockProject);
    });

    it('should return null if not found', async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);
      const result = await getProjectById(mockActor as any, 'wrong-id');
      expect(result).toBeNull();
    });
  });

  describe('createProject (Addendum)', () => {
    it('should throw if addendum lacks parent', async () => {
      const input = { projectType: 'ADDENDUM', clientId: 'c-1' };
      await expect(createProject(mockActor as any, input as any)).rejects.toThrow('Project addendum harus memiliki project utama');
    });

    it('should throw if parent not found', async () => {
      const input = { projectType: 'ADDENDUM', clientId: 'c-1', parentProjId: 'p-missing' };
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);
      await expect(createProject(mockActor as any, input as any)).rejects.toThrow('Project utama tidak ditemukan');
    });
  });

  describe('getProjectAssignments', () => {
    it('should fetch project assignments', async () => {
      const mockAssignments = [{ id: 'a-1', user: { id: 'u-1' } }];
      vi.mocked(prisma.projectAssignment.findMany).mockResolvedValue(mockAssignments as any);

      const result = await getProjectAssignments(mockActor as any, 'p-1');

      expect(result).toEqual(mockAssignments);
    });
  });

  describe('createProject', () => {
    it('should create a project with machines', async () => {
      const input = {
        name: 'New Project',
        clientId: 'c-1',
        projectType: 'UTAMA' as const,
        machines: [{ unitNumber: 'CH-01', type: 'CHILLER' as const, ownership: 'CORINTEK' as const, status: 'IDLE' as const }]
      };

      vi.mocked(prisma.project.create).mockResolvedValue({ id: 'p-1', ...input } as any);

      const result = await createProject(mockActor as any, input as any);

      expect(result.id).toBe('p-1');
      expect(prisma.project.create).toHaveBeenCalled();
    });
  });

  describe('updateProject (Machine Sync)', () => {
    it('should sync machines (create, update, delete)', async () => {
      const projectId = 'p-1';
      const input = {
        id: projectId,
        machines: [
          { unitNumber: 'NEW-01', type: 'CHILLER', ownership: 'CORINTEK', status: 'IDLE' }, // To create
          { id: 'm-exist', unitNumber: 'UPD-01', type: 'CT', ownership: 'CLIENT', status: 'RUNNING' } // To update
        ]
      };

      // Mock existing machines: 'm-exist' (to be updated) and 'm-old' (to be deleted)
      vi.mocked(prisma.machine.findMany).mockResolvedValue([
        { id: 'm-exist' },
        { id: 'm-old' }
      ] as any);
      vi.mocked(prisma.project.update).mockResolvedValue({ id: projectId } as any);

      await updateProject(mockActor as any, input as any);

      // Verify Delete
      expect(prisma.machine.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: { in: ['m-old'] } }
      }));
      // Verify Create
      expect(prisma.machine.createMany).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ unitNumber: 'NEW-01' })])
      }));
      // Verify Update
      expect(prisma.machine.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'm-exist' },
        data: expect.objectContaining({ unitNumber: 'UPD-01' })
      }));
    });
  });

  describe('deleteProject', () => {
    it('should soft delete a project', async () => {
      vi.mocked(prisma.project.update).mockResolvedValue({ id: 'p-1', deletedAt: new Date() } as any);

      const result = await deleteProject(mockActor as any, 'p-1');

      expect(prisma.project.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) })
      }));
    });
  });

  describe('setProjectAssignments', () => {
    it('should sync project assignments', async () => {
      const projectId = 'p-1';
      const assignments = [{ userId: 'u-1', role: 'TECHNICIAN' as const }];
      
      vi.mocked(prisma.projectAssignment.findMany).mockResolvedValue([] as any);
      
      const result = await setProjectAssignments(mockActor as any, projectId, assignments);
      
      expect(prisma.projectAssignment.upsert).toHaveBeenCalled();
    });
  });

  describe('upsertProjectParameterOverride', () => {
    it('should upsert parameter override', async () => {
      const input = { projectId: 'p-1', parameterId: 'param-1', minValue: 10 };
      
      await upsertProjectParameterOverride(mockActor as any, input);
      
      expect(prisma.projectParameterOverride.upsert).toHaveBeenCalled();
    });
  });

  describe('getAccessibleProjectIds', () => {
    it('should return null for non-scoped roles', async () => {
      const result = await getAccessibleProjectIds({ ...mockActor, role: 'ADMIN' } as any);
      expect(result).toBeNull();
    });

    it('should return ids for scoped roles', async () => {
      vi.mocked(prisma.projectAssignment.findMany).mockResolvedValue([{ projectId: 'p-1' }] as any);
      const result = await getAccessibleProjectIds({ ...mockActor, role: 'TECHNICIAN' } as any);
      expect(result).toEqual(['p-1']);
    });
  });

  describe('assertCanAccessProject', () => {
    it('should not throw for admin', async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 'p-1' } as any);
      await expect(assertCanAccessProject({ ...mockActor, role: 'ADMIN' } as any, 'p-1')).resolves.not.toThrow();
    });

    it('should throw for unauthorized user', async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);
      await expect(assertCanAccessProject({ ...mockActor, role: 'TECHNICIAN' } as any, 'p-1')).rejects.toThrow('Unauthorized');
    });
  });
});
