import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createUser,
  updateUser,
  deleteUser,
  updateCurrentUserProfile,
  restoreUser,
  permanentlyDeleteUser,
} from './services/user-mutations';
import {
  getTechniciansList,
  getAllUsers,
  getUserById,
  getCurrentUserProfile,
} from './services/user-queries';
import { isUserAuthValid } from './utils';
import { prisma } from '@/lib/prisma';
import { canAccess } from '@/lib/rbac';
import { hashPassword } from '@/features/auth/crypto';
import { userResponseSelect } from './utils';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/rbac', () => ({
  canAccess: vi.fn(),
  RbacResource: {
    USERS_ADMIN: 'USERS_ADMIN',
    LOG_SHEETS: 'LOG_SHEETS',
  },
}));

vi.mock('@/features/auth/crypto', () => ({
  hashPassword: vi.fn(),
}));

const prismaMock = vi.mocked(prisma);
const canAccessMock = vi.mocked(canAccess);
const hashPasswordMock = vi.mocked(hashPassword);

const mockActor = {
  id: '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e',
  role: 'ADMIN',
  email: 'admin@example.com',
};

function makeMockUser(overrides: any = {}) {
  return {
    id: '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e',
    firstName: 'John',
    lastName: 'Doe',
    idNumber: '12345',
    email: 'john@example.com',
    phoneNumber: '08123456789',
    avatarUrl: 'http://example.com/avatar.png',
    address: '123 Main St',
    role: 'TECHNICIAN',
    employmentStatus: 'PERMANENT',
    isActive: true,
    isBlocked: false,
    clientId: '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e',
    client: { id: '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e', name: 'Test Client' },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe('Users Service Characterization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canAccessMock.mockReturnValue(true); // Default to authorized
  });

  describe('1. createUser', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '08123456789',
      password: 'password123',
      role: 'TECHNICIAN' as any,
      employmentStatus: 'PERMANENT' as any,
    };

    it('creates a user when data is valid and unique', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      hashPasswordMock.mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(makeMockUser({
        ...input,
        password: 'hashed-password',
      }));

      const result = await createUser(mockActor as any, input);

      expect(result.id).toBeDefined();
      expect(hashPasswordMock).toHaveBeenCalledWith('password123');
    });

    it('throws error if user with email/phone already exists (active)', async () => {
      prismaMock.user.findFirst.mockResolvedValue(makeMockUser());

      await expect(createUser(mockActor as any, input)).rejects.toThrow(
        'Pengguna dengan email atau nomor telepon ini sudah ada'
      );
    });

    it('throws specific error if user was soft-deleted', async () => {
      prismaMock.user.findFirst.mockResolvedValue(makeMockUser({ deletedAt: new Date() }));

      await expect(createUser(mockActor as any, input)).rejects.toThrow(
        /Pengguna yang dihapus dengan email atau telepon ini sudah ada/
      );
    });

    it('enforces RBAC', async () => {
      canAccessMock.mockReturnValue(false);
      await expect(createUser(mockActor as any, input)).rejects.toThrow('Unauthorized');
    });
  });

  describe('2. updateUser', () => {
    const userId = '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e';
    const updateInput = { firstName: 'Jane' };

    it('updates user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ id: userId }));
      prismaMock.user.update.mockResolvedValue(makeMockUser({ id: userId, firstName: 'Jane' }));

      const result = await updateUser(mockActor as any, userId, updateInput);

      expect(result.firstName).toBe('Jane');
    });

    it('checks uniqueness when email is changed', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ id: userId }));
      prismaMock.user.findFirst.mockResolvedValue(makeMockUser({ id: '8f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e' }));

      await expect(updateUser(mockActor as any, userId, { email: 'new@example.com' }))
        .rejects.toThrow('Email atau nomor telepon sudah digunakan');
    });

    it('hashes password if provided in update', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ id: userId }));
      hashPasswordMock.mockResolvedValue('new-hash');
      prismaMock.user.update.mockResolvedValue(makeMockUser({ id: userId }));

      await updateUser(mockActor as any, userId, { password: 'new-password' });

      expect(hashPasswordMock).toHaveBeenCalledWith('new-password');
    });
  });

  describe('3. deleteUser (Soft Delete)', () => {
    it('sets deletedAt for an existing user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ deletedAt: null }));
      
      const result = await deleteUser(mockActor as any, mockActor.id);

      expect(result.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { deletedAt: expect.any(Date) }
      }));
    });

    it('throws error if already deleted', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ deletedAt: new Date() }));
      await expect(deleteUser(mockActor as any, mockActor.id)).rejects.toThrow('Pengguna sudah dihapus');
    });
  });

  describe('4. restoreUser', () => {
    it('clears deletedAt for a soft-deleted user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ deletedAt: new Date() }));
      prismaMock.user.update.mockResolvedValue(makeMockUser({ deletedAt: null }));

      const result = await restoreUser(mockActor.id);

      // toUserResponse strips deletedAt
      expect((result as any).deletedAt).toBeUndefined();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockActor.id },
        data: { deletedAt: null },
        select: expect.any(Object)
      });
    });

    it('throws if user is not deleted', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'id', deletedAt: null } as any);
      await expect(restoreUser('id')).rejects.toThrow('Pengguna tidak sedang dihapus');
    });
  });

  describe('5. getTechniciansList', () => {
    it('returns list of technicians if authorized', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        makeMockUser({ id: '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e', role: 'TECHNICIAN' }),
        makeMockUser({ id: '8f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e', role: 'TECHNICIAN' })
      ] as any);

      const result = await getTechniciansList(mockActor as any);

      expect(result).toHaveLength(2);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { deletedAt: null, role: 'TECHNICIAN' }
      }));
    });

    it('checks LOG_SHEETS read access instead of USERS_ADMIN', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      // Mock authorized for log sheets, but not users admin (default is true, so we test the specific resource)
      await getTechniciansList(mockActor as any);
      expect(canAccessMock).toHaveBeenCalledWith(mockActor.role, 'LOG_SHEETS', 'read');
    });
  });

  describe('6. getAllUsers', () => {
    it('returns all non-deleted users', async () => {
      prismaMock.user.findMany.mockResolvedValue([makeMockUser(), makeMockUser()] as any);
      const result = await getAllUsers(mockActor as any);
      expect(result).toHaveLength(2);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { deletedAt: null }
      }));
    });
  });

  describe('7. getUserById', () => {
    const userId = '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e';

    it('returns user by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ id: userId }));
      const result = await getUserById(mockActor as any, userId);
      expect(result.id).toBe(userId);
    });

    it('throws error if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(getUserById(mockActor as any, userId)).rejects.toThrow('Pengguna tidak ditemukan');
    });

    it('throws error if user is deleted', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ id: userId, deletedAt: new Date() }));
      await expect(getUserById(mockActor as any, userId)).rejects.toThrow('Pengguna tidak ditemukan');
    });
  });

  describe('8. permanentlyDeleteUser', () => {
    const userId = '7f9c9c3e-8c3d-4c3e-8c3d-4c3e8c3d4c3e';

    it('permanently deletes user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeMockUser({ id: userId }));
      const result = await permanentlyDeleteUser(userId);
      expect(result.success).toBe(true);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('throws if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(permanentlyDeleteUser(userId)).rejects.toThrow('Pengguna tidak ditemukan');
    });
  });

  describe('9. isUserAuthValid (Utils)', () => {
    it('returns true for valid active user', () => {
      expect(isUserAuthValid({ deletedAt: null, isActive: true, isBlocked: false })).toBe(true);
    });

    it('returns false if deleted', () => {
      expect(isUserAuthValid({ deletedAt: new Date(), isActive: true, isBlocked: false })).toBe(false);
    });

    it('returns false if inactive', () => {
      expect(isUserAuthValid({ deletedAt: null, isActive: false, isBlocked: false })).toBe(false);
    });

    it('returns false if blocked', () => {
      expect(isUserAuthValid({ deletedAt: null, isActive: true, isBlocked: true })).toBe(false);
    });
  });
});
