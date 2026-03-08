/**
 * Cached User Service - Delegates to original service with caching
 * @module features/users/CachedUserService
 */

import * as originalService from './service';
import {
  getAllUsers as _getAllUsers,
  getTechniciansList as _getTechniciansList,
  getUserById as _getUserById,
  getCurrentUserProfile as _getCurrentUserProfile,
} from './service';

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

// Cached wrappers
async function getAllUsersCached(actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.USERS);
  cacheLife(CACHE_LIFE.HOURS);
  if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'read')) {
    throw new Error('Unauthorized');
  }
  return await _getAllUsers(actor);
}

async function getTechniciansListCached(actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.USERS_TECHNICIANS);
  cacheLife(CACHE_LIFE.HOURS);
  if (!canAccess(actor.role, RbacResource.LOG_SHEETS, 'read')) {
    throw new Error('Unauthorized');
  }
  return await _getTechniciansList(actor);
}

async function getUserByIdCached(actor: IJwtPayload, id: string) {
  'use cache';
  cacheTag(ECacheTag.USERS);
  cacheLife(CACHE_LIFE.HOURS);
  if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'read')) {
    throw new Error('Unauthorized');
  }
  return await _getUserById(actor, id);
}

async function getCurrentUserProfileCached(userId: string) {
  'use cache';
  cacheTag(ECacheTag.USERS);
  cacheLife(CACHE_LIFE.HOURS);
  return await _getCurrentUserProfile(userId);
}

export class CachedUserService {
  async getAllUsers(actor: IJwtPayload) {
    return await getAllUsersCached(actor);
  }

  async getTechniciansList(actor: IJwtPayload) {
    return await getTechniciansListCached(actor);
  }

  async getUserById(actor: IJwtPayload, id: string) {
    return await getUserByIdCached(actor, id);
  }

  async getCurrentUserProfile(userId: string) {
    return await getCurrentUserProfileCached(userId);
  }

  async createUser(
    actor: IJwtPayload,
    data: Omit<TUserCreateInput, 'confirmPassword'>
  ) {
    if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'create')) {
      throw new Error('Unauthorized');
    }
    try {
      return await originalService.createUser(actor, data);
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
      return await originalService.updateUser(actor, id, data);
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
      return await originalService.deleteUser(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedUserService.deleteUser:', error);
      throw error;
    }
  }

  async updateCurrentUserProfile(userId: string, data: TProfileUpdateInput) {
    try {
      return await originalService.updateCurrentUserProfile(userId, data);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedUserService.updateCurrentUserProfile:',
        error
      );
      throw error;
    }
  }
}
