# CPIS WBS — Module Scan: M-03 Shared Components & Infrastructure

## EP-016: Infrastructure & Foundation

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-016** | — | **Epic** | **Infrastructure & Foundation** | **—** | **—** | **—** | **Σ** |
| **US-016-002** | EP-016 | **User Story** | **As a developer, I want a set of reusable UI primitives to ensure visual consistency** | **—** | **—** | **—** | **Σ** |
| AC-016-002 | US-016-002 | Acceptance Criteria | Standardized DataTable, CrudDialog, and ActionCell components | — | — | — | Σ |
| **WP-016-002** | AC-016-002 | **Work Package** | **Frontend (Shared UI Primitives)** | **—** | **—** | **—** | **Σ** |
| TK-016-014 | WP-016-002 | Task | DataTable: implementation with TanStack Table, sorting, pagination & mobile card view | 4 | 6 | 10 | 6.33 |
| TK-016-015 | WP-016-002 | Task | CrudDialog: responsive wrapper for shadcn dialog with success/cancel callbacks | 1 | 2 | 4 | 2.17 |
| TK-016-016 | WP-016-002 | Task | ActionCell: dropdown menu for Edit/Delete with AlertDialog confirmation | 1.5 | 3 | 5 | 3.08 |
| TK-016-017 | WP-016-002 | Task | AppSidebar: collapsible navigation with RBAC filtering & NavMain/NavUser | 2 | 4 | 6 | 4.00 |
| TK-016-018 | WP-016-002 | Task | MobileNav: bottom navigation with RBAC filtering for technician mobile access | 1 | 2 | 3 | 2.00 |
| TK-016-019 | WP-016-002 | Task | CameraInput: browser-native camera access, 1:1 square cropping & WebP compression | 3 | 5 | 8 | 5.17 |
| TK-016-020 | WP-016-002 | Task | MultiSelect: combobox with search and removable badges | 1.5 | 2.5 | 4 | 2.67 |
| TK-016-021 | WP-016-002 | Task | DatePicker: shadcn calendar wrapper with locale-id support | 0.5 | 1 | 2 | 1.08 |
| TK-016-022 | WP-016-002 | Task | MachineFormSection: complex field array management for machine lists in projects | 2 | 4 | 7 | 4.17 |
| TK-016-023 | WP-016-002 | Task | SignaturePreview: component for displaying signed photos with metadata | 0.5 | 1 | 2 | 1.08 |
| TK-016-024 | WP-016-002 | Task | MetricLineChart: reusable Recharts wrapper with empty states and line config | 1.5 | 3 | 5 | 3.08 |
| TK-016-025 | WP-016-002 | Task | RootLayout & MainLayout: app shell orchestration with sticky header and sidebar | 1.5 | 3 | 5 | 3.08 |
| **US-016-003** | EP-016 | **User Story** | **As a developer, I want core utility functions to handle auth, RBAC, and file operations** | **—** | **—** | **—** | **Σ** |
| AC-016-003 | US-016-003 | Acceptance Criteria | Centralized RBAC matrix, JWT handling, and R2 upload utilities | — | — | — | Σ |
| **WP-016-003** | AC-016-003 | **Work Package** | **Backend (Core Logic & Infrastructure)** | **—** | **—** | **—** | **Σ** |
| TK-016-026 | WP-016-003 | Task | RBAC: implementation of role matrix, resource mapping, and access guard helpers | 2 | 4 | 7 | 4.17 |
| TK-016-027 | WP-016-003 | Task | Auth Helpers: JWT session management, cookie handling, and actor retrieval | 1.5 | 3 | 5 | 3.08 |
| TK-016-028 | WP-016-003 | Task | JWT Utility: sign/verify implementation using jose library | 0.5 | 1 | 2 | 1.08 |
| TK-016-029 | WP-016-003 | Task | Action Helpers: standardized ActionResult types and error logging for server actions | 0.5 | 1 | 2 | 1.08 |
| TK-016-030 | WP-016-003 | Task | Image Compression Engine (V2): canvas-based WebP compression with smart resizing | 2 | 3 | 5 | 3.17 |
| TK-016-031 | WP-016-003 | Task | R2 Upload: client-side fetch integration with Cloudflare Worker API | 0.5 | 1 | 2 | 1.08 |
| TK-016-032 | WP-016-003 | Task | Prisma Infrastructure: singleton client setup and shared select fragments | 1 | 2 | 3 | 2.00 |

---

### File Manifest — M-03: Shared Components & Infrastructure

| # | File | Lines | Functions | Covered By | Complexity |
| :-- | :--- | ---: | ---: | :--- | :--- |
| 1 | `src/lib/action-helpers.ts` | 40 | 3 | TK-016-029 | Standard |
| 2 | `src/lib/auth-helpers.ts` | 120 | 6 | TK-016-027 | 📋 Business rules |
| 3 | `src/lib/jwt.ts` | 60 | 3 | TK-016-028 | Standard |
| 4 | `src/lib/prisma.ts` | 30 | 0 | TK-016-032 | Standard |
| 5 | `src/lib/r2-upload.ts` | 40 | 1 | TK-016-031 | 🔗 Integration-heavy |
| 6 | `src/lib/rbac.ts` | 220 | 6 | TK-016-026 | 📋 Business rules |
| 7 | `src/lib/utils.ts` | 40 | 3 | TK-016-025 | Standard |
| 8 | `src/lib/utils/image-compression.ts`| 120 | 4 | TK-016-030 | ⚠️ Deceptively complex |
| 9 | `src/lib/utils/user.ts` | 20 | 2 | TK-016-025 | Standard |
| 10 | `src/lib/prisma-selects.ts` | 70 | 0 | TK-016-032 | Standard |
| 11 | `src/hooks/use-mobile.ts` | 25 | 1 | TK-016-018 | Standard |
| 12 | `src/hooks/use-image-compression.ts`| 50 | 1 | TK-016-030 | Standard |
| 13 | `src/components/data-table.tsx` | 260 | 2 | TK-016-014 | ⚠️ Deceptively complex |
| 14 | `src/components/crud-dialog.tsx` | 60 | 1 | TK-016-015 | Standard |
| 15 | `src/components/action-cell.tsx` | 100 | 1 | TK-016-016 | Standard |
| 16 | `src/components/app-sidebar.tsx` | 100 | 1 | TK-016-017 | 📋 Business rules |
| 17 | `src/components/mobile-nav.tsx` | 60 | 1 | TK-016-018 | Standard |
| 18 | `src/components/camera-input.tsx` | 300 | 1 | TK-016-019 | 🔗 Integration-heavy |
| 19 | `src/components/date-picker.tsx` | 45 | 1 | TK-016-021 | Standard |
| 20 | `src/components/multi-select.tsx` | 110 | 1 | TK-016-020 | ⚠️ Deceptively complex |
| 21 | `src/components/print-button.tsx` | 12 | 1 | TK-016-025 | Standard |
| 22 | `src/components/signature/signature-preview.tsx` | 45 | 1 | TK-016-023 | Standard |
| 23 | `src/components/machine-form-section.tsx` | 200 | 2 | TK-016-022 | 📋 Business rules |
| 24 | `src/app/layout.tsx` | 30 | 1 | TK-016-025 | Standard |
| 25 | `src/app/(main)/layout.tsx` | 60 | 1 | TK-016-025 | Standard |
| 26 | `src/app/(main)/_components/metric-line-chart.tsx` | 75 | 1 | TK-016-024 | Standard |

---

### Confidence: 98%

**Justification:**

- Files scanned: 26/26 (for infrastructure core)
- Functions covered: 100% of custom components and utilities
- Gaps: Deferred dashboard-specific chart wrappers and shadcn/ui primitives to respective epics/WP groups.
- Cross-ref vs fast scan: Identified 19 specific tasks, providing much higher granularity than the initial fast scan for EP-016. Captured complex logic in `CameraInput` and `ImageCompressionV2` that was previously underestimated.

**Status:** 🟢 High Confidence
