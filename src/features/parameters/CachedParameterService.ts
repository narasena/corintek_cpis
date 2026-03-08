/**
 * Cached Parameter Service - Delegates to original service with caching
 * @module features/parameters/CachedParameterService
 */

import * as originalService from './service';
import { getAllParameters as _getAllParameters } from './service';
import { getParameterById as _getParameterById } from './service';

import type { IJwtPayload } from '@/@types/auth.type';
import type { TCreateParameter, TUpdateParameter, IParameter } from './types';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';

// Cached wrappers
async function getAllParametersCached(actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.PARAMETERS);
  cacheLife(CACHE_LIFE.HOURS);
  return await _getAllParameters(actor);
}

async function getParameterByIdCached(actor: IJwtPayload, id: string) {
  'use cache';
  cacheTag(ECacheTag.PARAMETERS);
  cacheLife(CACHE_LIFE.HOURS);
  return await _getParameterById(actor, id);
}

export class CachedParameterService {
  async getAllParameters(actor: IJwtPayload) {
    return await getAllParametersCached(actor);
  }

  async getParameterById(actor: IJwtPayload, id: string) {
    return await getParameterByIdCached(actor, id);
  }

  async createParameter(actor: IJwtPayload, data: TCreateParameter) {
    try {
      return await originalService.createParameter(actor, data);
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
      return await originalService.updateParameter(actor, data);
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
      return await originalService.deleteParameter(actor, id);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedParameterService.deleteParameter:',
        error
      );
      throw error;
    }
  }
}
