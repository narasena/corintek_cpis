import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateUser } from './service';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth-helpers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  comparePassword: vi.fn(),
}));

describe('authenticateUser Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully authenticates a valid user', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashed-password',
      isActive: true,
      isBlocked: false,
      firstName: 'Test',
      role: 'ADMIN',
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(comparePassword).mockResolvedValue(true);

    const result = await authenticateUser('test@example.com', 'password123');

    expect(result.id).toBe('1');
    expect(result.email).toBe('test@example.com');
    expect((result as any).password).toBeUndefined();
  });

  it('throws error for non-existent user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(authenticateUser('wrong@example.com', 'password'))
      .rejects.toThrow('Email atau kata sandi tidak valid');
  });

  it('throws error for blocked user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'blocked@example.com',
      isBlocked: true,
    } as any);

    await expect(authenticateUser('blocked@example.com', 'password'))
      .rejects.toThrow('Akun diblokir. Silakan hubungi administrator.');
  });

  it('throws error for inactive user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'inactive@example.com',
      isBlocked: false,
      isActive: false,
    } as any);

    await expect(authenticateUser('inactive@example.com', 'password'))
      .rejects.toThrow('Akun tidak aktif. Silakan hubungi administrator.');
  });

  it('throws error for invalid password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'test@example.com',
      password: 'hashed-password',
      isBlocked: false,
      isActive: true,
    } as any);
    vi.mocked(comparePassword).mockResolvedValue(false);

    await expect(authenticateUser('test@example.com', 'wrong-password'))
      .rejects.toThrow('Email atau kata sandi tidak valid');
  });
});
