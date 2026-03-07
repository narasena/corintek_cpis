/**
 * Cached Parameter Service - Delegates to original service with caching
 * @module features/parameters/CachedParameterService
 */

import * as original from './service';
import type { IJwtPayload } from '@/@types/auth.type';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import type { TCreateParameter, TUpdateParameter, IParameter } from './types';

export class CachedParameterService {
  constructor(private readonly service: typeof original = original) {}

  async getAllParameters(actor: IJwtPayload): Promise<IParameter[]> {
    'use cache';
    cacheTag(ECacheTag.PARAMETERS);
    cacheLife({ stale: 1800, revalidate: 3600 });
    try {
      return await this.service.getAllParameters(actor);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedParameterService.getAllParameters:',
        error
      );
      throw error;
    }
  }

  async getParameterById(
    actor: IJwtPayload,
    id: string
  ): Promise<IParameter | null> {
    'use cache';
    cacheTag(ECacheTag.PARAMETERS);
    cacheLife({ stale: 1800, revalidate: 3600 });
    try {
      return await this.service.getParameterById(actor, id);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedParameterService.getParameterById:',
        error
      );
      throw error;
    }
  }

  async createParameter(
    actor: IJwtPayload,
    data: TCreateParameter
  ): Promise<IParameter> {
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

  async updateParameter(
    actor: IJwtPayload,
    data: TUpdateParameter
  ): Promise<IParameter> {
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

  async deleteParameter(actor: IJwtPayload, id: string): Promise<IParameter> {
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
