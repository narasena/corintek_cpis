/**
 * Cached Client Service - Delegates to original service with caching
 * @module features/clients/CachedClientService
 */

import * as originalService from './service';
import { getAllClients as _getAllClients } from './service';
import { getClientById as _getClientById } from './service';

import type { IJwtPayload } from '@/@types/auth.type';
import type {
  TClientCreateInput,
  TClientUpdateInput,
  TClientResponse,
} from '@/@types/client.type';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';

// Cached wrappers
async function getAllClientsCached(actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.CLIENTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await _getAllClients(actor);
}

async function getClientByIdCached(actor: IJwtPayload, id: string) {
  'use cache';
  cacheTag(ECacheTag.CLIENTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await _getClientById(actor, id);
}

export class CachedClientService {
  async getAllClients(actor: IJwtPayload): Promise<TClientResponse[]> {
    return await getAllClientsCached(actor);
  }

  async getClientById(
    actor: IJwtPayload,
    id: string
  ): Promise<TClientResponse> {
    return await getClientByIdCached(actor, id);
  }

  async createClient(
    actor: IJwtPayload,
    data: TClientCreateInput
  ): Promise<TClientResponse> {
    try {
      return await originalService.createClient(actor, data);
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
      return await originalService.updateClient(actor, id, data);
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
      return await originalService.deleteClient(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedClientService.deleteClient:', error);
      throw error;
    }
  }
}
