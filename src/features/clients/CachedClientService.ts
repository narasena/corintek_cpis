/**
 * Cached Client Service - Delegates to original service with caching
 * @module features/clients/CachedClientService
 */

import * as original from './service';
import type { IJwtPayload } from '@/@types/auth.type';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import type {
  TClientCreateInput,
  TClientUpdateInput,
} from '@/@types/client.type';
import { CACHE_LIFE } from '../cache/life-profiles';

export class CachedClientService {
  constructor(private readonly service: typeof original = original) {}

  async getAllClients(actor: IJwtPayload): Promise<unknown[]> {
    'use cache';
    cacheTag(ECacheTag.CLIENTS);
    cacheLife(CACHE_LIFE.HOURS);
    try {
      return await this.service.getAllClients(actor);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedClientService.getAllClients:', error);
      throw error;
    }
  }

  async getClientById(actor: IJwtPayload, id: string): Promise<unknown> {
    'use cache';
    cacheTag(ECacheTag.CLIENTS);
    cacheLife(CACHE_LIFE.HOURS);
    try {
      return await this.service.getClientById(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedClientService.getClientById:', error);
      throw error;
    }
  }

  async createClient(
    actor: IJwtPayload,
    data: TClientCreateInput
  ): Promise<unknown> {
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
  ): Promise<unknown> {
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
