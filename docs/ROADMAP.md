# CPIS Project Roadmap

> **Project:** Corintek Project Information System (CPIS)
> **Updated:** 2026-03-04
> **Status:** Operational Phase — Feature Complete
> **Current Focus:** Stabilization & QA (`QA`)

---

## Implementation Status

### ✅ Completed Domains

| Domain             | Notes                                                                                                                         |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Auth               | Login/session management with JWT                                                                                             |
| Clients            | Full CRUD with DataTable                                                                                                      |
| Users              | Full CRUD, roles, soft delete, avatar upload                                                                                  |
| Parameters         | Master data + categories + ParameterLimitProfile system                                                                       |
| Parameter Profiles | Global default profile + per-project overrides                                                                                |
| Projects           | Full CRUD with status, assignments, personnel, Addendum support                                                               |
| Machines           | Nested in Projects form, master data via project context only                                                                 |
| Chemicals          | Master CRUD + Log Sheet integration                                                                                           |
| Attendance         | Clock in/out + photo validation + CSV export                                                                                  |
| Lab Analysis       | Results tracking per project with print view                                                                                  |
| Work Reports       | Ad-hoc technician reports + signatures + approval workflow                                                                    |
| Summary Reports    | Monthly project sign-off + PDF attachments (Temuan, Blowdown, Suhu, Surat Jalan)                                              |
| Notifications      | Limit breach notifications + bell UI with unread count                                                                        |
| Client Portal      | Read-only CLIENT role + My Projects view                                                                                      |
| My Profile         | Avatar upload, form submission, self-service edit                                                                             |
| RBAC & Scoping     | Project-level access control + role matrix                                                                                    |
| Worker (R2)        | Upload API with Bearer auth (dev/prod environments)                                                                           |
| Log Sheet          | All sections complete + Option A Mobile + Print Preview + Digital Signatures + Approval workflow + Limit breach notifications |
| Dashboard          | Charts (Approach/Ampere) + Recent Activity Feed with RBAC + Photo Gallery                                                     |

---

## 🚧 In Progress

| Feature | Scope ID | Priority | Status                  |
| :------ | :------- | :------- | :---------------------- |
| _None_  | —        | —        | Ready for next priority |

---

## Upcoming (Priority Order)

| #   | Feature                                        | Scope ID                       | Priority | Effort |
| :-- | :--------------------------------------------- | :----------------------------- | :------- | :----- |
| 1   | Browser UI Tests (MP-01, CP-01)                | `QA`                           | 🟢 P1    | Low    |
| 2   | Log Sheet Adjustments (video, A4, warnings)    | `LS-ADJ`                       | 🟡 P2    | Medium |
| 3   | Dashboard Parameter Panel                      | `DB-04`                        | 🟡 P2    | Low    |
| 4   | Client/User Fields (website, company, address) | `CLIENT-FIELDS`, `USER-FIELDS` | 🟢 P3    | Low    |
| 5   | Work Types Multi-select                        | `PRJ-FIELDS-02`                | 🟢 P3    | Low    |
| 6   | Summary Report Signatures                      | `DS-EXT`                       | ⚪ P4    | Low    |

> **Note:** Summary Report Analytics (`SR-02`) removed from roadmap — dashboard charts provide sufficient visibility.

> **Detailed specs for each scope ID:** See `fsd_cpis/FSD_CPIS.md`

---

## Features NOT Implemented (FSD Reference)

| Feature                        | FSD Section | Scope ID          | Status                               |
| :----------------------------- | :---------- | :---------------- | :----------------------------------- |
| Log Sheet Request Form         | 4.3         | `LS-REQ`          | ❌ Not Implemented                   |
| Attendance Excel Export        | 4.6         | `ATT-EXP`         | ❌ CSV Only (.xlsx)                  |
| Master Settings - Daftar Mesin | 4.7.3       | `MASTER-MACHINE`  | ❌ No UI (managed via Projects only) |
| Master Settings - Log Sheet    | 4.7.3       | `MASTER-LOGSHEET` | ❌ Not Implemented                   |

> These features are **preserved in FSD** for future reference but NOT in current implementation.

---

## Known Issues & Technical Debt

- ⚠️ `Log Sheet`: Detail page ~437 lines — could benefit from further component extraction
- ⚠️ `Worker`: Basic R2 upload only — no CDN/optimization pipeline yet
- ⚠️ `Dashboard Activity`: No real-time updates (polling/WebSocket) — requires manual refresh
- ⚠️ `Dashboard Activity`: Pagination uses offset not cursor (may miss items during high activity)
- ⚠️ `Attendance`: CSV export only — Excel (.xlsx) not implemented

---

## Key Decisions

| Date       | Decision                                                   | Rationale                                                                                |
| :--------- | :--------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| 2026-03-04 | Dashboard Activity Feed (`DB-01`) — query-time aggregation | No new table needed; query existing sources (log_sheets, work_reports) with RBAC filters |
| 2026-02-26 | Renamed `ParameterLimitCategory` → `ParameterLimitProfile` | Clearer naming, profile implies reusability                                              |
| 2026-02-25 | Added CLIENT role as read-only portal                      | Client access without admin capabilities                                                 |
| 2026-02-23 | Server Actions only, no REST API layer                     | Eliminated fetch/axios overhead for internal data                                        |

---

> **Completed feature history:** See `CHANGELOG.md`
> **Detailed feature specs & task breakdowns:** See `fsd_cpis/FSD_CPIS.md` (load with `@fsd_cpis/FSD_CPIS.md` only when implementing a specific scope ID)
