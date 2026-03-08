/**
 * Cached Parameter Service - Delegates to original service with caching
 * @module features/parameters/CachedParameterService
 */

import * as original from './service';
import type { IJwtPayload } from '@/@types/auth.type';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';
import type { TCreateParameter, TUpdateParameter, IParameter } from './types';

// Cached function wrappers (outside class)
async function getAllParametersCached(
  service: typeof original,
  actor: IJwtPayload
) {
  'use cache';
  cacheTag(ECacheTag.PARAMETERS);
  cacheLife(CACHE_LIFE.HOURS);
  return await service.getAllParameters(actor);
}

async function getParameterByIdCached(
  service: typeof original,
  actor: IJwtPayload,
  id: string
) {
  'use cache';
  cacheTag(ECacheTag.PARAMETERS);
  cacheLife(CACHE_LIFE.HOURS);
  return await service.getParameterById(actor, id);
}

export class CachedParameterService {
  constructor(private readonly service: typeof original = original) {}

  async getAllParameters(actor: IJwtPayload) {
    return await getAllParametersCached(this.service, actor);
  }

  async getParameterById(actor: IJwtPayload, id: string) {
    return await getParameterByIdCached(this.service, actor, id);
  }

  async createParameter(actor: IJwtPayload, data: TCreateParameter) {
    try {
      return await this.service.createParameter(actor, data);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedParameterService.createParameter:',
        error
      );
      throw error;
    }
  }

  async updateParameter(actor: IJwtPayload, data: TUpdateParameter) {
    try {
      return await this.service.updateParameter(actor, data);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedParameterService.updateParameter:',
        error
      );
      throw error;
    }
  }

  async deleteParameter(actor: IJwtPayload, id: string) {
    try {
      return await this.service.deleteParameter(actor, id);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedParameterService.deleteParameter:',
        error
      );
      throw error;
    }
  }
}
