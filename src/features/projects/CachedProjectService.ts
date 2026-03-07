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
  IProject,
  IProjectDashboardCard,
} from './types';
import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag } from '../cache/tags';

export class CachedProjectService {
  constructor(private readonly service: typeof original = original) {}

  async getProjects(actor: IJwtPayload): Promise<IProject[]> {
    'use cache';
    cacheTag(ECacheTag.PROJECTS);
    cacheLife({ stale: 900, revalidate: 900 });
    try {
      return await this.service.getProjects(actor);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedProjectService.getProjects:', error);
      throw error;
    }
  }

  async getDashboardProjects(
    actor: IJwtPayload
  ): Promise<IProjectDashboardCard[]> {
    'use cache';
    cacheTag(ECacheTag.PROJECTS_DASHBOARD);
    cacheLife({ stale: 60, revalidate: 300 });
    try {
      return await this.service.getDashboardProjects(actor);
    } catch (error) {
      console.error(
        '[CPIS-ERROR] CachedProjectService.getDashboardProjects:',
        error
      );
      throw error;
    }
  }

  async getProjectById(
    actor: IJwtPayload,
    id: string
  ): Promise<IProject | null> {
    'use cache';
    cacheTag(ECacheTag.PROJECTS);
    cacheLife({ stale: 900, revalidate: 900 });
    try {
      return await this.service.getProjectById(actor, id);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedProjectService.getProjectById:', error);
      throw error;
    }
  }

  async createProject(
    actor: IJwtPayload,
    data: TCreateProject
  ): Promise<IProject> {
    try {
      return await this.service.createProject(actor, data);
    } catch (error) {
      console.error('[CPIS-ERROR] CachedProjectService.createProject:', error);
      throw error;
    }
  }

  async updateProject(
    actor: IJwtPayload,
    data: TUpdateProject
  ): Promise<IProject> {
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
  ): Promise<unknown[]> {
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

  async assertCanAccessProject(
    actor: IJwtPayload,
    projectId: string
  ): Promise<void> {
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

  async getAccessibleProjectIds(actor: IJwtPayload): Promise<string[] | null> {
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
}
