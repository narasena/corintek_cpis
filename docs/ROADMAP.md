# CPIS Project Roadmap

> **Project:** Corintek Project Information System (CPIS)
> **Updated:** 2026-03-04
> **Status:** Operational Phase — Dashboard Activity Complete
> **Current Focus:** Stabilization & QA (`QA`, `SR-02`)

---

## Implementation Status

### ✅ Completed Domains

| Domain          | Notes                                                                                                                |
| :-------------- | :------------------------------------------------------------------------------------------------------------------- |
| Auth            | Login/session management                                                                                             |
| Clients         | Full CRUD with DataTable                                                                                             |
| Users           | Full CRUD, roles, soft delete                                                                                        |
| Parameters      | Master data + categories + global limits                                                                             |
| Projects        | Full CRUD with status, assignments, personnel                                                                        |
| Machines        | Nested in Projects form                                                                                              |
| Chemicals       | Master CRUD + Log Sheet integration                                                                                  |
| Attendance      | Clock in/out + photo validation                                                                                      |
| Lab Analysis    | Results tracking per project                                                                                         |
| Work Reports    | Ad-hoc technician reports + signatures                                                                               |
| Summary Reports | Monthly project sign-off                                                                                             |
| Notifications   | NT-02 & NT-03 Complete                                                                                               |
| Client Portal   | CP-01 — Read-only CLIENT role                                                                                        |
| My Profile      | Avatar upload, form submission                                                                                       |
| RBAC & Scoping  | Project-level access control                                                                                         |
| Worker (R2)     | Basic upload API ready                                                                                               |
| Log Sheet       | All sections complete + Option A Mobile + Print Preview + Refactoring (LS-STAB: Page -65%, Service -32%, Tests +161) |
| Dashboard       | Recent Activity Feed with RBAC (`DB-01`) — Log sheets + Work reports, 7d/30d range, role-based visibility            |

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
| 2   | Summary Report Analytics                       | `SR-02`                        | 🟡 P1    | Medium |
| 3   | Log Sheet Adjustments (video, A4, warnings)    | `LS-ADJ`                       | 🟡 P2    | Medium |
| 4   | Dashboard Parameter Panel                      | `DB-04`                        | 🟡 P2    | Low    |
| 5   | Client/User Fields (website, company, address) | `CLIENT-FIELDS`, `USER-FIELDS` | 🟢 P3    | Low    |
| 6   | Work Types Multi-select                        | `PRJ-FIELDS-02`                | 🟢 P3    | Low    |
| 7   | Summary Report Signatures                      | `DS-EXT`                       | ⚪ P4    | Low    |

> **Detailed specs for each scope ID:** See `fsd_cpis/FSD_CPIS.md`

---

## Known Issues & Technical Debt

- ⚠️ `Log Sheet`: Detail page ~437 lines — could benefit from further component extraction
- ⚠️ `Worker`: Basic R2 upload only — no CDN/optimization pipeline yet
- ⚠️ `Dashboard Activity`: No real-time updates (polling/WebSocket) — requires manual refresh
- ⚠️ `Dashboard Activity`: Pagination uses offset not cursor (may miss items during high activity)

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
