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

## ADR-009: Standardized User Data Transformation Pattern

**Date:** 2026-03-04  
**Status:** Accepted  
**Scope:** Security, Type Safety, Data Leakage Prevention

### Context

User data transformation was inconsistent across features. Some services used manual destructuring to remove sensitive fields (like `password`), while others used Prisma `select` blocks. This was prone to "Type Dishonesty" where objects were cast to `TUserResponse` even if they lacked required relations like `client`.

### Decision

Standardize user data transformation using a centralized Prisma `select` constant and a schema-validated mapper function.

### Implementation

- Created `src/features/users/utils.ts` containing:
  - `userResponseSelect`: A Prisma `select` object covering all fields in `TUserResponse`.
  - `toUserResponse()`: A function that uses `userResponseSchema.parse()` to strip unknown fields and validate integrity.
- Refactored `src/features/auth/service.ts` and `src/features/users/service.ts` to use these utilities.

### Rationale

- **Security by Default:** Zod's `parse()` automatically strips sensitive fields not defined in the response schema.
- **Type Integrity:** Ensures database objects actually contain all relations (like `client`) required by the UI before they reach the component layer.
- **Maintainability:** Adding a new sensitive field only requires updating the response schema and the centralized `select` object.
- **DRY:** Eliminates repeated `select` blocks across multiple service files.

### Consequences

- All services returning `TUserResponse` MUST use `toUserResponse()` and include `userResponseSelect` (or a superset of it) in their Prisma queries.
- Prisma queries now explicitly include the `client` relation by default for user responses.

---

## ADR-010: Secure Authentication Pattern (Timing & Enumeration)

**Date:** 2026-03-04  
**Status:** Accepted  
**Scope:** Security, Authentication, Privacy

### Context

The previous `authenticateUser` implementation leaked account information and was vulnerable to timing attacks. It returned specific error messages like "Akun diblokir" (account blocked) or "Akun tidak aktif" (account inactive) before password verification, allowing attackers to confirm email existence. Furthermore, it exited early if a user was not found, bypassing the expensive `bcrypt.compare` operation and creating measurable timing differences.

### Decision

Implement a constant-time and generic-failure authentication pattern to protect against timing attacks and account enumeration.

### Implementation

- **Unify Errors:** Use a single generic error message (`'Email atau kata sandi tidak valid'`) for all authentication failures, regardless of whether the email exists, the account is blocked, or the password is incorrect.
- **Timing Attack Prevention:** Use `FAKE_PASSWORD_HASH` when an email is not found in the database. This ensures `bcrypt.compare()` is always executed, maintaining consistent response times (approx. 100ms+ depending on salt rounds).
- **Status Checks Delay:** Verify account status (`isActive`, `isBlocked`) ONLY after a successful password comparison. Even if these checks fail, return the same generic error message.

### Rationale

- **Privacy:** Attackers cannot confirm whether an email belongs to a registered user.
- **Security:** Timing-based side-channel attacks are mitigated by normalizing computational work.
- **Consistency:** Provides a uniform behavior for all authentication attempts.

### Consequences

- Developers must use `ERROR_MESSAGES.AUTHENTICATION_FAILED` for authentication-related errors.
- Internal logging (if implemented) should still capture the specific failure reason for debugging while shielding the end-user.

---

## ADR-011: Auth Domain Consolidation

**Date:** 2026-03-04  
**Status:** Accepted  
**Scope:** Architecture, Domain Boundaries, Dependency Management

### Context

There was a circular dependency between `src/features/auth/service.ts` and `src/lib/auth-helpers.ts`. The service depended on the helpers for password primitives (`comparePassword`), while the helpers depended on the service for user retrieval (`getUserById`). This fragmented the authentication domain and made the codebase brittle.

### Decision

Consolidate all core authentication primitives and logic within the `auth` feature domain and break the circular dependency.

### Implementation

- **Primitives Move:** Relocated `hashPassword` and `comparePassword` from `src/lib/auth-helpers.ts` to `src/features/auth/service.ts`.
- **Dependency Inversion:** `src/lib/auth-helpers.ts` now re-exports these primitives from the `auth` service. The generic helper now depends on the domain service, but the service no longer depends on the helper for its core logic.
- **Strict Boundaries:** Other features (like `users`) now import `hashPassword` directly from the `auth` service instead of generic library utilities.

### Rationale

- **Cohesion:** Authentication logic is now contained within its own feature slice.
- **Decoupling:** Breaking circular dependencies improves build stability and simplifies testing.
- **Domain Integrity:** Core domain operations (like hashing passwords) are owned by the domain service responsible for that entity.

### Consequences

- All password-related operations MUST go through the `auth` service.
- `src/lib/auth-helpers.ts` remains as a convenience layer for session-related utilities but no longer owns auth implementation logic.

---

## ADR-012: Standardized Internal Logging for Authentication

**Date:** 2026-03-04  
**Status:** Accepted  
**Scope:** Security, Observability, Maintenance

### Context

Generic error messages returned to the client (for security) made production debugging difficult. Developers could not distinguish between a wrong password, non-existent user, or blocked account. Standardizing internal logs without exposing sensitive data was needed for auditing and troubleshooting.

### Decision

Implement internal logging using the project-wide `[CPIS-ERROR]` prefix for all authentication failures.

### Implementation

- **Standard Prefix:** Use `[CPIS-ERROR] <Feature>.<Action>:` (e.g., `[CPIS-ERROR] Auth.authenticateUser:`).
- **Granular Internal Logs:** Log the specific failure reason (e.g., "Password mismatch", "User blocked") internally to `console.error` before throwing the generic security-safe error to the client.
- **Sensitive Data Protection:** Never log plain-text passwords or full authentication payloads.

### Rationale

- **Observability:** Enables developers to diagnose auth failures via server logs without compromising security.
- **Auditability:** Provides a traceable record of failed login attempts for security monitoring.
- **Maintenance:** Centralizes error reporting patterns across the authentication domain.

### Consequences

- All authentication failure paths must include an internal log entry.
- External error messages remain generic as per ADR-010.

---

## ADR-013: Secure Verification Abstraction

**Date:** 2026-03-04  
**Status:** Accepted  
**Scope:** Security, Architecture, Maintenance

### Context

The timing-attack prevention logic (using `FAKE_PASSWORD_HASH`) was previously implemented directly within the `authenticateUser` service. This mixed security mechanics with business flow logic, making the service declarative-less and harder to maintain if the security policy changed.

### Decision

Encapsulate timing-attack and user-existence verification logic within a specialized `secureCompare` utility.

### Implementation

- **Location:** `src/features/auth/crypto.ts`
- **Mechanism:** `secureCompare(provided, hashed?)` handles the hash selection (real vs. fake) and ensures that the overall comparison returns `false` if the user hash was missing, even if the timing is normalized.
- **Service usage:** `authenticateUser` now calls `secureCompare` directly, remaining focused on identity resolution and lifecycle status checks.

### Rationale

- **Separation of Concerns:** Business services focus on the "What" (identity, status); cryptographic utilities focus on the "How" (secure comparison).
- **Security Posture:** Centralizing security mechanisms reduces the risk of incorrect implementation in new authentication flows.
- **Maintainability:** Changes to hashing strategies or timing normalization only require updates in the `crypto` utility.

### Consequences

- Developers must use `secureCompare` for any password verification flow to ensure timing-attack safety.

---

## ADR-014: Structured Logging Standardization

**Date:** 2026-03-08  
**Status:** Accepted  
**Scope:** Observability, Maintenance, Security

### Context

The system previously used procedural logging via manual `console.error` and `console.info` calls with template literals. While following a `[CPIS-TYPE]` prefix convention, this was prone to human error, inconsistent formatting, and made log aggregation difficult. As the system scales, a more robust and machine-readable logging strategy is required.

### Decision

Implement a project-wide structured logger in `src/lib/logger.ts` that encapsulates the `[CPIS-TYPE]` convention and supports structured metadata.

### Implementation

- **Location:** `src/lib/logger.ts`
- **Standardized Prefixes:**
  - `[CPIS-ERROR]`: For catch blocks and error states.
  - `[CPIS-AUTH]`: For security and authentication events (login, logout, session verification).
  - `[CPIS-SYSTEM]`: For general system information.
  - `[CPIS-WARN]`: For non-critical warnings.
- **Usage Pattern:**

  ```typescript
  import { logger } from '@/lib/logger';

  logger.error('Feature', 'Method', 'Message', { metadata: 'value' });
  ```

### Rationale

- **Consistency:** Automates the prefixing convention mandated in project rules.
- **Observability:** Structured metadata allows for easier searching and filtering in log management systems.
- **Maintainability:** Logging logic is centralized; changes to format or destination (e.g., external monitoring service) only require one update.
- **Separation of Concerns:** Developers focus on "what" to log, while the logger handles "how" it's formatted.

### Consequences

- All manual `console` calls with `[CPIS-*]` prefixes must be migrated to the new `logger`.
- Future feature implementation MUST use the structured logger for all internal observability.
- Ensures a clean, uniform output across the entire system's server logs.

---

## ADR-015: UI/UX Aesthetic Overhaul (v0.4.0)

**Date:** 2026-03-09  
**Status:** Accepted  
**Scope:** UI/UX, Component Refinement

### Context

The initial shadcn implementation was functional but felt "boring" and "empty" (per user feedback). It lacked clear visual hierarchy and didn't provide enough value in the dashboard for high-level users (Admin/Director).

### Decision

1.  **Sidebar:** Added visual separation (right border + muted background) and pill-shaped active navigation items.
2.  **Header:** Implemented sticky blur header (`backdrop-blur-md`) with increased padding and a more professional horizontal title layout.
3.  **Dashboard:** Replaced empty video-aspect blocks with KPI cards and a structured welcome banner. Scoped dashboard empty states now use premium cards instead of dashed outlines.
4.  **Data Table:** Merged search and filters into a unified blurred toolbar container. Pagination now includes a "Showing X-Y of Z" indicator for better context.

### Rationale

- **Structural Soul:** Achieves a premium look through spacing, typography, and subtle borders.
- **Value-First:** Replaces placeholders with real metrics/KPIs.
- **Consistency:** Standardizes patterns across components.

### Consequences

- CSS complexity slightly increased.
- `DashboardScoped` remains a Client Component.

---

## ADR-012: Real-time Dashboard Stats & Premium Header Refinement (v0.4.1)

**Date:** 2026-03-09  
**Status:** Accepted  
**Scope:** UI/UX, Data Integration, Dashboard

### Context

Feedback on v0.4.0 indicated the dashboard felt static and the header lacked depth and alignment.

### Decision

1.  **Dashboard Stats Integration:** Connected KPI cards to live database counts via `getAdminDashboardStats` server action.
2.  **Premium Header:** Upgraded to blue gradient theme (`bg-gradient-to-r from-primary via-primary to-primary/95`) with 80px height.
3.  **Typography & Proportions:** Established "Hero Title vs Small Date" hierarchy, removing redundant subtitles.
4.  **Layout Spacing:** Aligned header padding (`px-4 md:px-6 lg:px-8`) with content margins.
5.  **Sidebar Greeting:** Repositioned user greeting to top for immediate context.

### Rationale

- **Utility:** Real metrics provide immediate value.
- **Aesthetics:** Gradient and tightened proportions establish professional branding.
- **Hierarchy:** Alignment and simplified text improve scannability.

### Consequences

- `NotificationBell` now supports external `className`.
- `HeaderTitle` simplified (logic centered on proportions).

---

## ADR-013: Form UX Standards & Sticky Action Protocol (v0.5.0)

**Date:** 2026-03-09  
**Status:** Accepted  
**Scope:** UI/UX, Forms, Dialogs

### Context

Complex data entry forms (Users, Projects, Parameters) were causing "scroll fatigue" and making the primary "Save" action difficult to find. Forms lacked a consistent internal hierarchy, and raw HTML inputs felt sub-premium.

### Decision

1.  **Sticky Action Footer:** Established `CrudDialog` as the source of truth for all form containers, implementing a sticky bottom action bar (`-mx-6 -mb-6 mt-8 p-4 border-t bg-background/95 backdrop-blur-sm`).
2.  **Card-Based Sectioning:** Large forms MUST be broken into focused `Card` components (e.g., "Personal Data", "Account Access") to reduce visual noise.
3.  **Vertical Navigation for Dense Data:** High-density forms (Parameter Profiles) use `Tabs` with `orientation="vertical"` to keep fields accessible without endless scrolling.
4.  **Premium primitives over raw inputs:** Switched strictly to `shadcn/ui` based Switch, DatePicker, and Combobox (Searchable Select).

### Rationale

- **Accessibility:** Users should never have to search for the "Simpan" button.
- **Cognitive Load:** Breaking data into chunks prevents users from feeling overwhelmed.
- **Visual Rhythm:** Grid-based layouts (`md:grid-cols-2`) provide a professional appearance.

### Consequences

- All new forms must follow the Sticky Footer pattern for consistency.
- Forms with >2 sections require the "Section Card" pattern.

---

## ADR-014: Floating Mobile Dialog Strategy (v0.6.1)

**Date:** 2026-03-09  
**Status:** Accepted  
**Scope:** UI/UX, Dialogs, Mobile Responsiveness

### Context

Standard full-screen mobile dialogs can feel jarring and break the mental model of a single-page application. The user requested a more "modern" approach that feels layered.

### Decision

Implement a **Floating Full Screen** dialog design for mobile viewports (widths < 640px).

1.  **Margins:** Instead of `w-full h-full`, use `w-[calc(100%-1rem)]` and `max-h-[calc(100dvh-1rem)]`.
2.  **Visuals:** Maintain standard rounded corners and borders even on mobile.
3.  **Positioning:** Centered vertically and horizontally using fixed inset calculations.

### Rationale

- **Modern Aesthetic:** The "floating" look conveys hierarchy and depth, similar to high-end mobile OS interfaces (e.g., iOS sheets).
- **Usability:** Keeps the context of the underlying page visible in the margins.
- **Consistency:** Scales naturally from mobile to desktop centered modals.

### Consequences

- Slightly less horizontal space on very narrow devices (320px).
- Requires careful handling of `max-h` to ensure the "Floating" gap remains visible even with tall forms.
- Close buttons must be high-contrast to stay visible against themed headers.

---

## ADR-015: Automated Video Generation Suite

**Date:** 2026-03-09  
**Status:** Accepted  
**Scope:** QA, Documentation, Marketing

### Context

Handover and client training required high-quality video demonstrations. Manual recording was inconsistent, slow, and hard to update as the UI evolved.

### Decision

Implement an automated video generation suite using Playwright.

1. **Configuration:** Dedicated `playwright.video.config.ts` with 1920x1080 resolution.
2. **Scenarios:** Scripted paths for Admin, Technician, and Client roles.
3. **Post-Processing:** Custom Node script (`scripts/record-videos.ts`) to extract and rename `.webm` files into a root `/videos/` folder.
4. **Resolution Isolation:** Split video sizes per project (1080p for Desktop, Portrait for Mobile) to avoid letterboxing.

### Rationale

- **Consistency:** Every video uses the same timing, data, and resolution.
- **Maintainability:** Scripts can be re-run instantly if the UI changes.
- **Readability:** Forced high-res ensuring text is legible in professional presentations.

### Consequences

- Automated suite takes ~10-15 minutes to generate all 20 videos.
- Test scenarios use `isVisible` guards to handle slight data variations during long runs.
- Root `/videos/` folder remains git-ignored but can be generated on-demand.

---

## How to Add New Decisions

1. Use format: `ADR-XXX: Title`
2. Include Date, Status (Proposed/Accepted/Deprecated), Scope
3. Document Context → Decision → Rationale → Consequences
4. Update this file via PR — never commit directly to main

---

## ADR-016: Multi-Time Range Analytics Support

**Date:** 2026-03-10
**Status:** Accepted
**Scope:** Dashboard, Analytics, UX

### Context

The dashboard analytics (Approach and Ampere charts) were previously limited to a fixed 30-day window. This didn't allow users to see short-term trends (7 days) or longer-term historical data (90 days). Additionally, some older data (e.g., February 12th) was "hidden" because it fell outside the 30-day window.

### Decision

Implement dynamic time range selection (7d, 30d, 90d) using URL search parameters and a reusable `TimeRangeSelector` component.

### Implementation

1.  **URL State**: Used Next.js `useSearchParams` and `useRouter` to manage `timeRange` in the URL.
2.  **Server Actions**: Updated `getDashboardMetricsAction` to calculate the start date based on the selected range.
3.  **UI Components**: Created `TimeRangeSelector` using Radix UI Tabs for a premium feel.
4.  **Data Wiring**: Updated `AnalyticsDashboard` to pass the selected range to all sub-charts and aggregate data accordingly.

### Rationale

- **Flexibility**: Users can now toggle between different views without page reloads (using Next.js transitions).
- **Data Visibility**: The 90-day range ensures that older but relevant data is accessible.
- **Consistency**: Standardizes the "7/30/90" pattern across all dashboard analytics.

### Consequences

- Increased query range for 90-day view (mitigated by existing database indices on `date`).
- Requires coordination between client-side URL state and server-side data fetching.

---

## ADR-017: Backlog Purge & History Protocol

**Date:** 2026-03-10  
**Status:** Accepted  
**Scope:** Documentation, Maintenance, Context Management

### Context

As the project reached "Feature Complete" status, `BACKLOG.md` had grown to over 300 lines, with ~70% of entries being completed tasks (`[x]`). This caused significant "token bloat" for AI agents and obscured the remaining critical stabilization tasks.

### Decision

Implement a strict "Purge & History" protocol for `BACKLOG.md`:

1.  **Purge Frequency:** Completed tasks must be removed from `BACKLOG.md` immediately after being committed.
2.  **Historical Record:** `CHANGELOG.md` serves as the permanent source of truth for completed work. No task is deleted from the project history, only moved from the "active" view.
3.  **Active Bug Tracking:** A dedicated `## ACTIVE BUGS` section is maintained at the top of the backlog for immediate stabilization items.

### Rationale

- **Token Efficiency:** Smaller active documentation files improve AI agent focus and reduce context window waste.
- **Cognitive Clarity:** Developers and agents see only what remains to be done.
- **Auditability:** `CHANGELOG.md` maintains the legacy without cluttering day-to-day operations.

### Consequences

- Developers must manually verify that completed tasks are summarized in `CHANGELOG.md` before purging them from `BACKLOG.md`.
- `BACKLOG.md` will naturally shrink and grow based on current sprint activity instead of accumulating indefinite history.

---

> **Related:** See `ROADMAP.md` for upcoming features, `CONTEXT.md` for active sprint state.

---

## ADR-016: Bug Tracking Protocol & Centralized Bug Registry

**Date:** 2026-03-10  
**Status:** Accepted  
**Scope:** Maintenance, Project Management, documentation

### Context

The stabilization phase revealed 48 unique bugs across multiple modules. Manual tracking in a table within `BACKLOG.md` became unreadable and discouraged proactive logging by agents during implementation tasks.

### Decision

1.  **Centralized Registry:** Move all bugs to a dedicated `docs/bugs.md` file.
2.  **Sequential IDs:** Use `BUG-XXX` IDs to allow clear referencing in commits.
3.  **Agent Protocol:** Updated `AGENTS.md` to mandate that agents MUST log any discovered bug to `docs/bugs.md` immediately.
4.  **No Silent Fixes:** Out-of-scope bugs found during a task must be logged first. Only P0/P1 blockers for the current task may be fixed immediately.

### Rationale

- **Clarity:** Separate "Features" (Backlog) from "Faults" (Bugs).
- **Automation:** Simplifies agent discovery and reporting of technical debt.
- **Auditability:** Sequential IDs allow tracking a bug from discovery to resolution in history.

### Consequences

- `BACKLOG.md` is now significantly smaller and more focused on scope.
- `AGENTS.md` governs bug documentation behavior.
- Manual UAT preparation is faster by simply reviewing `docs/bugs.md`.
