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

## How to Add New Decisions

1. Use format: `ADR-XXX: Title`
2. Include Date, Status (Proposed/Accepted/Deprecated), Scope
3. Document Context → Decision → Rationale → Consequences
4. Update this file via PR — never commit directly to main

---

> **Related:** See `ROADMAP.md` for upcoming features, `CONTEXT.md` for active sprint state.
