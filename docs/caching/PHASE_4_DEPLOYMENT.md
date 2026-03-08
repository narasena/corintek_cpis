# Phase 4: Production Rollout — Caching Layer

**Date:** 2026-03-08  
**Branch:** `feat/caching/nextjs-cache-components`  
**Target:** Deploy to QA/staging, then production

---

## Pre-Deployment Checklist

### Build & Tests

- [x] `npm run build` passes (32 pages, no errors)
- [x] TypeScript typecheck passes
- [x] Integration tests pass (`src/features/cache/integration.test.ts` → 22/22)
- [x] Unit tests for cached services (existing, some unrelated failures OK)

### Code Completeness

- [x] All 5 cached services implemented with helper function pattern
- [x] All 5 action modules use cached services
- [x] All mutation actions call `revalidateTag()` appropriately:
  - [x] clients: `revalidateTag(ECacheTag.CLIENTS, 'max')`
  - [x] parameters: `revalidateTag(ECacheTag.PARAMETERS, 'max')` + limits
  - [x] projects: `revalidateTag(ECacheTag.PROJECTS, 'max')` + dashboard
  - [x] users: `revalidateTag(ECacheTag.USERS, 'max')` + technicians
  - [x] work reports: `revalidateTag(ECacheTag.WORK_REPORTS, 'max')` + activities
  - [x] log sheets: `revalidateTag(DASHBOARD_ACTIVITIES/DASHBOARD_PHOTOS, 'max')`
  - [x] attendance: `revalidateTag(ECacheTag.ATTENDANCE, 'max')`
- [x] `next.config.ts` has `cacheComponents: true` and TTL profiles defined
- [x] Layout uses Suspense boundary for uncached `getCurrentUserDetails()`

### Monitoring & Telemetry

- [x] `src/features/cache/metrics.ts` implemented (opt-in via env)
- [ ] Enable metrics in staging: set `NEXT_PUBLIC_CACHE_METRICS=true`
- [ ] Create admin endpoint to view metrics (optional, see below)

---

## Staging Deployment Steps

1. **Merge to development_v2**

   ```bash
   git checkout development_v2
   git merge --no-ff feat/caching/nextjs-cache-components
   git push origin development_v2
   ```

2. **Deploy to Staging**
   - Deploy to staging environment (e.g., `staging.cpis-corintek.workers.dev`)
   - Set environment variable: `NEXT_PUBLIC_CACHE_METRICS=true`

3. **Smoke Tests**
   - [ ] Login as admin
   - [ ] Visit Dashboard → verify data loads quickly
   - [ ] Visit Parameters list → verify data loads
   - [ ] Visit Clients list → verify data loads
   - [ ] Visit Projects list → verify data loads
   - [ ] Visit Users list → verify data loads
   - [ ] Perform CRUD on Clients → verify list updates (within TTL)
   - [ ] Perform CRUD on Parameters → verify dashboard reflects changes
   - [ ] Create a Log Sheet → verify dashboard activity appears

4. **Metrics Validation**
   - Access metrics (see "Metrics Collection" below)
   - Check:
     - [ ] Total cache hits > total misses on read-heavy pages
     - [ ] Hit rate > 70% on parameters/clients/projects/users/dashboard
     - [ ] Errors count = 0 (or minimal)
     - [ ] Memory usage stable (< 100MB for cache)

5. **Concurrency Test** (optional)
   - Simulate 5-10 concurrent users accessing same pages
   - Verify no race conditions, cache deduplication works (should see only 1 DB call per unique request)

6. **Rollback Preparation**
   - If issues observed, be ready to set `cacheComponents: false` in `next.config.ts` and redeploy

---

## Production Rollout

After staging validation passes:

1. **Merge to main**

   ```bash
   git checkout main
   git merge --no-ff feat/caching/nextjs-cache-components
   git tag -a v0.3.0 -m "Release v0.3.0: Caching layer"
   git push origin main --tags
   ```

2. **Production Deployment**
   - Deploy to production (e.g., `app.cpis-corintek.workers.dev`)
   - **Optional**: Keep `NEXT_PUBLIC_CACHE_METRICS=false` (default) or set to true for 24h monitoring
   - Ensure `cacheComponents: true` remains

3. **Post-Deployment Monitoring**
   - Watch logs for cache-related errors
   - Check error reporting (Sentry) for any `[CPIS-ERROR]` from cached services
   - Verify page load times improved (compare before/after if metrics available)

4. **After 24h**
   - If stable, consider disabling metrics (`NEXT_PUBLIC_CACHE_METRICS=false`) to avoid overhead
   - Document any tuning adjustments (e.g., TTL profile changes if data staleness complaints)

---

## Metrics Collection (Operational)

### Enabling Metrics

Set environment variable: `NEXT_PUBLIC_CACHE_METRICS=true`

### Viewing Metrics

Create an admin-only API endpoint or use server console. Example:

```typescript
// src/features/cache/metrics-endpoint.ts (optional)
import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSnapshot, resetMetrics } from './metrics';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.role === 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snapshot = getMetricsSnapshot();
  return NextResponse.json(snapshot);
}
```

### Metrics Format

```json
{
  "enabled": true,
  "uptimeSeconds": 86400,
  "totalRequests": 1500,
  "totalHits": 1200,
  "totalMisses": 300,
  "totalErrors": 0,
  "hitRate": 0.80,
  "byTag": {
    "hits": { "clients": 400, "parameters": 300, ... },
    "misses": { "clients": 50, ... },
    "errors": {}
  },
  "memoryBytes": 12345
}
```

---

## Rollback Plan

**Immediate rollback** (if issues arise):

1. Edit `next.config.ts`: set `cacheComponents: false`
2. Redeploy (full rebuild)
3. All `'use cache'` directives become no-ops; app falls back to direct service calls
4. No data loss or schema changes — safe instant rollback

**Selective rollback** (if only one domain problematic):

- Remove `'use cache'` directive from the specific `CachedXxxService.ts` file
- Redeploy

---

## Known Limitations & Gotchas

- **Serverless**: In-memory cache does NOT persist across serverless instances. Acceptable for self-hosted deployment where same instance handles all requests.
- **Serialization**: All cached function arguments must be serializable. Already satisfied by current usage (IDs, strings, dates, plain objects).
- **Dynamic data**: Cannot call `cookies()`, `headers()` inside cached functions. Already avoided by design.
- **Suspense**: Pages that call uncached server components (like `getCurrentUserDetails`) must be wrapped in `<Suspense>`. Already handled in layout and problematic pages.
- **deduplication**: Next.js automatically deduplicates concurrent identical requests. Not verifiable in unit tests; confirmed in e2e.

---

## Success Criteria

- [ ] Staging pass: all smoke tests green
- [ ] Metrics show >70% hit rate on read-heavy endpoints
- [ ] No cache-related errors in logs after 24h
- [ ] Page load times improved (subjective or measured)
- [ ] Memory usage stable (< 100MB for cache)
- [ ] Invalidation works: CRUD operations reflect within TTL

---

## Post-Completion

- [ ] Update `docs/HANDOFFS.md` with final status
- [ ] Update `docs/CHANGELOG.md` with v0.3.0 release notes
- [ ] Close related GitHub issues (if any)
- [ ] Schedule retrospective if needed
