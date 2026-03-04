# WBS Module: M-10 — Attendance & Absence Management

> Epic: EP-007

## 1. File Manifest

| File Path | Lines | Scope / Purpose |
| :--- | --: | :--- |
| `prisma/schema/attendance.prisma` | 20 | `Attendance` model & `AttendanceStatus` enum |
| `src/features/attendance/types.ts` | 24 | Zod filter schemas & TypeScript input types |
| `src/features/attendance/service.ts` | 120 | Clock-in/out CRUD, total hours calc, list, CSV export |
| `src/features/attendance/actions.ts` | 140 | Server Actions, R2 photo upload integration, cache revalidation |
| `src/app/(main)/attendance/page.tsx` | 230 | Technician UI: Real-time status, Camera integration, State management |
| `src/app/(main)/attendance/admin/page.tsx` | 200 | Admin UI: Filterable list (date/tech), CSV download logic |
| `src/app/(main)/attendance/admin/components/columns.tsx` | 70 | DataTable column definitions & status badges |
| `src/app/(main)/absence/page.tsx` | 5 | Simple redirect to `/attendance` |

## 2. WBS Table (PERT) — EP-007

| ID | Parent | Type | Item | O | L | P | E |
| :-- | :----- | :--- | :--- | --: | --: | --: | --: |
| **EP-007** | — | **Epic** | **Attendance & Absence Management** | **—** | **—** | **—** | **Σ 23.16** |
| **US-007-001** | EP-007 | **User Story** | **As a technician, I want to clock in/out with a photo to record my attendance** | **—** | **—** | **—** | **Σ 15.00** |
| AC-007-001 | US-007-001 | Acceptance | Capture photo from camera or gallery (square crop) | — | — | — | — |
| AC-007-002 | US-007-001 | Acceptance | Auto-calculate total hours worked upon clock-out | — | — | — | — |
| AC-007-003 | US-007-001 | Acceptance | Restrict to one entry per user per day (`dateLocal`) | — | — | — | — |
| TK-007-001 | US-007-001 | Database | Prisma schema for Attendance & unique constraints | 0.5 | 1.5 | 3.0 | 1.58 |
| TK-007-002 | US-007-001 | Backend | Service layer (clock-in/out logic, hour calculation) | 2.0 | 4.0 | 7.0 | 4.17 |
| TK-007-003 | US-007-001 | Backend | Server Actions (R2 photo upload, cache revalidation) | 1.5 | 3.0 | 5.0 | 3.08 |
| TK-007-004 | US-007-001 | Frontend | Technician Attendance UI (Camera integration, status state) | 2.0 | 6.0 | 10.0 | 6.17 |
| **US-007-002** | EP-007 | **User Story** | **As an admin, I want to review technician attendance and export logs** | **—** | **—** | **—** | **Σ 4.08** |
| AC-007-004 | US-007-002 | Acceptance | Filter attendance by date range and technician | — | — | — | — |
| AC-007-005 | US-007-002 | Acceptance | Export filtered list to CSV format with BOM support | — | — | — | — |
| TK-007-005 | US-007-002 | Backend | List attendance query & CSV export logic (service.ts) | 1.5 | 3.0 | 5.0 | 3.08 |
| TK-007-006 | US-007-002 | Frontend | Admin Dashboard UI (DataTable, filter controls, CSV trigger) | 1.5 | 4.0 | 7.0 | 4.08 |
| **WP-007-001** | EP-007 | **Work Package**| **Testing & QA** | **—** | **—** | **—** | **Σ 4.08** |
| TK-007-007 | WP-007-001 | Testing | Characterization tests for hour calculation & photo upload | 2.0 | 4.0 | 7.0 | 4.08 |

## 3. Confidence Assessment

- **Confidence Score:** 95% [🟢]
- **Reasoning:**
    - Source code read in full for all 8 files.
    - Integration points with Infrastructure (Camera, R2, Image Compression) identified.
    - Timezone (`Asia/Jakarta`) logic verified in code.
    - No significant fabrication; all WBS tasks map directly to observed logic in `actions.ts`, `service.ts`, and UI components.
- **Cross-ref Fast Scan:**
    - Fast scan total for EP-007: 16.5 hours.
    - Deep scan total for EP-007: 23.16 hours.
    - Delta: +6.66 hours (Better accounting for R2 upload complexity, technician UI state management, and characterization tests).
