# M-01: Database Schema — Risk & Priority Matrix

> Updated 2026-03-07

---

## 1. Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god domain |
| 🟡 MEDIUM | Transactional data, moderate coupling, cross-domain dependency    |
| 🟢 LOW    | Isolated master data or leaf domain, few/no dependents            |

---

## 2. Refactoring Value (ROI)

| Value | Impact of Refactoring |
| :--- | :--- |
| 🔴 HIGH | Major reduction in complexity, kills cross-domain coupling, or fixes major tech debt. |
| 🟡 MED | Improves readability, better type safety, or minor architectural alignment. |
| 🟢 LOW | Cosmetic changes, stable master data, or low-use features. |

---

## 3. Priority Table (Risk vs. Value)

| ID | File | Risk | Value | Priority | Reason |
| :--- | :--- | :---: | :---: | :--- | :--- |
| F1 | `log-sheets.prisma` | 🔴 | 🔴 | **CRITICAL** | God Domain; 5x User relations; Nexus of most coupling. High ROI to decouple. |
| F2 | `projects.prisma` | 🔴 | 🟡 | **HIGH** | Core Anchor; Recursive relations (Addenda). High risk to change. |
| F3 | `users.prisma` | 🔴 | 🟢 | **MONITOR** | Auth Anchor. High risk but currently stable. Lower ROI for change. |
| F4 | `machines.prisma` | 🟡 | 🔴 | **HIGH** | Fixes the "Implicit Machine-Entry Contract" tech debt. |
| F5 | `lab-analyses.prisma` | 🟡 | 🟡 | **MED** | Simplifies complex 3-model column/parameter relationship. |
| F6 | `work-reports.prisma` | 🟡 | 🟢 | **MED** | Transactional but relatively straightforward compared to LogSheets. |
| F7 | `chemicals.prisma` | 🟡 | 🟢 | **LOW** | Stable inventory logic; low current debt. |
| F8 | `parameter-limit-profiles.prisma` | 🟡 | 🟡 | **MED** | Improves validation logic consistency across projects. |
| F9 | `summary-reports.prisma` | 🟢 | 🟡 | **MED** | Low risk to refactor; high value for improving monthly export accuracy. |
| F10 | `attendance.prisma` | 🟢 | 🟢 | **LOW** | Isolated leaf domain; stable. |
| F11 | `notifications.prisma` | 🟢 | 🟢 | **LOW** | Isolated leaf domain; stable. |
| F12 | `parameters.prisma` | 🟢 | 🟢 | **LOW** | Stable master data definition. |
| F13 | `clients.prisma` | 🟢 | 🟢 | **LOW** | Stable master data definition. |
| F14 | `schema.prisma` | 🟢 | 🟢 | **LOW** | Config only. |

---

## 4. Summary Matrix

| Risk \ Value | 🟢 LOW | 🟡 MED | 🔴 HIGH |
| :--- | :--- | :--- | :--- |
| **🔴 HIGH** | `users` | `projects` | `log-sheets` |
| **🟡 MED** | `work-reports`, `chemicals` | `lab-analyses`, `param-limits` | `machines` |
| **🟢 LOW** | `attendance`, `notif`, `param`, `client`, `schema` | `summary-reports` | |

---

## 5. Strategic Recommendation

1.  **Immediate Focus**: Decouple `log-sheets.prisma` from its 5x `User` relations (likely move to a join table or service-level resolution) to reduce global coupling.
2.  **Integrity Fix**: Strengthen the `Machine-Entry` relationship in `log-sheets.prisma` or via cross-module validation to resolve the implicit contract debt.
3.  **Stability Guard**: Guard `users.prisma` and `projects.prisma` from breaking changes during refactoring of transactional modules.
