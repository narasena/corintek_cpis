# [M-01] - [DATABASE SCHEMA] Work Breakdown Structure (WBS)

> **Module:** Database Schema Architecture
> **Architecture:** Next.js 16 + Prisma 7 + TypeScript
> **Scan Type:** DEEP SCAN
> **Date:** 2026-03-03
> **Estimation Basis:** Mid-Level Developer (Rp 85,000/hr)

---

### Output 1: WBS Table

| ID | Parent | Type | Item | O | L | P | E |
|:---|:---|:---|:---|---:|---:|---:|---:|
| **EP-M01** | — | **Epic** | **[M-01] Database Schema Architecture** | — | — | — | **Σ** |
| **US-M01-001** | EP-M01 | **User Story** | **Core System & Identity Infrastructure** | — | — | — | **Σ** |
| AC-M01-001 | US-M01-001 | Acceptance Criteria | Scalable Auth, Notification, and Attendance foundations | — | — | — | **Σ** |
| **WP-M01-001** | AC-M01-001 | **Work Package** | **Database (Schema Definitions)** | — | — | — | **Σ** |
| TK-M01-001 | WP-M01-001 | Task | Global Prisma 7 configuration & provider setup (schema.prisma) | 0.5 | 1.0 | 2.0 | 1.08 |
| TK-M01-002 | WP-M01-001 | Task | User domain: Role-based identity & system notifications | 1.0 | 2.5 | 5.0 | 2.67 |
| TK-M01-003 | WP-M01-001 | Task | Attendance domain: Geo-tagged clock-in/out schema | 0.5 | 1.5 | 3.0 | 1.67 |
| **WP-M01-002** | AC-M01-001 | **Work Package** | **Testing & QA** | — | — | — | **Σ** |
| TK-M01-004 | WP-M01-002 | Task | Schema linting & relation integrity validation | 1.0 | 2.0 | 4.0 | 2.17 |
| **US-M01-002** | EP-M01 | **User Story** | **Portfolio & Asset Management Hierarchy** | — | — | — | **Σ** |
| AC-M01-002 | US-M01-002 | Acceptance Criteria | Client-Project-Machine relational mapping | — | — | — | **Σ** |
| **WP-M01-003** | AC-M01-002 | **Work Package** | **Database (Schema Definitions)** | — | — | — | **Σ** |
| TK-M01-005 | WP-M01-003 | Task | Client & Machine domain: Asset tracking models | 1.0 | 2.0 | 4.0 | 2.17 |
| TK-M01-006 | WP-M01-003 | Task | Project domain: Addenda, Assignments, and Overrides | 1.5 | 3.5 | 6.5 | 3.67 |
| **WP-M01-004** | AC-M01-002 | **Work Package** | **Testing & QA** | — | — | — | **Σ** |
| TK-M01-007 | WP-M01-004 | Task | Unit test for Project-Addendum recursive relations | 1.5 | 3.0 | 5.0 | 3.08 |
| **US-M01-003** | EP-M01 | **User Story** | **Dynamic Parameter & Limit Framework** | — | — | — | **Σ** |
| AC-M01-003 | US-M01-003 | Acceptance Criteria | Centralized measurement hub with limit profile support | — | — | — | **Σ** |
| **WP-M01-005** | AC-M01-003 | **Work Package** | **Database (Schema Definitions)** | — | — | — | **Σ** |
| TK-M01-008 | WP-M01-005 | Task | Master Parameters: Metadata-driven value types & categories | 1.0 | 2.0 | 4.0 | 2.17 |
| TK-M01-009 | WP-M01-005 | Task | Parameter Limit Profiles: Global vs Project-specific ranges | 1.0 | 2.0 | 4.0 | 2.17 |
| **WP-M01-006** | AC-M01-003 | **Work Package** | **Testing & QA** | — | — | — | **Σ** |
| TK-M01-010 | WP-M01-006 | Task | Validation of Parameter cascade delete & limit isolation | 1.0 | 2.5 | 5.0 | 2.67 |
| **US-M01-004** | EP-M01 | **User Story** | **Field Operations Data Collection** | — | — | — | **Σ** |
| AC-M01-004 | US-M01-004 | Acceptance Criteria | Log Sheet & Lab Analysis dynamic data structures | — | — | — | **Σ** |
| **WP-M01-007** | AC-M01-004 | **Work Package** | **Database (Schema Definitions)** | — | — | — | **Σ** |
| TK-M01-011 | WP-M01-007 | Task | Log Sheet domain: Multi-role signatures & machine snapshots | 2.0 | 4.0 | 8.0 | 4.33 |
| TK-M01-012 | WP-M01-007 | Task | Lab Analysis domain: Dynamic column-entry grid architecture | 1.5 | 3.0 | 6.0 | 3.25 |
| TK-M01-013 | WP-M01-007 | Task | Chemical domain: Usage mapping & inventory relations | 0.5 | 1.5 | 3.0 | 1.67 |
| **WP-M01-008** | AC-M01-004 | **Work Package** | **Testing & QA** | — | — | — | **Σ** |
| TK-M01-014 | WP-M01-008 | Task | Data integrity check for polymorphic-style numeric/text entries | 1.5 | 3.5 | 6.0 | 3.58 |
| **US-M01-005** | EP-M01 | **User Story** | **Field Reporting & Documentation** | — | — | — | **Σ** |
| AC-M01-005 | US-M01-005 | Acceptance Criteria | Formal Work Reports and Monthly Summary aggregations | — | — | — | **Σ** |
| **WP-M01-009** | AC-M01-005 | **Work Package** | **Database (Schema Definitions)** | — | — | — | **Σ** |
| TK-M01-015 | WP-M01-009 | Task | Work Report domain: Situation/Result tracking & photos | 1.0 | 2.0 | 4.0 | 2.17 |
| TK-M01-016 | WP-M01-009 | Task | Summary Report domain: Monthly period meta-data & attachments | 0.5 | 1.5 | 3.0 | 1.67 |
| **WP-M01-010** | AC-M01-005 | **Work Package** | **Testing & QA** | — | — | — | **Σ** |
| TK-M01-017 | WP-M01-010 | Task | Validation of month-scoped Summary Report uniqueness | 0.5 | 1.5 | 3.0 | 1.67 |
| **US-M01-006** | EP-M01 | **User Story** | **Database Governance & Life Cycle** | — | — | — | **Σ** |
| AC-M01-006 | US-M01-006 | Acceptance Criteria | Automated migrations and seed data portability | — | — | — | **Σ** |
| **WP-M01-011** | AC-M01-006 | **Work Package** | **Database (DevOps)** | — | — | — | **Σ** |
| TK-M01-018 | WP-M01-011 | Task | Implementation of 31 incremental schema migrations | 8.0 | 15.0 | 25.0 | 15.50 |
| TK-M01-019 | WP-M01-011 | Task | Development of Seed scripts for Master Parameters & Users | 1.0 | 2.5 | 5.0 | 2.67 |

---

### Output 2: File Manifest

| # | File | Lines | Functions* | Covered By | Complexity |
|:--|:---|---:|---:|:---|:---|
| 1 | attendance.prisma | 19 | 1M, 1E | TK-M01-003 | Standard |
| 2 | chemicals.prisma | 41 | 2M, 1E | TK-M01-013 | Standard |
| 3 | clients.prisma | 14 | 1M | TK-M01-005 | Standard |
| 4 | lab-analyses.prisma | 84 | 3M, 1E | TK-M01-012 | ⚠️ Deceptively complex |
| 5 | log-sheets.prisma | 131 | 4M, 3E | TK-M01-011 | 🔗 Integration-heavy |
| 6 | machines.prisma | 45 | 1M, 3E | TK-M01-005 | Standard |
| 7 | notifications.prisma | 25 | 1M, 1E | TK-M01-002 | Standard |
| 8 | parameter-limit-profiles.prisma | 38 | 2M | TK-M01-009 | Standard |
| 9 | parameters.prisma | 42 | 1M, 2E | TK-M01-008 | ⚠️ Deceptively complex |
| 10 | projects.prisma | 105 | 3M, 4E | TK-M01-006 | 🔗 Integration-heavy |
| 11 | schema.prisma | 11 | — | TK-M01-001 | Standard |
| 12 | summary-reports.prisma | 38 | 1M, 1E | TK-M01-016 | Standard |
| 13 | users.prisma | 57 | 1M, 2E | TK-M01-002 | Standard |
| 14 | work-reports.prisma | 78 | 2M, 2E | TK-M01-015 | 📋 Business rules |

*\*In Prisma context: Models (M) and Enums (E).*

---

### Output 3: Confidence Assessment

Confidence: **98%**
- **Files scanned:** 14/14
- **Functions covered:** 35/35 (Models + Enums)
- **Gaps:** None. All domain files listed in the project structure were analyzed.
- **Cross-ref vs fast scan:** Matched 14/14 domains; identified significant additional complexity in `LabAnalysisEntry` (ValueType polymorphism) and `LogSheet` signatory relations. Added specific tasks for Migration Governance (TK-M01-018) to account for the 31 existing migrations.
- **Status:** 🟢 Done
