import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSessionUser } from './service';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getCurrentUserDetails, requireActor, getActorOrNull } from './lib/user-context';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/jwt', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Auth Utilities & Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateSessionUser', () => {
    it('returns user without password when valid session exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        firstName: 'Test',
        lastName: 'User',
        idNumber: '123',
        email: 'test@test.com',
        phoneNumber: '08123',
        password: 'hashed-password',
        avatarUrl: null,
        address: 'Test Address',
        role: 'ADMIN',
        employmentStatus: 'PERMANENT',
        isActive: true,
        isBlocked: false,
        clientId: null,
        client: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any);

      const result = await validateSessionUser('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(result?.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect((result as any).password).toBeUndefined();
    });

    it('returns null when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await validateSessionUser('non-existent');
      expect(result).toBeNull();
    });

    it('returns null when user status is invalid', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '123',
        isActive: false, // Inactive
      } as any);
      
      const result = await validateSessionUser('123');
      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns payload when valid token exists', async () => {
      const mockCookie = { get: vi.fn().mockReturnValue({ value: 'token' }) };
      vi.mocked(cookies).mockResolvedValue(mockCookie as any);
      vi.mocked(verifyToken).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'ADMIN' });

      const result = await getCurrentUser();
      expect(result?.id).toBe('1');
    });

    it('returns null when no token exists', async () => {
      const mockCookie = { get: vi.fn().mockReturnValue(null) };
      vi.mocked(cookies).mockResolvedValue(mockCookie as any);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('requireActor', () => {
    it('returns actor when authenticated', async () => {
      // Mock getCurrentUserDetails indirectly or directly
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        firstName: 'Test',
        lastName: 'User',
        idNumber: '123',
        email: 'test@test.com',
        phoneNumber: '08123',
        password: 'hashed-password',
        avatarUrl: null,
        address: 'Test Address',
        role: 'ADMIN',
        employmentStatus: 'PERMANENT',
        isActive: true,
        isBlocked: false,
        clientId: null,
        client: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any);
      const mockCookie = { get: vi.fn().mockReturnValue({ value: 'token' }) };
      vi.mocked(cookies).mockResolvedValue(mockCookie as any);
      vi.mocked(verifyToken).mockResolvedValue({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', role: 'ADMIN' });

      const result = await requireActor();
      expect(result.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    });

    it('throws AuthenticationError when not authenticated', async () => {
      const mockCookie = { get: vi.fn().mockReturnValue(null) };
      vi.mocked(cookies).mockResolvedValue(mockCookie as any);

      await expect(requireActor()).rejects.toThrow('Unauthorized');
    });
  });
});
