import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLogSheet } from '@/features/api/features/v1/log-sheets/logSheets.controller';
import { prisma } from '@/features/api/connection/prisma';
import { fetchProjectByIdService } from '@/features/api/features/v1/projects/project.service';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { NextResponse } from 'next/server';

// Mock the dependencies
vi.mock('@/features/api/connection/prisma');
vi.mock('@/features/api/features/v1/projects/project.service');
vi.mock('@/utils/api/v1/validation/requestValidation');
vi.mock('@/features/api/features/v1/log-sheets/logSheets.service');

describe('LogSheets Controller', () => {
  const mockProjectId = 'test-project-id';
  const mockProject = {
    id: mockProjectId,
    name: 'Test Project',
    startDate: new Date(),
    endDate: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLogSheet', () => {
    it('should successfully create a log sheet with valid data', async () => {
      // Arrange
      const mockRequest = {
        json: vi.fn().mockResolvedValue({ date: '2024-01-15', notes: 'test' }),
      } as any;

      vi.mocked(fetchProjectByIdService).mockResolvedValue(mockProject as any);
      vi.mocked(prisma.parameterGroup.findMany).mockResolvedValue([]);
      vi.mocked(requestValidation).mockReturnValue({
        date: '2024-01-15',
        notes: 'test',
      });
      vi.mocked(prisma.$transaction).mockResolvedValue({ id: 'test-id' });

      // Act
      const result = await createLogSheet(mockProjectId, mockRequest);

      // Assert
      expect(fetchProjectByIdService).toHaveBeenCalledWith(mockProjectId);
      expect(result).toBeDefined();
    });

    it('should return 404 when project is not found', async () => {
      // Arrange
      const mockRequest = {
        json: vi.fn().mockResolvedValue({ date: '2024-01-15', notes: 'test' }),
      } as any;

      vi.mocked(fetchProjectByIdService).mockResolvedValue(undefined);

      // Act
      const result = await createLogSheet(mockProjectId, mockRequest);

      // Assert
      expect(fetchProjectByIdService).toHaveBeenCalledWith(mockProjectId);
      expect(result).toEqual(
        NextResponse.json(
          {
            success: false,
            message: 'Project not found',
          },
          { status: 404 }
        )
      );
    });
  });
});
