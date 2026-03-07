/**
 * Cached User Service - Delegates to original service with caching
 * @module features/users/CachedUserService
 */

import * as original from './service';
import type { IJwtPayload } from '@/@types/auth.type';
import {
  TUserCreateInput,
  TUserUpdateInput,
  TProfileUpdateInput,
  ICurrentUserProfile,
} from '@/@types/user.type';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { canAccess, RbacResource } from '@/lib/rbac';

export class CachedUserService {
  constructor(private readonly service: typeof original = original) {}

  async getAllUsers(actor: IJwtPayload): Promise<unknown[]> {
    'use cache';
    cacheTag(ECacheTag.USERS);
    cacheLife({ stale: 1800, revalidate: 3600 });
    if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'read')) {
      throw new Error('Unauthorized');
    }
    try {
      return await this.service.getAllUsers(actor);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedUserService.getAllUsers:', error);
      throw error;
    }
  }

  async getTechniciansList(actor: IJwtPayload): Promise<unknown[]> {
    'use cache';
    cacheTag(ECacheTag.USERS_TECHNICIANS);
    cacheLife({ stale: 1800, revalidate: 3600 });
    if (!canAccess(actor.role, RbacResource.LOG_SHEETS, 'read')) {
      throw new Error('Unauthorized');
    }
    try {
      return await this.service.getTechniciansList(actor);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedUserService.getTechniciansList:',
        error
      );
      throw error;
    }
  }

  async getUserById(actor: IJwtPayload, id: string): Promise<unknown> {
    'use cache';
    cacheTag(ECacheTag.USERS);
    cacheLife({ stale: 1800, revalidate: 3600 });
    if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'read')) {
      throw new Error('Unauthorized');
    }
    try {
      return await this.service.getUserById(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedUserService.getUserById:', error);
      throw error;
    }
  }

  async getCurrentUserProfile(userId: string): Promise<ICurrentUserProfile> {
    'use cache';
    cacheTag(ECacheTag.USERS);
    cacheLife({ stale: 1800, revalidate: 3600 });
    try {
      return await this.service.getCurrentUserProfile(userId);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedUserService.getCurrentUserProfile:',
        error
      );
      throw error;
    }
  }

  async createUser(
    actor: IJwtPayload,
    data: Omit<TUserCreateInput, 'confirmPassword'>
  ): Promise<unknown> {
    if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'create')) {
      throw new Error('Unauthorized');
    }
    try {
      return await this.service.createUser(actor, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedUserService.createUser:', error);
      throw error;
    }
  }

  async updateUser(
    actor: IJwtPayload,
    id: string,
    data: TUserUpdateInput
  ): Promise<unknown> {
    if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'update')) {
      throw new Error('Unauthorized');
    }
    try {
      return await this.service.updateUser(actor, id, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedUserService.updateUser:', error);
      throw error;
    }
  }

  async deleteUser(
    actor: IJwtPayload,
    id: string
  ): Promise<{ success: boolean }> {
    if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'delete')) {
      throw new Error('Unauthorized');
    }
    try {
      return await this.service.deleteUser(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedUserService.deleteUser:', error);
      throw error;
    }
  }

  async updateCurrentUserProfile(
    userId: string,
    data: TProfileUpdateInput
  ): Promise<ICurrentUserProfile> {
    try {
      return await this.service.updateCurrentUserProfile(userId, data);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedUserService.updateCurrentUserProfile:',
        error
      );
      throw error;
    }
  }
}
