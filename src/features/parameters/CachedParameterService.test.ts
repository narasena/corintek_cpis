import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedParameterService } from './CachedParameterService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  canAccess: vi.fn(() => true),
  RbacResource: {
    MASTER_DATA: 'MASTER_DATA',
    LOG_SHEETS: 'LOG_SHEETS',
    USERS_ADMIN: 'USERS_ADMIN',
  },
}));

vi.mock('./service', () => ({
  getAllParameters: vi.fn(),
  getParameterById: vi.fn(),
  createParameter: vi.fn(),
  updateParameter: vi.fn(),
  deleteParameter: vi.fn(),
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);
import * as service from './service';

describe('CachedParameterService', () => {
  let serviceInstance: CachedParameterService;

  const actor = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'ADMIN',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    serviceInstance = new CachedParameterService();
  });

  describe('getAllParameters', () => {
    it('applies cache tag and life before delegating', async () => {
      const mockData = [{ id: 'p1' }] as any;
      vi.mocked(service.getAllParameters).mockResolvedValue(mockData);

      const result = await serviceInstance.getAllParameters(actor);

      expect(mockCacheTag).toHaveBeenCalledWith('parameters');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
      expect(service.getAllParameters).toHaveBeenCalledWith(actor);
      expect(result).toEqual(mockData);
    });

    it('propagates errors', async () => {
      const error = new Error('DB error');
      vi.mocked(service.getAllParameters).mockRejectedValue(error);

      await expect(serviceInstance.getAllParameters(actor)).rejects.toThrow(
        'DB error'
      );
    });
  });

  describe('getParameterById', () => {
    it('applies cache tag and life before delegating', async () => {
      const mockParam = { id: 'p1' } as any;
      vi.mocked(service.getParameterById).mockResolvedValue(mockParam);

      const result = await serviceInstance.getParameterById(actor, 'p1');

      expect(mockCacheTag).toHaveBeenCalledWith('parameters');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
      expect(service.getParameterById).toHaveBeenCalledWith(actor, 'p1');
      expect(result).toEqual(mockParam);
    });

    it('returns null when not found', async () => {
      vi.mocked(service.getParameterById).mockResolvedValue(null);
      const result = await serviceInstance.getParameterById(actor, 'p1');
      expect(result).toBeNull();
    });
  });

  describe('createParameter', () => {
    it('does NOT apply cache tag/life (write method)', async () => {
      const input = {
        name: 'Param1',
        variableName: 'var1',
        category: 'test',
        valueType: 'number',
      } as any;
      vi.mocked(service.createParameter).mockResolvedValue({ id: 'new' });

      await serviceInstance.createParameter(actor, input);

      expect(mockCacheTag).not.toHaveBeenCalled();
      expect(mockCacheLife).not.toHaveBeenCalled();
      expect(service.createParameter).toHaveBeenCalledWith(actor, input);
    });
  });

  describe('updateParameter', () => {
    it('does NOT apply cache tag/life', async () => {
      const data = { id: 'p1', name: 'Updated' } as any;
      vi.mocked(service.updateParameter).mockResolvedValue({});

      await serviceInstance.updateParameter(actor, data);

      expect(mockCacheTag).not.toHaveBeenCalled();
      expect(mockCacheLife).not.toHaveBeenCalled();
    });
  });

  describe('deleteParameter', () => {
    it('does NOT apply cache tag/life', async () => {
      vi.mocked(service.deleteParameter).mockResolvedValue({});

      await serviceInstance.deleteParameter(actor, 'p1');

      expect(mockCacheTag).not.toHaveBeenCalled();
      expect(mockCacheLife).not.toHaveBeenCalled();
    });
  });
});
