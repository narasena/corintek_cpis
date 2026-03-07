# M-01: Database Schema — Risk & Priority Matrix (DEFERRED)

> Updated 2026-03-07

**NOTICE:** Structural refactoring of the database schema has been deferred to avoid codebase-wide type breakages during the primary refactoring phase. 

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

| ID | File | Risk | Value | Priority | Status |
| :--- | :--- | :---: | :---: | :--- | :--- |
| F1 | `log-sheets.prisma` | 🔴 | 🔴 | **CRITICAL** | **⏸️ DEFERRED** |
| F2 | `projects.prisma` | 🔴 | 🟡 | **HIGH** | **⏸️ DEFERRED** |
| F3 | `users.prisma` | 🔴 | 🟢 | **MONITOR** | **⏸️ DEFERRED** |
| F4 | `machines.prisma` | 🟡 | 🔴 | **HIGH** | **⏸️ DEFERRED** |
| F5 | `lab-analyses.prisma` | 🟡 | 🟡 | **MED** | **⏸️ DEFERRED** |
| F6 | `work-reports.prisma` | 🟡 | 🟢 | **MED** | **⏸️ DEFERRED** |
| F7 | `chemicals.prisma` | 🟡 | 🟢 | **LOW** | **⏸️ DEFERRED** |
| F8 | `parameter-limit-profiles.prisma` | 🟡 | 🟡 | **MED** | **⏸️ DEFERRED** |
| F9 | `summary-reports.prisma` | 🟢 | 🟡 | **MED** | **⏸️ DEFERRED** |
| F10 | `attendance.prisma` | 🟢 | 🟢 | **LOW** | **DONE (Standardized)** |
| F11 | `notifications.prisma` | 🟢 | 🟢 | **LOW** | **DONE (Standardized)** |
| F12 | `parameters.prisma` | 🟢 | 🟢 | **LOW** | **DONE (Standardized)** |
| F13 | `clients.prisma` | 🟢 | 🟢 | **LOW** | **DONE (Standardized)** |
| F14 | `schema.prisma` | 🟢 | 🟢 | **LOW** | **DONE (Standardized)** |

---

## 4. Summary Matrix

| Risk \ Value | 🟢 LOW | 🟡 MED | 🔴 HIGH |
| :--- | :--- | :--- | :--- |
| **🔴 HIGH** | `users` | `projects` | `log-sheets` |
| **🟡 MED** | `work-reports`, `chemicals` | `lab-analyses`, `param-limits` | `machines` |
| **🟢 LOW** | `attendance`, `notif`, `param`, `client`, `schema` | `summary-reports` | |

---

## 5. Strategic Recommendation (Revised 2026-03-07)

1.  **Freeze Structural Changes**: To prevent global type breakage, no breaking structural changes will be applied to M-01 during the main project transition.
2.  **Service-Layer Abstraction**: Instead of refactoring the schema, business logic refactoring in downstream modules (M-11, M-12, etc.) should use service-layer abstractions to hide current schema complexities.
3.  **Migration Planning**: Structural changes (like F1 and F4) should be moved to a post-transition migration phase where data can be safely mapped to a new schema.
