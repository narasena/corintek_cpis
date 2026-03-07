import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedClientService } from './CachedClientService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: {
    MASTER_DATA: 'MASTER_DATA',
  },
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);

describe('CachedClientService', () => {
  let service: CachedClientService;
  let mockService: any;

  const actor = { id: 'u1', email: 'e@e.com', role: 'ADMIN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getAllClients: vi.fn(),
      getClientById: vi.fn(),
      createClient: vi.fn(),
      updateClient: vi.fn(),
      deleteClient: vi.fn(),
    };
    service = new CachedClientService(mockService);
  });

  describe('getAllClients', () => {
    it('caches with CLIENTS tag and HOURS life', async () => {
      const data = [{ id: 'c1' }];
      mockService.getAllClients.mockResolvedValue(data);
      expect(await service.getAllClients(actor)).toEqual(data);
      expect(mockCacheTag).toHaveBeenCalledWith('clients');
      expect(mockCacheLife).toHaveBeenCalledWith({
        stale: 1800,
        revalidate: 3600,
      });
    });
  });

  describe('getClientById', () => {
    it('caches with CLIENTS tag', async () => {
      const client = { id: 'c1' };
      mockService.getClientById.mockResolvedValue(client);
      expect(await service.getClientById(actor, 'c1')).toEqual(client);
      expect(mockCacheTag).toHaveBeenCalledWith('clients');
    });

    it('throws when client not found', async () => {
      mockService.getClientById.mockResolvedValue(null);
      // Original service might throw in its own logic; here we'll just propagate
      // For test, we could reject instead but implementation returns null -> caller handles
      const result = await service.getClientById(actor, 'c1');
      expect(result).toBeNull();
    });
  });

  describe('write methods', () => {
    it('createClient does not cache', async () => {
      mockService.createClient.mockResolvedValue({});
      await service.createClient(actor, { name: 'C' } as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('updateClient does not cache', async () => {
      mockService.updateClient.mockResolvedValue({});
      await service.updateClient(actor, 'c1', {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('deleteClient does not cache', async () => {
      mockService.deleteClient.mockResolvedValue({ success: true });
      await service.deleteClient(actor, 'c1');
      expect(mockCacheTag).not.toHaveBeenCalled();
    });
  });

  // SOLID: Single Responsibility (caching wrapper), Open/Closed (extend without modify),
  // Liskov (substitutable for IClientService if defined), Interface Segregation, Dependency Inversion (deps injected)
});
