/**
 * Cached Client Service - Delegates to original service with caching
 * @module features/clients/CachedClientService
 */

import * as original from './service';
import type { IJwtPayload } from '@/@types/auth.type';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';
import type {
  TClientCreateInput,
  TClientUpdateInput,
  TClientResponse,
} from '@/@types/client.type';

// Cached function wrappers (outside class)
async function getAllClientsCached(
  service: typeof original,
  actor: IJwtPayload
) {
  'use cache';
  cacheTag(ECacheTag.CLIENTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await service.getAllClients(actor);
}

async function getClientByIdCached(
  service: typeof original,
  actor: IJwtPayload,
  id: string
) {
  'use cache';
  cacheTag(ECacheTag.CLIENTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await service.getClientById(actor, id);
}

export class CachedClientService {
  constructor(private readonly service: typeof original = original) {}

  async getAllClients(actor: IJwtPayload): Promise<TClientResponse[]> {
    return await getAllClientsCached(this.service, actor);
  }

  async getClientById(
    actor: IJwtPayload,
    id: string
  ): Promise<TClientResponse> {
    return await getClientByIdCached(this.service, actor, id);
  }

  async createClient(
    actor: IJwtPayload,
    data: TClientCreateInput
  ): Promise<TClientResponse> {
    try {
      return await this.service.createClient(actor, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedClientService.createClient:', error);
      throw error;
    }
  }

  async updateClient(
    actor: IJwtPayload,
    id: string,
    data: TClientUpdateInput
  ): Promise<TClientResponse> {
    try {
      return await this.service.updateClient(actor, id, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedClientService.updateClient:', error);
      throw error;
    }
  }

  async deleteClient(
    actor: IJwtPayload,
    id: string
  ): Promise<{ success: boolean }> {
    try {
      return await this.service.deleteClient(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedClientService.deleteClient:', error);
      throw error;
    }
  }
}
