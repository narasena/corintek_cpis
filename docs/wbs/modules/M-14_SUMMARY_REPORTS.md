# WBS Deep Scan: M-14 — Summary Reports

> **Module:** M-14 (Summary Reports)
> **Epic:** EP-012 (Monthly Summary Reporting)
> **Accuracy:** Deep Scan (100% file coverage)
> **Date:** 2026-03-04

---

## EP-012: Monthly Summary Reporting

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-012** | — | **Epic** | **Monthly Summary Reporting** | **—** | **—** | **—** | **Σ** |
| **US-012-001** | EP-012 | **User Story** | **As a reporting officer, I want to generate monthly summary reports for clients** | **—** | **—** | **—** | **Σ** |
| AC-012-001 | US-012-001 | Acceptance Criteria | Orchestrated report generation with TOC, chapters, and client attachments | — | — | — | Σ |
| **WP-012-001** | AC-012-001 | **Work Package** | **Frontend (Reporting UI)** | **—** | **—** | **—** | **Σ** |
| TK-012-001 | WP-012-001 | Task | SummaryReportsPage: project/period selection, notes, and chapter toggles | 2 | 3.5 | 6 | 3.75 |
| TK-012-002 | WP-012-001 | Task | SummaryReportsPage: client attachment upload (R2) form & progress state | 1.5 | 3 | 5 | 3.08 |
| TK-012-003 | WP-012-001 | Task | SummaryReportPrintPage: formal layout with TOC and cover page | 1.5 | 3 | 5 | 3.08 |
| TK-012-004 | WP-012-001 | Task | SummaryReportPrintPage: aggregation logic for log sheets/lab/work reports | 2 | 4 | 7 | 4.17 |
| TK-012-005 | WP-012-001 | Task | AttachmentPackPrintPage: dedicated view for PDF/Image pack with object/iframe | 1 | 2 | 4 | 2.17 |
| **WP-012-002** | AC-012-001 | **Work Package** | **Backend (Aggregation Logic)** | **—** | **—** | **—** | **Σ** |
| TK-012-006 | WP-012-002 | Task | Aggregation service: fetching logs/lab/work data with UTC period logic | 2 | 4 | 7 | 4.17 |
| TK-012-007 | WP-012-002 | Task | getProjectReportingScope: multi-project aggregation logic (Utama Addendum) | 1.5 | 3 | 5 | 3.08 |
| TK-012-008 | WP-012-002 | Task | Chemical usage summary calculator (Map aggregation by chemicalId) | 1 | 2 | 3 | 2.00 |
| TK-012-009 | WP-012-002 | Task | Summary report server actions: create, update, and fetch by period | 1 | 2 | 4 | 2.17 |
| TK-012-010 | WP-012-002 | Task | R2 attachment upload action with filename sanitization and bearer auth | 1.5 | 3 | 5 | 3.08 |
| **WP-012-003** | AC-012-001 | **Work Package** | **Database** | **—** | **—** | **—** | **Σ** |
| TK-012-011 | WP-012-003 | Task | SummaryReport model: unique constraint, status enum, and URL fields | 0.5 | 1.5 | 3 | 1.67 |
| **WP-012-004** | AC-012-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-012-012 | WP-012-004 | Task | Aggregation service unit tests (date ranges, scoped projects) | 1.5 | 3 | 5 | 3.08 |

---

### File Manifest — M-14: Summary Reports

| #   | File                                                                         | Lines | Functions | Covered By | Complexity             |
| :-- | :--------------------------------------------------------------------------- | ----: | --------: | :--------- | :--------------------- |
| 1   | `prisma/schema/summary-reports.prisma`                                       |    31 |         0 | TK-012-011 | Standard               |
| 2   | `src/features/summary-reports/service.ts`                                    |   262 |        10 | TK-012-006 | 🔗 Integration-heavy   |
| 3   | `src/features/summary-reports/actions.ts`                                    |   238 |         5 | TK-012-009 | 🔗 Integration-heavy   |
| 4   | `src/features/summary-reports/types.ts`                                      |    30 |         0 | TK-012-009 | Standard               |
| 5   | `src/app/(main)/summary-reports/page.tsx`                                    |   312 |         1 | TK-012-001 | 📋 Business rules      |
| 6   | `src/app/(main)/summary-reports/[projectId]/[period]/print/page.tsx`         |   415 |         1 | TK-012-003 | 🔗 Integration-heavy   |
| 7   | `src/app/(main)/summary-reports/[projectId]/[period]/attachments/print/page.tsx` |   158 |         1 | TK-012-005 | Standard               |

---

### Confidence: 100%

**Justification:**

- Files scanned: 7/7 (100%)
- Functions covered: All aggregation and action logic mapped.
- Gaps: None. All print views and backend services read in full.
- Cross-ref vs fast scan: Matched basic tasks, added database schema and project scope logic (Utama Addendum).

**Status:** 🟢 High Confidence
