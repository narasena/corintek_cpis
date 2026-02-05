# CPIS Project Implementation Roadmap

> **Project:** Corintek Project Information System (CPIS)  
> **Updated:** 2026-02-04  
> **Status:** Rescue Mode - MVP Priority

---

## 1. Current Implementation Status

### ✅ Completed Domains

| Domain            | Schema | Service | Actions | UI  | Notes                          |
| ----------------- | ------ | ------- | ------- | --- | ------------------------------ |
| Auth              | ✅     | ✅      | ✅      | ✅  | Login/session management       |
| Clients           | ✅     | ✅      | ✅      | ✅  | Full CRUD with DataTable       |
| Users             | ✅     | ✅      | ✅      | ✅  | Full CRUD, roles, soft delete  |
| Parameters        | ✅     | ✅      | ✅      | ✅  | Master data with categories    |
| Projects          | ✅     | ✅      | ✅      | ✅  | Full CRUD with status          |
| Machines          | ✅     | ✅      | ✅      | ✅  | Nested in Projects form        |
| Worker (R2)       | ✅     | ✅      | N/A     | N/A | Basic upload API ready         |
| Image Compression | N/A    | ✅      | N/A     | ✅  | V2 Engine (WebP) with resizing |

### ✅ Log Sheets Domain (Mostly Complete)

| Feature                    | Status | File/Component                                                |
| -------------------------- | ------ | ------------------------------------------------------------- |
| Log Sheet List per Project | ✅     | `/log-sheets/[projectId]/page.tsx`                            |
| Create Log Sheet Dialog    | ✅     | `log-sheet-dialog.tsx`, `log-sheet-form.tsx`                  |
| Log Sheet Detail/Edit      | ✅     | `/log-sheets/[projectId]/[logSheetId]/page.tsx` (~1000 lines) |
| Unit Condensor Entry       | ✅     | Per-chiller entries with limits                               |
| Unit Evaporator Entry      | ✅     | Per-chiller entries with limits                               |
| Cooling Water Quality      | ✅     | Per-CT entries + Raw Water column                             |
| General Condition          | ✅     | Per-CT boolean entries + notes                                |
| Job Description            | ✅     | Per-CT boolean entries + notes                                |
| Consumption                | ✅     | Water meter before/after                                      |
| Draft/Submit/Approve Flow  | ✅     | Status selector, save functionality                           |
| Print Preview Mode         | ✅     | `log-sheet-preview.tsx` (588 lines)                           |
| Service Layer              | ✅     | `service.ts` - CRUD + upsertEntries                           |
| Actions Layer              | ✅     | `actions.ts` - Server actions                                 |

### 🔶 Log Sheets - Remaining Tasks

| Feature                          | Status | FSD Reference                                                     |
| -------------------------------- | ------ | ----------------------------------------------------------------- |
| Photo Attachments (Before/After) | ❌     | FSD: "Mengunggah lampiran berupa foto sebelum dan sesudah"        |
| Chemical Fill-up Section         | ❌     | FSD: "Fill Up Chemical" linked to log sheet                       |
| Technician Replacement           | ❌     | FSD: "laporan teknisi yang tidak bisa masuk dan dapat digantikan" |
| Video Attachments (Optional)     | ❌     | FSD: "Mengunggah lampiran video (opsional)"                       |

---

## 2. Implementation Roadmap

Each scope is sized for **1-3 agent prompts** (~30-60 minutes each).

---

### Phase 1: Complete Log Sheet Features

#### 1.1 Photo Attachments for Log Sheet

**Scope ID:** `LS-PHOTO`  
**Estimated Prompts:** 2-3  
**Priority:** HIGH

**Tasks:**

- [ ] Create `LogSheetPhoto` schema (or add to existing)
  ```prisma
  model LogSheetPhoto {
    id          String    @id @default(uuid())
    logSheetId  String
    logSheet    LogSheet  @relation(...)
    url         String
    caption     String?
    type        PhotoType // BEFORE, AFTER
    createdAt   DateTime  @default(now())
  }
  ```
- [ ] Create ImageUpload component (reuse Worker R2 API)
- [ ] Add photo upload section in log sheet form
- [ ] Max 8 photos per log sheet (per FSD)
- [ ] Display photos in log sheet preview/print

**Dependencies:** Worker R2 ✅

---

#### 1.2 Image Compression (Client-Side) ✅

**Scope ID:** `LS-COMPRESS`  
**Completed:** 2026-02-05

**Tasks:**

- [x] Add client-side image compression before upload
- [x] Use Canvas API (V2 Engine)
- [x] Target WebP format for optimal size/quality
- [x] Smart Resizing (Default 1600px)

---

#### 1.3 Chemical Fill-up Section

**Scope ID:** `LS-CHEM`  
**Estimated Prompts:** 2

**Tasks:**

- [ ] Create `Chemical` master data schema
- [ ] Create `ChemicalUsage` schema linked to LogSheet
- [ ] Add Chemical master CRUD page
- [ ] Add chemical usage section in log sheet form
- [ ] Display in log sheet preview

---

#### 1.4 Technician Replacement Feature

**Scope ID:** `LS-REPLACE`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Add `replacedByUserId` field to LogSheet or separate model
- [ ] Add "Digantikan oleh" field in log sheet form
- [ ] Display replacement info in preview

---

### Phase 2: Work Reports (Log Sheet Request Type)

Different from regular log sheets - text-based work documentation.

#### 2.1 Work Report Schema & CRUD

**Scope ID:** `WR-01`  
**Estimated Prompts:** 2

**Tasks:**

- [ ] Create `WorkReport` schema
  - Fields: projectId, machineIds[], date, situation, workDone, workResult
- [ ] Service and actions
- [ ] List page per project
- [ ] Create/Edit form

---

#### 2.2 Work Report Photos & Preview

**Scope ID:** `WR-02`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Add photo attachments (reuse LS-PHOTO component)
- [ ] Print preview page
- [ ] Max 8 photos per work report

---

### Phase 3: Dashboard

#### 3.1 Dashboard - Project Overview

**Scope ID:** `DB-01`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Dashboard layout with project cards/stats
- [ ] Active projects count
- [ ] Quick status indicators
- [ ] Recent activity

---

#### 3.2 Dashboard - Historical Charts

**Scope ID:** `DB-02`  
**Estimated Prompts:** 2-3

**Tasks:**

- [ ] Install charting library (request permission first)
- [ ] Query historical log sheet entries
- [ ] Charts: Approach data (Condenser/Evaporator)
- [ ] Date range filter
- [ ] Per-project filtering

---

#### 3.3 Dashboard - Photo Gallery

**Scope ID:** `DB-03`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Recent photos carousel
- [ ] Sorted by date
- [ ] Click to view full size

---

### Phase 4: Summary Reports

#### 4.1 Summary Report Structure

**Scope ID:** `SR-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Summary report page per project
- [ ] Sections: Executive Summary, Lab Results, Log Sheets, Photos, Chemicals
- [ ] Tab navigation

---

#### 4.2 Executive Summary Generation

**Scope ID:** `SR-02`  
**Estimated Prompts:** 2

**Tasks:**

- [ ] Aggregate water quality data per machine group
- [ ] Calculate averages, min/max for period
- [ ] Condenser approach summary tables

---

#### 4.3 Lab Results Form

**Scope ID:** `SR-03`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Manual form for lab analysis results
- [ ] Fields per FSD: Attn, Cc, Customer, Address, Parameter, Test Result
- [ ] Link to project

---

#### 4.4 PDF Scan Uploads

**Scope ID:** `SR-04`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Upload sections for scanned documents:
  - Data temuan
  - Data blowdown silang
  - Data suhu
  - Surat jalan
- [ ] PDF preview/download

---

### Phase 5: Attendance (Absensi)

#### 5.1 Attendance Schema & Service

**Scope ID:** `AB-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Create `Attendance` schema
  - Fields: userId, clockIn, clockOut, clockInPhotoUrl, clockOutPhotoUrl
  - Calculated: workHours
- [ ] Service and actions

---

#### 5.2 Attendance UI

**Scope ID:** `AB-02`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Clock In button with photo capture
- [ ] Clock Out button with photo capture
- [ ] Today's record display
- [ ] Current status indicator

---

#### 5.3 Attendance Admin & Export

**Scope ID:** `AB-03`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Admin view of all attendance records
- [ ] Filter by user, date range
- [ ] Export to Excel

---

### Phase 6: Reports List Page

#### 6.1 Reports List with Filters

**Scope ID:** `RP-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Unified reports list page
- [ ] Sort/search/filter by client, project, date
- [ ] Combined view of log sheets + work reports

---

### Phase 7: Personnel Assignment

#### 7.1 Project Personnel Assignment

**Scope ID:** `PA-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Create `ProjectPersonnel` junction table
- [ ] Fields: projectId, userId, role (PIC_CORINTEK, PIC_CLIENT, TECHNICIAN)
- [ ] UI in project form for assigning personnel

---

### Phase 8: Digital Signatures

#### 8.1 Signature Pad Component

**Scope ID:** `DS-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Install signature pad library (request permission)
- [ ] Reusable SignaturePad component
- [ ] Save as image/base64

---

#### 8.2 Signature in Log Sheet

**Scope ID:** `DS-02`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Technician signature field
- [ ] Supervisor approval signature
- [ ] Display in print view

---

### Phase 9: Notifications

#### 9.1 Notification System

**Scope ID:** `NT-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Create `Notification` schema
- [ ] Service for creating notifications
- [ ] Mark as read

---

#### 9.2 Parameter Limit Alerts

**Scope ID:** `NT-02`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] On entry save, check against limits
- [ ] Create notification if exceeded

---

#### 9.3 Notification UI

**Scope ID:** `NT-03`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Notification bell in header
- [ ] Dropdown with unread count
- [ ] Click-through to source

---

### Phase 10: User Experience & RBAC

#### 10.1 My Profile Page

**Scope ID:** `MP-01`  
**Estimated Prompts:** 1

**Tasks:**

- [ ] Profile view
- [ ] Assigned projects list
- [ ] Avatar upload

---

#### 10.2 Client Portal View

**Scope ID:** `CP-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Filtered views for CLIENT role
- [ ] Limited project access
- [ ] Read-only dashboard/reports

---

#### 10.3 Role-Based Access Control

**Scope ID:** `AC-01`  
**Estimated Prompts:** 1-2

**Tasks:**

- [ ] Implement user matrix per FSD Section 10
- [ ] Middleware role checks
- [ ] UI element visibility based on role

---

## 3. Implementation Priority Order

### Priority 1 - MVP Core (1-2 weeks)

1. **LS-PHOTO** - Photo attachments (critical for operations)
2. **LS-COMPRESS** - Image compression
3. **LS-CHEM** - Chemical tracking
4. **WR-01**, **WR-02** - Work Reports

### Priority 2 - Operations (Week 3)

1. **AB-01** to **AB-03** - Attendance
2. **RP-01** - Reports list
3. **PA-01** - Personnel assignment

### Priority 3 - Analytics (Week 4)

1. **DB-01** to **DB-03** - Dashboard
2. **SR-01** to **SR-04** - Summary Reports

### Priority 4 - Enhancement (Week 5+)

1. **DS-01**, **DS-02** - Digital Signatures
2. **NT-01** to **NT-03** - Notifications
3. **MP-01**, **CP-01**, **AC-01** - User experience

---

## 4. Quick Reference

| Scope ID    | Name                   | Phase | Est. Prompts |
| ----------- | ---------------------- | ----- | ------------ |
| LS-PHOTO    | Photo Attachments      | 1     | 2-3          |
| LS-COMPRESS | Image Compression      | 1     | 1            |
| LS-CHEM     | Chemical Fill-up       | 1     | 2            |
| LS-REPLACE  | Technician Replacement | 1     | 1            |
| WR-01       | Work Report CRUD       | 2     | 2            |
| WR-02       | Work Report Photos     | 2     | 1-2          |
| DB-01       | Dashboard Overview     | 3     | 1            |
| DB-02       | Dashboard Charts       | 3     | 2-3          |
| DB-03       | Dashboard Gallery      | 3     | 1            |
| SR-01       | Summary Structure      | 4     | 1-2          |
| SR-02       | Executive Summary      | 4     | 2            |
| SR-03       | Lab Results            | 4     | 1-2          |
| SR-04       | PDF Uploads            | 4     | 1            |
| AB-01       | Attendance Schema      | 5     | 1-2          |
| AB-02       | Attendance UI          | 5     | 1-2          |
| AB-03       | Attendance Export      | 5     | 1            |
| RP-01       | Reports List           | 6     | 1-2          |
| PA-01       | Personnel Assignment   | 7     | 1-2          |
| DS-01       | Signature Component    | 8     | 1-2          |
| DS-02       | Signature Integration  | 8     | 1            |
| NT-01       | Notification System    | 9     | 1-2          |
| NT-02       | Limit Alerts           | 9     | 1            |
| NT-03       | Notification UI        | 9     | 1            |
| MP-01       | My Profile             | 10    | 1            |
| CP-01       | Client Portal          | 10    | 1-2          |
| AC-01       | RBAC                   | 10    | 1-2          |

---

**Total Remaining:** ~30-40 agent prompts  
**Estimated Timeline:** 3-5 weeks at 2-3 hours/day

---

## 5. Notes from FSD Review

### Features Explicitly in FSD but Not Yet Implemented:

1. **Fill Up Chemical (LS-CHEM)** - FSD explicitly lists this as a log sheet section
2. **Photo/Video Attachments (LS-PHOTO)** - Required for before/after documentation
3. **Technician Replacement (LS-REPLACE)** - For when technician can't attend
4. **Work Report / Log Sheet Request (WR-\*)** - Separate form for ad-hoc work
5. **Hasil Analisa Lab (SR-03)** - Lab analysis results form
6. **Attendance/Absensi (AB-\*)** - Clock in/out with photo validation
7. **Digital Signature (DS-\*)** - For log sheet approval
8. **Notifications (NT-\*)** - When values exceed parameter limits
9. **Project Personnel Assignment** - PIC Corintek, PIC Klien, Technicians
10. **User Matrix/RBAC** - Different access levels per role

### Project Fields in FSD but May Need Review:

- **Tipe Project:** Utama vs Addendum (addendum continues from main project)
- **Jenis Project:** Langsung vs Subcon
- **Pekerjaan:** Operasional, Proyek/Konstruksi, Ad Hoc
- **Warranty:** X months warranty period
