import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedParameterService } from './CachedParameterService';

// Mock next/cache
vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

// Mock rbac
vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  canAccess: vi.fn(),
  RbacResource: {
    MASTER_DATA: 'MASTER_DATA',
    LOG_SHEETS: 'LOG_SHEETS',
    USERS_ADMIN: 'USERS_ADMIN',
  },
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);

describe('CachedParameterService', () => {
  let service: CachedParameterService;
  let mockService: any;

  const actor = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'ADMIN',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getAllParameters: vi.fn(),
      getParameterById: vi.fn(),
      createParameter: vi.fn(),
      updateParameter: vi.fn(),
      deleteParameter: vi.fn(),
    };
    service = new CachedParameterService(mockService);
  });

  describe('getAllParameters', () => {
    it('applies cache tag and life before delegating', async () => {
      const mockData = [{ id: 'p1' }];
      mockService.getAllParameters.mockResolvedValue(mockData);

      const result = await service.getAllParameters(actor);

      expect(mockCacheTag).toHaveBeenCalledWith('parameters');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
      expect(mockService.getAllParameters).toHaveBeenCalledWith(actor);
      expect(result).toEqual(mockData);
    });

    it('propagates errors', async () => {
      const error = new Error('DB error');
      mockService.getAllParameters.mockRejectedValue(error);

      await expect(service.getAllParameters(actor)).rejects.toThrow('DB error');
    });
  });

  describe('getParameterById', () => {
    it('applies cache tag and life before delegating', async () => {
      const mockParam = { id: 'p1' };
      mockService.getParameterById.mockResolvedValue(mockParam);

      const result = await service.getParameterById(actor, 'p1');

      expect(mockCacheTag).toHaveBeenCalledWith('parameters');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
      expect(mockService.getParameterById).toHaveBeenCalledWith(actor, 'p1');
      expect(result).toEqual(mockParam);
    });

    it('returns null when not found', async () => {
      mockService.getParameterById.mockResolvedValue(null);
      const result = await service.getParameterById(actor, 'p1');
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
      mockService.createParameter.mockResolvedValue({ id: 'new' });

      await service.createParameter(actor, input);

      expect(mockCacheTag).not.toHaveBeenCalled();
      expect(mockCacheLife).not.toHaveBeenCalled();
      expect(mockService.createParameter).toHaveBeenCalledWith(actor, input);
    });
  });

  describe('updateParameter', () => {
    it('does NOT apply cache tag/life', async () => {
      const data = { id: 'p1', name: 'Updated' } as any;
      mockService.updateParameter.mockResolvedValue({});

      await service.updateParameter(actor, data);

      expect(mockCacheTag).not.toHaveBeenCalled();
      expect(mockCacheLife).not.toHaveBeenCalled();
    });
  });

  describe('deleteParameter', () => {
    it('does NOT apply cache tag/life', async () => {
      mockService.deleteParameter.mockResolvedValue({});

      await service.deleteParameter(actor, 'p1');

      expect(mockCacheTag).not.toHaveBeenCalled();
      expect(mockCacheLife).not.toHaveBeenCalled();
    });
  });
});
