# M-04: Users — Dependency Map

> Generated: 2026-03-08

<!-- PROMPT FOR AI AGENT:
"Analyze this module and create a dependency map:
1. List all files and their roles
2. Identify dependencies between sub-layers
3. Find circular dependencies
4. Identify god classes (>300 lines or >10 methods)
5. Find duplicated code blocks
6. List ALL imports from other modules (cross-module dependencies)
Do NOT suggest fixes yet. Just map the current state."
-->

---

## 1. File Inventory
### Presentation Layer (Components & Hooks)

| #   | File                                       | Lines | Role                                         |
| --- | ------------------------------------------ | ----: | -------------------------------------------- |
| 1   | `src/features/users/components/user-form.tsx` |    73 | Refactored: Orchestrator component           |
| 2   | `src/features/users/hooks/use-user-form.ts`|   123 | Form logic, initialization & submission      |
| 3   | `src/features/users/components/form-sections/UserBasicFields.tsx` | 118 | UI: Basic info fields |
| 4   | `src/features/users/components/form-sections/UserRoleFields.tsx` | 131 | UI: Role & Client fields |
| 5   | `src/features/users/components/form-sections/UserSecurityFields.tsx` | 60 | UI: Password fields |
| 6   | `src/features/users/components/profile-form.tsx` |   231 | Self-profile management                      |
| 7   | `src/features/users/hooks/use-user-clients.ts`|    28 | Reusable client fetching logic               |
| 8   | `src/features/users/components/user-dialog.tsx` |    46 | Dialog wrapper for `UserForm`                |

### Domain/Action Layer

| #   | File                             | Lines | Role                                          |
| --- | -------------------------------- | ----: | --------------------------------------------- |
| 9   | `src/features/users/actions.ts`  |   159 | Server actions entry points                   |

### Service/Infrastructure Layer

| #   | File                                | Lines | Role                                           |
| --- | ----------------------------------- | ----: | ---------------------------------------------- |
| 10  | `src/features/users/services/user-queries.ts` |   119 | Decomposed Read operations                     |
| 11  | `src/features/users/services/user-mutations.ts`|   255 | Decomposed Write operations                    |
| 12  | `src/features/users/service.ts`     |     9 | Backward-compatible facade (exports all)       |
| 13  | `src/features/users/utils.ts`       |    68 | Data mappers and shared Prisma select objects  |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Presentation Layer"
        UD[user-dialog.tsx] --> UF[user-form.tsx]
        UF --> UFH[use-user-form.ts]
        UF --> UB[UserBasicFields.tsx]
        UF --> UR[UserRoleFields.tsx]
        UF --> USec[UserSecurityFields.tsx]
        PF[profile-form.tsx] --> UA[actions.ts]
        UFH --> UA
        UFH --> UH[use-user-clients.ts]
    end

    subgraph "Domain Layer"
        UA --> UQ[user-queries.ts]
        UA --> UM[user-mutations.ts]
        UH --> CA[@/features/clients/actions]
    end

    subgraph "Service/Infra Layer"
        UQ --> UU[utils.ts]
        UM --> UU[utils.ts]
        UQ --> DB[(Prisma)]
        UM --> DB[(Prisma)]
    end

    subgraph "External Dependencies"
        UA --> AF[actionFactory]
        UA --> R2[uploadToR2]
        UQ --> RBAC[lib/rbac]
        UM --> RBAC[lib/rbac]
        UM --> CRYPTO[features/auth/crypto]
        UF --> CLIENTS[@/features/clients/actions]
    end
```

---

## 3. Circular Dependency Analysis

**Result: 0 module-level circular dependencies.**

---

## 4. God Classes / Oversized Files

| File | Lines | Exports | Verdict |
| ---- | ----: | :-----: | ------- |
| None | < 300 | - | **RESOLVED**: All files are now under the 300-line threshold. |

---

## 5. Duplicated Code Blocks

| ID | Description | Locations | Status |
| -- | ----------- | --------- | ------ |
| DUP-1 | Redundant `Prisma.UserSelect` block | `service.ts` | Resolved |
| DUP-2 | Manual `toUserResponse` mapping | `service.ts` | Resolved |

---

## 6. Cross-Module Impact

**⚠️ External modules this module imports from or is imported by:**

| Direction | External Module | Files Affected | Impact |
| --- | --- | --- | --- |
| **Imports** | `@/features/clients` | `use-user-clients.ts` | Fetches client list for role-based assignments. |
| **Imports** | `@/features/auth` | `services/*`, `actions.ts` | Uses `hashPassword` and `actionFactory`. |
| **Imported By** | `@/features/log-sheets` | `use-log-sheet-technicians.ts` | Fetches technicians list for dropdowns. |
| **Imported By** | `@/features/projects` | `project-assignments-section.tsx` | Fetches all users for assignment. |
| **Imported By** | `app/(main)/attendance` | `admin/page.tsx` | Lists users for attendance management. |

**Rule:** Changes to the return type of `getTechniciansListAction` or `getAllUsersAction` will require updates in `log-sheets`, `projects`, and `attendance` modules.
