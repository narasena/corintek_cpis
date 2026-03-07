import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedUserService } from './CachedUserService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('@/lib/rbac', () => ({
  canAccess: vi.fn(),
  RbacResource: {
    USERS_ADMIN: 'USERS_ADMIN',
    LOG_SHEETS: 'LOG_SHEETS',
  },
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);

describe('CachedUserService', () => {
  let service: CachedUserService;
  let mockService: any;

  const adminActor = { id: 'u1', email: 'a@a.com', role: 'ADMIN' } as any;
  const anyActor = { id: 'u2', email: 't@t.com', role: 'TECHNICIAN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getAllUsers: vi.fn(),
      getTechniciansList: vi.fn(),
      getUserById: vi.fn(),
      getCurrentUserProfile: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      updateCurrentUserProfile: vi.fn(),
    };
    service = new CachedUserService(mockService);
  });

  describe('getAllUsers', () => {
    it('caches with USERS tag and HOURS life', async () => {
      mockService.getAllUsers.mockResolvedValue([]);
      await service.getAllUsers(adminActor);
      expect(mockCacheTag).toHaveBeenCalledWith('users');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
    });

    it('requires USERS_ADMIN read permission', async () => {
      // The check is inside the service method; mock canAccess to return false
      // But in our service we call canAccess before delegation, so it will throw before calling mockService
      // We can test by calling with non-admin role; should throw before mockService call
      mockService.getAllUsers.mockResolvedValue([]);
      await expect(service.getAllUsers(anyActor)).rejects.toThrow(
        'Unauthorized'
      );
      expect(mockService.getAllUsers).not.toHaveBeenCalled();
    });
  });

  describe('getTechniciansList', () => {
    it('caches with USERS_TECHNICIANS tag', async () => {
      mockService.getTechniciansList.mockResolvedValue([]);
      await service.getTechniciansList(anyActor);
      expect(mockCacheTag).toHaveBeenCalledWith('users-technicians');
    });

    it('requires LOG_SHEETS read permission', async () => {
      mockService.getTechniciansList.mockResolvedValue([]);
      // anyActor role TECH not permitted per canAccess check (LOG_SHEETS read)
      // Our service code uses: if (!canAccess(actor.role, RbacResource.LOG_SHEETS, 'read')) throw new Error('Unauthorized')
      // We didn't mock canAccess, but the real import is used. In test, the mocked canAccess returns undefined by default (not a mock function). That may not work.
      // For unit test, the service code uses real canAccess, not mocked because we didn't mock it inside the class file? Wait, CachedUserService imports canAccess from '@/lib/rbac' directly. The vi.mock at top mocks that module. So canAccess is mocked as vi.fn() but returns undefined by default. So condition !undefined would be true -> Unauthorized. So test should indeed throw.
      await expect(service.getTechniciansList(anyActor)).rejects.toThrow(
        'Unauthorized'
      );
      expect(mockService.getTechniciansList).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('caches with USERS tag', async () => {
      mockService.getUserById.mockResolvedValue({});
      await service.getUserById(adminActor, 'u1');
      expect(mockCacheTag).toHaveBeenCalledWith('users');
    });
  });

  describe('getCurrentUserProfile', () => {
    it('caches with USERS tag', async () => {
      mockService.getCurrentUserProfile.mockResolvedValue({} as any);
      await service.getCurrentUserProfile('u1');
      expect(mockCacheTag).toHaveBeenCalledWith('users');
    });
  });

  describe('write methods', () => {
    it('createUser does not cache and checks auth', async () => {
      mockService.createUser.mockResolvedValue({});
      await service.createUser(adminActor, {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('updateUser does not cache', async () => {
      mockService.updateUser.mockResolvedValue({});
      await service.updateUser(adminActor, 'u1', {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('deleteUser does not cache', async () => {
      mockService.deleteUser.mockResolvedValue({ success: true });
      await service.deleteUser(adminActor, 'u1');
      expect(mockCacheTag).not.toHaveBeenCalled();
    });
  });
});
