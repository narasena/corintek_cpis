import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLogSheetService } from '@/features/api/features/v1/log-sheets/logSheets.service';
import { AppError } from '@/lib/app-error';
import { ILogSheetServiceData } from '@/types/log-sheet.type';

describe('LogSheets Service', () => {
  const mockProjectId = 'test-project-id';
  const mockLogSheetId = 'test-log-sheet-id';
  const mockMachineId = 'test-machine-id';
  const mockParameterId = 'test-parameter-id';
  const mockGroupId = 'test-group-id';

  const mockMachines = [
    {
      id: mockMachineId,
      unitNumber: 1,
      type: 'CHILLER',
    },
  ];

  const mockParameterGroups = [
    {
      id: mockGroupId,
      name: 'Unit Evaporator',
      type: 'LOG_SHEET',
      members: [
        {
          parameter: {
            id: mockParameterId,
            name: 'Temperature',
            valueType: 'NUMBER',
            unit: '°C',
          },
        },
      ],
    },
  ];

  const mockCreatedLogSheet = {
    id: mockLogSheetId,
    projectId: mockProjectId,
    date: new Date('2024-01-15'),
    notes: 'Test notes',
    clientPICSignatureId: `test-signature-client-personnel-${mockProjectId}`,
    PICSignatureId: `test-signature-personnel-${mockProjectId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockTx: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTx = {
      logSheet: {
        create: vi.fn().mockResolvedValue(mockCreatedLogSheet),
      },
      logSheetHistory: {
        create: vi.fn().mockResolvedValue({ id: 'history-id' }),
      },
      machine: {
        findMany: vi.fn().mockResolvedValue(mockMachines),
      },
      parameterGroup: {
        findMany: vi.fn().mockResolvedValue(mockParameterGroups),
      },
      logSheetDetail: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
  });

  describe('createLogSheetService', () => {
    it('should create a log sheet with valid date string', async () => {
      // Arrange
      const data: ILogSheetServiceData = {
        date: '2024-01-15',
        notes: 'Test notes',
        chemicalUsageData: [],
        [mockGroupId]: {
          [mockParameterId]: 25.5,
        },
      };

      // Act
      const result = await createLogSheetService(data, mockTx, mockProjectId);

      // Assert
      expect(mockTx.logSheet.create).toHaveBeenCalledWith({
        data: {
          projectId: mockProjectId,
          date: new Date('2024-01-15'),
          notes: 'Test notes',
          clientPICSignatureId: `test-signature-client-personnel-${mockProjectId}`,
          PICSignatureId: `test-signature-personnel-${mockProjectId}`,
        },
      });
      expect(mockTx.logSheetHistory.create).toHaveBeenCalledWith({
        data: {
          logSheetId: mockLogSheetId,
          status: 'DRAFT',
        },
      });
      expect(result).toEqual(mockCreatedLogSheet);
    });

    it('should create a log sheet with Date object', async () => {
      // Arrange
      const testDate = new Date('2024-01-15');
      const data: ILogSheetServiceData = {
        date: testDate,
        notes: 'Test notes',
        chemicalUsageData: [],
      };

      // Act
      const result = await createLogSheetService(data, mockTx, mockProjectId);

      // Assert
      expect(mockTx.logSheet.create).toHaveBeenCalledWith({
        data: {
          projectId: mockProjectId,
          date: testDate,
          notes: 'Test notes',
          clientPICSignatureId: `test-signature-client-personnel-${mockProjectId}`,
          PICSignatureId: `test-signature-personnel-${mockProjectId}`,
        },
      });
      expect(result).toEqual(mockCreatedLogSheet);
    });

    it('should use current date when no date is provided', async () => {
      // Arrange
      const data: ILogSheetServiceData = {
        notes: 'Test notes',
        chemicalUsageData: [],
      };

      const beforeCall = new Date();

      // Act
      const result = await createLogSheetService(data, mockTx, mockProjectId);

      const afterCall = new Date();

      // Assert
      const createCall = mockTx.logSheet.create.mock.calls[0][0];
      const usedDate = createCall.data.date;
      expect(usedDate).toBeInstanceOf(Date);
      expect(usedDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(usedDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
      expect(result).toEqual(mockCreatedLogSheet);
    });

    it('should throw AppError for invalid date string', async () => {
      // Arrange
      const data: ILogSheetServiceData = {
        date: 'invalid-date',
        notes: 'Test notes',
        chemicalUsageData: [],
      };

      // Act & Assert
      await expect(
        createLogSheetService(data, mockTx, mockProjectId)
      ).rejects.toThrow(AppError);
    });

    it('should handle machine-specific parameters for chillers', async () => {
      // Arrange
      const data: ILogSheetServiceData = {
        date: '2024-01-15',
        notes: 'Test notes',
        chemicalUsageData: [],
        [mockGroupId]: {
          [mockParameterId]: 25.5,
        },
      };

      // Act
      const result = await createLogSheetService(data, mockTx, mockProjectId);

      // Assert
      expect(mockTx.logSheetDetail.createMany).toHaveBeenCalledWith({
        data: [
          {
            logSheetId: mockLogSheetId,
            machineId: mockMachineId,
            parameterId: mockParameterId,
            groupId: mockGroupId,
            valueType: 'NUMBER',
            numericValue: 25.5,
            boolValue: undefined,
            textValue: undefined,
          },
        ],
      });
      expect(result).toEqual(mockCreatedLogSheet);
    });

    it('should handle backdated entries', async () => {
      // Arrange
      const backdatedData: ILogSheetServiceData = {
        date: '2023-12-01', // Backdated entry
        notes: 'Backdated entry for maintenance record',
        chemicalUsageData: [],
      };

      const backdatedLogSheet = {
        ...mockCreatedLogSheet,
        date: new Date('2023-12-01'),
        notes: 'Backdated entry for maintenance record',
      };

      mockTx.logSheet.create.mockResolvedValue(backdatedLogSheet);

      // Act
      const result = await createLogSheetService(
        backdatedData,
        mockTx,
        mockProjectId
      );

      // Assert
      expect(mockTx.logSheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: new Date('2023-12-01'),
          notes: 'Backdated entry for maintenance record',
        }),
      });
      expect(result?.date).toEqual(new Date('2023-12-01'));
    });
  });
});
