import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TUserRole } from '@/@types/user.type';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('./jwt', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('./prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const cookiesMock = vi.mocked(
  await import('next/headers').then(m => m.cookies)
);
const verifyTokenMock = vi.mocked(
  await import('./jwt').then(m => m.verifyToken)
);
const prismaMock = vi.mocked(await import('./prisma').then(m => m.prisma));

import {
  AuthenticationError,
  getCurrentUser,
  getAuthCookieName,
} from './auth-helpers';
import {
  requireActor,
  getActorOrNull,
  getCurrentUserDetails,
} from '@/features/auth/lib/user-context';

function makeValidPayload(role: TUserRole = 'TECHNICIAN') {
  return {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'test@example.com',
    role,
  };
}

function makeValidUser(role: TUserRole = 'TECHNICIAN') {
  return {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    idNumber: '123456789',
    phoneNumber: '08123456789',
    avatarUrl: null,
    address: 'Jl. Test No. 1',
    role,
    employmentStatus: 'PERMANENT',
    isActive: true,
    isBlocked: false,
    clientId: null,
    client: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

describe('AuthenticationError', () => {
  it('creates error with default message', () => {
    const error = new AuthenticationError();
    expect(error.message).toBe('Unauthorized');
    expect(error.name).toBe('AuthenticationError');
    expect(error).toBeInstanceOf(Error);
  });

  it('creates error with custom message', () => {
    const error = new AuthenticationError('Session expired');
    expect(error.message).toBe('Session expired');
    expect(error.name).toBe('AuthenticationError');
  });
});

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no cookie exists', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it('returns payload when valid token exists', async () => {
    const payload = makeValidPayload();
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);

    const result = await getCurrentUser();

    expect(result).toEqual(payload);
  });

  it('returns null when token verification fails', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
    } as never);
    verifyTokenMock.mockRejectedValue(new Error('Invalid token'));

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});

describe('getCurrentUserDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no current user', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    const result = await getCurrentUserDetails();

    expect(result).toBeNull();
  });

  it('returns null when user not found in database', async () => {
    const payload = makeValidPayload();
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await getCurrentUserDetails();

    expect(result).toBeNull();
  });

  it('returns null when user is soft-deleted', async () => {
    const payload = makeValidPayload();
    const user = { ...makeValidUser(), deletedAt: new Date() };
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await getCurrentUserDetails();

    expect(result).toBeNull();
  });

  it('returns null when user is inactive', async () => {
    const payload = makeValidPayload();
    const user = { ...makeValidUser(), isActive: false };
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await getCurrentUserDetails();

    expect(result).toBeNull();
  });

  it('returns null when user is blocked', async () => {
    const payload = makeValidPayload();
    const user = { ...makeValidUser(), isBlocked: true };
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await getCurrentUserDetails();

    expect(result).toBeNull();
  });

  it('returns user details for valid active user', async () => {
    const payload = makeValidPayload();
    const user = makeValidUser();
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await getCurrentUserDetails();

    expect(result).toEqual({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: null,
      role: 'TECHNICIAN',
    });
  });
});

describe('requireActor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws AuthenticationError when not authenticated', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    await expect(requireActor()).rejects.toThrow(AuthenticationError);
    await expect(requireActor()).rejects.toThrow('Unauthorized');
  });

  it('throws AuthenticationError when user is deleted', async () => {
    const payload = makeValidPayload();
    const user = { ...makeValidUser(), deletedAt: new Date() };
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    await expect(requireActor()).rejects.toThrow(AuthenticationError);
  });

  it('returns IJwtPayload for valid user', async () => {
    const payload = makeValidPayload();
    const user = makeValidUser();
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await requireActor();

    expect(result).toEqual({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'test@example.com',
      role: 'TECHNICIAN',
    });
  });

  it('returns IJwtPayload for CLIENT role', async () => {
    const payload = makeValidPayload('CLIENT');
    const user = makeValidUser('CLIENT');
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await requireActor();

    expect(result).toEqual({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'test@example.com',
      role: 'CLIENT',
    });
  });
});

describe('getActorOrNull', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when not authenticated', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    const result = await getActorOrNull();

    expect(result).toBeNull();
  });

  it('returns null when user is inactive', async () => {
    const payload = makeValidPayload();
    const user = { ...makeValidUser(), isActive: false };
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await getActorOrNull();

    expect(result).toBeNull();
  });

  it('returns IJwtPayload for valid user', async () => {
    const payload = makeValidPayload();
    const user = makeValidUser();
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await getActorOrNull();

    expect(result).toEqual({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'test@example.com',
      role: 'TECHNICIAN',
    });
  });

  it('returns IJwtPayload for CLIENT role', async () => {
    const payload = makeValidPayload('CLIENT');
    const user = makeValidUser('CLIENT');
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never);
    verifyTokenMock.mockResolvedValue(payload);
    prismaMock.user.findUnique.mockResolvedValue(user as never);

    const result = await getActorOrNull();

    expect(result).toEqual({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'test@example.com',
      role: 'CLIENT',
    });
  });
});
