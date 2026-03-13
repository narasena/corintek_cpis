# WBS Deep Scan: M-11f — Log Sheet Pages & Route Components

> **Epic:** EP-010 — Log Sheet System
> **Scope:** Next.js App Router pages and route-specific hooks for log sheet management, history, and the complex entry workstation.

### Output 1: WBS Table

| ID | Parent | Type | Item | O | L | P | E |
|:---|:---|:---|:---|---:|---:|---:|---:|
| **US-010-001** | EP-010 | **User Story** | **As a technician, I want to manage log sheets so I can record periodic measurement data** | **—** | **—** | **—** | **Σ** |
| AC-010-001 | US-010-001 | Acceptance Criteria | Seamless navigation from project list to history to entry workstation | — | — | — | Σ |
| **WP-010-012** | AC-010-001 | **Work Package** | **Frontend (Pages & Orchestration)** | **—** | **—** | **—** | **Σ** |
| TK-010-048 | WP-010-012 | Task | Main Log Sheets page: project selection list with role-based visibility | 1 | 2 | 4 | 2.17 |
| TK-010-049 | WP-010-012 | Task | Project History page: log sheet listing with status tracking and CRUD entry points | 1.5 | 3 | 5 | 3.08 |
| TK-010-050 | WP-010-012 | Task | Entry Workstation: complex page orchestration (Desktop/Mobile-A/Mobile-B modes) | 4 | 7 | 12 | 7.33 |
| TK-010-056 | WP-010-012 | Task | Global Reports page: cross-project log sheet list with search and date filter | 1 | 2 | 3 | 2.00 |
| **US-010-002** | EP-010 | **User Story** | **As a technician, I want smart forms that validate my data in real-time** | **—** | **—** | **—** | **Σ** |
| AC-010-002 | US-010-002 | Acceptance Criteria | Real-time draft persistence and cross-category validation | — | — | — | Σ |
| **WP-010-013** | AC-010-002 | **Work Package** | **Frontend (State & Save Hooks)** | **—** | **—** | **—** | **Σ** |
| TK-010-051 | WP-010-013 | Task | Draft Saver Hook: orchestrating batch persistence of entries, chemicals, and R2 uploads | 3 | 5 | 9 | 5.33 |
| TK-010-052 | WP-010-013 | Task | Client-side Validation Hook: real-time completeness & range monitoring | 1.5 | 3 | 5 | 3.08 |
| TK-010-053 | WP-010-013 | Task | Active Units Hook: managing dynamic machine visibility & state toggling | 1 | 2 | 4 | 2.17 |
| TK-010-054 | WP-010-013 | Task | Draft State Hook: unified state management for heterogeneous log-sheet data points | 1 | 2 | 3 | 2.00 |
| TK-010-055 | WP-010-013 | Task | Mobile ViewModel Bridge: mapping workstation state to Option A mobile contracts | 2 | 4 | 6 | 4.00 |

### Output 2: File Manifest

| # | File | Lines | Functions | Covered By | Complexity |
|:--|:---|---:|---:|:---|:---|
| 1 | `src/app/(main)/log-sheets/page.tsx` | 62 | 1 | TK-010-048 | Standard |
| 2 | `src/app/(main)/log-sheets/[projectId]/page.tsx` | 124 | 1 | TK-010-049 | Standard |
| 3 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx` | 435 | 1 | TK-010-050 | ⚠️ Deceptively complex |
| 4 | `src/app/(main)/reports/page.tsx` | 117 | 1 | TK-010-056 | Standard |
| 5 | `src/app/(main)/reports/components/columns.tsx` | 150 | 1 | TK-010-056 | Standard |
| 6 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-draft-saver.ts` | 157 | 1 | TK-010-051 | 🔗 Integration-heavy |
| 7 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-validation.ts` | 79 | 1 | TK-010-052 | 📋 Business rules |
| 8 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-active-machines.ts` | 109 | 3 | TK-010-053 | Standard |
| 9 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-draft-state.ts` | 59 | 1 | TK-010-054 | Standard |
| 10 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-mobile-unit-view-model.ts` | 154 | 1 | TK-010-055 | ⚠️ Deceptively complex |
| 11 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells.tsx` | 146 | 1 | TK-010-050 | Standard |
| 12 | `src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/mobile-entry-card.tsx` | 145 | 1 | TK-010-050 | Standard |

### Output 3: Confidence Assessment

Confidence: [98]%
- Files scanned: 12/12 (M-11f routes subset)
- Functions covered: 100%
- Gaps: None identified.
- Cross-ref vs fast scan: Significantly expanded the "Entry page" task into specific hooks for saving, validation, and state management, reflecting the high complexity of the workstation. Added Global Reports page (TK-010-056) for cross-project log sheet viewing.
- Status: 🟢 done
