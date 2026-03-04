# CPIS — Work Breakdown Structure (WBS)

> **Project:** Corintek Project Information System (CPIS)
> **Prepared by:** [Your Name]
> **Date:** 2026-03-03
> **Version:** Detailed (Task-Level)
> **Estimation Method:** PERT (Program Evaluation and Review Technique)
> **Rate Basis:** Mid-Level Developer — **Rp 85,000/hr**

---

## Legend

| Column     | Description                                                                                                           |
| :--------- | :-------------------------------------------------------------------------------------------------------------------- |
| **ID**     | Hierarchical identifier: `EP` = Epic, `US` = User Story, `AC` = Acceptance Criteria, `WP` = Work Package, `TK` = Task |
| **Parent** | Parent ID this item belongs to                                                                                        |
| **Type**   | Epic / User Story / Acceptance Criteria / Work Package / Task                                                         |
| **Item**   | Description of the work                                                                                               |
| **O**      | Optimistic hours (best case)                                                                                          |
| **L**      | Likely hours (normal case)                                                                                            |
| **P**      | Pessimistic hours (worst case)                                                                                        |
| **E**      | Expected hours = `(O + 4L + P) / 6`                                                                                   |

---

## How to Read This Document

- **Epics** (pink rows) = Major feature areas. Their hours are the **sum** of all child items.
- **User Stories** = What the user wants to achieve. Sum of their Acceptance Criteria.
- **Acceptance Criteria** = Testable conditions. Sum of their Work Packages.
- **Work Packages** = Groupings (Frontend, Backend, DB, Testing). Sum of their Tasks.
- **Tasks** = Atomic units of work with individual PERT estimates.

---

## PERT Formula

```
Expected = (Optimistic + 4 × Likely + Pessimistic) / 6
```

---

<!-- TEMPLATE STARTS HERE — Repeat this pattern for each Epic -->

## EP-001: Authentication & Session Management

| ID         | Parent | Type                | Item                                                             |     O |     L |     P |     E |
| :--------- | :----- | :------------------ | :--------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-001** | —      | **Epic**            | **Authentication & Session Management**                          | **—** | **—** | **—** | **Σ** |
| US-001     | EP-001 | User Story          | As an internal user, I want to log in so I can access the system |     — |     — |     — |     Σ |
| AC-001     | US-001 | Acceptance Criteria | Email/Password Authentication with JWT                           |     — |     — |     — |     Σ |
| **WP-001** | AC-001 | **Work Package**    | **Frontend (UI/UX)**                                             |     — |     — |     — |     Σ |
| TK-001     | WP-001 | Task                | Login page layout & responsive design                            |     1 |     2 |     4 |  2.17 |
| TK-002     | WP-001 | Task                | Login form with validation (react-hook-form + zod)               |     1 |     2 |     3 |     2 |
| TK-003     | WP-001 | Task                | Error states & toast feedback                                    |   0.5 |     1 |     2 |  1.08 |
| **WP-002** | AC-001 | **Work Package**    | **Backend (Logic & APIs)**                                       |     — |     — |     — |     Σ |
| TK-004     | WP-002 | Task                | Auth server action (login handler)                               |     1 |     2 |     3 |     2 |
| TK-005     | WP-002 | Task                | JWT token generation & session cookie                            |     1 |     2 |     4 |  2.17 |
| TK-006     | WP-002 | Task                | Middleware route protection                                      |     1 |     2 |     3 |     2 |
| **WP-003** | AC-001 | **Work Package**    | **Database**                                                     |     — |     — |     — |     Σ |
| TK-007     | WP-003 | Task                | User model schema design (Prisma)                                |   0.5 |     1 |     2 |  1.08 |
| TK-008     | WP-003 | Task                | Seed data for initial admin user                                 |   0.5 |     1 |   1.5 |     1 |
| **WP-004** | AC-001 | **Work Package**    | **Testing & QA**                                                 |     — |     — |     — |     Σ |
| TK-009     | WP-004 | Task                | Auth helpers unit tests                                          |     1 |     2 |     3 |     2 |
| TK-010     | WP-004 | Task                | RBAC unit tests                                                  |     1 |     2 |     3 |     2 |

<!-- NOTE: This EP-001 is a FILLED EXAMPLE. Other EPs below are EMPTY TEMPLATES to be filled after scanning. -->

---

<!-- EMPTY TEMPLATE — Copy this for each new Epic -->
<!--
## EP-XXX: [Epic Name]

| ID | Parent | Type | Item | O | L | P | E |
|:---|:---|:---|:---|---:|---:|---:|---:|
| **EP-XXX** | — | **Epic** | **[Epic Name]** | **—** | **—** | **—** | **Σ** |
| US-XXX | EP-XXX | User Story | As a [role], I want to [action] so that [benefit] | — | — | — | Σ |
| AC-XXX | US-XXX | Acceptance Criteria | [Testable condition] | — | — | — | Σ |
| **WP-XXX** | AC-XXX | **Work Package** | **Frontend (UI/UX)** | — | — | — | Σ |
| TK-XXX | WP-XXX | Task | [Specific task] | O | L | P | E |
| **WP-XXX** | AC-XXX | **Work Package** | **Backend (Logic & APIs)** | — | — | — | Σ |
| TK-XXX | WP-XXX | Task | [Specific task] | O | L | P | E |
| **WP-XXX** | AC-XXX | **Work Package** | **Database** | — | — | — | Σ |
| TK-XXX | WP-XXX | Task | [Specific task] | O | L | P | E |
| **WP-XXX** | AC-XXX | **Work Package** | **Testing & QA** | — | — | — | Σ |
| TK-XXX | WP-XXX | Task | [Specific task] | O | L | P | E |
-->

---

## Summary Table (To be filled after all Epics are complete)

| Epic ID | Epic Name                           | Expected Hours | Cost (IDR) |
| :------ | :---------------------------------- | -------------: | ---------: |
| EP-001  | Authentication & Session Management |                |            |
| EP-002  | User Management                     |                |            |
| EP-003  | Client Management                   |                |            |
| EP-004  | Project Management                  |                |            |
| EP-005  | Machine Management                  |                |            |
| EP-006  | Chemical Management                 |                |            |
| EP-007  | Attendance & Absence                |                |            |
| EP-008  | Lab Analysis                        |                |            |
| EP-009  | Parameters & Limit Profiles         |                |            |
| EP-010  | Log Sheets                          |                |            |
| EP-011  | Work Reports                        |                |            |
| EP-012  | Summary Reports                     |                |            |
| EP-013  | Notifications                       |                |            |
| EP-014  | Dashboard                           |                |            |
| EP-015  | Client Portal & My Profile          |                |            |
| EP-016  | Infrastructure & Shared Components  |                |            |
| EP-017  | Cloudflare Worker (R2 Storage)      |                |            |
|         | **TOTAL**                           |          **Σ** |      **Σ** |

---

## Rate Card

| Level                | Monthly Salary (IDR) | Hourly Rate (IDR) | Note                   |
| :------------------- | -------------------: | ----------------: | :--------------------- |
| Junior Entry         |            7,500,000 |            62,500 | Market avg 2025-2026   |
| **Mid-Level (used)** |       **10,200,000** |        **85,000** | **Basis for this WBS** |
| Senior               |           15,000,000 |           125,000 | 3-5 years exp          |

> Formula: Monthly ÷ 4 weeks ÷ 5 days ÷ 6 productive hours/day = hourly rate
