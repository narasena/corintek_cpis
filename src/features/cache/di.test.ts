import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializeCacheContainer,
  getCacheContainer,
  resetCacheContainer,
  ICacheContainer,
} from './di';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {} as any,
}));

// Mock all original service modules
vi.mock('../parameters/service', () => ({
  getAllParameters: vi.fn(),
  getParameterById: vi.fn(),
  createParameter: vi.fn(),
  updateParameter: vi.fn(),
  deleteParameter: vi.fn(),
}));

vi.mock('../clients/service', () => ({
  getAllClients: vi.fn(),
  getClientById: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}));

vi.mock('../projects/service', () => ({
  getProjects: vi.fn(),
  getDashboardProjects: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  setProjectAssignments: vi.fn(),
  assertCanAccessProject: vi.fn(),
  getAccessibleProjectIds: vi.fn(),
}));

vi.mock('../users/service', () => ({
  getAllUsers: vi.fn(),
  getTechniciansList: vi.fn(),
  getUserById: vi.fn(),
  getCurrentUserProfile: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

vi.mock('../dashboard/service', () => ({
  getDashboardMetrics: vi.fn(),
  getRecentLogSheetPhotos: vi.fn(),
}));

vi.mock('../dashboard/di', () => ({
  composeDashboardModule: vi.fn(() => ({
    activityService: { getRecentActivities: vi.fn() },
    projectAccessService: {},
    activityRepository: {},
  })),
}));

import { prisma } from '@/lib/prisma';

describe('Cache DI Container', () => {
  beforeEach(() => {
    resetCacheContainer();
  });

  it('initializeCacheContainer creates all cached services', () => {
    expect(() => initializeCacheContainer(prisma)).not.toThrow();
    const container = getCacheContainer();
    expect(container).toBeDefined();
    expect(container.parameters).toBeDefined();
    expect(container.clients).toBeDefined();
    expect(container.projects).toBeDefined();
    expect(container.users).toBeDefined();
    expect(container.dashboard).toBeDefined();
  });

  it('getCacheContainer throws when not initialized', () => {
    expect(() => getCacheContainer()).toThrow('Container not initialized');
  });

  it('initializeCacheContainer is idempotent', () => {
    initializeCacheContainer(prisma);
    const c1 = getCacheContainer();
    initializeCacheContainer(prisma); // second call
    const c2 = getCacheContainer();
    expect(c1).toBe(c2); // same instance
  });

  it('resetCacheContainer clears the singleton', () => {
    initializeCacheContainer(prisma);
    resetCacheContainer();
    expect(() => getCacheContainer()).toThrow('Container not initialized');
  });

  it('container services have correct method signatures', () => {
    initializeCacheContainer(prisma);
    const { parameters, clients, projects, users, dashboard } =
      getCacheContainer();

    // read methods exist
    expect(typeof parameters.getAllParameters).toBe('function');
    expect(typeof parameters.getParameterById).toBe('function');
    // write methods exist
    expect(typeof parameters.createParameter).toBe('function');

    expect(typeof clients.getAllClients).toBe('function');
    expect(typeof clients.getClientById).toBe('function');
    expect(typeof clients.createClient).toBe('function');

    expect(typeof projects.getProjects).toBe('function');
    expect(typeof projects.getDashboardProjects).toBe('function');
    expect(typeof projects.createProject).toBe('function');

    expect(typeof users.getAllUsers).toBe('function');
    expect(typeof users.getCurrentUserProfile).toBe('function');

    expect(typeof dashboard.getDashboardMetrics).toBe('function');
    expect(typeof dashboard.getRecentLogSheetPhotos).toBe('function');
    expect(typeof dashboard.getRecentActivities).toBe('function');
  });

  // SOLID: Dependency Inversion — high-level modules can depend on ICacheContainer abstraction
  // Interface Segregation — each service is focused on its domain
  // Single Responsibility — container only assembles dependencies
});
