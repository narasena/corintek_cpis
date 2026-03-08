# Caching Feature — Implementation Guide & Next Steps

**Status:** ✅ Implemented (Infrastructure + Service Layer)  
**Last Updated:** 2026-03-07  
**Architecture:** Next.js 16 Cache Components + Tag-Based Invalidation

---

## What Was Built

### Infrastructure (`src/features/cache/`)

| File               | Purpose                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `tags.ts`          | `ECacheTag` enum & `ECacheLifeProfile` enum for systematic invalidation                                 |
| `config.ts`        | `ICacheConfig` interface & `cacheConfig()` factory (for documentation)                                  |
| `errors.ts`        | `CacheError` & `CacheInvariantError` classes (future use)                                               |
| `life-profiles.ts` | Centralized `CACHE_LIFE` constants (DEFAULT, SHORT, HOURS)                                              |
| `di.ts`            | Dependency Injection container (`initializeCacheContainer`, `getCacheContainer`, `resetCacheContainer`) |

### Cached Service Classes

Each domain has a `CachedXxxService` that wraps the original service:

- `CachedParameterService` – `getAllParameters`, `getParameterById` (cached)
- `CachedClientService` – `getAllClients`, `getClientById` (cached)
- `CachedProjectService` – `getProjects`, `getProjectById`, `getDashboardProjects` (cached)
- `CachedUserService` – `getAllUsers`, `getTechniciansList`, `getUserById`, `getCurrentUserProfile` (cached)
- `CachedDashboardService` – `getDashboardMetrics`, `getRecentLogSheetPhotos`, `getRecentActivities` (cached)

**Characteristics:**

- Read methods use `'use cache'` directive at the file/class level
- Each read method calls `cacheTag(tag)` and `cacheLife(profile)` immediately
- Write methods (create/update/delete) **do not** use caching (by design)
- Constructor injection of original service modules (or dependencies like `ActivityService`)
- All methods under **20 lines** (delegation pattern)
- Error handling: `try/catch` with `[CPIS-ERROR]` prefix

### Mutation Actions Updated

All server actions that perform mutations now call `revalidateTag()` after successful DB operations:

| Domain       | Actions Updated                                                                                                                                | Cache Tags Invalidated                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Parameters   | `createParameterAction`, `updateParameterAction`, `deleteParameterAction`, `updateParameterLimit*`                                             | `PARAMETERS`, `PARAMETERS_LIMITS`                                |
| Clients      | `createClientAction`, `updateClientAction`, `deleteClientAction`                                                                               | `CLIENTS`                                                        |
| Projects     | `createProjectAction`, `updateProjectAction`, `deleteProjectAction`, `setProjectAssignmentsAction`                                             | `PROJECTS`, `PROJECTS_DASHBOARD`, `USERS` (assignments)          |
| Users        | `createUserAction`, `updateUserAction`, `deleteUserAction`, `updateCurrentUserProfileAction`                                                   | `USERS`, `USERS_TECHNICIANS`                                     |
| Log Sheets   | `createLogSheetAction`, `updateLogSheetAction`, `submitLogSheetAction`, `approveLogSheetAction`, `deleteLogSheetAction`, `saveLogSheet*Action` | `DASHBOARD_ACTIVITIES`, `DASHBOARD_PHOTOS`, `PROJECTS_DASHBOARD` |
| Work Reports | `createWorkReportAction`, `updateWorkReportAction`, `submitWorkReportAction`, `approveWorkReportAction`, `deleteWorkReportAction`              | `WORK_REPORTS`, `DASHBOARD_ACTIVITIES`                           |
| Attendance   | `clockInAction`, `clockOutAction`                                                                                                              | `ATTENDANCE`                                                     |

_Note:_ Commented `revalidatePath()` fallbacks retained in each action for defense-in-depth during testing.

---

## Configuration Done

`next.config.ts` now includes:

```ts
cacheComponents: true,
cacheLife: {
  default: { stale: 900, revalidate: 900 },       // 15 min
  short:   { stale: 60,  revalidate: 300 },      // 1 min stale, 5 min revalidate
  hours:   { stale: 1800, revalidate: 3600 },    // 30 min stale, 1 hr revalidate
  days:    { stale: 3600, revalidate: 86400 },   // 1 hr stale, 24 hr revalidate
  max:     { stale: 31536000, revalidate: 31536000 } // ~1 year (for tag invalidation)
}
```

---

## Current State

- ✅ All caching infrastructure in place
- ✅ Cached service classes implemented and tested (unit tests exist)
- ✅ Dependency Injection container ready (`src/features/cache/di.ts`)
- ✅ Mutation actions use `revalidateTag()`
- ❌ **Not yet wired into the application** — Container initialization and service consumption not done

---

## 🚀 Next Steps (What to Do Now)

### 1. Initialize the DI Container at App Startup

Choose **one** location:

**Option A:** In `app/layout.tsx` (server component root)

```tsx
import { prisma } from '@/lib/prisma';
import { initializeCacheContainer } from '@/features/cache/di';

initializeCacheContainer(prisma);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Option B:** In a dedicated startup file imported by layout.

---

### 2. Replace Legacy Service Calls with Cached Services in Server Actions

For each server action file, modify to use cached services:

**Example – Parameters actions (`src/features/parameters/actions.ts`)**

```ts
import { getCacheContainer } from '@/features/cache/di';

// Inside an action:
const { parameters } = getCacheContainer();
const data = await parameters.getAllParameters(actor);
```

**Apply to all reads:**

- `getAllParameters`, `getParameterById` → use `getCacheContainer().parameters`
- `getAllClients`, `getClientById` → `getCacheContainer().clients`
- `getProjects`, `getDashboardProjects`, `getProjectById` → `getCacheContainer().projects`
- `getAllUsers`, `getTechniciansList`, `getUserById`, `getCurrentUserProfile` → `getCacheContainer().users`
- `getDashboardMetrics`, `getRecentLogSheetPhotos`, `getRecentActivities` → `getCacheContainer().dashboard`

---

### 3. Update Server Components & Pages

Any server component that directly calls original service functions must switch to cached services:

**Example – Dashboard page:**

```tsx
import { getCacheContainer } from '@/features/cache/di';

export default async function DashboardPage() {
  const { dashboard } = getCacheContainer();
  const metrics = await dashboard.getDashboardMetrics();
  const photos = await dashboard.getRecentLogSheetPhotos();
  const activities = await dashboard.getRecentActivities({ timeRange: '7d' });
  // ...
}
```

**Note:** Some pages already use server actions; those don't need changes—the actions should use cached services instead.

---

### 4. Verify Cache Behavior in Development

1. Start dev server: `npm run dev`
2. Open browser DevTools → Network → check response headers for `x-nextjs-cache`:
   - `HIT` means cache working
   - `MISS` means fresh query
3. Perform a mutation (e.g., create parameter) and verify that subsequent reads are `REVALIDATED` (not stale).

---

### 5. Monitoring & Tuning

- **TTL tuning:** If data is too stale, reduce `cacheLife` values in `life-profiles.ts`.
- **Tag granularity:** Current tags are domain-level; consider more granular tags (e.g., `parameters:{id}`) if selective invalidation becomes necessary.
- **Cache size:** Next.js in-memory cache may grow; monitor memory usage on long-running servers.
- **Serverless limitation:** Cache does **not** persist across serverless instances. Acceptable for self-hosted deployment; if moving to serverless, consider Redis or external cache.

---

### 6. Testing Checklist

- [ ] All read-only pages show fresh data immediately after a mutation
- [ ] No `[CPIS-ERROR]` from cached service errors appearing in UI (should be handled by actions)
- [ ] Cache hit rates look healthy (logs or `NEXT_PRIVATE_DEBUG_CACHE=1`)
- [ ] No pages error due to `'use cache'` incompatible patterns (export const dynamic = 'force-dynamic' should be removed where caching is desired)

---

### 7. Potential Improvements (Optional)

- **Define explicit service interfaces** (`IParameterService`, `IClientService`, etc.) to formalize the contract and enable easier testing.
- **Base class with common logging** to reduce duplication of `try/catch` blocks across cached services.
- **Cache metrics collection** (hits/misses) if monitoring becomes necessary.
- **Generic `withCache` higher-order function** to wrap methods, though `'use cache'` directive must be at top-level of async function, so a base class pattern is more practical.

---

## Phase 5: Performance Testing Results

**Date:** March 8, 2026  
**Status:** Cache infrastructure working, but limited impact due to architecture

### Findings

1. **Cache IS working** - Console logs confirm hit/miss events:

   ```
   {"level":"CACHE","event":"miss","tag":"users","timestamp":...}
   {"level":"CACHE","event":"hit","tag":"users","timestamp":...}
   ```

2. **Timing results:**
   - First request (cache miss): ~300ms
   - Subsequent rapid request (cache hit): ~80-300ms
   - Dev server introduces variability

3. **Limitation:** Due to client-side fetching pattern (all pages use `'use client'` with `useEffect`), caching benefits are limited to rapid repeated requests within same session.

### Architecture Reality

| Pattern                      | Cache Impact                                  |
| ---------------------------- | --------------------------------------------- |
| Client Component + useEffect | Limited (each navigation = new request)       |
| Server Component             | Full benefit (Next.js caches rendered output) |

### Load Test (k6)

- 10 VUs, 3 minutes
- Error rate: 0%
- p95 latency: 262ms
- Note: k6 testing limited by Next.js server action auth (requires browser)

### Verdict

**Caching infrastructure is functional.** For internal tool (<40 users), current approach is acceptable. Future optimization: migrate to Server Components for full caching benefits.

---

## Reference

- **CG-05 Spec:** `docs/conversation/kilo/cg-05-caching-specification.md`
- **Design ADR:** `docs/DECISIONS.md` (ADR-009)
- **Architecture Rules:** `AGENTS.md` (Server Actions Only, no REST API)
- **Service Pattern:** Original service modules in `src/features/*/service.ts`
- **Phase 5 Report:** `docs/PHASE_5_CACHING_REPORT.md`

---

**After completing these steps, the caching system will be fully operational and providing performance benefits across the application.**
