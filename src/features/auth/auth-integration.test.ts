import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateUser, validateSessionUser } from './service';
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

const mockFullUser = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  firstName: 'Test',
  lastName: 'User',
  idNumber: '12345',
  email: 'test@example.com',
  phoneNumber: '0812345678',
  password: 'hashed-password',
  avatarUrl: 'https://example.com/avatar.png',
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
};

describe('authenticateUser Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully authenticates a valid user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockFullUser as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    const result = await authenticateUser({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(result.email).toBe('test@example.com');
    expect((result as any).password).toBeUndefined();
  });

  it('throws error for non-existent user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

    await expect(
      authenticateUser({ email: 'wrong@example.com', password: 'password' })
    ).rejects.toThrow('Email atau kata sandi tidak valid');
  });

  it('throws error for blocked user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockFullUser,
      isBlocked: true,
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    await expect(
      authenticateUser({ email: 'blocked@example.com', password: 'password' })
    ).rejects.toThrow('Email atau kata sandi tidak valid');
  });

  it('throws error for inactive user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockFullUser,
      isActive: false,
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    await expect(
      authenticateUser({ email: 'inactive@example.com', password: 'password' })
    ).rejects.toThrow('Email atau kata sandi tidak valid');
  });

  it('throws error for invalid password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockFullUser as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

    await expect(
      authenticateUser({
        email: 'test@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Email atau kata sandi tidak valid');
  });
});

describe('validateSessionUser Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully validates an active user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockFullUser as any);
    const result = await validateSessionUser(mockFullUser.id);
    expect(result?.id).toBe(mockFullUser.id);
  });

  it('returns null for non-existent user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await validateSessionUser('wrong-id');
    expect(result).toBeNull();
  });

  it('returns null for blocked user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockFullUser,
      isBlocked: true,
    } as any);
    const result = await validateSessionUser(mockFullUser.id);
    expect(result).toBeNull();
  });
});
