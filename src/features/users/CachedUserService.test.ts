import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedUserService } from './CachedUserService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('@/lib/rbac', () => ({
  canAccess: vi.fn(() => true),
  RbacResource: {
    USERS_ADMIN: 'USERS_ADMIN',
    LOG_SHEETS: 'LOG_SHEETS',
  },
}));

vi.mock('./service', () => ({
  getAllUsers: vi.fn(),
  getTechniciansList: vi.fn(),
  getUserById: vi.fn(),
  getCurrentUserProfile: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);
import * as service from './service';
import { canAccess } from '@/lib/rbac';

describe('CachedUserService', () => {
  let serviceInstance: CachedUserService;

  const adminActor = { id: 'u1', email: 'a@a.com', role: 'ADMIN' } as any;
  const anyActor = { id: 'u2', email: 't@t.com', role: 'TECHNICIAN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(canAccess).mockReturnValue(true);
    serviceInstance = new CachedUserService();
  });

  describe('getAllUsers', () => {
    it('caches with USERS tag and HOURS life', async () => {
      vi.mocked(service.getAllUsers).mockResolvedValue([]);
      await serviceInstance.getAllUsers(adminActor);
      expect(mockCacheTag).toHaveBeenCalledWith('users');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
    });

    it('requires USERS_ADMIN read permission', async () => {
      vi.mocked(canAccess).mockReturnValue(false);
      await expect(serviceInstance.getAllUsers(anyActor)).rejects.toThrow(
        'Unauthorized'
      );
      expect(service.getAllUsers).not.toHaveBeenCalled();
    });
  });

  describe('getTechniciansList', () => {
    it('caches with USERS_TECHNICIANS tag', async () => {
      vi.mocked(service.getTechniciansList).mockResolvedValue([]);
      await serviceInstance.getTechniciansList(anyActor);
      expect(mockCacheTag).toHaveBeenCalledWith('users-technicians');
    });

    it('requires LOG_SHEETS read permission', async () => {
      vi.mocked(canAccess).mockReturnValue(false);
      await expect(
        serviceInstance.getTechniciansList(anyActor)
      ).rejects.toThrow('Unauthorized');
      expect(service.getTechniciansList).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('caches with USERS tag', async () => {
      vi.mocked(service.getUserById).mockResolvedValue({} as any);
      await serviceInstance.getUserById(adminActor, 'u1');
      expect(mockCacheTag).toHaveBeenCalledWith('users');
    });

    it('requires USERS_ADMIN read permission', async () => {
      vi.mocked(canAccess).mockReturnValue(false);
      await expect(serviceInstance.getUserById(anyActor, 'u1')).rejects.toThrow(
        'Unauthorized'
      );
      expect(service.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUserProfile', () => {
    it('caches with USERS tag', async () => {
      vi.mocked(service.getCurrentUserProfile).mockResolvedValue({} as any);
      await serviceInstance.getCurrentUserProfile('u1');
      expect(mockCacheTag).toHaveBeenCalledWith('users');
    });
  });

  describe('write methods', () => {
    it('createUser does not cache and checks auth (delegates to canAccess)', async () => {
      vi.mocked(service.createUser).mockResolvedValue({});
      await serviceInstance.createUser(adminActor, {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('updateUser does not cache', async () => {
      vi.mocked(service.updateUser).mockResolvedValue({});
      await serviceInstance.updateUser(adminActor, 'u1', {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('deleteUser does not cache', async () => {
      vi.mocked(service.deleteUser).mockResolvedValue({ success: true });
      await serviceInstance.deleteUser(adminActor, 'u1');
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('updateCurrentUserProfile does not cache', async () => {
      vi.mocked(service.updateCurrentUserProfile).mockResolvedValue({});
      await serviceInstance.updateCurrentUserProfile('u1', {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });
  });
});
