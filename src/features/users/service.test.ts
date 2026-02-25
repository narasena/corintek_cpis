import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getCurrentUserProfile, updateCurrentUserProfile } from './service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

const prismaMock = vi.mocked(await import('@/lib/prisma').then(m => m.prisma));

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '+62812345678',
    avatarUrl: null,
    role: 'TECHNICIAN',
    employmentStatus: 'PERMANENT',
    ...overrides,
  };
}

describe('getCurrentUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user profile for valid user', async () => {
    const mockUser = makeUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser as never);

    const result = await getCurrentUserProfile('user-1');

    expect(result.id).toBe('user-1');
    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(result.email).toBe('john@example.com');
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
      select: expect.objectContaining({
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        employmentStatus: true,
      }),
    });
  });

  it('throws error when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(getCurrentUserProfile('non-existent')).rejects.toThrow(
      'Pengguna tidak ditemukan'
    );
  });

  it('throws error when user is soft-deleted', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(getCurrentUserProfile('deleted-user')).rejects.toThrow(
      'Pengguna tidak ditemukan'
    );
  });
});

describe('updateCurrentUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates user profile successfully', async () => {
    const existingUser = makeUser();
    const updatedUser = {
      ...existingUser,
      firstName: 'Jane',
      phoneNumber: '+62899999999',
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser as never);
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.update.mockResolvedValue(updatedUser as never);

    const result = await updateCurrentUserProfile('user-1', {
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+62899999999',
      avatarUrl: null,
    });

    expect(result.firstName).toBe('Jane');
    expect(result.phoneNumber).toBe('+62899999999');
  });

  it('allows updating only firstName and lastName', async () => {
    const existingUser = makeUser({ phoneNumber: '+62812345678' });
    const updatedUser = {
      ...existingUser,
      firstName: 'Jane',
      lastName: 'Smith',
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser as never);
    prismaMock.user.update.mockResolvedValue(updatedUser as never);

    const result = await updateCurrentUserProfile('user-1', {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.firstName).toBe('Jane');
    expect(result.lastName).toBe('Smith');
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  it('throws error when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      updateCurrentUserProfile('non-existent', {
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '+62899999999',
        avatarUrl: null,
      })
    ).rejects.toThrow('Pengguna tidak ditemukan');
  });

  it('throws error when phone number already in use', async () => {
    const existingUser = makeUser();
    const duplicateUser = makeUser({
      id: 'user-2',
      phoneNumber: '+62899999999',
    });

    prismaMock.user.findUnique.mockResolvedValue(existingUser as never);
    prismaMock.user.findFirst.mockResolvedValue(duplicateUser as never);

    await expect(
      updateCurrentUserProfile('user-1', {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+62899999999',
        avatarUrl: null,
      })
    ).rejects.toThrow('Nomor telepon sudah digunakan');
  });

  it('allows updating with same phone number', async () => {
    const existingUser = makeUser({ phoneNumber: '+62812345678' });
    const updatedUser = { ...existingUser, firstName: 'Jane' };

    prismaMock.user.findUnique.mockResolvedValue(existingUser as never);
    prismaMock.user.update.mockResolvedValue(updatedUser as never);

    const result = await updateCurrentUserProfile('user-1', {
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.firstName).toBe('Jane');
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  it('updates avatarUrl', async () => {
    const existingUser = makeUser();
    const updatedUser = {
      ...existingUser,
      avatarUrl: 'https://r2.example.com/avatar.webp',
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser as never);
    prismaMock.user.update.mockResolvedValue(updatedUser as never);

    const result = await updateCurrentUserProfile('user-1', {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: 'https://r2.example.com/avatar.webp',
    });

    expect(result.avatarUrl).toBe('https://r2.example.com/avatar.webp');
  });

  it('clears avatarUrl when set to null', async () => {
    const existingUser = makeUser({
      avatarUrl: 'https://r2.example.com/old.webp',
    });
    const updatedUser = { ...existingUser, avatarUrl: null };

    prismaMock.user.findUnique.mockResolvedValue(existingUser as never);
    prismaMock.user.update.mockResolvedValue(updatedUser as never);

    const result = await updateCurrentUserProfile('user-1', {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.avatarUrl).toBeNull();
  });

  it('handles null lastName', async () => {
    const existingUser = makeUser({ lastName: null });
    const updatedUser = { ...existingUser, lastName: 'Smith' };

    prismaMock.user.findUnique.mockResolvedValue(existingUser as never);
    prismaMock.user.update.mockResolvedValue(updatedUser as never);

    const result = await updateCurrentUserProfile('user-1', {
      firstName: 'John',
      lastName: 'Smith',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.lastName).toBe('Smith');
  });
});
