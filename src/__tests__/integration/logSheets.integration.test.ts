import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/v1/projects/[id]/log-sheets/route';
import { prisma } from '@/features/api/connection/prisma';
import { fetchProjectByIdService } from '@/features/api/features/v1/projects/project.service';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { NextRequest } from 'next/server';
import { ILogSheetServiceData } from '@/types/log-sheet.type';

// Mock all dependencies
vi.mock('@/features/api/connection/prisma');
vi.mock('@/features/api/features/v1/projects/project.service');
vi.mock('@/utils/api/v1/validation/requestValidation');

describe('Log Sheets Integration Tests', () => {
  const mockProjectId = 'integration-test-project-id';
  const mockProject = {
    id: mockProjectId,
    name: 'Integration Test Project',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    clientId: 'client-id',
    status: 'ACTIVE',
  };

  const mockParameterGroups = [
    {
      id: 'general-group',
      name: 'General Parameters',
      type: 'LOG_SHEET',
      members: [
        {
          parameter: {
            id: 'ambient-temp',
            name: 'Ambient Temperature',
            valueType: 'NUMBER',
            unit: '°C',
          },
        },
        {
          parameter: {
            id: 'system-running',
            name: 'System Running',
            valueType: 'BOOLEAN',
          },
        },
        {
          parameter: {
            id: 'observations',
            name: 'Observations',
            valueType: 'TEXT',
          },
        },
      ],
    },
  ];

  const mockCreatedLogSheet = {
    id: 'created-log-sheet-id',
    projectId: mockProjectId,
    date: new Date('2024-01-15'),
    notes: 'Integration test log sheet',
    clientPICSignatureId: `test-signature-client-personnel-${mockProjectId}`,
    PICSignatureId: `test-signature-personnel-${mockProjectId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockTx: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup transaction mock
    mockTx = {
      logSheet: {
        create: vi.fn().mockResolvedValue(mockCreatedLogSheet),
      },
      logSheetHistory: {
        create: vi.fn().mockResolvedValue({ id: 'history-id' }),
      },
      machine: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      parameterGroup: {
        findMany: vi.fn().mockResolvedValue(mockParameterGroups),
      },
      logSheetDetail: {
        createMany: vi.fn().mockResolvedValue({ count: 3 }),
      },
    };

    // Setup mocks
    vi.mocked(fetchProjectByIdService).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.parameterGroup.findMany).mockResolvedValue(
      mockParameterGroups as any
    );
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });
  });

  describe('Complete Log Sheet Creation Flow', () => {
    it('should successfully create a complete log sheet', async () => {
      // Arrange
      const logSheetData: ILogSheetServiceData = {
        date: '2024-01-15',
        notes: 'Integration test log sheet',
        chemicalUsageData: [{ id: 'chemical-1', quantity: 10 }],
        'general-group': {
          'ambient-temp': 22.0,
          'system-running': true,
          observations: 'All systems operating normally',
        },
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(logSheetData),
      } as unknown as NextRequest;

      const mockParams = Promise.resolve({ id: mockProjectId });

      vi.mocked(requestValidation).mockReturnValue(logSheetData);

      // Act
      const response = await POST(mockRequest, { params: mockParams });
      const result = await response.json();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Log sheet berhasil dibuat');
      expect(result.newLogSheet).toEqual(mockCreatedLogSheet);

      // Verify the complete flow
      expect(fetchProjectByIdService).toHaveBeenCalledWith(mockProjectId);
      expect(prisma.parameterGroup.findMany).toHaveBeenCalledWith({
        where: { type: 'LOG_SHEET' },
        include: {
          members: {
            include: {
              parameter: true,
            },
          },
        },
      });
      expect(requestValidation).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();

      // Verify log sheet creation
      expect(mockTx.logSheet.create).toHaveBeenCalledWith({
        data: {
          projectId: mockProjectId,
          date: new Date('2024-01-15'),
          notes: 'Integration test log sheet',
          clientPICSignatureId: `test-signature-client-personnel-${mockProjectId}`,
          PICSignatureId: `test-signature-personnel-${mockProjectId}`,
        },
      });

      // Verify history creation
      expect(mockTx.logSheetHistory.create).toHaveBeenCalledWith({
        data: {
          logSheetId: 'created-log-sheet-id',
          status: 'DRAFT',
        },
      });
    });

    it('should handle backdated log sheet creation', async () => {
      // Arrange
      const backdatedData: ILogSheetServiceData = {
        date: '2023-12-01', // Backdated entry
        notes: 'Backdated entry for maintenance record',
        chemicalUsageData: [],
        'general-group': {
          'ambient-temp': 18.5,
          'system-running': false,
          observations: 'System was down for maintenance',
        },
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(backdatedData),
      } as unknown as NextRequest;

      const mockParams = Promise.resolve({ id: mockProjectId });

      const backdatedLogSheet = {
        ...mockCreatedLogSheet,
        date: new Date('2023-12-01'),
        notes: 'Backdated entry for maintenance record',
      };

      mockTx.logSheet.create.mockResolvedValue(backdatedLogSheet);
      vi.mocked(requestValidation).mockReturnValue(backdatedData);

      // Act
      const response = await POST(mockRequest, { params: mockParams });
      const result = await response.json();

      // Assert
      expect(result.success).toBe(true);
      expect(result.newLogSheet.date).toEqual(new Date('2023-12-01'));
      expect(result.newLogSheet.notes).toBe(
        'Backdated entry for maintenance record'
      );

      // Verify the date was correctly processed
      expect(mockTx.logSheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: new Date('2023-12-01'),
          notes: 'Backdated entry for maintenance record',
        }),
      });
    });

    it('should handle project not found error', async () => {
      // Arrange
      const logSheetData = {
        date: '2024-01-15',
        notes: 'Test',
        chemicalUsageData: [],
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(logSheetData),
      } as unknown as NextRequest;

      const mockParams = Promise.resolve({ id: 'non-existent-project' });

      vi.mocked(fetchProjectByIdService).mockResolvedValue(undefined);

      // Act
      const response = await POST(mockRequest, { params: mockParams });
      const result = await response.json();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Project not found');
      expect(response.status).toBe(404);

      // Verify that subsequent operations were not called
      expect(prisma.parameterGroup.findMany).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
