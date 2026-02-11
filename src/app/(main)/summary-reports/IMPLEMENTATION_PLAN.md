# Summary Report MVP Implementation Plan

## Goal

Deliver a printable, multi-page monthly Summary Report per project that includes:

1. Cover Page
2. Table of Contents
3. Bab I — Executive Summary Report
4. Bab II — Log Sheet Reports
5. Bab III — Analisa Laboratorium
6. Bab IV — Work Reports
7. Bab V — Chemical Reports

The report is rendered as web pages optimized for browser print (no PDF engine).

## Current WIP Snapshot

Existing implementation already provides:

- Summary Report selector UI and creation flow
- Summary Report print route with cover page, table of contents, and basic per-section lists
- Service layer for month filtering and summary aggregation

Key files:

- Summary report selector page: src/app/(main)/summary-reports/page.tsx
- Print page: src/app/(main)/summary-reports/[projectId]/[period]/print/page.tsx
- Actions: src/features/summary-reports/actions.ts
- Services: src/features/summary-reports/service.ts
- Prisma model: prisma/schema/summary-reports.prisma

## Status Update (2026-02-11)

- **Bab II (Log Sheets)**: ✅ Implemented. Now renders full log sheet previews per page instead of a summary list.
- **Timezone Handling**: ✅ Fixed. Service now uses UTC month boundaries to prevent date shift issues.
- **Print Layout**: ✅ Optimized for A4 with `break-before-page`.

## Constraints

- No PDF generation backend
- Use browser-native print (print CSS/Tailwind print: modifiers)
- A4 layout, 210mm x 297mm, multi-page flow
- Server Actions only for internal data
- Use existing feature services and Prisma relations

## Implementation Plan

### 1) Validate existing flow and stabilize inputs

- [x] Keep summary-reports/page.tsx as the entry point for report generation.
- [x] Ensure the month input always submits YYYY-MM and is converted to UTC month start in the action.
- [x] Persist section toggles and notes in SummaryReport so the print page is deterministic.

### 2) Define report section rendering strategy

Decision for MVP:

- Bab II–IV should embed the existing print sections for each record in the month.
- Bab V shows a monthly chemical usage summary table (per chemical).

### 3) Data fetching design (server-side)

- [x] getMonthlyLogSheets(projectId, period)
- [x] getMonthlyLabAnalyses(projectId, period)
- [x] getMonthlyWorkReports(projectId, period)
- [x] getMonthlyChemicalUsageSummary(projectId, period)
- [x] **Fix:** Date range uses UTC month boundaries (Implemented)

### 4) Print page layout upgrade

Update src/app/(main)/summary-reports/[projectId]/[period]/print/page.tsx

#### 4.1 Cover Page

- [x] Keep current cover page design
- [x] Force full A4 height with min-h-[297mm]

#### 4.2 Table of Contents

- [x] Generate TOC items based on included sections

#### 4.3 Bab I — Executive Summary

- [x] Keep counts (log sheets, lab analyses, work reports, chemicals)
- [x] Add notes block if provided

#### 4.4 Bab II — Log Sheet Reports

- [x] Replace list with embedded printable pages per log sheet
- [x] Strategy:
  - [x] For each monthly log sheet, render the existing log sheet print component/page body
  - [x] Ensure each log sheet starts on a new page (break-before-page)
  - [x] Include photos if the log sheet print layout supports it

#### 4.5 Bab III — Analisa Laboratorium

- [x] Replace list with embedded LabAnalysisPrint per analysis
- [x] Each lab analysis starts on a new page

#### 4.6 Bab IV — Work Reports

- [x] Replace list with embedded WorkReportPreview per report
- [x] Ensure each work report starts on a new page

#### 4.7 Bab V — Chemical Reports

- [x] Show monthly summary table from getMonthlyChemicalUsageSummary (Implemented as table/list)

### 5) Add summary report section wrappers

- [x] Create small wrapper components in the print page for each chapter

### 6) Integration with existing print components

- [x] Log sheet print component (Verified and Integrated)
- [x] LabAnalysisPrint
- [x] WorkReportPreview

### 7) Navigation and print UX

- [x] Keep PrintButton and back navigation hidden in print mode
- [x] Ensure layout uses print:hidden, print:p-0, print:bg-white
- [x] Ensure each chapter starts on a new page using break-before-page

### 8) Verification checklist

- [x] Load Summary Report page, select project + month, include all sections
- [x] Print preview shows:
  - Cover page
  - TOC
  - Bab I–V in correct order
  - Each report starts on a new page
