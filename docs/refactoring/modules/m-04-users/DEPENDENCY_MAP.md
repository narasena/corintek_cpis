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

### Presentation Layer (Components)

| #   | File                                       | Lines | Role                                         |
| --- | ------------------------------------------ | ----: | -------------------------------------------- |
| 1   | `src/features/users/components/user-form.tsx` |   417 | Main form for creating and editing users     |
| 2   | `src/features/users/components/profile-form.tsx` |   226 | Specialized form for self-profile management |
| 3   | `src/features/users/components/user-dialog.tsx` |    46 | Dialog wrapper for the `UserForm`            |

### Domain/Action Layer

| #   | File                             | Lines | Role                                          |
| --- | -------------------------------- | ----: | --------------------------------------------- |
| 4   | `src/features/users/actions.ts`  |   154 | Server actions (entry points) with RBAC gates |

### Service/Infrastructure Layer

| #   | File                                | Lines | Role                                           |
| --- | ----------------------------------- | ----: | ---------------------------------------------- |
| 5   | `src/features/users/service.ts`     |   319 | Core business logic and Prisma operations      |
| 6   | `src/features/users/service-admin.ts` |    66 | Administrative utilities (restore/hard-delete) |
| 7   | `src/features/users/utils.ts`       |    68 | Data mappers and shared Prisma select objects  |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Presentation Layer"
        UD[user-dialog.tsx] --> UF[user-form.tsx]
        UF --> UA[actions.ts]
        PF[profile-form.tsx] --> UA
    end

    subgraph "Domain Layer"
        UA --> US[service.ts]
        UA --> USA[service-admin.ts]
    end

    subgraph "Service/Infra Layer"
        US --> UU[utils.ts]
        USA --> UU
        US --> DB[(Prisma)]
    end

    subgraph "External Dependencies"
        UA --> AF[actionFactory]
        UA --> R2[uploadToR2]
        US --> RBAC[lib/rbac]
        US --> CRYPTO[features/auth/crypto]
        UF --> CLIENTS[@/features/clients/actions]
    end
```

---

## 3. Circular Dependency Analysis

**Result: 0 module-level circular dependencies.**

- The layer flow is strictly top-down: Components → Actions → Services → Utils.
- `UserForm` calls `actions.ts` which is standard for Next.js Server Actions.

---

## 4. God Classes / Oversized Files

| File | Lines | Exports | Verdict |
| ---- | ----: | :-----: | ------- |
| `src/features/users/components/user-form.tsx` | 417 | 1 | **GOD COMPONENT**: Handles create/edit logic, role-based conditional fields (Client selection), and complex validation. |
| `src/features/users/service.ts` | 319 | 9 | **THICK SERVICE**: Contains all user CRUD. While under 500 lines, it manages many concerns (auth, status, list, search). |

---

## 5. Duplicated Code Blocks

| ID | Description | Locations | Status |
| -- | ----------- | --------- | ------ |
| DUP-1 | Redundant `Prisma.UserSelect` block | `service-admin.ts` (lines 27-41) matches `utils.ts` `userResponseSelect` | Open |
| DUP-2 | Manual `toUserResponse` mapping | `service-admin.ts` manually defines returning object instead of using `toUserResponse` from `utils.ts` | Open |

---

## 6. Cross-Module Impact

**⚠️ External modules this module imports from or is imported by:**

| Direction | External Module | Files Affected | Impact |
| --- | --- | --- | --- |
| **Imports** | `@/features/clients` | `user-form.tsx` | Fetches client list for role-based assignments. |
| **Imports** | `@/features/auth` | `service.ts`, `actions.ts` | Uses `hashPassword` and `actionFactory`. |
| **Imported By** | `@/features/log-sheets` | `use-log-sheet-technicians.ts` | Fetches technicians list for dropdowns. |
| **Imported By** | `@/features/projects` | `project-assignments-section.tsx` | Fetches all users for assignment. |
| **Imported By** | `app/(main)/attendance` | `admin/page.tsx` | Lists users for attendance management. |

**Rule:** Changes to the return type of `getTechniciansListAction` or `getAllUsersAction` will require updates in `log-sheets`, `projects`, and `attendance` modules.
