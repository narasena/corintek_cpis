# M-01: Database Schema — Risk Matrix

> Updated 2026-03-04

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god domain |
| 🟡 MEDIUM | Transactional data, moderate coupling, cross-domain dependency    |
| 🟢 LOW    | Isolated master data or leaf domain, few/no dependents            |

---

## Risk Table

| ID   | File                                          | Lines | Risk | Reason                                                                 |
| ---- | --------------------------------------------- | ----: | :--: | ---------------------------------------------------------------------- |
| F1   | prisma/schema/log-sheets.prisma               |   123 |  🔴  | God Domain; 4 models; 5+ relations to User; Core transactional engine  |
| F2   | prisma/schema/projects.prisma                 |   118 |  🔴  | Core Anchor; Recursive relations (Addenda); Primary foreign key target  |
| F3   | prisma/schema/users.prisma                    |    61 |  🔴  | Authentication Anchor; Heavily coupled to LogSheets and Projects       |
| F4   | prisma/schema/work-reports.prisma             |    72 |  🟡  | Transactional; Cross-references Project, User, and Machine             |
| F5   | prisma/schema/lab-analyses.prisma             |    80 |  🟡  | Complex internal structure (3 models); Multi-column/parameter logic    |
| F6   | prisma/schema/machines.prisma                 |    46 |  🟡  | Shared asset model; Linked to Projects, LogSheets, and WorkReports     |
| F7   | prisma/schema/chemicals.prisma                |    42 |  🟡  | Inventory logic; Linked to LogSheets via ChemicalUsage                 |
| F8   | prisma/schema/parameter-limit-profiles.prisma |    41 |  🟡  | Critical business validation logic; Linked to Projects and Parameters  |
| F9   | prisma/schema/attendance.prisma               |    24 |  🟢  | Leaf domain; Primary dependency on User only                           |
| F10  | prisma/schema/notifications.prisma            |    30 |  🟢  | Leaf domain; Low impact on core transactions                           |
| F11  | prisma/schema/summary-reports.prisma          |    38 |  🟢  | Derived data; Monthly snapshots; Low risk of breaking active flows      |
| F12  | prisma/schema/parameters.prisma               |    45 |  🟢  | Master data; Stable definitions                                        |
| F13  | prisma/schema/clients.prisma                  |    20 |  🟢  | Master data; High-level anchor but simple structure                    |
| F14  | prisma/schema/schema.prisma                   |    12 |  🟢  | Configuration only                                                     |

---

## Summary

| Risk Level | Count | Files                                                              |
| :--------: | :---: | ------------------------------------------------------------------ |
|  🔴 HIGH   |   3   | log-sheets, projects, users                                        |
| 🟡 MEDIUM  |   5   | work-reports, lab-analyses, machines, chemicals, parameter-limits  |
|   🟢 LOW   |   6   | attendance, notifications, summary-reports, parameters, clients, schema |
