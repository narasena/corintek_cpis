# CPIS Project Implementation Roadmap

> **Project:** Corintek Project Information System (CPIS)
> **Updated:** 2026-02-25
> **Status:** MVP Phase Completed - Transitioning to Operational Phase
> **WARNING:** DO NOT REMOVE ANYTHING FROM THIS DOCUMENT!!! Just update, append, or change. Removal need PERMISSION!!!

#### 2.6 [NEW] RBAC & Project Scoping (Keamanan & Pembatasan Proyek)

**Scope ID:** `RBAC-02`
**Why:** Critical for data privacy between projects and preventing unauthorized access by scoped roles (PIC/Technician).
**Tasks:**

- [x] Implement `ProjectAssignment` model to link users and projects.
- [x] Update `ROLE_MATRIX` with resource-level permissions (PROJECTS_ADMIN, PROJECTS_LIST, etc.).
- [x] Enforce project-scoped access in `getProjectsAction` for SUPERVISOR/TECHNICIAN roles.
- [x] Implement `assertCanAccessProject` middleware-like helper in Service layer.
- [x] Protect Log Sheets, Work Reports, Lab Analyses, and Summary Reports from URL guessing.
- [x] Add Assignment Management UI in Project edit dialog (PIC Project, Teknisi, PIC Klien).

#### 2.7 [NEW] Notifications System (Backend & Log Sheet Integration)

**Scope ID:** `NT-02`
**Why:** Alert technicians when log sheet entries breach parameter limits.
**Tasks:**

- [x] Implement Notification persistence and Service layer.
- [x] Implement Limit Evaluation Adapter for Log Sheets.
- [x] Integrate Notifications into Log Sheet submission flow.
- [x] Expose Notifications in UI (Header Bell/Dropdown) - `NT-03`.

---

## 0. MVP Definition (Rescue Mode) - ✅ COMPLETED

### In Scope (MVP)

- **Users:** Internal users only (ADMIN / SUPERVISOR / TECHNICIAN). ✅
- **Masters:** Clients, Projects, Machines, Parameters, Chemicals. ✅
- **Log Sheets:** ✅
  - Draft save + submit flow. ✅
  - Photo attachments (before/after) - Max 8 photos. ✅
  - Print (A4 single page) / Save as PDF via browser print. ✅
- **Reporting:** Unified Reports List (find + filter). ✅
- **[NEW] Lab Analysis:** Simple CRUD for entering lab results. ✅
- **[NEW] Work Reports:** Ad-hoc work requests/reports (different from daily log sheets). ✅
- **[NEW] Ops Readiness:** Seeding (Password Reset & Backups deferred). ✅

### Out of Scope (Defer)

- Dashboard complex charts (Project list only for MVP).
- Attendance module (use existing HR tools).
- Digital signatures (originally out-of-scope for MVP, now implemented post-MVP).
- Notifications system (complex alerts). **(Moved to In Scope - NT-02)**
- Client portal / external access.
- **OPS-02 (Password Reset)**.
- **OPS-03 (Backup Plan)**.

---

## 1. Current Implementation Status

### ✅ Completed Domains

| Domain          | Schema | Service | Actions | UI  | Notes                                       |
| --------------- | ------ | ------- | ------- | --- | ------------------------------------------- |
| Auth            | ✅     | ✅      | ✅      | ✅  | Login/session management                    |
| Clients         | ✅     | ✅      | ✅      | ✅  | Full CRUD with DataTable                    |
| Users           | ✅     | ✅      | ✅      | ✅  | Full CRUD, roles, soft delete               |
| Parameters      | ✅     | ✅      | ✅      | ✅  | Master data with categories + global limits |
| Projects        | ✅     | ✅      | ✅      | ✅  | Full CRUD with status                       |
| Machines        | ✅     | ✅      | ✅      | ✅  | Nested in Projects form                     |
| Chemicals       | ✅     | ✅      | ✅      | ✅  | Master CRUD + Usage in LS                   |
| Attendance      | ✅     | ✅      | ✅      | ✅  | Clock in/out + Photo validation             |
| Lab Analysis    | ✅     | ✅      | ✅      | ✅  | Results tracking per project                |
| Work Reports    | ✅     | ✅      | ✅      | ✅  | Ad-hoc technician reports + signatures      |
| Summary Reports | ✅     | ✅      | ✅      | ✅  | Monthly project sign-off                    |
| Worker (R2)     | ✅     | ✅      | N/A     | N/A | Basic upload API ready                      |
| Notifications   | ✅     | ✅      | ✅      | ✅  | NT-02 & NT-03 Complete                      |

### ✅ Log Sheets Domain (Mostly Complete)

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
| **Option A Mobile Layout** | 🚧     | View model ✅, UI components ✅, Integration ⏳              |

---

## 2. Detailed Roadmap (Prioritized)

### 🚨 P0: MVP (MUST HAVE) - _The "Go Live" Blocker List_

These tasks are absolutely critical for the system to be usable in production.

#### 2.1 [NEW] Summary Report (Laporan Bulanan) — MAIN FEATURE

**Scope ID:** `SR-01`
**Why:** Client requirement for monthly project sign-off.
**Strategy:** Browser-Native Print (HTML -> PDF).
**Tasks:**

- [x] Create `SummaryReport` schema (for attachments like Surat Jalan, Data Temuan).
- [x] Add section toggles for monthly report composition.
- [x] Implement Selection Page (Project + Period + Sections).
- [x] Implement Print View Layout (A4 optimized).
  - [x] Cover Page & Table of Content.
  - [x] Bab I: Executive Summary (Auto-generated stats).
  - [x] Bab II: Log Sheets (Grid/List view of approved logs).
  - [x] Bab III: Lab Analysis (Table of results).
  - [x] Bab IV: Work Reports (List of ad-hoc work).
  - [x] Bab V: Chemical Reports (Usage summary).
- [x] Integrate PDF Uploads for Appendices.

#### 2.2 [NEW] Ops Readiness (Hidden Agenda)

**Scope ID:** `OPS-01` (Database Seeding) ✅
**Why:** Cannot deploy without initial Admin user & default categories.
**Tasks:**

- [x] Create `prisma/seed.ts` script
- [x] Seed default Admin user (`admin@corintek.com`)
- [x] Seed default Parameter Categories
- [x] Seed default Chemical Categories

#### 2.3 [NEW] Work Reports (Log Sheet Request)

**Scope ID:** `WR-01`
**Why:** Technicians need to report ad-hoc repairs/requests separate from daily checklists.
**Estimated Prompts:** 2-3
**Tasks:**

- [x] Create `WorkReport` schema
  - Fields: `projectId`, `machineIds[]`, `date`, `situation`, `workDone`, `workResult`
- [x] Create Service and Server Actions
- [x] Create List Page (per project) and Create/Edit Form
- [x] Integrate Photo Attachments (reuse `LogSheetPhoto` logic)
- [x] Create Print Preview page

#### 2.4 [NEW] Lab Analysis (Hasil Analisa Lab)

**Scope ID:** `LB-01`
**Why:** Critical for tracking water quality results from lab.
**Estimated Prompts:** 2
**Tasks:**

- [x] Create `LabAnalysis` schema
- [x] Create Manual Entry Form
  - Fields: `Attention`, `Cc`, `Customer`, `Address`, `Parameter`, `Test Result`
- [x] Link to Project/Client
- [x] List View per Project

#### 2.5 Log Sheet Completions

**Scope ID:** `LS-PHOTO` (Photo Attachments)
**Status:** ✅ Mostly Done
**Tasks:**

- [x] Create `LogSheetPhoto` schema + `PhotoType` enum (BEFORE/AFTER)
- [x] Reuse existing upload pipeline (Worker R2 + server action)
- [x] Reuse existing camera/gallery UX (CameraInput + compression)
- [x] Add dedicated photo section in log sheet UI (before/after + optional caption)
- [x] Enforce max 2 photos per log sheet for water consumption section only
- [x] Render photos in preview/print

**Scope ID:** `LS-REPLACE` (Technician Replacement)
**Status:** ✅ Done
**Tasks:**

- [x] Add `replacedByUserId` field to LogSheet
- [x] Add "Digantikan oleh" field in log sheet form
- [x] Display replacement info in preview

**Scope ID:** `PRJ-PARAM-01` (Per-Project Parameter Overrides)
**Status:** ✅ Done
**Tasks:**

- [x] Add schema for project-specific overrides (min/max)
- [x] Add UI in Project form to edit overrides
- [x] Apply overrides when rendering log sheet limits

**Scope ID:** `PARAM-LIMIT-01` (Parameter Limits Master)
**Status:** ✅ Done
**Tasks:**

- [x] Add global parameter limit management page (`/parameters/limits`) with filters.
- [x] Validate numeric ranges for min/max and raw water limits.
- [x] Support single and batch updates with transaction safety.

**Scope ID:** `RP-01` (Unified Reports List)
**Status:** ✅ Done
**Tasks:**

- [x] Unified list view of all log sheets
- [x] Filter by Project / Client / Date

---

### ⚠️ P1: SHOULD HAVE - _Important but survivable_

These improve operations significantly but can be delayed a few days if necessary.

#### 3.1 PDF Uploads for Summary

**Scope ID:** `SR-04`
**Status:** ✅ Done
**Estimated Prompts:** 1
**Tasks:**

- [x] Create `ProjectDocument` schema or similar (Added to `SummaryReport`)
- [x] Upload sections for scanned documents:
  - Data temuan
  - Data blowdown silang
  - Data suhu
  - Surat jalan
- [x] Store in R2, link to Project
- [x] PDF preview/download UI (Attachment Pack Print View)

#### 3.2 Basic Dashboard (DB-01) ✅

- [x] Dashboard layout with project cards/stats (Scoped for PIC/Technician/Client)
- [x] Active projects count & Quick action buttons
- [ ] Recent activity list

#### 3.3 Log Sheet Ops

**Scope ID:** `LS-CHEM` (Chemical Fill-up)
**Status:** ✅ Done (but listed here as P1 feature)
**Tasks:**

- [x] Create `Chemical` master data schema
- [x] Create `ChemicalUsage` schema linked to LogSheet
- [x] Add Chemical master CRUD page
- [x] Add chemical usage section in log sheet form
- [x] Display in log sheet preview

**Scope ID:** `LS-LOCK` (Submission Locking)
**Estimated Prompts:** 1
**Tasks:**

- [x] Prevent editing log sheets after status = SUBMITTED/APPROVED
- [x] Allow Admin override

---

### 📉 P2: COULD HAVE (DEFERRED) - _Nice to have_

These are planned but moved to "Phase 2" to prioritize the rescue mission.

#### 4.1 Attendance (Absensi)

**Scope ID:** `AB-01` (Schema & Service) ✅
**Tasks:**

- [x] Create `Attendance` schema (userId, clockIn, clockOut, photos)
- [x] Service and actions for clock-in/out

**Scope ID:** `AB-02` (UI) ✅
**Tasks:**

- [x] Clock In/Out button with photo capture
- [x] Today's record display

**Scope ID:** `AB-03` (Admin) ✅
**Tasks:**

- [x] Admin view of attendance records
- [x] Export to Excel

#### 4.2 Notifications

**Scope ID:** `NT-01` (System) ✅
**Tasks:**

- [x] Create `Notification` schema
- [x] Service for creating notifications

**Scope ID:** `NT-02` (Limit Alerts) ✅
**Tasks:**

- [x] On entry save, check against limits
- [x] Create notification if exceeded

**Scope ID:** `NT-03` (UI) ✅
**Tasks:**

- [x] Notification bell in header
- [x] Dropdown with unread count

#### 4.3 Digital Signatures

**Scope ID:** `DS-01` (Component)
**Status:** ✅ Done
**Tasks:**

- [x] Implement in-house `SignaturePad` canvas component (no external library).
- [x] Expose reusable `SignaturePad` in `features/log-sheets/components/signature-pad.tsx`.

**Scope ID:** `DS-02` (Integration)
**Status:** ✅ Done (Log Sheet)
**Tasks:**

- [x] Technician signature field in Log Sheet (`technicianSignatureUrl`, `technicianSignedAt`, `technicianSignedByUserId` in schema).
- [x] Client PIC approval signature field in Log Sheet (`clientPicSignatureUrl`, `clientPicSignedAt`, `clientPicSignedByUserId`).
- [x] RBAC-aware signing rules in service layer (`assertCanSignLogSheet` in `log-sheets/service.ts`).
- [x] Server Action for saving signatures with validation (`saveLogSheetSignatureAction` in `log-sheets/actions.ts`).
- [x] Signature capture UI (`SignatureSection`) wired into Log Sheet Detail page.
- [x] Signature preview/print rendering in `log-sheet-preview.tsx`.

#### 4.4 Dashboard Expansion

**Scope ID:** `DB-02` (Historical Charts)
**Tasks:**

- [x] Install charting library
- [x] Query historical log sheet entries
- [x] Charts: Approach data (Condenser/Evaporator)

**Scope ID:** `DB-03` (Photo Gallery)
**Tasks:**

- [x] Recent photos carousel
- [x] Sorted by date

#### 4.5 Advanced Summary Reports

**Scope ID:** `SR-01` (Structure)
**Tasks:**

- [ ] Summary report page per project
- [ ] Tab navigation (Executive Summary, Lab, Log Sheets, etc.)

**Scope ID:** `SR-02` (Executive Summary)
**Tasks:**

- [ ] Aggregate water quality data
- [ ] Calculate averages, min/max

#### 4.6 User Experience

**Scope ID:** `MP-01` (My Profile)
**Tasks:**

- [ ] Profile view
- [ ] Avatar upload

**Scope ID:** `CP-01` (Client Portal) 🚧
**Tasks:**

- [x] Filtered views for CLIENT role (via project-scoped RBAC)
- [ ] Read-only dashboard

**Scope ID:** `AC-01` (RBAC) ✅
**Tasks:**

- [x] Implement user matrix per FSD Section 10
- [x] Middleware role checks (Server Action layer)

#### 4.7 Digital Signatures Expansion (DS-EXT, Lowest Priority)

> **Priority Note:** This is intentionally the lowest-priority item in the roadmap. Only implement after all other P0/P1/P2 items are stable in production.

**Scope ID:** `DS-EXT` (Work Reports & Summary Reports)
**Status:** 🚧 Partially Implemented (Work Reports), Summary Reports pending
**Tasks:**

- [x] Add optional technician signature capture and rendering to Work Reports (form + print).
- [ ] Add optional approval signatures for Summary Reports (e.g. Corintek PIC / Client PIC) on print views.
- [x] Reuse existing `SignaturePad` component and RBAC rules; no new libraries.
- [x] Ensure signatures remain optional and do not block current submission flows.

---

## 5. Notes from FSD Review

### Features Explicitly in FSD and Status (per 2026-02-16):

1.  **Work Report / Log Sheet Request (WR-\*)**
    - Status: ✅ Implemented (`WR-01` in section 2.3) as "Log Sheet Request" form.
2.  **Hasil Analisa Lab (LB-01)**
    - Status: ✅ Implemented (`LB-01` in section 2.4) and linked to projects/clients.
3.  **Attendance/Absensi (AB-\*)**
    - Status: ✅ Implemented (`AB-01`–`AB-03` in section 4.1) including Admin view and export.
4.  **Digital Signature (DS-\*)**
    - Status: ✅ Implemented for Log Sheets (`DS-01`/`DS-02` in section 4.3) and 🚧 partially implemented for Work Reports (`DS-EXT`, technician signature); Summary Report approval signatures still pending (`DS-EXT` in section 4.7).
5.  **Notifications (NT-\*)**
    - Status: ✅ Implemented. `NT-01`–`NT-03` complete with schema, service, actions, and header bell UI.
6.  **Dashboard Charts & Photo Gallery** (FSD Dashboard section 1)
    - Status: ✅ Completed. `AnalyticsDashboard` with historical charts and gallery is active.
7.  **My Profile**
    - Status: ⏳ Not implemented. Planned as `MP-01` in section 4.6.
8.  **Client-Facing Read-Only Dashboard / Portal**
    - Status: ⏳ Partially implemented. CLIENT role scoping exists (`CP-01` in section 4.6), dedicated read-only dashboard still pending.
9.  **Project Personnel Assignment**
    - Status: ✅ Implemented via `ProjectAssignment` and assignment UI (see section 2.6 and Completed Domains).
10. **User Matrix/RBAC**
    - Status: ✅ Implemented (`AC-01` and `RBAC-02`), aligned with FSD Section 10.

### Project Fields in FSD but May Need Review:

- **Tipe Project:** Utama vs Addendum (addendum continues from main project) — ✅ Implemented (ProjectType + reporting scope logic)
- **Jenis Project:** Langsung vs Subcon — ✅ Schema, Service, dan UI (ProjectContractType + Jenis Project select)
- **Pekerjaan:** Operasional, Proyek/Konstruksi, Ad Hoc — ✅ Schema, Service, dan UI (ProjectWorkCategory + Pekerjaan select)
- **Warranty:** X months warranty period — ✅ Schema, Service, dan UI (`warrantyMonths` field + warranty column in project list)

These fields are documented in the FSD and are now first-class fields in the current schema/UI (see `projects.prisma` and projects pages). Existing data from earlier phases may still need migration/backfill if required by operations.

---

## 3. Operational Phase Roadmap (Post-MVP)

### 🚨 P0: Critical Stabilizations

#### 3.1 Submission Locking & Approval (LS-LOCK / WR-APP)

- [x] Add `locked` field to LogSheet/LabAnalysis schemas.
- [x] Implement `status` (DRAFT/SUBMITTED/APPROVED) for `WorkReport`.
- [x] Implement Server Action logic to prevent updates on locked/approved `WorkReport`.
- [x] Add Admin/PIC-only "Approve" capability for `WorkReport`.
- [x] Add Admin-only "Unlock" capability (LogSheet override toggle in detail view).
- [x] Status-based locking for `LogSheet` (disable edits on SUBMITTED/APPROVED)
- [x] Admin override for `LogSheet` edits
- [x] Store `submittedAt`/`submittedBy` and `approvedAt`/`approvedBy` on `LogSheet`.
- [x] Display submission and approval info (PIC Corintek & PIC Klien) in log sheet preview/print.

#### 3.2 Basic Dashboard (DB-01)

- [ ] Replace placeholders with real-time stats.
- [ ] Active Projects & Machines overview.
- [ ] Recent submissions feed.

### ⚠️ P1: Operational Efficiency

#### 4.1 Notifications (NT-01) ✅ COMPLETE

- [x] Alert supervisors when parameters exceed thresholds.
- [x] Notifications for pending approvals.

#### 4.2 Digital Signatures (DS-01/DS-02)

- [x] Signature pad integration for technicians and PIC Client on Log Sheets.
- [x] Automatic timestamping and user tracking on sign-off.

---

## 6. Recommended Next Steps (Post-MVP, FSD-Aligned)

This section summarizes the recommended execution order for remaining work, based on the gap between the current implementation and the FSD.

1. **Complete Option A Mobile Layout Integration (P1)**
   - Wire existing `UnitOverviewList` and `UnitEntryScreen` components into the log sheet detail page.
   - Implement mobile-first navigation flow with feature flag toggle.
   - Components exist at `src/features/log-sheets/option-a/components/`.

2. **Implement My Profile (MP-01)**
   - Profile view with editable fields and avatar upload.
   - Users can view their assignments and basic profile.

3. **Implement Summary Report Analytics (SR-02)**
   - Executive Summary Water Quality (avg/min/max per parameter).
   - Executive Summary Condenser Approach (avg/min/max per unit).
   - Prepare data access patterns needed for more complex reporting if required.

4. **Finalize Dashboard Recent Activity List (DB-01)**
   - Close out residual items in `DB-01` (recent activity list).
   - Feed from existing log sheets, work reports, and approvals data.

5. **Complete Client Portal Read-Only Experience (CP-01)**
   - Implement `CP-01` read-only dashboard for CLIENT role using existing RBAC + project scoping.
   - Ensure only assigned projects are visible with no write actions.

6. **Log Sheet Adjustments (LS-ADJ)**
   - Optional video attachment upload (before/after).
   - Final A4 print fit for all log sheet variants.
   - Inline min/max limit warnings (notifikasi ringan di form).

7. **Plan and Implement Digital Signatures Expansion (DS-EXT, Lowest Priority)**
   - Schedule `DS-EXT` (section 4.7) as the last Phase 2 item: extend existing digital signatures to Summary Reports without adding new libraries or blocking current flows.

8. **Refine Project Fields from FSD (If Needed Operationally)**
   - All four FSD project fields (`Tipe Project`, `Jenis Project`, `Pekerjaan`, and `Warranty`) are now implemented as structured fields (see section "Project Fields in FSD but May Need Review").
   - If operations require stricter rules (e.g., making them mandatory or backfilling legacy data), design migrations and UI validation updates under a dedicated scope ID (e.g., `PRJ-FIELDS-02`) and schedule as a Phase 2 enhancement in line with rescue-mode constraints.

---

## 6. Gap Audit (FSD vs Current Implementation)

### 6.1 Dashboard (DB-02/DB-03)

- [x] Historical charts for Approach/Ampere (Condenser & Evaporator).
- [x] Photo gallery of log sheet images sorted by latest.
- [ ] Parameter snapshot panel for active project.
- [ ] Recent activity list (log sheet + work report + approvals).

### 6.2 Log Sheet Adjustments (LS-ADJ)

- [ ] Optional video attachment upload (before/after).
- [ ] Final A4 print fit for all log sheet variants.
- [ ] Inline min/max limit warnings (notifikasi ringan di form).
- [ ] Mandatory fields mapping review vs FSD (unit selection, notes).

### 6.3 Summary Report Analytics (SR-02)

- [ ] Executive Summary Water Quality (avg/min/max per parameter).
- [ ] Executive Summary Condenser Approach (avg/min/max per unit).

### 6.4 Project Data Completeness (PRJ-FIELDS)

- [x] Add project type (Utama/Addendum) with continuity rules (ProjectType + reporting scope).
- [x] Add project kind (Langsung/Subcon) (ProjectContractType + select di form project).
- [x] Add job type (Operasional/Proyek-Konstruksi/Ad Hoc) (`workCategory` + select + kolom di tabel).
- [x] Add warranty duration (months) (`warrantyMonths` di schema + form + kolom list project).
- [ ] Evaluate and, jika dibutuhkan, implement multi-select jenis pekerjaan (saat ini single-select `workCategory` sudah aktif).

### 6.5 Client & User Data Completeness (CLIENT/USER-FIELDS)

- [ ] Client website field.
- [ ] User company field for client accounts.
- [ ] User address field.

### 6.6 My Profile (MP-01)

- [ ] Profile view with editable personal info.
- [ ] Avatar upload.

### 6.7 Notifications (NT-01/NT-02/NT-03)

- [x] Notification schema + creation service.
- [x] Limit exceed alerts on log sheet submission.
- [x] Notification bell + unread count UI.

### 6.8 Digital Signatures Expansion (DS-EXT, Lowest Priority)

- [x] Extend digital signatures to Work Reports (technician and approval signatures on print).
- [ ] Extend digital signatures to Summary Reports (sign-off area on print).
- Keep this as the lowest-priority item after all other roadmap gaps are closed.

### 6.9 Client Portal Read-Only UX (CP-01)

- [ ] Read-only dashboard for client roles (summary only).
