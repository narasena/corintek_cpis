import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/v1/projects/[id]/log-sheets/route';
import { createLogSheet } from '@/features/api/features/v1/log-sheets/logSheets.controller';
import { NextRequest } from 'next/server';

// Mock the controller
vi.mock('@/features/api/features/v1/log-sheets/logSheets.controller');

describe('Log Sheets API Route', () => {
  const mockProjectId = 'test-project-id';
  const mockRequest = {
    json: vi.fn(),
  } as unknown as NextRequest;

  const mockResponse = {
    json: () =>
      Promise.resolve({
        success: true,
        message: 'Log sheet berhasil dibuat',
        newLogSheet: { id: 'test-log-sheet-id' },
      }),
    status: 200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/projects/[id]/log-sheets', () => {
    it('should call createLogSheet controller with correct parameters', async () => {
      // Arrange
      const mockParams = Promise.resolve({ id: mockProjectId });
      vi.mocked(createLogSheet).mockResolvedValue(mockResponse as any);

      // Act
      const result = await POST(mockRequest, { params: mockParams });

      // Assert
      expect(createLogSheet).toHaveBeenCalledWith(mockProjectId, mockRequest);
      expect(result).toBe(mockResponse);
    });

    it('should handle async params resolution', async () => {
      // Arrange
      const mockParams = Promise.resolve({ id: 'another-project-id' });
      vi.mocked(createLogSheet).mockResolvedValue(mockResponse as any);

      // Act
      const result = await POST(mockRequest, { params: mockParams });

      // Assert
      expect(createLogSheet).toHaveBeenCalledWith(
        'another-project-id',
        mockRequest
      );
      expect(result).toBe(mockResponse);
    });

    it('should propagate controller errors', async () => {
      // Arrange
      const mockParams = Promise.resolve({ id: mockProjectId });
      const mockError = new Error('Controller error');
      vi.mocked(createLogSheet).mockRejectedValue(mockError);

      // Act & Assert
      await expect(POST(mockRequest, { params: mockParams })).rejects.toThrow(
        'Controller error'
      );
    });

    it('should handle params resolution failure', async () => {
      // Arrange
      const mockParams = Promise.reject(new Error('Params error'));
      vi.mocked(createLogSheet).mockResolvedValue(mockResponse as any);

      // Act & Assert
      await expect(POST(mockRequest, { params: mockParams })).rejects.toThrow(
        'Params error'
      );
    });
  });
});
