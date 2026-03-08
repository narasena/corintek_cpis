/**
 * Cache tag enumeration for systematic invalidation
 * @module features/cache/tags
 *
 * These tags are used with cacheTag() and revalidateTag() to provide
 * fine-grained cache invalidation across the application.
 *
 * Tag design principles:
 * - Domain-prefixed: dashboard-*, parameters, clients, etc.
 * - Granular: Multiple tags allow invalidating subsets of data
 * - Cross-cutting: Multiple functions can share tags (e.g., dashboard metrics + activities)
 */

export enum ECacheTag {
  // Dashboard tags
  DASHBOARD_METRICS = 'dashboard-metrics',
  DASHBOARD_PHOTOS = 'dashboard-photos',
  DASHBOARD_ACTIVITIES = 'dashboard-activities',

  // Master data tags
  PARAMETERS = 'parameters',
  PARAMETERS_LIMITS = 'parameters-limits',
  CLIENTS = 'clients',
  PROJECTS = 'projects',
  PROJECTS_DASHBOARD = 'projects-dashboard',
  USERS = 'users',
  USERS_TECHNICIANS = 'users-technicians',

  // Domain tags
  LAB_ANALYSES = 'lab-analyses',
  ATTENDANCE = 'attendance',
  WORK_REPORTS = 'work-reports',
}

/**
 * Cache TTL (time-to-live) profiles
 * These correspond to profiles defined in next.config.ts → cacheLife
 *
 * Stale = time before cached response is considered stale (served stale while revalidating)
 * Revalidate = time after which cached response is regenerated in background
 *
 * Usage: cacheLife(ECacheLifeProfile.HOURS)
 */
export enum ECacheLifeProfile {
  DEFAULT = 'default', // stale: 15min, revalidate: 15min
  SHORT = 'short', // stale: 1min, revalidate: 5min
  HOURS = 'hours', // stale: 30min, revalidate: 1h
  DAYS = 'days', // stale: 1h, revalidate: 24h
  MAX = 'max', // stale: infinite, revalidate: infinite (for tag invalidation)
}
