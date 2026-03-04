import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAnalyticsData,
  getParameterLimitsForAnalytics,
} from './analytics-service';
import { prisma } from '@/lib/prisma';
import { getProjectReportingScope } from '@/features/projects/reporting-scope';
import type { TWaterQualityRow, TCondenserUnitRow } from './analytics-types';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    parameter: { findUnique: vi.fn(), findMany: vi.fn() },
    logSheetEntry: { findMany: vi.fn() },
    machine: { findMany: vi.fn() },
    project: { findUnique: vi.fn() },
    parameterLimit: { findMany: vi.fn() },
  },
}));

vi.mock('@/features/projects/reporting-scope', () => ({
  getProjectReportingScope: vi.fn(),
}));

const mockPrisma = prisma as unknown as {
  parameter: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  logSheetEntry: { findMany: ReturnType<typeof vi.fn> };
  machine: { findMany: ReturnType<typeof vi.fn> };
  project: { findUnique: ReturnType<typeof vi.fn> };
  parameterLimit: { findMany: ReturnType<typeof vi.fn> };
};

const mockGetProjectReportingScope = getProjectReportingScope as ReturnType<
  typeof vi.fn
>;

describe('analytics-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnalyticsData', () => {
    it('should return analytics data for valid project and period', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });

      // Mock batch parameter fetch
      mockPrisma.parameter.findMany.mockImplementation(({ where }) => {
        const variableNames = where.variableName.in;
        const params: Record<string, { id: string; variableName: string }> = {
          ph_ct: { id: 'param-ph', variableName: 'ph_ct' },
          tds_ct: { id: 'param-tds', variableName: 'tds_ct' },
          conductivity_ct: {
            id: 'param-cond',
            variableName: 'conductivity_ct',
          },
          cycle_ct: { id: 'param-cycle', variableName: 'cycle_ct' },
        };
        return Promise.resolve(
          variableNames.map((vn: string) => params[vn]).filter(Boolean)
        );
      });

      mockPrisma.logSheetEntry.findMany.mockResolvedValue([]);
      mockPrisma.machine.findMany.mockResolvedValue([
        { id: 'machine-1', unitNumber: 1, capacity: '250 TR' },
      ]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      expect(result.daysInMonth).toBe(30);
      expect(Array.isArray(result.waterQuality)).toBe(true);
      expect(Array.isArray(result.condenserApproach)).toBe(true);
      expect(Array.isArray(result.limits)).toBe(true);
    });

    it('should handle February leap year correctly', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-02-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      expect(result.daysInMonth).toBe(29);
    });

    it('should handle February non-leap year correctly', async () => {
      const projectId = 'proj-123';
      const period = new Date('2023-02-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      expect(result.daysInMonth).toBe(28);
    });

    it('should handle 31-day months correctly', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-03-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      expect(result.daysInMonth).toBe(31);
    });
  });

  describe('water quality aggregation', () => {
    it('should aggregate daily values correctly', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });

      mockPrisma.parameter.findMany.mockImplementation(({ where }) => {
        const variableNames = where.variableName.in;
        const params: Record<string, { id: string; variableName: string }> = {
          ph_ct: { id: 'param-ph', variableName: 'ph_ct' },
        };
        return Promise.resolve(
          variableNames.map((vn: string) => params[vn]).filter(Boolean)
        );
      });

      mockPrisma.logSheetEntry.findMany.mockResolvedValue([
        {
          numericValue: 7.5,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-01') },
        },
        {
          numericValue: 7.6,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-15') },
        },
        {
          numericValue: 7.8,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-30') },
        },
      ]);

      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      const phRow = result.waterQuality.find(
        (r: TWaterQualityRow) =>
          r.parameter === 'pH' && r.source === 'COOLING_TOWER'
      );
      expect(phRow).toBeDefined();
      expect(phRow?.dailyValues[0]).toBe(7.5);
      expect(phRow?.dailyValues[14]).toBe(7.6);
      expect(phRow?.dailyValues[29]).toBe(7.8);
      expect(phRow?.dailyValues[10]).toBeNull();
    });

    it('should average multiple entries on same day', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([
        { id: 'param-ph', variableName: 'ph_ct' },
      ]);

      mockPrisma.logSheetEntry.findMany.mockResolvedValue([
        {
          numericValue: 7.0,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-01') },
        },
        {
          numericValue: 8.0,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-01') },
        },
        {
          numericValue: 9.0,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-01') },
        },
      ]);

      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      const phRow = result.waterQuality.find(
        (r: TWaterQualityRow) =>
          r.parameter === 'pH' && r.source === 'COOLING_TOWER'
      );
      expect(phRow?.dailyValues[0]).toBe(8.0);
    });

    it('should handle entries with null numericValue', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([
        { id: 'param-ph', variableName: 'ph_ct' },
      ]);
      mockPrisma.logSheetEntry.findMany.mockResolvedValue([
        {
          numericValue: null,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-01') },
        },
        {
          numericValue: 7.5,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-02') },
        },
      ]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      const phRow = result.waterQuality.find(
        (r: TWaterQualityRow) =>
          r.parameter === 'pH' && r.source === 'COOLING_TOWER'
      );
      expect(phRow?.dailyValues[0]).toBeNull();
      expect(phRow?.dailyValues[1]).toBe(7.5);
    });

    it('should skip entries without logSheet date', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([
        { id: 'param-ph', variableName: 'ph_ct' },
      ]);
      mockPrisma.logSheetEntry.findMany.mockResolvedValue([
        {
          numericValue: 7.5,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: null },
        },
        {
          numericValue: 7.6,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-01') },
        },
      ]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      const phRow = result.waterQuality.find(
        (r: TWaterQualityRow) =>
          r.parameter === 'pH' && r.source === 'COOLING_TOWER'
      );
      expect(phRow?.dailyValues[0]).toBe(7.6);
    });
  });

  describe('condenser approach aggregation', () => {
    it('should aggregate approach and load per machine', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.parameter.findUnique.mockImplementation(({ where }) => {
        if (where.variableName === 'approach_cond') {
          return Promise.resolve({ id: 'param-approach', name: 'Approach' });
        }
        if (where.variableName === 'load_demand_rla_cond') {
          return Promise.resolve({ id: 'param-load', name: 'Load' });
        }
        return Promise.resolve(null);
      });

      mockPrisma.machine.findMany.mockResolvedValue([
        { id: 'machine-1', unitNumber: 1, capacity: '250 TR' },
        { id: 'machine-2', unitNumber: 2, capacity: '450 TR' },
      ]);

      mockPrisma.logSheetEntry.findMany.mockImplementation(({ where }) => {
        if (where.parameterId === 'param-approach') {
          return Promise.resolve([
            { numericValue: 2.5, logSheet: { date: new Date('2024-04-01') } },
            { numericValue: 2.3, logSheet: { date: new Date('2024-04-02') } },
          ]);
        }
        if (where.parameterId === 'param-load') {
          return Promise.resolve([
            { numericValue: 95, logSheet: { date: new Date('2024-04-01') } },
            { numericValue: 98, logSheet: { date: new Date('2024-04-02') } },
          ]);
        }
        return Promise.resolve([]);
      });

      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      expect(result.condenserApproach).toHaveLength(2);

      const chiller1 = result.condenserApproach.find(
        (r: TCondenserUnitRow) => r.unitName === 'Chiller 1'
      );
      expect(chiller1).toBeDefined();
      expect(chiller1?.capacity).toBe('250 TR');
      expect(chiller1?.dailyApproach[0]).toBe(2.5);
      expect(chiller1?.dailyApproach[1]).toBe(2.3);
      expect(chiller1?.dailyLoad[0]).toBe(95);
    });

    it('should use default capacity when machine has no capacity', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.parameter.findUnique.mockImplementation(({ where }) => {
        if (where.variableName === 'approach_cond') {
          return Promise.resolve({ id: 'param-approach', name: 'Approach' });
        }
        return Promise.resolve(null);
      });

      mockPrisma.machine.findMany.mockResolvedValue([
        { id: 'machine-1', unitNumber: 1, capacity: null },
      ]);

      mockPrisma.logSheetEntry.findMany.mockResolvedValue([]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      const chiller1 = result.condenserApproach.find(
        (r: TCondenserUnitRow) => r.unitName === 'Chiller 1'
      );
      expect(chiller1?.capacity).toBe('250 TR');
    });

    it('should return empty array when approach parameter not found', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.parameter.findUnique.mockResolvedValue(null);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      expect(result.condenserApproach).toHaveLength(0);
    });
  });

  describe('parameter limits', () => {
    it('should fetch limits from ParameterLimitProfile', async () => {
      const projectId = 'proj-123';

      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: 'profile-1',
      });

      mockPrisma.parameterLimit.findMany.mockResolvedValue([
        {
          minValue: 6.5,
          maxValue: 8.0,
          parameter: { name: 'pH', variableName: 'ph_ct', unit: '' },
        },
        {
          minValue: null,
          maxValue: 2.2,
          parameter: {
            name: 'Approach',
            variableName: 'approach_cond',
            unit: '°C',
          },
        },
      ]);

      const result = await getParameterLimitsForAnalytics(projectId);

      expect(result).toHaveLength(2);
      expect(result[0].parameterName).toBe('pH');
      expect(result[0].min).toBe(6.5);
      expect(result[0].max).toBe(8.0);
      expect(result[1].max).toBe(2.2);
    });

    it('should return empty array when project has no ParameterLimitProfile', async () => {
      const projectId = 'proj-123';

      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getParameterLimitsForAnalytics(projectId);

      expect(result).toHaveLength(0);
    });

    it('should handle null min/max values', async () => {
      const projectId = 'proj-123';

      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: 'profile-1',
      });

      mockPrisma.parameterLimit.findMany.mockResolvedValue([
        {
          minValue: null,
          maxValue: null,
          parameter: { name: 'Cycle', variableName: 'cycle_ct', unit: 'Cycle' },
        },
      ]);

      const result = await getParameterLimitsForAnalytics(projectId);

      expect(result[0].min).toBeNull();
      expect(result[0].max).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle prisma errors gracefully and return empty results', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockRejectedValue(
        new Error('DB connection failed')
      );
      mockPrisma.machine.findMany.mockRejectedValue(
        new Error('DB connection failed')
      );
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getAnalyticsData(projectId, period);

      expect(consoleSpy).toHaveBeenCalled();
      expect(result.waterQuality).toHaveLength(0);
      expect(result.condenserApproach).toHaveLength(0);

      consoleSpy.mockRestore();
    });

    it('should handle machine query errors gracefully', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.parameter.findUnique.mockResolvedValue({
        id: 'param-approach',
        name: 'Approach',
      });
      mockPrisma.machine.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getAnalyticsData(projectId, period);

      expect(result.condenserApproach).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CPIS-ERROR] Analytics.getCondenserMachines:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle project with no reporting scope', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue(null);
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      expect(result.waterQuality).toHaveLength(0);
      expect(result.condenserApproach).toHaveLength(0);
    });

    it('should handle multiple projectIds in scope', async () => {
      const projectId = 'parent-proj';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: ['parent-proj', 'child-1', 'child-2'],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([]);
      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      await getAnalyticsData(projectId, period);

      const machineCall = mockPrisma.machine.findMany.mock.calls[0];
      expect(machineCall[0].where.projectId).toEqual({
        in: ['parent-proj', 'child-1', 'child-2'],
      });
    });

    it('should handle entries outside month range', async () => {
      const projectId = 'proj-123';
      const period = new Date('2024-04-15');

      mockGetProjectReportingScope.mockResolvedValue({
        projectIds: [projectId],
      });
      mockPrisma.parameter.findMany.mockResolvedValue([
        { id: 'param-ph', variableName: 'ph_ct' },
      ]);

      mockPrisma.logSheetEntry.findMany.mockResolvedValue([
        {
          numericValue: 7.5,
          role: 'VALUE',
          parameterId: 'param-ph',
          logSheet: { date: new Date('2024-04-15') },
        },
      ]);

      mockPrisma.project.findUnique.mockResolvedValue({
        parameterLimitProfileId: null,
      });

      const result = await getAnalyticsData(projectId, period);

      const phRow = result.waterQuality.find(
        (r: TWaterQualityRow) =>
          r.parameter === 'pH' && r.source === 'COOLING_TOWER'
      );
      expect(phRow?.dailyValues).toHaveLength(30);
    });
  });
});
