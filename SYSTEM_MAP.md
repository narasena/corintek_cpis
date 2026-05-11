# CPIS — System Architecture Map

> **Last Updated:** 2026-05-11
> **Purpose:** Orientation guide for agents working on the CPIS codebase

---

## 1. Project Summary

CPIS (Corintek Project Information System) is a field service management web application built with Next.js 16 (App Router) and React 19. It manages HVAC/chiller operations for facility management, tracking log sheets, work reports, lab analyses, attendance, and projects. The system supports role-based access for internal users (Admin, Supervisor, Technician, Reporting, Director) and read-only Client portal users. Data persisted via Prisma ORM to PostgreSQL with mobile-first responsive design.

---

## 2. Core Architecture Flow

### Standard User Flow (Log Sheet Creation)

```
UI Component (LogSheetForm)
  ↓ calls
Server Action (createLogSheetAction in features/log-sheets/actions.ts)
  ↓ validates (Zod) + calls
Service (createLogSheet in features/log-sheets/service.ts)
  ↓ uses
Prisma Client (src/lib/prisma.ts singleton)
  ↓ queries
PostgreSQL (via Prisma)
```

### External Webhook Flow

```
External Service (Stripe/cron)
  ↓ POST
API Route (app/api/.../route.ts)  ← EXTERNAL ONLY
  ↓ calls
Service Layer
  ↓
Prisma → DB
```

**Constraint:** Internal data fetching NEVER uses `fetch`/`axios`. Only Server Actions.

---

## 3. Clean Tree (Module Map)

```
cpis/
├── prisma/
│   ├── schema/                    # Modular Prisma schemas (14 files)
│   │   ├── schema.prisma          # Generator + datasource config
│   │   ├── users.prisma           # User + enums (UserRole, EmploymentStatus)
│   │   ├── clients.prisma         # Client model
│   │   ├── projects.prisma        # Project + ProjectAssignment + ProjectParameterOverride
│   │   ├── log-sheets.prisma      # LogSheet + LogSheetEntry + LogSheetPhoto + LogSheetMachine
│   │   ├── work-reports.prisma    # WorkReport + WorkReportPhoto
│   │   ├── attendance.prisma      # Attendance + AttendanceStatus
│   │   ├── parameters.prisma      # Parameter + ValueType + ParameterCategory
│   │   ├── parameter-limit-profiles.prisma  # ParameterLimitProfile + ParameterLimit
│   │   ├── machines.prisma        # Machine + MachineType/Ownership/Status enums
│   │   ├── chemicals.prisma       # Chemical + ChemicalUsage + ChemicalCategory
│   │   ├── lab-analyses.prisma    # LabAnalysis + LabAnalysisColumn + LabAnalysisEntry
│   │   ├── summary-reports.prisma # SummaryReport + SummaryReportStatus
│   │   └── notifications.prisma   # Notification + NotificationSeverity
│   ├── migrations/                # Prisma migration history
│   ├── seed.ts                    # DB seeding logic (60KB+)
│   └── prisma.config.ts           # Prisma client config
│
├── src/
│   ├── app/                       # Next.js App Router (Route Handlers + Pages)
│   │   ├── layout.tsx             # Root layout (Toaster mounted here)
│   │   ├── (main)/                # Protected route group
│   │   │   ├── dashboard/         # Charts, gallery, activity feed
│   │   │   ├── clients/           # Client CRUD
│   │   │   ├── projects/          # Project CRUD + details
│   │   │   ├── log-sheets/
│   │   │   │   ├── [projectId]/           # Project-scoped log sheet list
│   │   │   │   └── [projectId]/[logSheetId]/  # Detail/edit/submit/approve
│   │   │   ├── work-reports/      # Work report CRUD + approval
│   │   │   ├── attendance/        # Technician attendance (clock-in/out)
│   │   │   │   └── admin/         # Admin approval view
│   │   │   ├── parameters/        # Parameter master data
│   │   │   ├── chemicals/         # Chemical master data
│   │   │   ├── machines/          # Machine master data
│   │   │   ├── lab-analyses/      # Lab analysis entry
│   │   │   ├── summary-reports/   # Monthly summary + PDF uploads
│   │   │   ├── reports/           # Log sheet listing + filters
│   │   │   ├── my-projects/       # Client/technician project view
│   │   │   ├── my-profile/        # User profile + password change
│   │   │   ├── admin/             # Admin dashboard + user management
│   │   │   └── _components/       # Shared route components (sidebar, header)
│   │   ├── login/page.tsx        # Login + password reset
│   │   ├── api/                  # EXTERNAL WEBHOOKS ONLY (Stripe, cron, etc.)
│   │   └── test/                 # Dev/test routes (image compression, etc.)
│   │
│   ├── features/                  # Vertical slices (domain logic)
│   │   ├── auth/                 # actions.ts, service.ts, types.ts, lib/
│   │   ├── clients/              # actions.ts, service.ts, components/
│   │   ├── projects/             # actions.ts, service.ts, components/
│   │   ├── log-sheets/           # actions.ts, service.ts, components/, hooks/, context/
│   │   ├── work-reports/         # actions.ts, service.ts, components/
│   │   ├── attendance/           # actions.ts, service.ts, components/
│   │   ├── parameters/           # actions.ts, service.ts, components/
│   │   ├── chemicals/            # actions.ts, service.ts, components/
│   │   ├── machines/             # actions.ts, service.ts, components/
│   │   ├── lab-analyses/         # actions.ts, service.ts, components/
│   │   ├── summary-reports/      # actions.ts, service.ts, components/
│   │   ├── notifications/        # actions.ts, service.ts, components/
│   │   ├── users/                # actions.ts, service.ts, components/, hooks/, services/
│   │   ├── parameter-limit-profiles/  # actions.ts, service.ts, components/
│   │   ├── dashboard/            # DI container, charts, activity feed
│   │   ├── cache/                # DI container, caching logic (CG-05)
│   │   └── pagination/           # Generic pagination hook
│   │
│   ├── components/                # Shared UI primitives (shadcn-based)
│   │   ├── ui/                   # shadcn components (button, dialog, table, etc.)
│   │   ├── data-table.tsx        # Generic TanStack Table wrapper
│   │   ├── crud-dialog.tsx       # Generic create/edit dialog
│   │   ├── action-cell.tsx       # Edit/Delete dropdown
│   │   ├── signature/            # Digital signature pad
│   │   ├── camera-input.tsx      # Photo capture + compression
│   │   ├── app-sidebar.tsx       # Main navigation sidebar
│   │   ├── print-preview.tsx     # Print mode wrapper
│   │   └── markdown-editor.tsx   # Notes/description editor
│   │
│   ├── lib/                      # Shared utilities
│   │   ├── prisma.ts             # Prisma singleton
│   │   ├── auth-helpers.ts       # requireActor(), getActorOrNull(), toUserResponse()
│   │   ├── action-helpers.ts     # TActionResponse standard
│   │   ├── rbac.ts               # Permission checks (canAccessProject, isProjectPic, etc.)
│   │   ├── jwt.ts                # JWT encode/decode
│   │   ├── r2-upload.ts          # Cloudflare R2 signed URL upload
│   │   ├── logger.ts             # Structured logger ([CPIS-ERROR], [CPIS-AUTH], etc.)
│   │   ├── server-action-client.ts # Server action invocation helpers
│   │   └── validators/           # Zod schemas (if any outside features)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-image-compression.ts
│   │   ├── use-mobile.ts
│   │   └── ... (route-specific hooks in feature folders)
│   │
│   ├── @types/                   # Domain-specific TypeScript types
│   │   ├── user.type.ts          # IUser, UserRole, EmploymentStatus
│   │   ├── client.type.ts        # IClient
│   │   └── chemical.type.ts      # IChemical, IChemicalUsage
│   │
│   ├── types/                    # Shared/Global types
│   │   └── index.ts              # TActionResult, TActionResponse, etc.
│   │
│   ├── generated/                # Auto-generated (Prisma client, typegraphql, etc.)
│   │   └── prisma/               # Prisma Client (do not edit)
│   │
│   └── __tests__/                # E2E tests (Playwright)
│       ├── e2e/                  # Organized by domain
│       │   ├── auth/             # Login, role tests
│       │   ├── log-sheet/        # 10+ log sheet scenarios
│       │   ├── client-portal/    # Client view tests
│       │   └── infrastructure/   # Shared component tests
│       ├── video-scenarios/      # Recorded video test specs
│       └── setup.ts              # Test setup + fixtures
│
├── worker/                       # Cloudflare Worker (separate subproject)
│   ├── src/index.ts              # R2 upload handler
│   └── wrangler.jsonc            # Worker config
│
├── scripts/                      # Maintenance scripts
│   ├── assign-technician.ts
│   ├── backfill-client-users.ts
│   ├── check-project-assignments.ts
│   ├── load/k6.js                # Load testing script
│   └── record-videos.ts          # E2E video recording helper
│
├── public/                       # Static assets (images, favicon, etc.)
│
├── docs/                         # Project documentation
│   ├── STRUCTURE.md              # This file's predecessor (high-level overview)
│   ├── HANDOFFS.md               # Session handoff notes (short-term RAM)
│   ├── CONTEXT.md                # Active gotchas, decisions, current sprint
│   ├── CHANGELOG.md              # Feature completions
│   ├── BACKLOG.md                # Requirements shift backlog
│   ├── ROADMAP.md                # Project trajectory + status
│   ├── bugs.md                   # Bug tracking (BUG-XXX format, P0-P3)
│   ├── UI_AUDIT.md               # UI/UX audit findings (12 issues)
│   ├── WBS_SUMMARY.md            # Work breakdown summary
│   ├── ops/                      # Operational runbooks
│   │   ├── INCIDENT_RUNBOOK.md
│   │   ├── ROLLBACK_PLAYBOOK.md
│   │   ├── CHANGE_REQUEST_LOG.md
│   │   ├── ACCESS_CONTROL_REGISTER.md
│   │   ├── RELEASE_CHECKLIST.md
│   │   ├── KNOWN_ISSUES.md
│   │   └── POST_HANDOVER_SUPPORT.md
│   ├── caching/                  # Phase 4/5 caching docs
│   ├── refactoring/              # Refactoring plans + templates
│   │   ├── PROGRESS_TRACKER.md
│   │   ├── modules/              # Per-module plans (m-09, m-13, m-16, etc.)
│   │   └── templates/            # REFACTORING_PLAN.md, TEST_COVERAGE_ANALYSIS.md, etc.
│   └── fsd_cpis/                 # Functional spec docs
│       └── FSD_CPIS.md           # Full feature spec (662 lines)
│
├── .agent/                       # Kilo agent configuration
│   ├── agents/                   # Project-level agent definitions
│   ├── skills/                   # Custom agent skills
│   │   ├── cpis-feature-scaffold/
│   │   ├── cpis-heavy-refactor/
│   │   └── cpis-wbs-scan/
│   └── workflows/                # Workflow definitions
│       ├── cpis-refactor.md
│       ├── bdd-refactor.md
│       ├── git-tdd.md
│       └── wbs-scan.md
│
├── components.json                # shadcn/ui registry + component config
├── next.config.ts                 # Next.js config
├── tailwind.config.js             # Tailwind CSS config (v4)
├── tsconfig.json                  # TypeScript config
├── vitest.config.ts               # Unit test config
├── playwright.video.config.ts     # E2E test config
├── prisma.config.ts               # Prisma client config
│
├── package.json                   # Dependencies + scripts
├── AGENTS.md                      # Project agent rules (CPIS-specific)
├── README.md
└── SYSTEM_MAP.md                  # THIS FILE — architecture cartography
```

---

## 4. Data & State Activity

### State Management

- **Client-side state:** Zustand (lightweight, feature-scoped stores). Used sparingly. Server-first by default.
- **Server-side state:** React Server Components (RSC) + Server Actions. Most data fetched server-side, passed as props.
- **Cache layer:** Next.js cache tags (`cacheTag()`, `revalidateTag()`) implemented in `features/cache/`. Works but limited impact due to Client Component architecture (see `docs/caching/PHASE_5_CACHING_REPORT.md`).

### CRUD Operations

All CRUD follows **Actions → Service → Prisma** pattern:

| Domain          | Actions File                              | Service File                         |
|-----------------|-------------------------------------------|--------------------------------------|
| Auth            | `src/features/auth/actions.ts`            | `src/features/auth/service.ts`       |
| Users           | `src/features/users/actions/` (slice)     | `src/features/users/services/`       |
| Clients         | `src/features/clients/actions.ts`         | `src/features/clients/service.ts`    |
| Projects        | `src/features/projects/actions.ts`        | `src/features/projects/service.ts`   |
| Log Sheets      | `src/features/log-sheets/actions.ts`      | `src/features/log-sheets/service.ts` |
| Work Reports    | `src/features/work-reports/actions.ts`    | `src/features/work-reports/service.ts` |
| Attendance      | `src/features/attendance/actions.ts`      | `src/features/attendance/service.ts` |
| Parameters      | `src/features/parameters/actions.ts`      | `src/features/parameters/service.ts` |
| Chemicals       | `src/features/chemicals/actions.ts`       | `src/features/chemicals/service.ts`  |
| Machines        | `src/features/machines/actions.ts`        | `src/features/machines/service.ts`   |
| Lab Analyses    | `src/features/lab-analyses/actions.ts`    | `src/features/lab-analyses/service.ts` |
| Summary Reports | `src/features/summary-reports/actions.ts` | `src/features/summary-reports/service.ts` |
| Notifications   | `src/features/notifications/actions.ts`   | `src/features/notifications/service.ts` |
| Parameter Limit Profiles | `src/features/parameter-limit-profiles/actions.ts` | `src/features/parameter-limit-profiles/service.ts` |

**Important:** New logic → new files. Legacy files treated as read-only libraries.

---

## 5. External Integrations

| Service/API       | Purpose                          | Integration Point                      |
|-------------------|----------------------------------|----------------------------------------|
| Supabase           | Auth (email/password + JWT)      | `src/features/auth/lib/supabase.ts`    |
| Cloudflare R2     | File storage (photos, PDFs)      | `src/lib/r2-upload.ts` + `worker/`    |
| Stripe (planned)  | Payments (future)                | External webhooks in `app/api/stripe/`|
| SendGrid (planned)| Email notifications (future)     | External webhooks in `app/api/email/` |

### Worker Subproject

Cloudflare Worker (`worker/`) handles R2 pre-signed URL uploads independently. Deployed separately.

---

## 6. Key Entry Points

### Server Actions (Most frequently edited)

- `src/features/auth/actions.ts` → `loginAction`, `logoutAction`, `registerAction`
- `src/features/log-sheets/actions.ts` → `createLogSheetAction`, `updateLogSheetAction`, `submitLogSheetAction`, `approveLogSheetAction`
- `src/features/work-reports/actions.ts` → `createWorkReportAction`, `submitWorkReportAction`, `approveWorkReportAction`
- `src/features/attendance/actions.ts` → `clockInAction`, `clockOutAction`
- `src/features/projects/actions.ts` → `createProjectAction`, `updateProjectAction`
- `src/features/users/actions.ts` → `createUserAction`, `updateUserAction`

### Services (Business Logic)

- `src/features/log-sheets/service.ts` → `createLogSheet`, `submitLogSheet`, `validateLogSheetEntries`
- `src/features/work-reports/service.ts` → `createWorkReport`, `submitWorkReport`, `approveWorkReport`
- `src/features/attendance/service.ts` → `clockIn`, `clockOut`, `calculateTotalHours`
- `src/features/dashboard/service.ts` → `getDashboardStats`, `getRecentActivity`, `getProjectCharts`

### Core Utilities

- `src/lib/auth-helpers.ts` → `requireActor()`, `getActorOrNull()`, `toUserResponse()`
- `src/lib/rbac.ts` → `canAccessProject()`, `isProjectPic()`, `requireProjectAccess()`
- `src/lib/logger.ts` → Structured logger with `[CPIS-ERROR]`, `[CPIS-AUTH]`, `[CPIS-SYSTEM]` prefixes
- `src/lib/prisma.ts` → Prisma singleton (`prisma`)

### UI Components (Standard)

- `src/components/ui/data-table.tsx` → Generic `DataTable` used across all CRUD pages
- `src/components/ui/crud-dialog.tsx` → Generic `CrudDialog` for create/edit
- `src/components/ui/action-cell.tsx` → `ActionCell` with Edit/Delete dropdown
- `src/components/ui/signature/` → Digital signature pad components
- `src/components/ui/camera-input.tsx` → Photo capture with compression

### Route Pages (App Router)

- `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx` → Log sheet detail/edit (primary technician workflow)
- `src/app/(main)/work-reports/[projectId]/page.tsx` → Work report list + create
- `src/app/(main)/dashboard/page.tsx` → Dashboard with charts + activity + gallery
- `src/app/(main)/reports/page.tsx` → Log sheet listing with filters
- `src/app/(main)/attendance/page.tsx` → Technician daily attendance
- `src/app/(main)/admin/page.tsx` → Admin overview + user management

### Database Schema Source

- `prisma/schema/` — All 14 modular `.prisma` files. Single source of truth for data model.

---

## 7. Auth & RBAC Quick Reference

### Roles (UserRole enum)

| Role               | Internal/Client | Permissions                              |
|--------------------|-----------------|------------------------------------------|
| ADMIN              | Internal        | Full access, user management, overrides  |
| SUPERVISOR         | Internal        | Project oversight, approve log sheets    |
| TECHNICIAN         | Internal        | Create/edit own log sheets, attendance   |
| REPORTING          | Internal        | View all data, generate reports          |
| DIRECTOR           | Internal        | Read-only executive view                 |
| CLIENT             | Client          | Read-only project data (portal)          |
| CLIENT_TECHNICIAN  | Client          | Limited log sheet entry (client-side)    |
| CLIENT_SUPERVISOR  | Client          | Approve client-side submissions          |

### Key Auth Helpers

- `requireActor()` — Throws if no authenticated user (use in Server Actions)
- `getActorOrNull()` — Returns user or null (use in pages needing conditional rendering)
- `toUserResponse()` — Sanitized user DTO (never return raw User model)
- `userResponseSelect` — Prisma select object for safe user queries

### RBAC Checks

- `canAccessProject(user, projectId)` — Basic project access
- `isProjectPic(user, projectId)` — User is PROJECT_PIC for project
- `isTechnician(user)` — Role is TECHNICIAN
- `isClientRole(user)` — Any CLIENT* role
- `requireProjectAccess(projectId, allowedRoles)` — Throws if insufficient permissions

---

## 8. Important Conventions

### Naming

- **Actions:** `[verb][Noun]Action` (e.g., `createLogSheetAction`, `updateProjectAction`)
- **Services:** `[verb][Noun]` (e.g., `createLogSheet`, `updateProject`)
- **Interfaces:** `I*` prefix (e.g., `IUser`, `IProject`)
- **Types:** `T*` prefix (e.g., `TComponentProps`, `TActionResponse`)
- **Files:** kebab-case (`log-sheet-form.tsx`)
- **Functions:** camelCase (`handleSubmit`)
- **Components:** PascalCase (`LogSheetTable`)

### UI/UX

- **Mobile-first:** Technicians use low-budget Android phones. Test mobile viewport FIRST.
- **Toast feedback:** MANDATORY on all user actions. Use `sonner` — `<Toaster />` already in root layout.
- **Indonesian labels:** "Ubah" (Edit), "Hapus" (Delete), "Tambah" (Add)
- **PDF/Print:** Browser-native print only. Use `@media print` / Tailwind `print:` modifiers. Nav/buttons must be `print:hidden`. Log sheets MUST fit single A4 page.
- **CRUD pages:** MUST use `DataTable`, `CrudDialog`, `ActionCell` standard components.

### Error Handling & Logging

- **Logger:** Always use `logger` from `@/lib/logger` — NEVER `console.log`.
- **Prefixes:** `[CPIS-ERROR]`, `[CPIS-AUTH]`, `[CPIS-SYSTEM]`, `[CPIS-WARN]`.
- **Catch blocks:** Prefix error messages with `[CPIS-ERROR] <Feature>.<Action>:`.
- **Validation:** Zod schemas in each feature's `validators/` or colocated.

### Code Quality

- **No `any` types:** Use `unknown` if uncertain.
- **No new packages:** Requires explicit permission.
- **No architectural deviations:** Stick to Actions → Service pattern.
- **No custom CSS:** Tailwind 4 + shadcn only.
- **No refactoring legacy code:** Unless `/refactor` command given.

### Bug Tracking

Log all bugs to `docs/bugs.md` immediately:

```
## BUG-XXX — <Short Title>
**Priority:** P0-P3 (P0=blocker, P3=minor)
**Root Cause:** <concise explanation>
**Status:** Open
```

P0/P1 blockers for current task can be fixed immediately; update status to `Fixed`. Others stay `Open`.

---

## 9. Testing

### Unit Tests

- Vitest + Testing Library
- Colocated `*.test.ts` next to source files (where appropriate)
- Run: `npm run test`, `npm run test:watch`, `npm run test:coverage`

### E2E Tests

- Playwright (Chromium/Firefox/WebKit)
- Organized in `src/__tests__/e2e/` by domain
- Auth fixtures: `auth/admin.setup.ts`, `auth/technician.setup.ts`, `auth/client.setup.ts`
- Run: `npm run test:e2e`, `npm run test:e2e:headed`, `npm run test:e2e:ui`

### Video Scenarios

Recorded test videos in `src/__tests__/video-scenarios/` for regression validation.

---

## 10. Known Gotchas (Critical)

1. **Parameter limits:** `Parameter` model NO LONGER has `minValue`/`maxValue`. All limits live in `ParameterLimit` via `ParameterLimitProfile`. Old code referencing `parameter.minValue` WILL BREAK.
2. **Auth primitives:** Use `toUserResponse()` and `userResponseSelect` from `src/features/users/utils.ts` for ALL user data retrieval.
3. **Password handling:** Use `hashPassword()` and `comparePassword()` from `src/features/auth/service.ts` (re-exported via `lib/auth-helpers.ts`).
4. **Auth guards:** Use `requireActor()` and `getActorOrNull()` — never bare `getServerSession()`.
5. **Dashboard:** No real-time updates. Users must refresh to see new activity.
6. **Attendance export:** CSV only — Excel (.xlsx) NOT implemented despite FSD mention.
7. **Log sheet detail page:** ~437 lines — already refactored in LS-STAB. Do NOT touch without `/refactor` command.
8. **Caching:** Implemented but limited impact. Full benefits require Server Components migration.

See `docs/CONTEXT.md` for current active decisions and backlog.

---

## 11. References

- **Architecture & file structure:** See `docs/STRUCTURE.md`
- **Project trajectory & status:** See `docs/ROADMAP.md`
- **Detailed feature specs:** See `docs/fsd_cpis/FSD_CPIS.md` (load when implementing specific scope IDs)
- **UI/UX audit:** See `docs/UI_AUDIT.md` (12 issues: 3 P0, 4 P1, 5 P2)
- **Caching deep-dive:** See `docs/caching/PHASE_5_CACHING_REPORT.md`
- **Refactoring progress:** See `docs/refactoring/PROGRESS_TRACKER.md`
- **WBS (Work Breakdown Structure):** See `docs/wbs/WBS_SUMMARY.md` and `docs/wbs/WBS_DETAILED.md`
- **Bug backlog:** See `docs/bugs.md`
- **Handoff notes:** See `docs/HANDOFFS.md` (session continuity)

---

## 12. Quick Start Commands

```bash
npm run dev              # Dev with Turbopack (Prisma generate + Next dev)
npm run build            # Build (Prisma generate + Next build)
npm run prisma:migrate   # Apply migrations (use ALWAYS over db push)
npm run prisma:studio    # Open DB inspector
npm run prisma:seed      # Seed database
npm run lint             # Lint check (ESLint + Prettier)
npm run test             # Unit tests (Vitest)
npm run test:e2e         # E2E tests (Playwright)
```

---

**END OF SYSTEM_MAP.MD**
