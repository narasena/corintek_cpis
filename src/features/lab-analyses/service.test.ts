import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLabAnalysesByProject,
  getLabAnalysisDetail,
  getCoolingWaterQualityParameters,
  createLabAnalysis,
  updateLabAnalysis,
} from './service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    labAnalysis: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    labAnalysisColumn: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    labAnalysisEntry: {
      create: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    parameter: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(cb => cb(prisma)),
  },
}));

describe('Lab Analysis Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLabAnalysesByProject', () => {
    it('should fetch lab analyses for a project', async () => {
      const mockAnalyses = [{ id: 'la-1', date: new Date() }];
      vi.mocked(prisma.labAnalysis.findMany).mockResolvedValue(
        mockAnalyses as any
      );

      const result = await getLabAnalysesByProject('p-1');
      expect(result).toEqual(mockAnalyses);
    });
  });

  describe('createLabAnalysis', () => {
    it('should create a lab analysis with columns and entries', async () => {
      const input = {
        projectId: 'p-1',
        date: new Date(),
        columns: [{ tempId: 'c1', unitNumber: 'U1', kind: 'UNIT' }],
        entries: [
          { parameterId: 'param1', columnTempId: 'c1', textValue: 'value' },
        ],
      };

      vi.mocked(prisma.labAnalysis.create).mockResolvedValue({
        id: 'la-1',
      } as any);
      vi.mocked(prisma.labAnalysisColumn.create).mockResolvedValue({
        id: 'real-c1',
        tempId: 'c1',
      } as any);

      const result = await createLabAnalysis(input as any);
      expect(result.id).toBe('la-1');
      expect(prisma.labAnalysis.create).toHaveBeenCalled();
    });
  });

  describe('updateLabAnalysis', () => {
    it('should update an existing lab analysis and sync columns/entries', async () => {
      const input = {
        id: 'la-1',
        date: new Date(),
        columns: [
          { id: 'c-exist', unitNumber: 'U1' }, // Update
          { tempId: 'c-new', unitNumber: 'U2' }, // Create
        ],
        entries: [
          { parameterId: 'p1', columnId: 'c-exist', textValue: 'v1' },
          { parameterId: 'p1', columnTempId: 'c-new', textValue: 'v2' },
        ],
      };

      // Mock existing columns: 'c-exist' (stay) and 'c-old' (remove)
      vi.mocked(prisma.labAnalysisColumn.findMany).mockResolvedValue([
        { id: 'c-exist' },
        { id: 'c-old' },
      ] as any);
      vi.mocked(prisma.labAnalysis.update).mockResolvedValue({
        id: 'la-1',
      } as any);
      vi.mocked(prisma.labAnalysisColumn.create).mockResolvedValue({
        id: 'real-new',
        tempId: 'c-new',
      } as any);

      const result = await updateLabAnalysis(input as any);

      expect(result.id).toBe('la-1');
      // Verify column deletion
      expect(prisma.labAnalysisColumn.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: { in: ['c-old'] } }),
        })
      );
      // Verify column creation
      expect(prisma.labAnalysisColumn.create).toHaveBeenCalled();
      // Verify entry upserts
      expect(prisma.labAnalysisEntry.upsert).toHaveBeenCalledTimes(2);
    });
  });
});
