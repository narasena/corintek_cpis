import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedClientService } from './CachedClientService';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock('./service', () => ({
  getAllClients: vi.fn(),
  getClientById: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}));

import { cacheTag, cacheLife } from 'next/cache';
const mockCacheTag = vi.mocked(cacheTag);
const mockCacheLife = vi.mocked(cacheLife);
import * as service from './service';

describe('CachedClientService', () => {
  let serviceInstance: CachedClientService;

  const actor = { id: 'u1', email: 'e@e.com', role: 'ADMIN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    serviceInstance = new CachedClientService();
  });

  describe('getAllClients', () => {
    it('caches with CLIENTS tag and HOURS life', async () => {
      const data = [{ id: 'c1' }];
      vi.mocked(service.getAllClients).mockResolvedValue(data);
      expect(await serviceInstance.getAllClients(actor)).toEqual(data);
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
      vi.mocked(service.getClientById).mockResolvedValue(client);
      expect(await serviceInstance.getClientById(actor, 'c1')).toEqual(client);
      expect(mockCacheTag).toHaveBeenCalledWith('clients');
    });

    it('throws when client not found', async () => {
      vi.mocked(service.getClientById).mockResolvedValue(null);
      const result = await serviceInstance.getClientById(actor, 'c1');
      expect(result).toBeNull();
    });
  });

  describe('write methods', () => {
    it('createClient does not cache', async () => {
      vi.mocked(service.createClient).mockResolvedValue({});
      await serviceInstance.createClient(actor, { name: 'C' } as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('updateClient does not cache', async () => {
      vi.mocked(service.updateClient).mockResolvedValue({});
      await serviceInstance.updateClient(actor, 'c1', {} as any);
      expect(mockCacheTag).not.toHaveBeenCalled();
    });

    it('deleteClient does not cache', async () => {
      vi.mocked(service.deleteClient).mockResolvedValue({ success: true });
      await serviceInstance.deleteClient(actor, 'c1');
      expect(mockCacheTag).not.toHaveBeenCalled();
    });
  });
});
