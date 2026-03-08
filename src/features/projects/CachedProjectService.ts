/**
 * Cached Project Service - Delegates to original service with caching
 * @module features/projects/CachedProjectService
 */

// Original service module (used for write operations)
import * as originalService from './service';

// Specific functions for caching (direct imports avoid passing module references)
import { getProjects as _getProjects } from './service';
import { getDashboardProjects as _getDashboardProjects } from './service';
import { getProjectById as _getProjectById } from './service';

import type { IJwtPayload } from '@/@types/auth.type';
import {
  TCreateProject,
  TUpdateProject,
  TProjectAssignmentInput,
  TProjectParameterOverride,
} from './types';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';

// Cached wrapper functions (module-level)
async function getProjectsCached(actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.PROJECTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await _getProjects(actor);
}

async function getDashboardProjectsCached(actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.PROJECTS_DASHBOARD);
  cacheLife(CACHE_LIFE.SHORT);
  return await _getDashboardProjects(actor);
}

async function getProjectByIdCached(actor: IJwtPayload, id: string) {
  'use cache';
  cacheTag(ECacheTag.PROJECTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await _getProjectById(actor, id);
}

export class CachedProjectService {
  // Read methods (cached)
  async getProjects(actor: IJwtPayload) {
    return await getProjectsCached(actor);
  }

  async getDashboardProjects(actor: IJwtPayload) {
    return await getDashboardProjectsCached(actor);
  }

  async getProjectById(actor: IJwtPayload, id: string) {
    return await getProjectByIdCached(actor, id);
  }

  // Write methods (non-cached, delegate through originalService)
  async createProject(actor: IJwtPayload, data: TCreateProject) {
    try {
      return await originalService.createProject(actor, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedProjectService.createProject:', error);
      throw error;
    }
  }

  async updateProject(actor: IJwtPayload, data: TUpdateProject) {
    try {
      return await originalService.updateProject(actor, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedProjectService.updateProject:', error);
      throw error;
    }
  }

  async setProjectAssignments(
    actor: IJwtPayload,
    projectId: string,
    assignments: TProjectAssignmentInput[]
  ) {
    try {
      return await originalService.setProjectAssignments(
        actor,
        projectId,
        assignments
      );
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedProjectService.setProjectAssignments:',
        error
      );
      throw error;
    }
  }

  async assertCanAccessProject(actor: IJwtPayload, projectId: string) {
    try {
      return await originalService.assertCanAccessProject(actor, projectId);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedProjectService.assertCanAccessProject:',
        error
      );
      throw error;
    }
  }

  async getAccessibleProjectIds(actor: IJwtPayload) {
    try {
      return await originalService.getAccessibleProjectIds(actor);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedProjectService.getAccessibleProjectIds:',
        error
      );
      throw error;
    }
  }

  async getProjectAssignments(
    actor: IJwtPayload,
    projectId: string
  ): Promise<unknown[]> {
    try {
      return await originalService.getProjectAssignments(actor, projectId);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedProjectService.getProjectAssignments:',
        error
      );
      throw error;
    }
  }

  async deleteProject(actor: IJwtPayload, id: string) {
    try {
      return await originalService.deleteProject(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedProjectService.deleteProject:', error);
      throw error;
    }
  }

  async upsertProjectParameterOverride(
    actor: IJwtPayload,
    data: TProjectParameterOverride
  ) {
    try {
      return await originalService.upsertProjectParameterOverride(actor, data);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedProjectService.upsertProjectParameterOverride:',
        error
      );
      throw error;
    }
  }
}
