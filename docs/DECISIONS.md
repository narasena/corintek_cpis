# Architectural Decisions — DECISIONS.md

> CPIS — Corintek Project Information System  
> **Purpose:** Permanent record of key architectural decisions and their rationale.  
> **Load Context:** When questioning "why does this exist?" or "why was it built this way?"

---

## ADR-001: Three-Tier Client Role System

**Date:** 2026-02-25  
**Status:** Accepted  
**Scope:** RBAC, User Management, Client Portal

### Context

Client users needed different access levels depending on their involvement in field operations. Some clients only need to view reports; others need to sign off work; some have their own technicians working alongside Corintek teams.

### Decision

Created three distinct client roles instead of a single "Client" role:

| Role                | Access Pattern     | Use Case                                           |
| ------------------- | ------------------ | -------------------------------------------------- |
| `CLIENT`            | Read-only          | Executives who only view reports                   |
| `CLIENT_SUPERVISOR` | Read + Sign        | Client-side managers who approve/sign as PIC Klien |
| `CLIENT_TECHNICIAN` | Read + Create/Edit | Client's own technicians who fill log sheets       |

### Rationale

- **Separation of concerns:** Signing authority (SUPERVISOR) vs field work (TECHNICIAN) vs view-only (CLIENT)
- **Security:** Prevents view-only users from accidentally modifying data
- **Flexibility:** CLIENT_TECHNICIAN can clock attendance and fill logs like internal TECHNICIAN

### Consequences

- CLIENT_SUPERVISOR requires `CLIENT_PIC` assignment on project to sign
- CLIENT_TECHNICIAN follows same assignment rules as internal TECHNICIAN
- Navigation filters must check all three roles separately

---

## ADR-002: Server Actions Only (No REST API Layer)

**Date:** 2026-02-23  
**Status:** Accepted  
**Scope:** Architecture, Data Fetching

### Context

Early development considered a REST API layer for internal app data fetching. This would require fetch/axios calls from components.

### Decision

Use Next.js Server Actions exclusively for all internal data operations. No REST API layer for app-internal communication.

```
UI Component → Server Action → Service → Prisma → PostgreSQL
```

### Rationale

- **Performance:** Eliminates HTTP overhead for internal calls
- **Type safety:** Full TypeScript across the entire data flow
- **Simpler mental model:** One pattern for all data mutations
- **Security:** Actions run server-side, secrets never exposed to client

### Consequences

- `api/` routes reserved for EXTERNAL webhooks only (Stripe, cron jobs)
- All data fetching must be Server Actions or Server Components
- Cannot use standard React Query/SWR patterns; use Server Components or form actions

---

## ADR-003: Parameter Limit Profile System

**Date:** 2026-02-26  
**Status:** Accepted  
**Scope:** Parameters, Projects, Data Model

### Context

Original design stored parameter limits (`minValue`, `maxValue`) directly on the `Parameter` model. FSD Section 7.1 required reusable limit "profiles" that could be assigned per-project with overrides.

### Decision

- Removed `minValue`, `maxValue`, `rawWaterMinValue`, `rawWaterMaxValue` from `Parameter` model
- Created `ParameterLimitProfile` table (was `ParameterLimitCategory`)
- Created `ParameterLimit` junction table linking profiles to parameters
- Projects reference a profile via `parameterLimitProfileId`

### Rationale

- **Reusability:** Same profile can be assigned to multiple projects
- **Flexibility:** Per-project overrides without duplicating parameter definitions
- **Data integrity:** Master parameters remain unchanged; limits are contextual

### Consequences

- Old code referencing `parameter.minValue` will break
- Migration creates "Standard" profile as default for existing projects
- Project form includes profile selection dropdown

---

## ADR-004: Browser-Native Print (No Backend PDF)

**Date:** 2026-01-15  
**Status:** Accepted  
**Scope:** Reports, PDF Generation, Printing

### Context

Requirements called for PDF generation of log sheets and summary reports. Evaluated `@react-pdf/renderer` and browser-native print.

### Decision

Use browser-native print with CSS `@media print` / Tailwind `print:` modifiers only. No backend PDF generation.

### Rationale

- **Performance:** No server-side rendering overhead
- **Maintainability:** Single source of truth (HTML/CSS)
- **Mobile compatibility:** Critical for field technicians on low-budget Android
- **Bundle size:** Avoids heavy PDF libraries

### Consequences

- Print styling must be meticulously crafted with `print:` modifiers
- Users must use browser print dialog (Ctrl+P / Cmd+P)
- Log sheets MUST fit on single A4 page (enforced via CSS)

---

## ADR-005: Mobile-First Design Priority

**Date:** 2026-01-10  
**Status:** Accepted  
**Scope:** UI/UX, Component Design

### Context

Technicians use low-budget Android phones in field conditions with potentially poor connectivity.

### Decision

Design all features mobile-first. Test mobile viewport FIRST, desktop second.

### Rationale

- **Primary user:** Technicians are the main data entry users
- **Device constraints:** Low RAM, small screens, touch-only input
- **Field conditions:** Bright sunlight, gloves, one-handed use

### Consequences

- Minimum touch target: 44x44px
- Bottom navigation for mobile (`mobile-nav.tsx`)
- All forms must be usable on 360px width screens
- Touch-friendly inputs (large checkboxes, steppers for numbers)

---

## ADR-006: Toast Protocol (Sonner Only)

**Date:** 2026-01-20  
**Status:** Accepted  
**Scope:** UI Feedback, Notifications

### Context

Inconsistent toast implementations across features (some custom, some Sonner).

### Decision

Standardize on `sonner` for ALL toast notifications. Mandatory on ALL user-facing actions (create/update/delete/login).

### Usage Pattern

```typescript
import { toast } from 'sonner';

toast.success('Data berhasil disimpan');
toast.error('Gagal menyimpan data', { description: error.message });
```

### Rationale

- **Consistency:** Single toast system across entire app
- **UX:** Sonner provides better stacking, auto-dismiss, and positioning
- **Maintainability:** No custom toast component to maintain

---

## ADR-007: Rescue Mode Development

**Date:** 2026-03-01  
**Status:** Active  
**Scope:** Development Process, Code Quality

### Context

Project is 2 months behind schedule. Need to prioritize delivery over perfection.

### Decision

Enter "Rescue Mode": Speed > Perfection, Functionality > Abstraction

### Rules

1. NO new npm packages without explicit permission
2. NO new architectural patterns (stick to Actions → Service)
3. NO custom CSS files (Tailwind 4 + shadcn only)
4. NO `any` types — use `unknown` if uncertain
5. NO `console.log` in production code
6. NO refactoring working legacy code unless `/refactor` command given

### Legacy Code Protocol

- Treat existing large files as **read-only** libraries
- ALL new logic in **new files** — never extend `utils.ts` messes
- If modifying legacy file: **MINIMAL** change only
- Use **Facade/Wrapper** pattern for new functionality over old

---

## ADR-008: Client-User Linking (CP-01)

**Date:** 2026-03-03  
**Status:** Accepted  
**Scope:** User Management, Client Portal, Data Integrity

### Context

CLIENT_SUPERVISOR users were "rogue" — no association with the Client entity. Project assignments showed ALL client supervisors, regardless of which client they belonged to. This created risk of assigning wrong client personnel to projects.

### Decision

Add `clientId` foreign key to `User` model. Link CLIENT\* role users (CLIENT, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN) to their respective Client entities.

### Implementation

1. **Schema:** Added nullable `clientId` to `User` model with relation to `Client`
2. **Validation:** Client dropdown appears in User form only when role is CLIENT\*
3. **Filtering:** Project assignments filter CLIENT_PIC options by `project.clientId == user.clientId`
4. **Navigation:** Added "Personel" button in Client list → links to `/users?clientId=xxx`
5. **Backfill:** Created script `scripts/backfill-client-users.ts` for manual migration

### Files Modified

```
prisma/schema/users.prisma
prisma/schema/clients.prisma
src/@types/user.type.ts
src/features/users/service.ts
src/features/users/components/user-form.tsx
src/features/projects/components/project-form.tsx
src/features/projects/components/project-assignments-section.tsx
src/app/(main)/clients/components/client-columns.tsx
src/app/(main)/users/page.tsx
scripts/backfill-client-users.ts (new)
```

### Rationale

- **Data integrity:** Prevents wrong client personnel assignment
- **UX clarity:** Users see only relevant client supervisors
- **Scalability:** Foundation for "Client Admin" self-service features
- **Rescue Mode:** Minimal change, maximum impact

### Consequences

- Existing CLIENT\* users need manual backfill (script provided)
- User form now conditionally shows Client dropdown
- Project assignments show warning when no eligible personnel exist

---

## ADR-009: Next.js 16 Cache Components for Service Layer (CG-05)

**Date:** 2026-03-07  
**Status:** Accepted (Implementation Phase)  
**Scope:** Performance Optimization, Service Layer, Caching

### Context

Current application hits database on every page load. With ~40 internal users, this is acceptable but not scalable for the upcoming client portal. No existing caching layer exists; only `revalidatePath()` is used for page refresh after mutations.

### Decision

Implement Next.js 16 Cache Components with tag-based invalidation:

1. **Enable `cacheComponents`** in `next.config.ts`
2. **Define cache tags** (`ECacheTag` enum) for all major domains
3. **Define TTL profiles** (`ECacheLifeProfile` enum) with graduated lifetimes
4. **Apply `'use cache'` directive** to read-heavy service methods
5. **Use `revalidateTag()`** in mutation actions instead of `revalidatePath()` alone
6. **Create class-based service wrappers** (`CachedXxxService`) to maintain separation and allow gradual rollout

### Rationale

- **Framework-native**: Uses built-in Next.js 16 cache system (zero new dependencies)
- **Server-side**: Compatible with "Server Actions Only" architecture
- **Tag-based invalidation**: More granular than path-based; can invalidate cross-cutting concerns (e.g., dashboard data from multiple sources)
- **Self-hosted friendly**: In-memory cache persists across requests; acceptable for 40 users
- **Low risk**: Opt-in per function; easy rollback via `cacheComponents: false` config flag
- **Performance**: Reduces database load for frequently accessed read-only data (parameters, clients, projects, dashboard metrics)
- **Stale-while-revalidate**: `revalidateTag(..., 'max')` ensures fresh data after mutations without blocking UI

### Architecture

```
Cache Tag Strategy:
┌─────────────────┬─────────────────────────────┬─────────────┬────────────────────────────┐
│ Domain          │ Tag Prefix                  │ TTL Profile │ Invalidation Triggers      │
├─────────────────┼─────────────────────────────┼─────────────┼────────────────────────────┤
│ Dashboard       │ dashboard-*                 │ DEFAULT     │ Log sheet status updates   │
│ Parameters      │ parameters, parameters-*    │ HOURS       │ CRUD on parameters/limits  │
│ Clients         │ clients                     │ HOURS       │ CRUD on clients            │
│ Projects        │ projects, projects-dashboard│ DEFAULT     │ CRUD, assignments          │
│ Users           │ users, users-technicians    │ HOURS       │ CRUD, profile updates      │
│ Work Reports    │ work-reports                │ DEFAULT     │ Create/update/approve/delete│
│ Log Sheets      │ dashboard-activities,       │ DEFAULT     │ Create/update/approve/delete│
│                 │ dashboard-photos            │ SHORT       │                            │
│ Attendance      │ attendance                  │ HOURS       │ Clock in/out actions       │
└─────────────────┴─────────────────────────────┴─────────────┴────────────────────────────┘
```

TTL Profiles (in `next.config.ts`):

- `default`: stale 15min, revalidate 15min
- `short`: stale 1min, revalidate 5min
- `hours`: stale 30min, revalidate 1h
- `days`: stale 1h, revalidate 24h
- `max`: stale infinite, revalidate infinite (for tag invalidation)

### Implementation Strategy

1. **Phase 1 - Infrastructure**: Create `src/features/cache/` with `tags.ts`, `config.ts`, `errors.ts` (optional)
2. **Phase 2 - Configuration**: Update `next.config.ts` with `cacheComponents: true` and `cacheLife` profiles
3. **Phase 3 - Cached Service Wrappers**: Create class-based stubs (`CachedDashboardService`, `CachedParameterService`, etc.) with:
   - `'use cache'` directive at file level
   - `cacheTag()` and `cacheLife()` calls in each cached read method
   - Constructor dependency injection (prisma, RBAC helpers, etc.)
   - CRUD methods WITHOUT caching (read-write separation)
4. **Phase 4 - Action Invalidation**: Modify all mutation actions to call `revalidateTag()` after successful DB operations
5. **Phase 5 - Testing**: Verify cache hits/misses via `NEXT_PRIVATE_DEBUG_CACHE=1`, confirm invalidation works

### Stub Pattern

```typescript
'use cache';

import { cacheTag, cacheLife } from 'next/cache';
import { ECacheTag, ECacheLifeProfile } from '../cache/tags';
import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';

export class CachedParameterService {
  constructor(
    private prisma: PrismaClient
    // TODO: inject other dependencies (RBAC, validators)
  ) {}

  /**
   * Get all active parameters
   * @caching tags=[PARAMETERS], life=HOURS
   * @throws NotImplementedError - stub not implemented
   */
  async getAllParameters(actor: IJwtPayload): Promise<IParameter[]> {
    cacheTag(ECacheTag.PARAMETERS);
    cacheLife(ECacheLifeProfile.HOURS);
    throw new Error(
      '[CPIS-STUB] CachedParameterService.getAllParameters: Not implemented'
    );
  }

  // CRUD methods (no caching) - similar stubs...
}
```

### Rollback Plan

- **Immediate**: Set `cacheComponents: false` in `next.config.ts` → all `'use cache'` directives become no-ops
- **Selective**: Remove `'use cache'` and `cacheTag()` from specific service files
- **Fallback**: Keep commented `revalidatePath()` in mutation actions until cache proven stable

### Consequences

- **Code volume**: ~5 new service files + modifications to ~7 action files
- **Testing overhead**: Must verify cache invalidation across all mutation paths
- **Serverless limitation**: Cache does not persist across serverless instances; acceptable for self-hosted deployment
- **Serialization requirement**: All function arguments must be serializable (Dates OK, Maps/Sets NO)
- **Dynamic data rule**: Cannot call `cookies()`, `headers()` inside cached functions; must pass as arguments

### Implementation Notes (2026-03-08)

**Deviations from original plan:**

1. **Helper Function Pattern**: Next.js 16 does NOT allow `'use cache'` in class instance methods. Implementation uses helper functions outside the class, with class methods delegating to them. This maintains the class interface while satisfying compiler restrictions.

2. **Suspense Boundaries Required**: Layout and pages calling uncached server components (e.g., `getCurrentUserDetails()`) must be wrapped in `<Suspense>`. Added Suspense to `app/(main)/layout.tsx` and `my-projects/[projectId]/page.tsx`.

3. **Dynamic Export Incompatible**: `export const dynamic = 'force-dynamic'` conflicts with `cacheComponents`. Resolved by using cached services and Suspense instead.

**Build Outcome:**

- All 32 pages build successfully with `npm run build`
- TypeScript checks pass
- No pre-render blocking errors

**Missing Methods Added:**

- `CachedProjectService`: Added `deleteProject`, `getProjectAssignments`, `upsertProjectParameterOverride` (were omitted from initial stub)

**Type Annotations:**

- Cached service methods now explicitly return concrete types (e.g., `TClientResponse[]`) instead of `unknown` to satisfy action type requirements.

---

## ADR-010: Caching Implementation - Architecture Trade-offs

**Date:** 2026-03-08  
**Status:** Accepted  
**Scope:** Performance, Caching, Architecture

### Context

Implemented Next.js cache tags at server action level (`revalidateTag()`). Testing revealed cache IS functional (hit/miss events logged), but impact is limited due to existing architecture.

### Decision

Accept current caching implementation as-is for Phase 5. Cache infrastructure works correctly; full performance benefits require future architecture changes.

### Rationale

1. **All data-fetching pages use Client Components** (`'use client'`) with `useEffect` to fetch data
2. **Each page navigation triggers fresh request** - server-side cache doesn't persist across navigations
3. **Cache DOES help** with rapid repeated requests within same session
4. **For internal tool (<40 users)**, current approach is acceptable

### Consequences

- ✅ Cache infrastructure in place and functional
- ⚠️ Limited performance impact until migrated to Server Components
- 📋 Future: Migrate to Server Components for full caching benefits
- 📋 Future: Add Redis for shared cache across server instances

### Related

- `docs/CACHING.md` - Implementation details
- `docs/PHASE_5_CACHING_REPORT.md` - Testing results

---

## How to Add New Decisions

1. Use format: `ADR-XXX: Title`
2. Include Date, Status (Proposed/Accepted/Deprecated), Scope
3. Document Context → Decision → Rationale → Consequences
4. Update this file via PR — never commit directly to main

---

> **Related:** See `ROADMAP.md` for upcoming features, `CONTEXT.md` for active sprint state.

1. Use format: `ADR-XXX: Title`
2. Include Date, Status (Proposed/Accepted/Deprecated), Scope
3. Document Context → Decision → Rationale → Consequences
4. Update this file via PR — never commit directly to main

---

> **Related:** See `ROADMAP.md` for upcoming features, `CONTEXT.md` for active sprint state.
