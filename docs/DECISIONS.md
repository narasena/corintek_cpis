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

## How to Add New Decisions

1. Use format: `ADR-XXX: Title`
2. Include Date, Status (Proposed/Accepted/Deprecated), Scope
3. Document Context → Decision → Rationale → Consequences
4. Update this file via PR — never commit directly to main

---

> **Related:** See `ROADMAP.md` for upcoming features, `CONTEXT.md` for active sprint state.
