import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TUserRole } from '@/@types/user.type';

// 1. Mock dependencies (next/headers, jwt, prisma)
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));
vi.mock('./jwt', () => ({
  verifyToken: vi.fn(),
  generateToken: vi.fn().mockResolvedValue('mocked-token'),
}));
vi.mock('./prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// 2. Import actual functions to test
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { prisma } from './prisma';
import { 
  getCurrentUser, 
  getCurrentUserDetails, 
  requireActor, 
  getActorOrNull, 
  AuthenticationError,
  getAuthCookieName,
  setAuthSession,
  deleteAuthSession
} from './auth-helpers';
import { ensureAccess, filterNavItems, matchPathToResource } from './rbac';

describe('auth-helpers (Actual Logic)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const mockPayload = { id: validId, email: 'test@example.com', role: 'TECHNICIAN' as TUserRole };
  const mockUser = { 
    id: validId, 
    firstName: 'J', lastName: 'D', idNumber: '1', email: 'test@example.com', phoneNumber: '1', avatarUrl: null, address: 'A',
    role: 'TECHNICIAN', employmentStatus: 'PERMANENT', isActive: true, isBlocked: false, clientId: null, client: null,
    createdAt: new Date(), updatedAt: new Date(), deletedAt: null 
  };

  it('getCurrentUser: returns null if no cookie', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => null } as any);
    expect(await getCurrentUser()).toBeNull();
  });

  it('getCurrentUser: returns null if token invalid', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'v' }) } as any);
    vi.mocked(verifyToken).mockRejectedValue(new Error('fail'));
    expect(await getCurrentUser()).toBeNull();
  });

  it('getCurrentUser: returns payload on success', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'v' }) } as any);
    vi.mocked(verifyToken).mockResolvedValue(mockPayload as any);
    expect(await getCurrentUser()).toEqual(mockPayload);
  });

  it('getCurrentUserDetails: returns null if user not found', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'v' }) } as any);
    vi.mocked(verifyToken).mockResolvedValue(mockPayload as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    expect(await getCurrentUserDetails()).toBeNull();
  });

  it('getCurrentUserDetails: returns details on success', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'v' }) } as any);
    vi.mocked(verifyToken).mockResolvedValue(mockPayload as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    const result = await getCurrentUserDetails();
    expect(result?.email).toBe('test@example.com');
  });

  it('requireActor: throws if auth fails', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => null } as any);
    await expect(requireActor()).rejects.toThrow(AuthenticationError);
  });

  it('requireActor: throws if user blocked', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'v' }) } as any);
    vi.mocked(verifyToken).mockResolvedValue(mockPayload as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, isBlocked: true } as any);
    await expect(requireActor()).rejects.toThrow(AuthenticationError);
  });

  it('getActorOrNull: returns null if inactive', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'v' }) } as any);
    vi.mocked(verifyToken).mockResolvedValue(mockPayload as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, isActive: false } as any);
    expect(await getActorOrNull()).toBeNull();
  });

  it('getAuthCookieName: returns current config name', () => {
    expect(getAuthCookieName()).toBeDefined();
  });

  it('setAuthSession: calls cookie store correctly', async () => {
    const setMock = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ set: setMock } as any);
    
    await setAuthSession({ id: '1', email: 't@e.com', role: 'ADMIN' as any });
    expect(setMock).toHaveBeenCalled();
  });

  it('deleteAuthSession: calls cookie store delete', async () => {
    const deleteMock = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ delete: deleteMock } as any);
    
    await deleteAuthSession();
    expect(deleteMock).toHaveBeenCalled();
  });
});

describe('rbac (Actual Logic Coverage)', () => {
  it('ensureAccess: throws if denied', () => {
    expect(() => ensureAccess('CLIENT', 'USERS_ADMIN' as any, 'create')).toThrow('Unauthorized');
  });

  it('filterNavItems: removes unauthorized links', () => {
    const items = [
      { url: '/', label: 'Home' },
      { url: '/users', label: 'Admin' }
    ];
    const filtered = filterNavItems('CLIENT', items);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].url).toBe('/');
  });

  it('matchPathToResource: handles unknown paths', () => {
    expect(matchPathToResource('/completely-random-path')).toBe('UNKNOWN');
  });
});
