/**
 * Cached Project Service - Delegates to original service with caching
 * @module features/projects/CachedProjectService
 */

import * as original from './service';
import type { IJwtPayload } from '@/@types/auth.type';
import {
  TCreateProject,
  TUpdateProject,
  TProjectAssignmentInput,
  TProjectParameterOverride,
  IProject,
  IProjectDashboardCard,
} from './types';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';
import { CACHE_LIFE } from '../cache/life-profiles';

// Cached function wrappers (outside class)
async function getProjectsCached(service: typeof original, actor: IJwtPayload) {
  'use cache';
  cacheTag(ECacheTag.PROJECTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await service.getProjects(actor);
}

async function getDashboardProjectsCached(
  service: typeof original,
  actor: IJwtPayload
) {
  'use cache';
  cacheTag(ECacheTag.PROJECTS_DASHBOARD);
  cacheLife(CACHE_LIFE.SHORT);
  return await service.getDashboardProjects(actor);
}

async function getProjectByIdCached(
  service: typeof original,
  actor: IJwtPayload,
  id: string
) {
  'use cache';
  cacheTag(ECacheTag.PROJECTS);
  cacheLife(CACHE_LIFE.HOURS);
  return await service.getProjectById(actor, id);
}

export class CachedProjectService {
  constructor(private readonly service: typeof original = original) {}

  async getProjects(actor: IJwtPayload) {
    return await getProjectsCached(this.service, actor);
  }

  async getDashboardProjects(actor: IJwtPayload) {
    return await getDashboardProjectsCached(this.service, actor);
  }

  async getProjectById(actor: IJwtPayload, id: string) {
    return await getProjectByIdCached(this.service, actor, id);
  }

  async createProject(actor: IJwtPayload, data: TCreateProject) {
    try {
      return await this.service.createProject(actor, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedProjectService.createProject:', error);
      throw error;
    }
  }

  async updateProject(actor: IJwtPayload, data: TUpdateProject) {
    try {
      return await this.service.updateProject(actor, data);
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
      return await this.service.setProjectAssignments(
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
      return await this.service.assertCanAccessProject(actor, projectId);
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
      return await this.service.getAccessibleProjectIds(actor);
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
      return await this.service.getProjectAssignments(actor, projectId);
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
      return await this.service.deleteProject(actor, id);
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
      return await this.service.upsertProjectParameterOverride(actor, data);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedProjectService.upsertProjectParameterOverride:',
        error
      );
      throw error;
    }
  }
}
