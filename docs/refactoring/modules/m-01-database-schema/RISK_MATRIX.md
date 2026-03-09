# M-01: Database Schema — Risk Matrix

> Updated 2026-03-07

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god class  |
| 🟡 MEDIUM | Shared utilities/types, moderate coupling, cross-layer dependency |
| 🟢 LOW    | UI-only, isolated leaf module, few/no dependents                  |

---

## Risk Table

| ID   | File                                          | Lines | Risk | Reason                                                                 |
| ---- | --------------------------------------------- | ----: | :--: | ---------------------------------------------------------------------- |
| F1   | `prisma/schema/log-sheets.prisma`             |   125 |  🔴  | **GOD MODULE**: Nexus for 5 domains; high coupling with User/Machine. |
| F2   | `prisma/schema/projects.prisma`               |   118 |  🔴  | **DOMAIN HUB**: Core project lifecycle; recursive addenda logic.       |
| F3   | `prisma/schema/users.prisma`                  |    62 |  🟡  | **CORE IDENTITY**: Moderate coupling; essential for RBAC/Middleware.   |
| F4   | `prisma/schema/lab-analyses.prisma`           |    80 |  🟡  | **TRANS. HUB**: Complex tree structure; high business value.           |
| F5   | `prisma/schema/work-reports.prisma`           |    72 |  🟡  | **TRANS. HUB**: Multiple signatures and relations.                     |
| F6   | `prisma/schema/parameters.prisma`             |    45 |  🟡  | **TRANS. DEPENDENCY**: Referenced by LogSheets and LabAnalyses.        |
| F7   | `prisma/schema/chemicals.prisma`              |    42 |  🟢  | **LEAF**: Isolated usage; low cross-domain impact.                     |
| F8   | `prisma/schema/parameter-limit-profiles.prisma` |    41 |  🟢  | **LEAF**: Isolated config; few dependents.                             |
| F9   | `prisma/schema/machines.prisma`               |    46 |  🟢  | **LEAF**: Isolated entity; well-defined relations.                     |
| F10  | `prisma/schema/notifications.prisma`          |    31 |  🟢  | **LEAF**: Side-effect only; minimal core logic coupling.               |
| F11  | `prisma/schema/attendance.prisma`             |    24 |  🟢  | **LEAF**: Isolated feature; zero cross-module dependents.              |
| F12  | `prisma/schema/clients.prisma`                |    21 |  🟢  | **LEAF**: Foundation entity; stable and rarely changed.                |
| F13  | `prisma/schema/summary-reports.prisma`        |    39 |  🟢  | **LEAF**: Aggregation only; deferred soft-delete standardization.      |
| F14  | `prisma/schema/schema.prisma`                 |    12 |  🟢  | **CONFIG**: Low complexity boilerplate.                                |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   2   | F1, F2 |
| 🟡 MEDIUM  |   4   | F3, F4, F5, F6 |
|   🟢 LOW   |   8   | F7, F8, F9, F10, F11, F12, F13, F14 |
