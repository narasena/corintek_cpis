# CG-05: Next.js Data Caching — Conversation Log

**Date:** 2026-03-07  
**Agent:** Kilo  
**Mode:** Supervised Autonomy (Phase 1-3 Complete, Phase 4-6 Pending)  
**Status:** Specification Complete, Implementation Pending

---

## **Context & Referenced Documents**

- **Backlog:** `docs/BACKLOG.md` (CG-05 entry, lines 247-261)
- **Critical Gap Analysis:** `docs/CRITICAL_GAP_ANALYSIS.md` (Gap #5, lines 247-261, Priority P2)
- **Project Rules:** `AGENTS.md` (Server Actions Only, No new npm packages)
- **Architecture:** `docs/STRUCTURE.md`
- **Next.js Version:** 16.1.6 (MCP verified)

---

## **Executive Summary**

**CG-05** adds Next.js 16 Cache Components to read-heavy service methods, reducing database load and improving response times. The implementation uses `'use cache'`, `cacheTag()`, and `revalidateTag()` to provide server-side caching with tag-based invalidation. No new dependencies — uses built-in Next.js APIs.

**Effort Estimate:** 4-6 hours  
**Risk:** Low (opt-in per function, easy rollback)  
**Architecture Fit:** Perfect — enhances existing Service Layer without breaking changes

---

## **Phase 1: Architecture Analysis**

### **1.1 Problem Statement**

Current state: Every page load hits the database fresh. `revalidatePath()` exists but no caching layer to revalidate against. Wasteful but acceptable for 40 users; must scale for client portal.

### **1.2 Solution Architecture**

```
UI Component
    ↓
Server Action (actions.ts)
    ↓
Service with 'use cache' (service.ts)
    ↓
cacheTag() + cacheLife()
    ↓
Prisma → PostgreSQL
```

Cache invalidation flow:

```
Mutation Action
    ↓
revalidateTag(tag, 'max')
    ↓
Next.js marks cached entries as stale
    ↓
Next page visit: stale served + background revalidation
```

### **1.3 Cache Strategy**

| Domain     | Tag Prefix    | TTL           | Invalidation Triggers          |
| ---------- | ------------- | ------------- | ------------------------------ |
| Dashboard  | `dashboard-*` | 15min default | Log sheet status, work reports |
| Parameters | `parameters`  | 1h            | CRUD ops on parameters/limits  |
| Clients    | `clients`     | 6h            | CRUD ops on clients            |
| Projects   | `projects`    | 15min default | CRUD, assignments              |
| Users      | `users`       | 1h            | CRUD, profile updates          |

### **1.4 Why NOT ReactQuery/TanStack Query?**

- Architecture: Server Actions Only (no client-side data fetching)
- ReactQuery is client-side → incompatible
- Next.js Cache Components = server-side, zero deps
- Strict constraint: "NO new npm packages"

---

## **Phase 2: Interface/Type Design**

### **2.1 Cache Tag Enum**

```typescript
// src/features/cache/tags.ts
export enum ECacheTag {
  // Dashboard
  DASHBOARD_METRICS = 'dashboard-metrics',
  DASHBOARD_PHOTOS = 'dashboard-photos',
  DASHBOARD_ACTIVITIES = 'dashboard-activities',

  // Master data
  PARAMETERS = 'parameters',
  PARAMETERS_LIMITS = 'parameters-limits',
  CLIENTS = 'clients',
  PROJECTS = 'projects',
  PROJECTS_DASHBOARD = 'projects-dashboard',
  USERS = 'users',
  USERS_TECHNICIANS = 'users-technicians',

  // Other domains
  LAB_ANALYSES = 'lab-analyses',
  ATTENDANCE = 'attendance',
  WORK_REPORTS = 'work-reports',
}
```

### **2.2 Cache Life Profile Enum**

```typescript
// src/features/cache/tags.ts
export enum ECacheLifeProfile {
  DEFAULT = 'default', // stale: 15min, revalidate: 15min
  SHORT = 'short', // stale: 1min, revalidate: 5min
  HOURS = 'hours', // stale: 30min, revalidate: 1h
  DAYS = 'days', // stale: 1h, revalidate: 24h
  MAX = 'max', // stale: infinite, revalidate: infinite
}
```

### **2.3 Cache Configuration Helper**

```typescript
// src/features/cache/config.ts
export interface ICacheConfig {
  readonly tags: ECacheTag | ECacheTag[];
  readonly life?: ECacheLifeProfile;
  readonly forceRevalidate?: boolean;
}

export function cacheConfig(params: {
  tags: ECacheTag | ECacheTag[];
  life?: ECacheLifeProfile;
}): ICacheConfig {
  return {
    tags: Array.isArray(params.tags) ? params.tags : [params.tags],
    life: params.life ?? ECacheLifeProfile.DEFAULT,
    forceRevalidate: false,
  };
}
```

### **2.4 Cached Service Interfaces (No Signature Changes)**

Existing service interfaces remain unchanged. Caching is orthogonal concern. Instead, we document caching metadata as comments:

```typescript
// src/features/parameters/service.ts
export interface IParameterService {
  /**
   * Get all active parameters
   * @caching tags=[PARAMETERS], life=HOURS
   */
  getAllParameters(actor: IJwtPayload): Promise<IParameter[]>;

  /**
   * Get parameter by ID
   * @caching tags=[PARAMETERS], life=HOURS
   */
  getParameterById(actor: IJwtPayload, id: string): Promise<IParameter | null>;

  // CRUD methods (no caching)
  createParameter(...): Promise<IParameter>;
  updateParameter(...): Promise<IParameter>;
  deleteParameter(...): Promise<IParameter>;
}
```

### **2.5 Error Types**

```typescript
// src/features/cache/errors.ts (optional, can inline in actions)
export type TCacheErrorCode =
  | 'CACHE_KEY_SERIALIZATION_FAILED'
  | 'CACHE_TAG_TOO_LONG'
  | 'CACHE_TAG_LIMIT_EXCEEDED'
  | 'CACHE_SIZE_LIMIT_EXCEEDED'
  | 'CACHE_DISABLED'
  | 'CACHE_INVALIDATION_FAILED'
  | 'CACHE_STORAGE_ERROR';

export interface ICacheError extends Error {
  readonly code: TCacheErrorCode;
  readonly tag?: string;
  readonly details?: Record<string, unknown>;
}

export class CacheError extends Error implements ICacheError {
  readonly code: TCacheErrorCode;
  readonly tag?: string;
  readonly details?: Record<string, unknown>;
  constructor(params: {
    message: string;
    code: TCacheErrorCode;
    tag?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'CacheError';
    this.code = params.code;
    this.tag = params.tag;
    this.details = params.details;
  }
}

export class CacheInvariantError extends Error {
  constructor(
    message: string,
    public readonly expected?: unknown,
    public readonly actual?: unknown
  ) {
    super(`[CACHE-INVARIANT] ${message}`);
    this.name = 'CacheInvariantError';
  }
}
```

---

## **Phase 3: BDD Scenarios**

### **Feature: Service Method Caching**

#### **Scenario 1.1: Cache hit on repeated service call (Happy Path)**

```
Given the cache system is initialized with cacheComponents: true
And the parameter service getAllParameters(actor) has been called before
When I call getAllParameters(actor) again with the same actor
Then the result should be served from cache
And the Prisma query should NOT execute again
And the returned data should be identical to the previous call
And the response time should be significantly faster (< 10ms)
```

#### **Scenario 1.2: Cache miss on first service call**

```
Given the cache system is initialized
When I call getAllParameters(actor) for the first time
Then the Prisma query should execute
And the result should be cached
And subsequent calls with same actor should be cache hits
```

#### **Scenario 1.3: Cache invalidation via tag after mutation**

```
Given the parameter list is cached with tag ECacheTag.PARAMETERS
And I have 5 parameters in the database
When I call getAllParameters(actor) → returns 5 parameters (cached)
And I create a new parameter via createParameterAction() which calls revalidateTag(PARAMETERS, 'max')
Then the next call to getAllParameters(actor) should execute a fresh query
And return 6 parameters
And the cache should be updated with the new result
```

#### **Scenario 1.4: Multiple cache tags on single function**

```
Given getDashboardMetrics() is tagged with [DASHBOARD_METRICS, DASHBOARD_ACTIVITIES]
When a log sheet is approved which calls revalidateTag(DASHBOARD_ACTIVITIES, 'max')
Then the dashboard metrics should also be invalidated (since it shares a tag)
And next page load fetches fresh data
```

#### **Scenario 1.5: Cache TTL respects configured profile**

```
Given cacheLife(ECacheLifeProfile.HOURS) is set (stale: 30min, revalidate: 1h)
And a cached query was executed 20 minutes ago
When I call the same service method again
Then the cached result should be served (still fresh)
And no background revalidation should occur

Given the same cached query is now 45 minutes old (stale)
When I call the service method
Then the stale cached result should be served immediately
And a background revalidation should trigger (async)
And after revalidation completes, cache should have fresh data
```

#### **Scenario 1.6: Actor-based cache key differentiation**

```
Given getClients(actor) is cached
And User A (role: ADMIN) calls the method → caches result with their auth context
When User B (role: SUPERVISOR) calls the same method
Then a separate cache entry should be created (different actor ID/role)
And each user sees only their authorized clients
And cache misses for unauthorized projections are isolated
```

---

### **Feature: Validation & Error Handling**

#### **Scenario 2.1: Non-serializable argument causes cache failure**

```
Given the service method expects a Date object (serializable)
When I call it with a Map object as argument
Then the caching system should throw a CacheError with code CACHE_KEY_SERIALIZATION_FAILED
And the function should fallback to no-cache execution (if implemented) or throw
And the error should be logged with [CPIS-CACHE] prefix
```

#### **Scenario 2.2: Function accessing cookies inside cache boundary**

```
Given a cached service method tries to call cookies() inside its body
When the method executes
Then Next.js should throw a build-time error: "Dynamic server usage detected"
And the developer should be instructed to move cookies() outside cached scope
```

#### **Scenario 2.3: Invalid cache tag length exceeds limit**

```
Given I call cacheTag() with a 300-character string
When the cache system processes the tag
Then a CacheError with code CACHE_TAG_TOO_LONG should be thrown
And the caching operation should be skipped for that call
```

#### **Scenario 2.4: Exceeding maximum tag count per function**

```
Given I call cacheTag() with 150 different tag strings in one function
When the cache system registers the tags
Then a CacheError with code CACHE_TAG_LIMIT_EXCEEDED should be thrown
And only the first 128 tags should be registered (current limit)
```

#### **Scenario 2.5: Cache storage limit exceeded**

```
Given the in-memory cache has reached its 50MB limit (default cacheMaxMemorySize)
When a new cache entry is attempted
Then the oldest (LRU) entry should be evicted automatically
And the new entry should be cached successfully
And no error should be thrown (graceful degradation)
```

---

### **Feature: Concurrency & Consistency**

#### **Scenario 3.1: Concurrent requests for same cached data**

```
Given 10 concurrent requests call getAllParameters(actor) with same arguments
When the cache entry is cold (miss)
Then only ONE Prisma query should execute (cache deduplication)
And the other 9 requests should wait for the first to complete
And all 10 requests should receive the same cached result
And no duplicate DB queries should occur
```

#### **Scenario 3.2: Cache corruption with soft-deleted records**

```
Given getAllParameters() caches results filtering deletedAt: null
And a parameter with deletedAt is accidentally included in the result
When the cached result is returned
Then a post-condition CacheInvariantError should be thrown in development mode
And the error message should indicate "Invariant violation: deleted parameter in cache"
And the cache entry should be marked as invalid
And subsequent calls should re-fetch fresh data
```

#### **Scenario 3.3: Actor with insufficient permissions never caches unauthorized data**

```
Given User A attempts to call getClients(actor) but lacks read permission
When the service throws Unauthorized before reaching cache
Then the cache should NOT store any entry for this request
And subsequent calls by same user should also throw immediately (cache bypass)
But if another user with proper permissions calls, their authorized result should be cached separately
```

#### **Scenario 3.4: Cache bypass with query parameter**

```
Given caching is enabled for getDashboardMetrics()
When a user visits /dashboard?noCache=true
And the page reads this param and calls revalidateTag(DASHBOARD_METRICS, { expire: 0 }) before rendering
Then the cached entry should be immediately invalidated
And fresh data should be fetched
And the new result should be re-cached normally
```

#### **Scenario 3.5: Cache persistence across requests in self-hosted environment**

```
Given the app is running on a self-hosted Node.js server (not serverless)
When getAllParameters() is called by User A at time T0 → cached
And User A calls it again at time T1 (different HTTP request, same server instance)
Then the cached result should be served from in-memory cache
And no database query should execute
And cache should persist until TTL expiry or invalidation
```

#### **Scenario 3.6: Cache behavior in serverless environment (Vercel/Edge)**

```
Given the app is deployed to a serverless platform
When getAllParameters() is called on Request #1 → cached in that instance memory
And Request #2 lands on a different serverless instance
Then Request #2 should suffer a cache miss (no shared memory)
And a new cache entry should be created on that instance
And this is acceptable per architecture (40 users, self-hosted expected)
```

#### **Scenario 3.7: Date serialization in cache keys**

```
Given getLogSheetsByDateRange(startDate: Date, endDate: Date) is cached
When called with new Date('2025-01-01') and new Date('2025-01-31')
Then the Date objects should be serialized to ISO strings for cache key
And calling again with equivalent Date objects (same time value) should be a cache hit
But calling with different Date range should be a cache miss
```

#### **Scenario 3.8: Null and undefined in cache keys**

```
Given getProjects(actor, projectId?: string) is cached
When called with projectId = null
Then cache key should include projectId: null
And calling again with projectId = null should be a hit
When called with projectId = undefined
Then cache key should include projectId: undefined
And null and undefined should generate different keys (isomorphic serialization)
```

#### **Scenario 3.9: revalidateTag called from non-server context**

```
Given a Server Action has successfully mutated data
When the action calls revalidateTag(PARAMETERS, 'max')
Then the cache invalidation should succeed
But if a Client Component tries to call revalidateTag()
Then a build error should occur: "revalidateTag cannot be called in Client Components"
```

#### **Scenario 3.10: Action retains revalidatePath as fallback**

```
Given an action uses both revalidateTag(PARAMETERS, 'max') AND revalidatePath('/parameters')
When the action executes
Then both invalidation mechanisms should trigger
And if tag-based invalidation fails (misconfiguration), path-based should still refresh the page
And logs should show both operations
```

---

### **Feature: Configuration**

#### **Scenario 4.1: cacheComponents flag enabled in next.config.ts**

```
Given next.config.ts contains cacheComponents: true
When the Next.js dev server starts
Then the cache APIs (use cache, cacheTag, revalidateTag) should be available
And no startup errors should occur

Given cacheComponents: false (or omitted)
When a cached function is encountered
Then a compilation error should occur: "Cache Components not enabled"
```

#### **Scenario 4.2: cacheLife profiles defined correctly**

```
Given next.config.ts defines:
  cacheLife: { hours: { stale: 1800, revalidate: 3600 } }
When a service calls cacheLife(ECacheLifeProfile.HOURS)
Then the cache should use 30min stale, 1h revalidate TTLs

Given a custom profile name not in config
When used in cacheLife('unknown')
Then Next.js should throw a configuration error at build time
```

#### **Scenario 4.3: Debug logging with NEXT_PRIVATE_DEBUG_CACHE**

```
Given environment variable NEXT_PRIVATE_DEBUG_CACHE=1 is set
When cached functions execute
Then console should show verbose cache logs with [cache] prefix
And cache hits/misses should be clearly logged with function names and keys

Given the variable is unset
When cached functions execute
Then only warnings/errors should be logged (quiet mode)
```

---

### **Feature: Performance**

#### **Scenario 5.1: Cache hit rate threshold**

```
Given the dashboard metrics endpoint is cached
When 100 users access the dashboard within 15 minutes
Then the cache hit rate should be > 80% (after warm-up)
And the database query count for getDashboardMetrics() should be ≤ 20 (cold + invalidation events)
```

#### **Scenario 5.2: Cache misses do not degrade performance**

```
Given a cache miss occurs (cold or invalidated)
When the service method executes fresh query
Then response time should be within 2x of pre-caching baseline
And no timeouts should occur
And user should not see error (fresh data returned as fallback)
```

#### **Scenario 5.3: Invalidation completes within acceptable window**

```
Given a mutation invalidates tags [PARAMETERS]
When the action completes and calls revalidateTag(PARAMETERS, 'max')
Then the invalidation should complete within 100ms
And subsequent page visits should see fresh data (stale-while-revalidate)
And no more than 5% of requests during the revalidation window should receive stale data beyond TTL
```

---

## **Phase 4: Module Stubs (Implementation Blueprint)**

### **4.1 File: `src/features/cache/tags.ts`**

```typescript
/**
 * Cache tag enumeration for systematic invalidation
 * @module features/cache/tags
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
 * Must be defined in next.config.ts → cacheLife
 */
export enum ECacheLifeProfile {
  DEFAULT = 'default', // stale: 15min, revalidate: 15min
  SHORT = 'short', // stale: 1min, revalidate: 5min
  HOURS = 'hours', // stale: 30min, revalidate: 1h
  DAYS = 'days', // stale: 1h, revalidate: 24h
  MAX = 'max', // stale: infinite, revalidate: infinite (stale-while-revalidate max)
}
```

### **4.2 File: `src/features/cache/config.ts`**

```typescript
/**
 * Cache configuration helpers
 * @module features/cache/config
 */

import type { ECacheLifeProfile, ECacheTag } from './tags';

/**
 * Configuration for cached service methods
 */
export interface ICacheConfig {
  /** Cache tag(s) for invalidation */
  readonly tags: ECacheTag | ECacheTag[];
  /** Cache life profile (uses next.config.js cacheLife) */
  readonly life?: ECacheLifeProfile;
  /** Force revalidation on every request (dev/debug only) */
  readonly forceRevalidate?: boolean;
}

/**
 * Create cache configuration object
 * Use as: cacheConfig({ tags: [ECacheTag.PARAMETERS], life: ECacheLifeProfile.HOURS })
 */
export function cacheConfig(params: {
  tags: ECacheTag | ECacheTag[];
  life?: ECacheLifeProfile;
}): ICacheConfig {
  return {
    tags: Array.isArray(params.tags) ? params.tags : [params.tags],
    life: params.life ?? ECacheLifeProfile.DEFAULT,
    forceRevalidate: false,
  };
}
```

### **4.3 File: `src/features/cache/errors.ts`** (Optional)

```typescript
/**
 * Cache-specific error classes
 * @module features/cache/errors
 */

export type TCacheErrorCode =
  | 'CACHE_KEY_SERIALIZATION_FAILED'
  | 'CACHE_TAG_TOO_LONG'
  | 'CACHE_TAG_LIMIT_EXCEEDED'
  | 'CACHE_SIZE_LIMIT_EXCEEDED'
  | 'CACHE_DISABLED'
  | 'CACHE_INVALIDATION_FAILED'
  | 'CACHE_STORAGE_ERROR';

export interface ICacheError extends Error {
  readonly code: TCacheErrorCode;
  readonly tag?: string;
  readonly details?: Record<string, unknown>;
}

export class CacheError extends Error implements ICacheError {
  readonly code: TCacheErrorCode;
  readonly tag?: string;
  readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    code: TCacheErrorCode;
    tag?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'CacheError';
    this.code = params.code;
    this.tag = params.tag;
    this.details = params.details;
  }
}

/**
 * Invariant violation within cached function
 * Indicates cache corruption or logic error
 */
export class CacheInvariantError extends Error {
  constructor(
    message: string,
    public readonly expected?: unknown,
    public readonly actual?: unknown
  ) {
    super(`[CACHE-INVARIANT] ${message}`);
    this.name = 'CacheInvariantError';
  }
}
```

### **4.4 Configuration Update: `next.config.ts`**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // CG-05: Enable Cache Components
  cacheComponents: true,
  // Define cache TTL profiles
  cacheLife: {
    default: {
      stale: 900, // 15 minutes (client-side stale)
      revalidate: 900, // 15 minutes (server-side revalidate)
    },
    short: {
      stale: 60, // 1 minute
      revalidate: 300, // 5 minutes
    },
    hours: {
      stale: 1800, // 30 minutes
      revalidate: 3600, // 1 hour
    },
    days: {
      stale: 3600, // 1 hour
      revalidate: 86400, // 24 hours
    },
    max: {
      stale: 31536000, // 1 year
      revalidate: 31536000,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cpis-corintek.workers.dev',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
```

---

## **Implementation Checklist**

### **Pre-Implementation**

- [ ] Read this conversation log fully
- [ ] Verify Next.js 16.1.6+ running (`next-devtools_nextjs_index`)
- [ ] Backup current services and actions (git commit)
- [ ] Create `src/features/cache/` directory with `tags.ts`, `config.ts`

### **Phase 1: Configuration (1 hour)**

- [ ] Update `next.config.ts`:
  - Add `cacheComponents: true`
  - Add `cacheLife` object with 5 profiles
- [ ] Restart dev server
- [ ] Verify no build errors

### **Phase 2: Service Caching (2-3 hours)**

**Priority order:** Dashboard → Parameters → Clients → Projects → Users

For each service file:

1. **Dashboard** (`src/features/dashboard/service.ts`):
   - `getDashboardMetrics()` → `'use cache'`, `cacheTag(DASHBOARD_METRICS)`, `cacheLife(DEFAULT)`
   - `getRecentLogSheetPhotos()` → `cacheTag(DASHBOARD_PHOTOS)`, `cacheLife(SHORT)`
   - `ActivityService.getRecentActivities()` → `cacheTag(DASHBOARD_ACTIVITIES)`, `cacheLife(SHORT)`
   - Add imports: `import { cacheTag, cacheLife } from 'next/cache'`
   - Add imports: `import { ECacheTag, ECacheLifeProfile } from '../cache/tags'`

2. **Parameters** (`src/features/parameters/service.ts`):
   - `getAllParameters()` → `cacheTag(PARAMETERS)`, `cacheLife(HOURS)`
   - `getParameterById()` → `cacheTag(PARAMETERS)`, `cacheLife(HOURS)`

3. **Clients** (`src/features/clients/service.ts`):
   - `getClients()` → `cacheTag(CLIENTS)`, `cacheLife(HOURS)`
   - `getClientById()` → `cacheTag(CLIENTS)`, `cacheLife(HOURS)`

4. **Projects** (`src/features/projects/service.ts`):
   - `getProjects()` → `cacheTag(PROJECTS)`, `cacheLife(DEFAULT)`
   - `getDashboardProjects()` → `cacheTag(PROJECTS_DASHBOARD)`, `cacheLife(SHORT)`
   - `getProjectById()` → `cacheTag(PROJECTS)`, `cacheLife(DEFAULT)`

5. **Users** (`src/features/users/service.ts`):
   - `getAllUsers()` → `cacheTag(USERS)`, `cacheLife(HOURS)`
   - `getTechniciansList()` → `cacheTag(USERS_TECHNICIANS)`, `cacheLife(HOURS)`
   - `getUserById()` → `cacheTag(USERS)`, `cacheLife(HOURS)`
   - `getCurrentUserProfile()` → `cacheTag(USERS)`, `cacheLife(HOURS)`

**For each modification:**

- Place `'use cache'` as first directive before any code
- Call `cacheTag()` and `cacheLife()` immediately after
- Verify all inputs and outputs are serializable (TypeScript catches)
- Add development-only post-condition checks (optional)
- Run `tsc` to ensure no type errors

### **Phase 3: Action Invalidation (1-2 hours)**

For each mutation action file, replace `revalidatePath()` with `revalidateTag()`:

**General pattern:**

```typescript
// Before:
await prisma.parameter.update(...);
revalidatePath('/parameters');

// After:
await prisma.parameter.update(...);
revalidateTag(ECacheTag.PARAMETERS, 'max');
revalidateTag(ECacheTag.PARAMETERS_LIMITS, 'max'); // if affects limits too
// Optional: keep revalidatePath('/parameters') as fallback
```

**Files to update:**

1. `src/features/parameters/actions.ts`:
   - `createParameterAction()` → invalidate `PARAMETERS`, `PARAMETERS_LIMITS`
   - `updateParameterAction()` → invalidate `PARAMETERS`, `PARAMETERS_LIMITS`
   - `deleteParameterAction()` → invalidate `PARAMETERS`
   - `updateParameterLimitMasterAction()` → invalidate `PARAMETERS_LIMITS`

2. `src/features/clients/actions.ts`:
   - `createClientAction()` → `CLIENTS`
   - `updateClientAction()` → `CLIENTS`
   - `deleteClientAction()` → `CLIENTS`

3. `src/features/projects/actions.ts`:
   - `createProjectAction()` → `PROJECTS`, `PROJECTS_DASHBOARD`
   - `updateProjectAction()` → `PROJECTS`, `PROJECTS_DASHBOARD`
   - `setProjectAssignmentsAction()` → `PROJECTS_DASHBOARD`, `USERS`

4. `src/features/users/actions.ts`:
   - `createUserAction()` → `USERS`, `USERS_TECHNICIANS`
   - `updateUserAction()` → `USERS`, `USERS_TECHNICIANS`
   - `deleteUserAction()` → `USERS`, `USERS_TECHNICIANS`
   - `updateCurrentUserProfileAction()` → `USERS`

5. `src/features/dashboard/actions.ts`:
   - Check if any mutations exist (mostly reads) — likely no changes needed
   - If notifications trigger dashboard updates, invalidate `DASHBOARD_ACTIVITIES`

6. `src/features/work-reports/actions.ts`:
   - All mutations (create/update/approve/delete) → `WORK_REPORTS`, `DASHBOARD_ACTIVITIES`

7. `src/features/log-sheets/actions.ts`:
   - `createLogSheetAction()` → `DASHBOARD_ACTIVITIES`, `DASHBOARD_PHOTOS`, `PROJECTS_DASHBOARD`
   - `approveLogSheetAction()` → `DASHBOARD_ACTIVITIES`, `PROJECTS_DASHBOARD`
   - `updateLogSheetAction()` → `DASHBOARD_ACTIVITIES`
   - `deleteLogSheetAction()` → `DASHBOARD_ACTIVITIES`

8. `src/features/attendance/actions.ts`:
   - `createAttendanceAction()` → `ATTENDANCE`
   - `updateAttendanceAction()` → `ATTENDANCE`

**Steps per file:**

- Add import: `import { revalidateTag } from 'next/cache'`
- Add import: `import { ECacheTag } from '../cache/tags'`
- Replace each `revalidatePath('/route')` with `revalidateTag(ECacheTag.X, 'max')`
- Use `'max'` profile for stale-while-revalidate (recommended)
- Keep `revalidatePath()` commented as fallback initially, remove after testing

### **Phase 4: Verification (0.5 hour)**

1. **Enable debug logging:**

   ```bash
   NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev
   ```

2. **Test cache hits:**
   - Navigate to Dashboard → observe logs
   - Refresh page → should see "[cache] hit" in console
   - First request: cache miss (query executes)
   - Second request: cache hit (no query)

3. **Test invalidation:**
   - Create a new parameter
   - Navigate to Parameters page
   - Should see new parameter immediately (stale-while-revalidate)
   - Check logs: `revalidateTag(PARAMETERS, 'max')` called

4. **Check no regressions:**
   - All pages still load correctly
   - No TypeScript errors
   - No runtime errors in console
   - Mobile view works (test viewport)

5. **Optional performance test:**
   ```sql
   -- Before: count queries per page load
   SELECT query, calls FROM pg_stat_statements ORDER BY calls DESC;
   -- After: should see reduction in SELECT * FROM Parameter, Project, etc.
   ```

### **Phase 5: Testing**

**Unit tests (add to existing service tests):**

```typescript
// src/features/parameters/service.test.ts
import { resetAllCache } from 'next/cache';

describe('ParameterService with cache', () => {
  beforeEach(() => {
    resetAllCache();
  });

  it('caches getParameters result', async () => {
    const result1 = await service.getAllParameters(actor);
    const result2 = await service.getAllParameters(actor);
    // Verify cache hit via mock count or debug log
  });

  it('invalidates cache on mutation', async () => {
    const before = await service.getAllParameters(actor);
    await actions.createParameterAction(data);
    const after = await service.getAllParameters(actor);
    expect(after.length).toBe(before.length + 1);
  });
});
```

**Integration tests (E2E):**

- Add Playwright tests that verify data consistency after mutations
- Not high priority in rescue mode

---

## **Important Decisions & Rationale**

### **Decision 1: Use Next.js Cache Components, NOT ReactQuery**

**Rationale:**

- Architecture enforces Server Actions Only (no client fetch)
- Zero new dependencies (strict constraint)
- Built into framework → no maintenance burden
- Sufficient for 40 users, self-hosted

### **Decision 2: Tag-based invalidation vs Path-based**

**Rationale:**

- Tags cross-cut routes → invalidate multiple pages at once
- More granular: can invalidate "parameters" without touching "projects"
- Path-based kept as optional fallback for defense-in-depth

### **Decision 3: TTL Profiles: DEFAULT=15min, HOURS=1h**

**Rationale:**

- Dashboard data changes frequently → shorter TTL (15min)
- Master data (parameters, users) changes rarely → longer TTL (1h)
- Acceptable staleness: dashboard 15min OK for internal tool
- Configurable per domain via `cacheLife()` if needed later

### **Decision 4: No cache warming**

**Rationale:**

- Rescue mode: speed > perfection
- 40 users → warm-up happens organically within minutes
- Complexity high, benefit low

### **Decision 5: In-memory cache only (no Redis)**

**Rationale:**

- Self-hosted expected → in-memory persists across requests
- 40 users × 5 service calls each = minimal memory (< 50MB)
- Distributed cache (Redis) adds infra complexity → defer to maintenance

---

## **Known Gotchas & Mitigations**

| Gotcha                                                        | Mitigation                                              |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| Non-serializable arguments (Dates OK, Maps/Sets NO)           | Enforce primitive args; extract actor.id/role           |
| Dynamic data in closures captured as part of cache key        | Pass all runtime data as explicit arguments             |
| Serverless environments lose cache per request                | Document: self-hosted expected; acceptable for 40 users |
| Cache size limit (50MB default) exceeded                      | Accept LRU eviction (graceful degradation)              |
| Stale-while-revalidate may serve outdated data                | TTLs chosen conservatively; max 15min for dashboard     |
| Tag limit (128 per function) exceeded                         | Use 1-3 tags per function → safe                        |
| `cookies()`/`headers()` inside cached function → build error  | Document rule: read outside, pass as arg                |
| Soft-deleted records accidentally cached → invariant          | Add post-condition checks in dev mode                   |
| Actor-based cache key misses if actor object non-serializable | Destructure to `{ id, role }` before using              |
| `revalidateTag()` called from Client Component → build error  | Only call from Server Actions/Route Handlers            |
| `cacheLife()` profile not defined in config → build error     | Define all profiles in `next.config.ts` first           |

---

## **Rollback Plan**

If caching causes issues:

1. **Immediate disable:**
   - Set `cacheComponents: false` in `next.config.ts`
   - OR remove `'use cache'` directives from all functions

2. **Partial rollback (per domain):**
   - Remove `'use cache'` and `cacheTag()` from problematic service
   - Revert to existing `revalidatePath()` (already present)

3. **Debug mode:**
   - Set `NEXT_DISABLE_CACHE=1` to bypass caching entirely
   - Keep code in place, just disable at runtime

**Timeline:** Rollback possible in < 5 minutes (config change + restart)

---

## **Related References**

- **Next.js Cache Docs:** `/docs/app/api-reference/directives/use-cache`
- **Next.js cacheTag:** `/docs/app/api-reference/functions/cacheTag`
- **Next.js revalidateTag:** `/docs/app/api-reference/functions/revalidateTag`
- **Next.js cacheLife:** `/docs/app/api-reference/config/next-config-js/cacheLife`
- **Next.js cacheComponents:** `/docs/app/api-reference/config/next-config-js/cacheComponents`

---

## **Next Steps**

### **Phase 4: Module Stubs (Ready to Execute)**

Files to create:

1. `src/features/cache/tags.ts`
2. `src/features/cache/config.ts`
3. (Optional) `src/features/cache/errors.ts`

File to modify:

1. `next.config.ts` — add `cacheComponents: true` + `cacheLife` profiles

### **Phase 5: Implementation**

Order of execution:

1. Create cache infrastructure files
2. Modify services (Dashboard → Parameters → Clients → Projects → Users)
3. Modify actions (all mutation files)
4. Run dev server, verify with debug logs

### **Phase 6: Tests & Final Review**

- Add unit tests for cache behavior
- Run full test suite: `npm test`
- Manual testing of all CRUD pages
- Verify cache hits in logs
- Confirm invalidation works

---

## **User Decisions Required**

1. **Keep `revalidatePath()` as fallback?**
   - Option A: Yes (defense in depth, no cost)
   - Option B: No (cleaner, less log noise)

2. **Post-condition invariant checks in dev?**
   - Add `if (process.env.NODE_ENV === 'development')` asserts?
   - Cost: minor dev overhead; Benefit: catches soft-delete bugs

3. **Cache warming on startup?**
   - Option A: No (rescue mode)
   - Option B: Yes (pre-warm dashboard metrics, parameters)

4. **Metrics collection?**
   - Track cache hit rate, miss rate?
   - Option A: No (monitoring overhead)
   - Option B: Yes (Prometheus metrics, log aggregation)

5. **Testing rigor?**
   - Rescue mode: "tests where easy, skip where hard"
   - Full coverage: write unit tests for all cached methods?
   - Recommended: 1-2 integration tests, skip unit cache tests

---

**Status:** Specification complete. Awaiting approval to proceed to Phase 4 (Module Stubs) and Phase 5 (Implementation).

**Questions for user:**

- Shall I implement the cache infrastructure files now?
- Any adjustments to TTL profiles or tag mapping?
- Keep `revalidatePath()` as fallback?
