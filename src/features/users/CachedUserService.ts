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
import { CACHE_LIFE } from '../cache/life-profiles';
import { canAccess, RbacResource } from '@/lib/rbac';

// Cached function wrappers (outside class)
async function getAllUsersCached(service: typeof original, actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.USERS);
  cacheLife(CACHE_LIFE.HOURS);
  if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'read')) {
    throw new Error('Unauthorized');
  }
  return await service.getAllUsers(actor);
}

async function getTechniciansListCached(
  service: typeof original,
  actor: IJwtPayload
) {
  'use cache';
  cacheTag(ECacheTag.USERS_TECHNICIANS);
  cacheLife(CACHE_LIFE.HOURS);
  if (!canAccess(actor.role, RbacResource.LOG_SHEETS, 'read')) {
    throw new Error('Unauthorized');
  }
  return await service.getTechniciansList(actor);
}

async function getUserByIdCached(
  service: typeof original,
  actor: IJwtPayload,
  id: string
) {
  'use cache';
  cacheTag(ECacheTag.USERS);
  cacheLife(CACHE_LIFE.HOURS);
  if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'read')) {
    throw new Error('Unauthorized');
  }
  return await service.getUserById(actor, id);
}

async function getCurrentUserProfileCached(
  service: typeof original,
  userId: string
) {
  'use cache';
  cacheTag(ECacheTag.USERS);
  cacheLife(CACHE_LIFE.HOURS);
  return await service.getCurrentUserProfile(userId);
}

export class CachedUserService {
  constructor(private readonly service: typeof original = original) {}

  async getAllUsers(actor: IJwtPayload) {
    return await getAllUsersCached(this.service, actor);
  }

  async getTechniciansList(actor: IJwtPayload) {
    return await getTechniciansListCached(this.service, actor);
  }

  async getUserById(actor: IJwtPayload, id: string) {
    return await getUserByIdCached(this.service, actor, id);
  }

  async getCurrentUserProfile(userId: string) {
    return await getCurrentUserProfileCached(this.service, userId);
  }

  async createUser(
    actor: IJwtPayload,
    data: Omit<TUserCreateInput, 'confirmPassword'>
  ) {
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

  async updateUser(actor: IJwtPayload, id: string, data: TUserUpdateInput) {
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

  async deleteUser(actor: IJwtPayload, id: string) {
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

  async updateCurrentUserProfile(userId: string, data: TProfileUpdateInput) {
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
