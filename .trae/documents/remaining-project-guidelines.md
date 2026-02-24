# CPIS Remaining Implementation Guide

> Project: Corintek Project Information System (CPIS)  
> Scope: Remaining roadmap/FSD features **and** log-sheet stabilization  
> Stack: Next.js 15 (App Router), React, Prisma 7, PostgreSQL, R2, Server Actions

This guide defines the concrete, end‑to‑end steps required to complete the remaining implementation work for CPIS. It is designed as an executable playbook for developers, QA, and operations.

- Section 1–2: Context and architecture
- Section 3: Remaining feature inventory (from ROADMAP + FSD)
- Section 4: Global implementation principles and patterns
- Section 5: Feature‑by‑feature technical specs and procedures
- Section 6: Log‑sheet module stabilization (god modules/components)
- Section 7: Testing strategy and success metrics
- Section 8: Deployment and migration guidelines
- Section 9: Troubleshooting
- Section 10: Deliverables and acceptance criteria

All examples use existing project patterns (Server Actions → Service Layer → Prisma).

---

## 1. Context And Goals

### 1.1 Current Status (High Level)

Per `ROADMAP.md` and `FSD_CPIS.md`:

- MVP domains are implemented:
  - Auth, Clients, Users, Projects, Machines, Parameters, Chemicals
  - Log Sheets, Work Reports, Lab Analyses, Attendance
  - Basic Dashboard, Summary Reports (structure + PDF uploads)
  - RBAC + project scoping
- Remaining work is primarily:
  - Phase‑2 analytics/UX (dashboard charts, gallery, executive summary)
  - Notifications (limit alerts, approvals)
  - My Profile and client‑facing read‑only experience
  - Digital signature expansion for Summary Reports
  - Data completeness enhancements (project/client/user fields)
  - Targeted stabilization of the Log‑sheets module, which contains god modules/components.

### 1.2 Guide Objectives

1. Provide **actionable, low‑ambiguity instructions** for each remaining feature.
2. Ensure **all new work** follows the established architecture:
   - UI → Server Action (`actions.ts`) → Service (`service.ts`) → Prisma.
3. Reduce technical risk by **stabilizing the log‑sheet slice** without large‑scale rewrites.
4. Define **testing, deployment, and QA standards** with measurable success criteria.

---

## 2. Architecture Overview

### 2.1 Application Architecture

```text
Browser (React)
   ↓  (form action / useTransition)
Server Action  (src/features/*/actions.ts)
   ↓  (validate with Zod + RBAC)
Service Layer  (src/features/*/service.ts)
   ↓  (Prisma + business rules)
Database       (PostgreSQL via Prisma)
   ↑
revalidatePath() → App Router routes
```

Key rules:

- Internal flows **must not** use `fetch`/`axios` to call internal routes; they call server actions directly.
- External integrations (webhooks, etc.) live under `src/app/api/` and are **not** used for internal flows.
- Inputs from UI → Actions must be validated via Zod schemas before reaching the service layer.

### 2.2 Log‑Sheet Module Architecture

- App layer: `src/app/(main)/log-sheets/**`
- Features layer: `src/features/log-sheets/**`

High‑risk files (per `BASELINE_INVENTORY.md`, `RISK_MATRIX.md`):

- `[projectId]/[logSheetId]/page.tsx` — god component (~1,200+ LOC).
- `features/log-sheets/service.ts` — god module (~1,000+ LOC, 17+ functions).
- `features/log-sheets/actions.ts` — large actions hub (~500+ LOC).
- `features/log-sheets/components/log-sheet-preview.tsx` — large but single responsibility.

Stabilization work in Section 6 is scoped to **thin, incremental refactors** only (no architecture changes).

---

## 3. Remaining Feature Inventory

This section enumerates all remaining items derived from:

- `ROADMAP.md` (sections 3–6)
- `FSD_CPIS.md` (Dashboard, Summary Reports, Notifications, My Profile, Client Portal)

### 3.1 Features By Priority

**P0 – Operational Stabilization**

- LS‑STAB: Log‑sheet module stabilization (see Section 6).

**P1 – High Business Value**

- NT‑01/02/03: Notifications system, limit alerts, and UI bell.
- DB‑02/03: Dashboard historical charts and photo gallery.
- SR‑02: Executive Summary analytics (Summary Reports).

**P2 – UX & Data Completeness**

- MP‑01: My Profile.
- CP‑01: Client read‑only dashboard (portal).
- DB‑01 (residual): Recent activity list.
- LS‑ADJ: Minor log‑sheet adjustments (video attachments, A4 print fit, inline warnings).
- PRJ‑FIELDS/CLIENT‑USER‑FIELDS: Additional fields in project/client/user forms.
- DS‑EXT: Digital signatures expansion for Summary Reports.

---

## 4. Global Implementation Principles

These apply to **all new work** in this guide.

### 4.1 Server Actions Pattern

- Naming: `[verb][Noun]Action` (e.g., `createNotificationAction`).
- Location: `src/features/<domain>/actions.ts`.
- Responsibilities:
  - Parse and validate inputs with Zod.
  - Enforce RBAC + project scoping.
  - Call service functions.
  - Handle errors using the standardized logging pattern.
  - Revalidate the relevant routes.

```ts
// Example server action pattern
export async function createSomethingAction(formData: FormData) {
  const parsed = createSomethingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, message: 'Invalid input.' };
  }

  try {
    await createSomething(parsed.data);
  } catch (error) {
    console.error('[CPIS-ERROR] Feature.createSomethingAction:', error);
    return { success: false, message: 'Action failed. Try again.' };
  }

  revalidatePath('/some/path');
  return { success: true };
}
```

### 4.2 Service Layer Pattern

- Naming: `[verb][Noun]` (e.g., `createNotification`).
- Location: `src/features/<domain>/service.ts` or sub‑modules.
- Responsibilities:
  - Enforce business rules and RBAC checks.
  - Orchestrate Prisma queries and transactions.
  - Return rich domain data models (no HTTP concerns).

### 4.3 Validation & Types

- All external inputs must be described by:
  - Zod schema (`z.object(...)`).
  - TS types/interfaces (`IZSomething`, `TDomainEntity`).
- New interfaces use `I*` naming; types use `T*`.

### 4.4 Security & Logging

- No secrets in client bundles (`process.env` only in server code).
- No logging of secrets.
- Each `catch` block:
  - Logs with `[CPIS-ERROR] <Feature>.<Action>` prefix.
  - Returns a safe error structure to the caller.

---

## 5. Feature‑By‑Feature Implementation Guides

Each subsection uses this template:

- Technical specification
- Step‑by‑step implementation
- Code examples
- Testing procedures
- Acceptance criteria

### 5.1 Notifications (NT‑01/NT‑02/NT‑03)

#### 5.1.1 Technical Specification

Goal: notify relevant users when:

- Log‑sheet entries exceed parameter limits.
- Optional: submissions/approvals occur (can be incremental).

Minimum scope:

- `Notification` schema (Prisma model).
- Service functions:
  - `createNotification`
  - `listNotificationsForUser`
  - `markNotificationAsRead`
- Server Actions:
  - `createNotificationAction` (internal use)
  - `getNotificationsAction`
  - `markNotificationAsReadAction`
- UI:
  - Header bell with unread count.
  - Dropdown with latest notifications (e.g., 20 most recent).

#### 5.1.2 Implementation Steps

1. **Define Prisma model** in `prisma/schema.prisma`:
   - Fields: `id`, `userId`, `type`, `title`, `body`, `resourceType`, `resourceId`, `readAt`, `createdAt`.
   - Run `npm run prisma:migrate` after editing schema.
2. **Generate TS types** (if shared types directory exists) for notifications.
3. **Create service module** `src/features/notifications/service.ts`:
   - Implement `createNotification`, `listNotificationsForUser`, `markNotificationAsRead`.
4. **Create actions module** `src/features/notifications/actions.ts`:
   - Implement server actions per pattern in Section 4.1.
5. **Integrate with log‑sheet save/submit flow**:
   - In `features/log-sheets/service.ts` or the relevant validation module, when a parameter is out of range:
     - Call `createNotification` with the supervisor/PIC as target.
6. **Add UI bell**:
   - In layout header (`src/app/(main)/layout.tsx` or header nav), call `getNotificationsAction` in a server component to prefetch notifications.
   - Render bell with unread count and dropdown list.

#### 5.1.3 Code Example (Service + Action)

```ts
// src/features/notifications/service.ts
export async function createNotification(input: ICreateNotificationInput) {
  // RBAC: ensure actor is allowed to create this notification type, if applicable
  return prisma.notification.create({ data: input });
}

export async function listNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}
```

```ts
// src/features/notifications/actions.ts
'use server';

export async function getNotificationsAction() {
  const session = await requireSession();
  try {
    const items = await listNotificationsForUser(session.user.id);
    return { success: true, data: items };
  } catch (error) {
    console.error('[CPIS-ERROR] Notifications.getNotificationsAction:', error);
    return { success: false, message: 'Gagal memuat notifikasi.' };
  }
}
```

#### 5.1.4 Testing & Acceptance

- Unit tests:
  - `createNotification` persists a row and returns it.
  - `listNotificationsForUser` filters by user and orders by `createdAt`.
- Manual flows:
  - For a test project, enter an out‑of‑range log‑sheet value, submit.
  - Expected: supervisor/PIC sees a new notification within 2 seconds.
- Acceptance criteria:
  - 100% of tested limit‑exceed scenarios create notifications.
  - Bell shows correct unread count after read/unread toggles.

---

### 5.2 Dashboard Analytics & Photo Gallery (DB‑02/DB‑03)

#### 5.2.1 Technical Specification

Goal: satisfy FSD dashboard requirements:

- Charts for:
  - Approach (Condenser/Evaporator) vs time.
  - Ampere (Condenser/Evaporator) vs time.
- Photo gallery of log‑sheet images ordered by latest timestamp.

Constraints:

- No new charting libraries without explicit approval.
- Data must respect project scoping and RBAC.

#### 5.2.2 Implementation Steps

1. **Add read models in service layer** (likely `src/features/log-sheets/service.ts` or new read module):
   - `getDashboardMetrics(projectId, range)`:
     - Query relevant `LogSheetEntry` records.
     - Return series grouped by date and unit.
   - `getRecentLogSheetPhotos(projectId, limit)`:
     - Query `LogSheetPhoto` by project/log‑sheet join.
2. **Server Actions**:
   - `getDashboardMetricsAction`, `getRecentPhotosAction`.
3. **Dashboard Page Integration** (`src/app/(main)/page.tsx` or dedicated dashboard route):
   - Server component fetches metrics and recent photos via actions.
   - Client component renders charts and gallery UI.
4. **Performance checks**:
   - Ensure queries use proper indexes (e.g., on `logSheetId`, `date`, `projectId`).

#### 5.2.3 Testing & Acceptance

- Unit tests:
  - Aggregation correctness for known small datasets.
- Manual:
  - For selected projects with sample data, verify the chart lines match raw entries.
  - Gallery shows latest 50 images by date.
- Acceptance:
  - Charts render under 3 seconds for one year of data on staging.
  - Gallery loads within 2 seconds for 50 photos.

---

### 5.3 Summary Report Analytics (SR‑02)

#### 5.3.1 Technical Specification

Goal: implement:

- Executive Summary Water Quality (avg/min/max per parameter).
- Executive Summary Condenser Approach (avg/min/max per unit).

Scope:

- Aggregation service functions that:
  - Accept project and period.
  - Return metrics grouped by parameter and machine.
- Integration into Summary Report print views (`summary-reports` routes).

#### 5.3.2 Implementation Steps

1. **Service functions** in a new module, e.g., `src/features/summary-reports/service.ts`:
   - `getWaterQualitySummary(projectId, period)`.
   - `getCondenserApproachSummary(projectId, period)`.
2. **Server Actions** for summary report page:
   - `getSummaryReportAnalyticsAction`.
3. **UI integration**:
   - Add sections to Summary Report pages to render metrics.
4. **Formatting**:
   - Ensure A4 print layout still fits all sections (may require condensed tables).

#### 5.3.3 Testing & Acceptance

- Seed a controlled dataset where manual aggregates are easy to compute.
- Compare service results to manual calculations.
- Acceptance:
  - Aggregates match manual expectations within floating‑point tolerance.
  - Print preview remains A4 compliant.

---

### 5.4 My Profile (MP‑01)

#### 5.4.1 Technical Specification

Goal: allow users to:

- View their profile.
- Edit non‑security fields (name, phone, address, optional avatar).
- View associated projects/roles if required by FSD.

#### 5.4.2 Implementation Steps

1. **Route and page**: `src/app/(main)/my-profile/page.tsx`.
2. **Server Actions**:
   - `getCurrentUserProfileAction`.
   - `updateCurrentUserProfileAction`.
3. **Service functions** in `src/features/users/service.ts`:
   - `getUserProfile`, `updateUserProfile`.
4. **Avatar upload**:
   - Reuse existing upload + compression infrastructure (R2 via Worker).
5. **Form**:
   - Use existing UI components (`Form`, `Input`, `Button`).

#### 5.4.3 Testing & Acceptance

- Verify that:
  - Users can see their own data only.
  - Updates persist and are reflected after refresh.
- Acceptance:
  - Profile view works for ADMIN / SUPERVISOR / TECHNICIAN / CLIENT.

---

### 5.5 Client Portal Read‑Only Dashboard (CP‑01)

#### 5.5.1 Technical Specification

Goal: provide read‑only dashboard views for CLIENT role:

- Project list limited by assignments.
- Summary stats and links to Summary Reports / Log Sheets (read‑only).

#### 5.5.2 Implementation Steps

1. **Route**: either reuse main dashboard with role‑based branching or a dedicated `/client-dashboard`.
2. **Server Actions**:
   - Use existing project/list actions with RBAC filters.
3. **UI Constraints**:
   - Hide create/edit/delete actions for CLIENT role.
   - Ensure only read‑only navigation is exposed.

#### 5.5.3 Testing & Acceptance

- With a CLIENT user:
  - Confirm only assigned projects are visible.
  - Confirm no write actions appear.

---

### 5.6 Log‑Sheet Adjustments & Data Completeness

This covers LS‑ADJ, PRJ‑FIELDS, CLIENT/USER‑FIELDS, and DS‑EXT for Summary Reports.

#### 5.6.1 LS‑ADJ (Optional Video Attachments, A4 Fit, Inline Warnings)

1. **Optional video attachments**:
   - Extend schema with optional video URL field if not present.
   - Reuse existing upload pipeline.
2. **A4 fit**:
   - Refine log‑sheet print view CSS/tailwind to ensure single‑page fit.
3. **Inline warnings**:
   - On client‑side validation hook for log‑sheets, show mild warnings when values are near/outside limits (without blocking save).

#### 5.6.2 Data Completeness (PRJ‑FIELDS, CLIENT/USER‑FIELDS)

1. **Project fields**:
   - Ensure all FSD fields are surfaced:
     - Tipe Project, Jenis Project, Pekerjaan, Warranty, etc.
   - Add UI validation rules where necessary.
2. **Client/User fields**:
   - Add `website`, `company`, `address` as needed.
   - Update create/edit forms accordingly.

#### 5.6.3 DS‑EXT (Summary Report Signatures)

1. Reuse `SignaturePad` and log‑sheet signature patterns.
2. Add optional sign‑off area to Summary Report print views.
3. Implement server actions to save signature data (e.g., `summaryReportSignatureUrl`).

---

## 6. Log‑Sheet Module Stabilization (LS‑STAB)

This is a focused refactor to reduce risk while preserving behavior.

### 6.1 Goals And Constraints

- Reduce complexity of:
  - `[logSheetId]/page.tsx` (A7).
  - `features/log-sheets/service.ts` (F2).
- Eliminate cross‑layer coupling and circular type dependencies where feasible.
- No changes to external APIs or UI behavior.

### 6.2 Stabilization Slices

#### Slice 1: Extract Detail Page View‑Model ✅ COMPLETE

Objective: move complex derived data from `[logSheetId]/page.tsx` into a dedicated module.

**Completed:**

- Created `src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-view-model.ts`
- Created `EntryStateProvider` for entry state management
- LOC in `page.tsx` reduced by **65%** (1,245 → 437 lines)

#### Slice 2: Split Service Into Focused Modules ✅ COMPLETE

Objective: split `service.ts` into read vs write vs validation without changing exports.

**Completed:**

- Created `service-extended.ts` for parallel data fetching
- Added `dto.ts` for type-safe Prisma mappers
- `service.ts` reduced by **32%** (1,008 → 687 lines)

#### Slice 3: Remove Cross‑Layer Coupling ✅ COMPLETE

Objective: decouple hooks from feature UI components.

**Completed:**

- Extracted `value-type.ts` utilities (pure functions for value handling)
- Constants moved to feature-level modules
- No more circular imports between hooks and UI components

#### Slice 4: Consolidate Duplicated Utilities And Types ✅ COMPLETE

Objective: centralize commonly duplicated functions and types.

**Completed:**

- `utils/value-type.ts`: `isEntryValueComplete`, `isNumericInRange`, `formatValue`
- DTOs in `dto.ts` for Prisma → Domain mapping
- Entry key generation in `utils.ts`

### 6.3 Option A Mobile Layout (Post-Stabilization)

After completing the stabilization slices, the Option A mobile layout implementation began:

| Component          | Status | File                                                  |
| ------------------ | ------ | ----------------------------------------------------- |
| View Model Builder | ✅     | `option-a/unit-view-model-builder.ts`                 |
| Contracts/Types    | ✅     | `option-a/contracts.ts`                               |
| Unit Tests         | ✅     | `option-a/unit-view-model-builder.test.ts` (27 tests) |
| Feature Flag       | ✅     | `option-a/feature-flags.ts`                           |
| Unit Overview List | ✅     | `option-a/components/unit-overview-list.tsx`          |
| Unit Entry Screen  | ✅     | `option-a/components/unit-entry-screen.tsx`           |
| Page Integration   | ⏳     | Pending                                               |

### 6.4 Stabilization Results Summary

| Metric                           | Before | After | Change |
| -------------------------------- | ------ | ----- | ------ |
| `page.tsx` LOC                   | 1,245  | 437   | -65%   |
| `service.ts` LOC                 | 1,008  | 687   | -32%   |
| `log-sheet-category-section.tsx` | 731    | 116   | -84%   |
| Test count                       | 652    | 813   | +161   |
| New dependencies                 | -      | -     | 0      |

---

## 7. Testing Strategy And Success Metrics

### 7.1 Manual Testing Matrix

For each major area (Notifications, Dashboard Analytics, Summary Reports, My Profile, Client Portal, Log‑sheet flows), define:

- Happy path scenarios.
- Failure/edge cases (invalid input, permission denied, network issues).

Example matrix (excerpt):

| Area          | Scenario                                  | Expected Result                                  |
| ------------- | ----------------------------------------- | ------------------------------------------------ |
| Notifications | Out‑of‑range log‑sheet value saved        | Notification created for supervisor/PIC          |
| Dashboard     | Open with 1 year of data                  | Charts render under 3s without errors            |
| My Profile    | Update phone number and avatar            | Persisted and visible after page reload          |
| Client Portal | CLIENT user visits dashboard              | Only assigned projects, all UI read‑only         |
| Log‑sheets    | Draft → Submit → Approve → Unlock (Admin) | Status transitions valid, locking rules enforced |

### 7.2 Automated Tests

- Preference: service‑level Jest/Vitest tests.
- Target coverage:
  - New service modules: ≥90% statement coverage where business logic is nontrivial.
  - All new validation functions: at least one positive and multiple negative cases.

### 7.3 Performance Benchmarks

- Notifications:
  - Alert creation latency <2s (measurement from action invocation to DB commit).
- Dashboard:
  - Charts and gallery render under 3s for 1‑year test dataset.
- Summary Reports:
  - Analytics queries under 2s for typical periods.

---

## 8. Deployment And Migration Guidelines

### 8.1 Prisma Migrations

- For each schema change:
  - Add new fields/models with defaults and backfill scripts if needed.
  - Run `npm run prisma:migrate`.
  - Run `npm run prisma:validate` to ensure schema consistency.

### 8.2 Build And Release Checklist

1. `npm run lint`
2. `npm run build`
3. Run minimal manual regression on:
   - Login and main dashboard.
   - Log‑sheet draft/submit/approve.
   - New features modified in the current release.

### 8.3 Rollback Considerations

- Keep migrations additive where possible.
- For high‑risk schema changes, plan a rollback migration or feature flag.

---

## 9. Troubleshooting

### 9.1 Notifications Not Appearing

- Check:
  - Prisma migration for `Notification` applied.
  - `createNotification` is called in limit‑check paths.
  - Server logs for `[CPIS-ERROR] Notifications.*`.

### 9.2 Dashboard Charts Empty Or Slow

- Validate:
  - Filters: project IDs and date ranges passed correctly.
  - Database indexes on timestamp and project fields.
  - No RBAC filters over‑restricting dataset.

### 9.3 Summary Report Layout Issues

- Confirm:
  - A4 print styles and `@media print` CSS in summary report pages.
  - No oversized images or tables forcing overflow.

### 9.4 Log‑sheet Regression After Stabilization

- Compare behavior against:
  - Existing tests (`service.test.ts`, `log-sheet-locking.test.ts`).
  - Baseline inventory metrics (Section 7 of `BASELINE_INVENTORY.md`).

---

## 10. Deliverables And Acceptance Criteria By Phase

### Phase 1 – Log‑Sheet Stabilization (LS‑STAB)

- Deliverables:
  - Refactored log‑sheet detail page and service façade.
  - Shared constants/utilities for formatting and categories.
- Acceptance:
  - No functional regressions in log‑sheet flows.
  - Reduced LOC and CC in key god modules/components.

### Phase 2 – Notifications (NT‑01/02/03)

- Deliverables:
  - Notification schema, service, actions, header bell, dropdown.
- Acceptance:
  - Notifications reliably created on limit‑exceed events.
  - UI unread counts accurate for tested users.

### Phase 3 – Dashboard Analytics & Summary Analytics (DB‑02/03, SR‑02)

- Deliverables:
  - Chart and gallery views on dashboard.
  - Executive summary sections in Summary Reports.
- Acceptance:
  - Aggregations verified against test data.
  - Performance benchmarks met on staging.

### Phase 4 – My Profile, Client Portal, Data Completeness, DS‑EXT

- Deliverables:
  - My Profile page with editable fields and avatar upload.
  - Client read‑only dashboard.
  - Additional project/client/user fields surfaced and validated.
  - Summary Report signatures integration (optional sign‑off).
- Acceptance:
  - RBAC rules enforced (no unauthorized writes).
  - All new fields visible and persisted via UI.

---

This document should be treated as the canonical implementation guide for completing the remaining CPIS work. Each phase can be executed independently, but the recommended sequence is:

1. LS‑STAB (stabilization)
2. Notifications
3. Dashboard + Summary analytics
4. Profile/Portal/Data completeness + signature expansion
