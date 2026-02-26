# CPIS Project Implementation Roadmap

> **Project:** Corintek Project Information System (CPIS)
> **Updated:** 2026-02-25
> **Status:** MVP Phase Completed - Transitioning to Operational Phase
> **WARNING:** DO NOT REMOVE ANYTHING FROM THIS DOCUMENT!!! Just update, append, or change. Removal need PERMISSION!!!

---

## 1. Implementation Status

### ✅ Completed Domains

| Domain          | Schema | Service | Actions | UI  | Notes                                       |
| --------------- | ------ | ------- | ------- | --- | ------------------------------------------- |
| Auth            | ✅     | ✅      | ✅      | ✅  | Login/session management                    |
| Clients         | ✅     | ✅      | ✅      | ✅  | Full CRUD with DataTable                    |
| Users           | ✅     | ✅      | ✅      | ✅  | Full CRUD, roles, soft delete               |
| Parameters      | ✅     | ✅      | ✅      | ✅  | Master data with categories + global limits |
| Projects        | ✅     | ✅      | ✅      | ✅  | Full CRUD with status, assignments          |
| Machines        | ✅     | ✅      | ✅      | ✅  | Nested in Projects form                     |
| Chemicals       | ✅     | ✅      | ✅      | ✅  | Master CRUD + Usage in LS                   |
| Attendance      | ✅     | ✅      | ✅      | ✅  | Clock in/out + Photo validation             |
| Lab Analysis    | ✅     | ✅      | ✅      | ✅  | Results tracking per project                |
| Work Reports    | ✅     | ✅      | ✅      | ✅  | Ad-hoc technician reports + signatures      |
| Summary Reports | ✅     | ✅      | ✅      | ✅  | Monthly project sign-off                    |
| Worker (R2)     | ✅     | ✅      | N/A     | N/A | Basic upload API ready                      |
| Notifications   | ✅     | ✅      | ✅      | ✅  | NT-02 & NT-03 Complete                      |
| Client Portal   | ✅     | ✅      | ✅      | ✅  | CP-01 Complete - Read-only CLIENT role      |

### 🚧 In Progress (Separate Worktree)

| Feature                    | Status | File/Component                                               |
| -------------------------- | ------ | ------------------------------------------------------------ |
| Unified Reports List       | ✅     | `/reports/page.tsx`                                          |
| Log Sheet List per Project | ✅     | `/log-sheets/[projectId]/page.tsx`                           |
| Create Log Sheet Dialog    | ✅     | `log-sheet-dialog.tsx`, `log-sheet-form.tsx`                 |
| Log Sheet Detail/Edit      | ✅     | `/log-sheets/[projectId]/[logSheetId]/page.tsx` (~437 lines) |
| Unit Condensor Entry       | ✅     | Per-chiller entries with limits                              |
| Unit Evaporator Entry      | ✅     | Per-chiller entries with limits                              |
| Cooling Water Quality      | ✅     | Per-CT entries + Raw Water column                            |
| General Condition          | ✅     | Per-CT boolean entries + notes                               |
| Job Description            | ✅     | Per-CT boolean entries + notes                               |
| Consumption                | ✅     | Water meter before/after                                     |
| Photo Attachments          | ✅     | Before/After sections, max 8, preview support                |
| Chemical Fill-up           | ✅     | Master data + Log Sheet integration                          |
| Print Preview Mode         | ✅     | `log-sheet-preview.tsx`                                      |
| **Refactoring (LS-STAB)**  | ✅     | Page: -65%, Service: -32%, Tests: +161                       |
| **Option A Mobile Layout** | ✅     | Unit-based mobile entry view with consumption section        |
---

## 2. Gap Audit (FSD vs Current Implementation)

> **Reference:** `fsd_cpis/FSD_CPIS.md`

### 2.1 Missing Features (Not in Production)

| #   | Feature                        | Scope ID        | FSD Reference             | Priority | Status                  |
| --- | ------------------------------ | --------------- | ------------------------- | -------- | ----------------------- |
| 1   | **Parameter Limit Categories** | `PARAM-CAT-01`  | Section 7.1, Form Project | 🚨 P0    | ❌ Not Started          |
| 2   | Video Attachment (Log Sheet)   | `LS-ADJ`        | Section 3                 | 🟡 P2    | ❌ Not Started          |
| 3   | Client Website Field           | `CLIENT-FIELDS` | Form Data Klien           | 🟢 P3    | ❌ Not Started          |
| 4   | User Company Field (Client)    | `USER-FIELDS`   | Form User                 | 🟢 P3    | ❌ Not Started          |
| 5   | User Address Field             | `USER-FIELDS`   | Form User                 | 🟢 P3    | ❌ Not Started          |
| 6   | Work Types Multi-select        | `PRJ-FIELDS-02` | Form Project              | 🟢 P3    | ⚠️ Single-select exists |
| 7   | Dashboard Parameter Panel      | `DB-04`         | Section 1                 | 🟡 P2    | ❌ Not Started          |
| 8   | Dashboard Recent Activity      | `DB-01`         | Section 1                 | 🟡 P1    | ❌ Not Started          |
| 9   | Executive Summary Analytics    | `SR-02`         | Section D                 | 🟡 P1    | ❌ Not Started          |
| 10  | Summary Report Signatures      | `DS-EXT`        | Section D                 | ⚪ P4    | ❌ Not Started          |

### 2.2 Completed Features (FSD Aligned)

| #   | Feature                         | Scope ID       | FSD Reference   | Status  |
| --- | ------------------------------- | -------------- | --------------- | ------- |
| 1   | Work Report / Log Sheet Request | `WR-01`        | Section 3, B, C | ✅ Done |
| 2   | Hasil Analisa Lab               | `LB-01`        | Section 5       | ✅ Done |
| 3   | Attendance/Absensi              | `AB-01~03`     | Section 6       | ✅ Done |
| 4   | Digital Signature (Log Sheet)   | `DS-01/02`     | Section 7       | ✅ Done |
| 5   | Digital Signature (Work Report) | `DS-EXT`       | Section 7       | ✅ Done |
| 6   | Notifications                   | `NT-01~03`     | Section 7       | ✅ Done |
| 7   | Dashboard Charts & Gallery      | `DB-02/03`     | Section 1       | ✅ Done |
| 8   | My Profile                      | `MP-01`        | Section 7       | ✅ Done |
| 9   | Client Portal                   | `CP-01`        | Section 3, 10   | ✅ Done |
| 10  | Project Personnel Assignment    | `RBAC-02`      | Section 7       | ✅ Done |
| 11  | User Matrix/RBAC                | `AC-01`        | Section 10      | ✅ Done |
| 12  | Project Type (Utama/Addendum)   | `PRJ-FIELDS`   | Form Project    | ✅ Done |
| 13  | Project Contract Type           | `PRJ-FIELDS`   | Form Project    | ✅ Done |
| 14  | Project Work Category           | `PRJ-FIELDS`   | Form Project    | ✅ Done |
| 15  | Warranty Period                 | `PRJ-FIELDS`   | Form Project    | ✅ Done |
| 16  | Per-Project Parameter Overrides | `PRJ-PARAM-01` | Section 7.1     | ✅ Done |

---

## 3. Detailed Feature Specifications

### 🚨 P0: Critical (Production Parity)

#### 3.1 Parameter Limit Categories

**Scope ID:** `PARAM-CAT-01`
**Why:** FSD Section 7.1 requires ability to set parameter limits from master data (default or per project). Current implementation requires manual per-parameter overrides. The original production system had parameter limit categories for easier project setup.
**FSD Reference:** "Limit Parameter: Dari data setting master (default atau per project)"

**Current Implementation:**

```
Parameter → minValue, maxValue (global defaults)
Project → ProjectParameterOverride (per-project manual overrides)
```

**Proposed Implementation:**

```
ParameterLimitCategory → id, name, description (e.g., "Standard", "Client XYZ Custom")
ParameterLimit → categoryId, parameterId, minValue, maxValue, rawWaterMin, rawWaterMax
Project → parameterLimitCategoryId (nullable, defaults to "Standard")
```

**Tasks:**

- [ ] Create `ParameterLimitCategory` schema
- [ ] Create `ParameterLimit` schema (links category to parameter limits)
- [ ] Add `parameterLimitCategoryId` to Project schema
- [ ] Create category management UI in `/parameters/limits`
- [ ] Update Project form to select limit category
- [ ] Update log sheet limit resolution logic to use category
- [ ] Create seed data for "Standard" default category
- [ ] Migration plan for existing `ProjectParameterOverride` data

**Benefits:**

- Reusability: Define once, apply to multiple projects
- Client-specific defaults: Create categories per client
- Easier management: Update category instead of individual overrides

---

### ⚠️ P1: Should Have

#### 4.1 Dashboard Recent Activity (DB-01)

**Scope ID:** `DB-01`
**Why:** FSD Section 1 requires recent activity display on dashboard.
**Tasks:**

- [ ] Create activity feed component
- [ ] Query recent log sheets, work reports, approvals
- [ ] Display timestamped activity list
- [ ] Filter by project scope for non-admin roles

#### 4.2 Summary Report Analytics (SR-02)

**Scope ID:** `SR-02`
**Why:** FSD Section D requires Executive Summary with aggregated data.
**Tasks:**

- [ ] Aggregate water quality data (avg/min/max per parameter)
- [ ] Aggregate condenser approach data (avg/min/max per unit)
- [ ] Create data access patterns for reporting
- [ ] Display in summary report print view

---

### 📉 P2: Could Have

#### 5.1 Log Sheet Adjustments (LS-ADJ)

**Scope ID:** `LS-ADJ`
**Why:** FSD Section 3 mentions optional video attachments and inline warnings.
**Tasks:**

- [ ] Optional video attachment upload (before/after)
- [ ] Final A4 print fit for all log sheet variants
- [ ] Inline min/max limit warnings (notifikasi ringan di form)
- [ ] Mandatory fields mapping review vs FSD (unit selection, notes)

#### 5.2 Dashboard Parameter Panel (DB-04)

**Scope ID:** `DB-04`
**Why:** FSD Section 1 requires parameter snapshot panel for active project.
**Tasks:**

- [ ] Design parameter snapshot panel component
- [ ] Fetch active project parameters with limits
- [ ] Display current values vs limits

---

### 🟢 P3: Nice to Have

#### 6.1 Client Data Completeness (CLIENT-FIELDS)

**Scope ID:** `CLIENT-FIELDS`
**Why:** FSD Form Data Klien includes website field.
**Tasks:**

- [ ] Add `website` field to Client schema
- [ ] Update Client form UI
- [ ] Update Client list columns

#### 6.2 User Data Completeness (USER-FIELDS)

**Scope ID:** `USER-FIELDS`
**Why:** FSD Form User includes company and address fields for client accounts.
**Tasks:**

- [ ] Add `company` field to User schema (for client accounts)
- [ ] Add `address` field to User schema
- [ ] Update User form UI
- [ ] Update User list columns

#### 6.3 Work Types Multi-select (PRJ-FIELDS-02)

**Scope ID:** `PRJ-FIELDS-02`
**Why:** FSD Form Project has "Jenis Pekerjaan" as multi-select. Currently single-select.
**Tasks:**

- [ ] Evaluate operational requirement for multi-select
- [ ] If needed, create `ProjectWorkType` junction table
- [ ] Update Project form with multi-select UI

---

### ⚪ P4: Lowest Priority

#### 7.1 Summary Report Signatures (DS-EXT)

1. ~~**Complete Option A Mobile Layout Integration (P1)**~~ ✅ COMPLETE
   - Unit-based mobile entry view with `UnitOverviewList` and `UnitEntryScreen`.
   - Consumption section with camera input for water meters.
   - Removed old mobile components (`CoolingWaterQualityMobile`, `GeneralCategoryMobile`).
**Scope ID:** `DS-EXT`
**Why:** Optional approval signatures for Summary Reports.
**Priority Note:** Only implement after all other P0/P1/P2 items are stable.
**Tasks:**

- [ ] Add optional approval signatures for Summary Reports (Corintek PIC / Client PIC)
- [ ] Reuse existing `SignaturePad` component
- [ ] Ensure signatures remain optional

---

## 4. Browser UI Tests Required

| Feature       | Scope ID | Test Cases                                                |
| ------------- | -------- | --------------------------------------------------------- |
| My Profile    | `MP-01`  | Avatar upload, form submission, role-based access         |
| Client Portal | `CP-01`  | CLIENT user sees only assigned projects, read-only access |

---

## 5. Recommended Next Steps

| Priority | Feature                        | Scope ID                       | Effort | Notes                              |
| -------- | ------------------------------ | ------------------------------ | ------ | ---------------------------------- |
| 🚨 **1** | **Parameter Limit Categories** | `PARAM-CAT-01`                 | Medium | **Critical for production parity** |
| 🟢 2     | Browser UI Tests               | `QA`                           | Low    | MP-01, CP-01 verification          |
| 🟡 3     | Dashboard Recent Activity      | `DB-01`                        | Low    | Activity feed                      |
| 🟡 4     | Summary Report Analytics       | `SR-02`                        | Medium | Executive summary calculations     |
| 🟡 5     | Log Sheet Adjustments          | `LS-ADJ`                       | Medium | Video, A4, warnings                |
| 🟢 6     | Client/User Fields             | `CLIENT-FIELDS`, `USER-FIELDS` | Low    | Data completeness                  |
| ⚪ 7     | Summary Report Signatures      | `DS-EXT`                       | Low    | Lowest priority                    |

---

## 6. Feature Dependency Matrix

| Level     | Features                          | Can Start           |
| --------- | --------------------------------- | ------------------- |
| 🟢 LOW    | CLIENT-FIELDS, USER-FIELDS, QA    | Immediately         |
| 🟡 MEDIUM | PARAM-CAT-01, SR-02, DB-01, DB-04 | After prerequisites |
| 🔴 HIGH   | LS-ADJ                            | After logsheet work |
| ⚪ LOWEST | DS-EXT                            | After all P0-P2     |

---

## 7. Implementation Guidelines

> **Architecture:** UI → Server Action (`actions.ts`) → Service (`service.ts`) → Prisma
> **Validation:** All external inputs via Zod schemas
> **Naming:** Actions = `[verb][Noun]Action`, Services = `[verb][Noun]`, Interfaces = `I*`, Types = `T*`
> **Logging:** `[CPIS-ERROR] <Feature>.<Action>:` prefix in catch blocks
> **No internal fetch:** Server actions call services directly, no HTTP for internal flows

### 7.1 Testing Standards

- **Service tests:** ≥90% coverage for business logic
- **Manual testing:** Happy path + edge cases per feature
- **Performance:** Actions <2s, charts <3s for 1-year data

---

## 8. Completed Feature History

### 8.1 Client Portal (CP-01) - 2026-02-25

**Branch:** `feat/client-portal-cp01` (merged to `development_v2`)

**Changes:**

- Added `CLIENT` to `UserRole` enum in Prisma schema
- Added `CLIENT` role with read-only permissions in RBAC matrix
- Added `requireActor()`, `getActorOrNull()`, `AuthenticationError` in auth-helpers
- Added `TActionResponse<T>` alias and `unauthorized()` helper
- Created shared Prisma select objects (`prisma-selects.ts`)
- Added `CLIENT` to project-scoped roles for dashboard access
- **Tests:** 46 passing (auth-helpers: 19, action-helpers: 11, rbac: 16)

**CLIENT Role Permissions (Read-Only):**

- Dashboard, Summary Reports, Log Sheets, Work Reports, Reports, Projects List
- No access to: Lab Analyses, Attendance, Users Admin, Projects Admin, Master Data

### 8.2 My Profile (MP-01) - 2026-02-25

**Branch:** `feat/users/my-profile-mp01`

**Files:**

- `src/features/users/service.ts` - Added `getCurrentUserProfile`, `updateCurrentUserProfile`
- `src/features/users/actions.ts` - Added profile actions + avatar upload
- `src/features/users/components/profile-form.tsx` - Profile edit form
- `src/app/(main)/my-profile/page.tsx` - Profile page
- **Tests:** 25 passing (service: 11, actions: 14)

### 8.3 RBAC & Project Scoping (RBAC-02)

**Tasks Completed:**

- Implement `ProjectAssignment` model to link users and projects
- Update `ROLE_MATRIX` with resource-level permissions
- Enforce project-scoped access for SUPERVISOR/TECHNICIAN/CLIENT roles
- Implement `assertCanAccessProject` helper in Service layer
- Protect Log Sheets, Work Reports, Lab Analyses, Summary Reports from URL guessing
- Add Assignment Management UI in Project edit dialog

### 8.4 Notifications System (NT-02/03)

**Tasks Completed:**

- Implement Notification persistence and Service layer
- Implement Limit Evaluation Adapter for Log Sheets
- Integrate Notifications into Log Sheet submission flow
- Expose Notifications in UI (Header Bell/Dropdown)

### 8.5 Parameter Limit UX Refactoring - 2026-02-26

**Branch:** `refactor/parameter-limit-ux` (in progress)

**Changes:**

- Renamed `ParameterLimitCategory` model → `ParameterLimitProfile` (clearer naming)
- Renamed table `parameter_limit_categories` → `parameter_limit_profiles`
- Removed redundant `minValue`, `maxValue`, `rawWaterMinValue`, `rawWaterMaxValue` from `Parameter` model
- All limits now stored in `ParameterLimit` table (single source of truth)
- Consolidated sidebar: merged 3 entries into 1 (`Parameters`)
- Updated project schema to use `parameterLimitProfileId`
- Created new feature module `src/features/parameter-limit-profiles/`

**TODO / NEXT STEPS:**

- [ ] Run `npm run prisma:migrate` to apply schema changes to database
- [ ] Fix remaining TypeScript build errors in:
  - [ ] `src/features/log-sheets/service.ts` - Update Parameter references
  - [ ] `src/features/summary-reports/service.ts` - Update Parameter references
  - [ ] `src/features/parameters/limits-service.ts` - Update Parameter references
  - [ ] `src/app/(main)/lab-analyses/[projectId]/[labAnalysisId]/edit/page.tsx` - Update ParameterLite type
- [ ] Recreate tabs UI for Parameters page (Parameter, Limit Defaults, Profiles)
- [ ] Test that existing projects work with new profile system
