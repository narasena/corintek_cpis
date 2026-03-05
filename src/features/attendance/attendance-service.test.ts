/**
 * @fileoverview Unit tests for AttendanceService
 * @module features/attendance/attendance-service.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceService } from './attendance-service';
import { AuthorizationError } from '@/lib/errors';
import type { PrismaClient } from '@/generated/prisma/client';
import type { IJwtPayload } from '@/@types/auth.type';

// Mock Prisma
const mockPrisma = {
  attendance: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

describe('AttendanceService', () => {
  let service: AttendanceService;
  const mockActor: IJwtPayload = {
    id: 'user-1',
    email: 'test@test.com',
    role: 'ADMIN',
  };

  beforeEach(() => {
    service = new AttendanceService({
      prisma: mockPrisma as unknown as PrismaClient,
    });
    vi.clearAllMocks();
  });

  describe('listAttendance', () => {
    it('should return paginated results for ADMIN', async () => {
      const mockItems = [
        {
          id: '1',
          userId: 'u1',
          dateLocal: '2024-01-01',
          clockInAt: new Date(),
          user: {
            id: 'u1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
          },
        },
        {
          id: '2',
          userId: 'u2',
          dateLocal: '2024-01-02',
          clockInAt: new Date(),
          user: {
            id: 'u2',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@test.com',
          },
        },
      ];

      mockPrisma.attendance.findMany.mockResolvedValue(mockItems);
      mockPrisma.attendance.count.mockResolvedValue(20);

      const result = await service.listAttendance(
        mockActor,
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        { page: 1, limit: 10 }
      );

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
    });

    it('should throw AuthorizationError for non-ADMIN/SUPERVISOR', async () => {
      const technicianActor: IJwtPayload = {
        id: 'user-2',
        email: 'tech@test.com',
        role: 'TECHNICIAN',
      };

      await expect(
        service.listAttendance(
          technicianActor,
          { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
          { page: 1, limit: 10 }
        )
      ).rejects.toThrow(AuthorizationError);
    });

    it('should apply userId filter when provided', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      await service.listAttendance(
        mockActor,
        {
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
          userId: 'specific-user',
        },
        { page: 1, limit: 10 }
      );

      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'specific-user' }),
        })
      );
    });

    it('should calculate correct offset for page 2', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(100);

      await service.listAttendance(
        mockActor,
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        { page: 2, limit: 10 }
      );

      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should exclude deleted records (deletedAt: null)', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      await service.listAttendance(
        mockActor,
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        { page: 1, limit: 10 }
      );

      const findManyCall = mockPrisma.attendance.findMany.mock.calls[0][0];
      expect(findManyCall.where.deletedAt).toBeNull();
    });

    it('should sort by dateLocal DESC, clockInAt DESC', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      await service.listAttendance(
        mockActor,
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        { page: 1, limit: 10 }
      );

      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ dateLocal: 'desc' }, { clockInAt: 'desc' }],
        })
      );
    });

    it('should include user relation', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      await service.listAttendance(
        mockActor,
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        { page: 1, limit: 10 }
      );

      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        })
      );
    });

    it('should handle empty result set', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      const result = await service.listAttendance(
        mockActor,
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        { page: 1, limit: 10 }
      );

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });
  });

  describe('countAttendance', () => {
    it('should return total count', async () => {
      mockPrisma.attendance.count.mockResolvedValue(50);

      const result = await service.countAttendance({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      });

      expect(result).toBe(50);
    });

    it('should apply date range filter', async () => {
      mockPrisma.attendance.count.mockResolvedValue(10);

      await service.countAttendance({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-15',
      });

      expect(mockPrisma.attendance.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dateLocal: { gte: '2024-01-01', lte: '2024-01-15' },
          }),
        })
      );
    });

    it('should apply userId filter when provided', async () => {
      mockPrisma.attendance.count.mockResolvedValue(5);

      await service.countAttendance({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        userId: 'user-123',
      });

      expect(mockPrisma.attendance.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-123' }),
        })
      );
    });

    it('should exclude deleted records', async () => {
      mockPrisma.attendance.count.mockResolvedValue(0);

      await service.countAttendance({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      });

      const countCall = mockPrisma.attendance.count.mock.calls[0][0];
      expect(countCall.where.deletedAt).toBeNull();
    });
  });
});
