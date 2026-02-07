# CPIS Project Implementation Roadmap

> **Project:** Corintek Project Information System (CPIS)
> **Updated:** 2026-02-07
> **Status:** Rescue Mode - MVP Priority

---

## 0. MVP Definition (Rescue Mode)

### In Scope (MVP)

- **Users:** Internal users only (ADMIN / SUPERVISOR / TECHNICIAN).
- **Masters:** Clients, Projects, Machines, Parameters, Chemicals.
- **Log Sheets:**
  - Draft save + submit flow.
  - Photo attachments (before/after) - Max 8 photos.
  - Print (A4 single page) / Save as PDF via browser print.
- **Reporting:** Unified Reports List (find + filter).
- **[NEW] Lab Analysis:** Simple CRUD for entering lab results.
- **[NEW] Work Reports:** Ad-hoc work requests/reports (different from daily log sheets).
- **[NEW] Ops Readiness:** Seeding, Password Reset, Backups.

### Out of Scope (Defer)

- Dashboard complex charts (Project list only for MVP).
- Automated Summary Report generation (PDFs).
- Attendance module (use existing HR tools).
- Digital signatures (use paper print + sign for now).
- Notifications system (complex alerts).
- Client portal / external access.

---

## 1. Current Implementation Status

### ✅ Completed Domains

| Domain      | Schema | Service | Actions | UI  | Notes                         |
| ----------- | ------ | ------- | ------- | --- | ----------------------------- |
| Auth        | ✅     | ✅      | ✅      | ✅  | Login/session management      |
| Clients     | ✅     | ✅      | ✅      | ✅  | Full CRUD with DataTable      |
| Users       | ✅     | ✅      | ✅      | ✅  | Full CRUD, roles, soft delete |
| Parameters  | ✅     | ✅      | ✅      | ✅  | Master data with categories   |
| Projects    | ✅     | ✅      | ✅      | ✅  | Full CRUD with status         |
| Machines    | ✅     | ✅      | ✅      | ✅  | Nested in Projects form       |
| Chemicals   | ✅     | ✅      | ✅      | ✅  | Master CRUD + Usage in LS     |
| Worker (R2) | ✅     | ✅      | N/A     | N/A | Basic upload API ready        |

### ✅ Log Sheets Domain (Mostly Complete)

| Feature                    | Status | File/Component                                                |
| -------------------------- | ------ | ------------------------------------------------------------- |
| Unified Reports List       | ✅     | `/reports/page.tsx`                                           |
| Log Sheet List per Project | ✅     | `/log-sheets/[projectId]/page.tsx`                            |
| Create Log Sheet Dialog    | ✅     | `log-sheet-dialog.tsx`, `log-sheet-form.tsx`                  |
| Log Sheet Detail/Edit      | ✅     | `/log-sheets/[projectId]/[logSheetId]/page.tsx` (~1000 lines) |
| Unit Condensor Entry       | ✅     | Per-chiller entries with limits                               |
| Unit Evaporator Entry      | ✅     | Per-chiller entries with limits                               |
| Cooling Water Quality      | ✅     | Per-CT entries + Raw Water column                             |
| General Condition          | ✅     | Per-CT boolean entries + notes                                |
| Job Description            | ✅     | Per-CT boolean entries + notes                                |
| Consumption                | ✅     | Water meter before/after                                      |
| Photo Attachments          | ✅     | Before/After sections, max 8, preview support                 |
| Chemical Fill-up           | ✅     | Master data + Log Sheet integration                           |
| Print Preview Mode         | ✅     | `log-sheet-preview.tsx`                                       |

---

## 2. Detailed Roadmap (Prioritized)

### 🚨 P0: MVP (MUST HAVE) - _The "Go Live" Blocker List_

These tasks are absolutely critical for the system to be usable in production.

#### 2.1 [NEW] Ops Readiness (Hidden Agenda)

**Scope ID:** `OPS-01` (Database Seeding)
**Why:** Cannot deploy without initial Admin user & default categories.
**Tasks:**

- [ ] Create `prisma/seed.ts` script
- [ ] Seed default Admin user (`admin@corintek.com`)
- [ ] Seed default Parameter Categories
- [ ] Seed default Chemical Categories

**Scope ID:** `OPS-02` (Password Reset)
**Why:** No "Forgot Password" flow; Admins must be able to reset technician passwords manually.
**Tasks:**

- [ ] Add "Reset Password" button in User Management table
- [ ] Server Action to hash new password and update DB
- [ ] Toast notification with new password

**Scope ID:** `OPS-03` (Backup Plan)
**Why:** High risk in "Rescue Mode"; need manual safety net.
**Tasks:**

- [ ] Document manual `pg_dump` / `psql` restore procedure in README
- [ ] Verify backup restoration on dev DB

#### 2.2 [NEW] Work Reports (Log Sheet Request)

**Scope ID:** `WR-01`
**Why:** Technicians need to report ad-hoc repairs/requests separate from daily checklists.
**Estimated Prompts:** 2-3
**Tasks:**

- [ ] Create `WorkReport` schema
  - Fields: `projectId`, `machineIds[]`, `date`, `situation`, `workDone`, `workResult`
- [ ] Create Service and Server Actions
- [ ] Create List Page (per project) and Create/Edit Form
- [ ] Integrate Photo Attachments (reuse `LogSheetPhoto` logic)
- [ ] Create Print Preview page

#### 2.3 [NEW] Lab Analysis (Hasil Analisa Lab)

**Scope ID:** `LB-01`
**Why:** Critical for tracking water quality results from lab.
**Estimated Prompts:** 2
**Tasks:**

- [ ] Create `LabAnalysis` schema
- [ ] Create Manual Entry Form
  - Fields: `Attention`, `Cc`, `Customer`, `Address`, `Parameter`, `Test Result`
- [ ] Link to Project/Client
- [ ] List View per Project

#### 2.4 Log Sheet Completions

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
**Estimated Prompts:** 1
**Tasks:**

- [ ] Create `ProjectDocument` schema or similar
- [ ] Upload sections for scanned documents:
  - Data temuan
  - Data blowdown silang
  - Data suhu
  - Surat jalan
- [ ] Store in R2, link to Project
- [ ] PDF preview/download UI

#### 3.2 Basic Dashboard

**Scope ID:** `DB-01`
**Estimated Prompts:** 1
**Tasks:**

- [ ] Dashboard layout with project cards/stats
- [ ] Active projects count
- [ ] Quick status indicators
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

- [ ] Prevent editing log sheets after status = SUBMITTED/APPROVED
- [ ] Allow Admin override

---

### 📉 P2: COULD HAVE (DEFERRED) - _Nice to have_

These are planned but moved to "Phase 2" to prioritize the rescue mission.

#### 4.1 Attendance (Absensi)

**Scope ID:** `AB-01` (Schema & Service)
**Tasks:**

- [ ] Create `Attendance` schema (userId, clockIn, clockOut, photos)
- [ ] Service and actions for clock-in/out

**Scope ID:** `AB-02` (UI)
**Tasks:**

- [ ] Clock In/Out button with photo capture
- [ ] Today's record display

**Scope ID:** `AB-03` (Admin)
**Tasks:**

- [ ] Admin view of attendance records
- [ ] Export to Excel

#### 4.2 Notifications

**Scope ID:** `NT-01` (System)
**Tasks:**

- [ ] Create `Notification` schema
- [ ] Service for creating notifications

**Scope ID:** `NT-02` (Limit Alerts)
**Tasks:**

- [ ] On entry save, check against limits
- [ ] Create notification if exceeded

**Scope ID:** `NT-03` (UI)
**Tasks:**

- [ ] Notification bell in header
- [ ] Dropdown with unread count

#### 4.3 Digital Signatures

**Scope ID:** `DS-01` (Component)
**Tasks:**

- [ ] Install signature pad library
- [ ] Reusable SignaturePad component

**Scope ID:** `DS-02` (Integration)
**Tasks:**

- [ ] Technician signature field in Log Sheet
- [ ] Supervisor approval signature

#### 4.4 Dashboard Expansion

**Scope ID:** `DB-02` (Historical Charts)
**Tasks:**

- [ ] Install charting library
- [ ] Query historical log sheet entries
- [ ] Charts: Approach data (Condenser/Evaporator)

**Scope ID:** `DB-03` (Photo Gallery)
**Tasks:**

- [ ] Recent photos carousel
- [ ] Sorted by date

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

**Scope ID:** `CP-01` (Client Portal)
**Tasks:**

- [ ] Filtered views for CLIENT role
- [ ] Read-only dashboard

**Scope ID:** `AC-01` (RBAC)
**Tasks:**

- [ ] Implement user matrix per FSD Section 10
- [ ] Middleware role checks

---

## 5. Notes from FSD Review

### Features Explicitly in FSD but Not Yet Implemented:

1.  **Work Report / Log Sheet Request (WR-\*)** - Separate form for ad-hoc work. (Added to P0)
2.  **Hasil Analisa Lab (LB-01)** - Lab analysis results form. (Added to P0)
3.  **Attendance/Absensi (AB-\*)** - Clock in/out with photo validation. (Deferred to P2)
4.  **Digital Signature (DS-\*)** - For log sheet approval. (Deferred to P2)
5.  **Notifications (NT-\*)** - When values exceed parameter limits. (Deferred to P2)
6.  **Project Personnel Assignment** - PIC Corintek, PIC Klien, Technicians. (Deferred to P2)
7.  **User Matrix/RBAC** - Different access levels per role. (Deferred to P2)

### Project Fields in FSD but May Need Review:

- **Tipe Project:** Utama vs Addendum (addendum continues from main project)
- **Jenis Project:** Langsung vs Subcon
- **Pekerjaan:** Operasional, Proyek/Konstruksi, Ad Hoc
- **Warranty:** X months warranty period
