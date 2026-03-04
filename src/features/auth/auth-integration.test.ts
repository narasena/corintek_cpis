import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateUser } from './service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
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
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    const result = await authenticateUser({ email: 'test@example.com', password: 'password123' });

    expect(result.id).toBe('1');
    expect(result.email).toBe('test@example.com');
    expect((result as any).password).toBeUndefined();
  });

  it('throws error for non-existent user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

    await expect(authenticateUser({ email: 'wrong@example.com', password: 'password' }))
      .rejects.toThrow('Email atau kata sandi tidak valid');
  });

  it('throws error for blocked user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'blocked@example.com',
      isBlocked: true,
      isActive: true,
      deletedAt: null,
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    await expect(authenticateUser({ email: 'blocked@example.com', password: 'password' }))
      .rejects.toThrow('Email atau kata sandi tidak valid');
  });

  it('throws error for inactive user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'inactive@example.com',
      isBlocked: false,
      isActive: false,
      deletedAt: null,
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    await expect(authenticateUser({ email: 'inactive@example.com', password: 'password' }))
      .rejects.toThrow('Email atau kata sandi tidak valid');
  });

  it('throws error for invalid password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'test@example.com',
      password: 'hashed-password',
      isBlocked: false,
      isActive: true,
      deletedAt: null,
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

    await expect(authenticateUser({ email: 'test@example.com', password: 'wrong-password' }))
      .rejects.toThrow('Email atau kata sandi tidak valid');
  });
});
