# Backlog — BACKLOG.md

> CPIS — Corintek Project Information System

**Purpose:** Detailed specs for upcoming features.  
**Usage:** Reference with `@BACKLOG.md` when implementing specific scope IDs.

---

## PARAM-CAT-01 — Parameter Limit Profile Refactor

**Source:** ROADMAP.md v0.2.0  
**Priority:** 🚨 P0 (Critical)  
**Status:** ✅ Complete

### Background

Current implementation stores global limits directly on `Parameter` model. FSD Section 7.1 requires reusable limit categories (profiles) that can be assigned per-project.

### Schema Changes (COMPLETED)

- [x] Renamed `ParameterLimitCategory` → `ParameterLimitProfile` (clearer naming)
- [x] Renamed table `parameter_limit_categories` → `parameter_limit_profiles`
- [x] Removed `minValue`, `maxValue`, `rawWaterMinValue`, `rawWaterMaxValue` from `Parameter` model
- [x] All limits now stored in `ParameterLimit` table linked to `ParameterLimitProfile`
- [x] Added `parameterLimitProfileId` to `Project` schema

### Implementation Complete

- [x] Run `npm run prisma:migrate` to apply schema to database
- [x] Fix TypeScript build errors in all affected files
- [x] Recreate tabs UI for Parameters page:
  - Tab 1: Parameter List
  - Tab 2: Limit Defaults (per-parameter master defaults)
  - Tab 3: Profiles (profile management with tabs)
- [x] Profile dialog with tabs (Info | Limits):
  - Info tab: Edit profile metadata (name, description, isDefault)
  - Limits tab: Manage per-parameter limits for this profile
  - "Batas" button in table opens dialog directly to Limits tab
- [x] "Salin dari Master" button to seed limits from master defaults
- [x] Grouped by category with accordion (mobile-friendly)
- [x] Tested: Existing projects continue to work with profile system

### Acceptance Criteria

- [x] All existing projects continue to work after migration
- [x] New "Standard" profile created as default
- [x] Project form includes profile selection dropdown
- [x] Log sheets resolve limits from assigned profile (or override)

---

## QA — Browser UI Tests (MP-01, CP-01)

**Source:** ROADMAP.md v0.2.0  
**Priority:** 🟢 P1  
**Status:** ✅ Complete

### My Profile (MP-01) Test Cases

- [x] Avatar upload displays preview before save
- [x] Form submission updates user profile
- [x] Role-based fields hidden for CLIENT users
- [x] Validation errors show inline (not toast)

### Client Portal (CP-01) Test Cases

- [x] CLIENT user sees only assigned projects in dashboard
- [x] CLIENT user cannot access admin routes (URL guessing returns 403/redirect)
- [x] CLIENT user has read-only access (no edit buttons on Log Sheets)
- [x] Navigation shows only permitted items

---

## DB-01 — Dashboard Recent Activity

**Source:** ROADMAP.md v0.2.0 | FSD Section 1  
**Priority:** 🟡 P1  
**Status:** Not Started

### Tasks

- [ ] Create activity feed component (`dashboard/components/activity-feed.tsx`)
- [ ] Query recent log sheets, work reports, approvals (last 7 days)
- [ ] Display timestamped activity list with icons
- [ ] Filter by project scope for non-admin roles (SUPERVISOR/TECHNICIAN/CLIENT)

---

## SR-02 — Summary Report Analytics

**Source:** ROADMAP.md v0.2.0 | FSD Section D  
**Priority:** 🟡 P1  
**Status:** Not Started

### Tasks

- [ ] Aggregate water quality data (avg/min/max per parameter per month)
- [ ] Aggregate condenser approach data (avg/min/max per unit per month)
- [ ] Create data access patterns in `summary-reports/analytics-service.ts`
- [ ] Display analytics in summary report print view

---

## LS-ADJ — Log Sheet Adjustments

**Source:** ROADMAP.md v0.2.0 | FSD Section 3  
**Priority:** 🟡 P2  
**Status:** Not Started

### Tasks

- [ ] Optional video attachment upload (before/after sections)
- [ ] Verify final A4 print fit for all log sheet variants
- [ ] Inline min/max limit warnings (lightweight form validation)
- [ ] Mandatory fields mapping review vs FSD (unit selection, notes)

---

## CLIENT-FIELDS — Client Data Completeness

**Source:** ROADMAP.md v0.2.0 | FSD Form Data Klien  
**Priority:** 🟢 P3  
**Status:** ✅ Completed

### Tasks

- [x] Add `website` field to `Client` schema
- [x] Update Client form UI with website input
- [x] Update Client list columns to show website

---

## USER-FIELDS — User Data Completeness

**Source:** ROADMAP.md v0.2.0 | FSD Form User  
**Priority:** 🟢 P3  
**Status:** ✅ Completed

### Tasks

- [x] Add `company` field to `User` schema (for client accounts) — Using linked Client name via `clientId`
- [x] Add `address` field to `User` schema
- [x] Update User form UI
- [x] Update User list columns

---

## PRJ-FIELDS-02 — Work Types Multi-select

**Source:** ROADMAP.md v0.2.0 | FSD Form Project  
**Priority:** 🟢 P3  
**Status:** Not Started

### Tasks

- [ ] Evaluate operational requirement for multi-select (vs current single-select)
- [ ] If needed: Create `ProjectWorkType` junction table
- [ ] Update Project form with multi-select UI (checkboxes or multi-select dropdown)
