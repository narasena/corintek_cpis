import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserById } from './service';
import { getCurrentUser, getCurrentUserDetails, requireActor, getActorOrNull } from '@/lib/auth-helpers';
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

  describe('getUserById', () => {
    it('returns user without password when found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '123',
        email: 'test@test.com',
        password: 'secret',
      } as any);

      const result = await getUserById('123');
      expect(result?.id).toBe('123');
      expect((result as any).password).toBeUndefined();
    });

    it('returns null when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await getUserById('non-existent');
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
        id: '1', email: 'a@b.com', role: 'ADMIN', isActive: true, isBlocked: false, firstName: 'A'
      } as any);
      const mockCookie = { get: vi.fn().mockReturnValue({ value: 'token' }) };
      vi.mocked(cookies).mockResolvedValue(mockCookie as any);
      vi.mocked(verifyToken).mockResolvedValue({ id: '1', role: 'ADMIN' });

      const result = await requireActor();
      expect(result.id).toBe('1');
    });

    it('throws AuthenticationError when not authenticated', async () => {
      const mockCookie = { get: vi.fn().mockReturnValue(null) };
      vi.mocked(cookies).mockResolvedValue(mockCookie as any);

      await expect(requireActor()).rejects.toThrow('Unauthorized');
    });
  });
});
