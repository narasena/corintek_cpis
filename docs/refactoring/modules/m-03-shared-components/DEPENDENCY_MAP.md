# M-03: Shared Components & Infrastructure — Dependency Map

> Generated: 2026-03-06

---

## 1. File Inventory

### Infrastructure Layer (src/lib)

| #   | File                               | Lines | Role                                      |
| --- | ---------------------------------- | ----: | ----------------------------------------- |
| 1   | `src/lib/rbac.ts`                  |   121 | **Coordinator**: Pure access check logic  |
| 2   | `src/lib/rbac/types.ts`            |    46 | **New**: RBAC type definitions            |
| 3   | `src/lib/rbac/policies/*.ts`       |   164 | **New**: Role-specific modular policies   |
| 4   | `src/lib/auth-helpers.ts`          |    72 | **Foundation**: Pure session/JWT logic    |
| 5   | `src/lib/action-factory.ts`        |   110 | Standard wrapper for Server Actions       |
| 6   | `src/lib/jwt.ts`                   |    96 | **Decoupled**: Jose-based token primitives|
| 7   | `src/lib/prisma.ts`                |    41 | Database client singleton                 |
| 8   | `src/lib/r2-upload.ts`             |    31 | Cloudflare R2 storage integration         |
| 9   | `src/lib/utils/image-compression.ts`|    92 | **Refactored**: Uses canvas utility        |
| 10  | `src/lib/utils/canvas.ts`           |   135 | **Refactored**: Foundational Canvas logic  |
| 11  | `src/lib/constants/auth.ts`        |    23 | **New**: Foundational security constants  |
| 12  | `src/lib/constants/navigation.ts`  |    84 | **New**: Grouped navigation schema        |

### UI Component Layer (src/components)

| #   | File                                    | Lines | Role                                      |
| --- | --------------------------------------- | ----: | ----------------------------------------- |
| 1   | `src/components/data-table.tsx`         |   316 | Complex table/card display logic          |
| 2   | `src/components/camera-input.tsx`       |   276 | **Refactored**: Uses unified pipeline     |
| 3   | `src/components/app-sidebar.tsx`        |    69 | **Refactored**: Modular layout component  |
| 4   | `src/components/nav-main.tsx`           |    56 | **Refactored**: Categorized navigation    |
| 5   | `src/components/multi-select.tsx`       |   163 | **Refactored**: Reusable form primitive   |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Infrastructure (Lib)"
        AF[action-factory.ts] --> RB[rbac.ts]
        AF --> UC[@/features/auth/lib/user-context]
        RB --> RBT[rbac/types.ts]
        RB --> RBP[rbac/policies/*.ts]
        AH[auth-helpers.ts] --> JW[jwt.ts]
        AH --> AC[constants/auth.ts]
        JW --> AC
        IC[image-compression.ts] --> CV[canvas.ts]
        NC[constants/navigation.ts]
    end

    subgraph "Auth Feature (Domain)"
        UC --> AH
        UC --> AS[@/features/auth/service]
    end

    subgraph "Components"
        DT[data-table.tsx] --> UI[src/components/ui/*]
        CI[camera-input.tsx] --> IC
        CI --> CV
        SB[app-sidebar.tsx] --> RB
        SB --> NC
        SB --> NM[nav-main.tsx]
        NM --> NC
        SB --> NU[nav-user.tsx]
        NU --> AA[@/features/auth/actions]
    end

    subgraph "External Features"
        FE[@/features/*] --> AF
        FE --> DT
        FE --> RB
        AS --> AC
        FE_PROJ[@/features/projects] --> FE_MACH[@/features/machines/components/machine-form-section]
    end

    AA --> AH
```

---

## 3. Circular Dependency Analysis

**Result: 0 high-severity circular dependencies.**

| ID   | Path                                            | Status      | Resolution                                  |
| ---- | ----------------------------------------------- | ----------- | ------------------------------------------- |
| CIR-1| `lib/auth-helpers` -> `auth/service` -> `lib/auth-helpers` | ✅ RESOLVED | Moved domain logic to `@/features/auth/lib/user-context`. |

---

## 4. God Classes / Oversized Files

| File                                    | Lines | Exports | Verdict           |
| --------------------------------------- | ----: | :-----: | ----------------- |
| `src/components/ui/sidebar.tsx`         |   726 |   ~15   | SHADCN GENERATED  |
| `src/components/data-table.tsx`         |   316 |    2    | GOD COMPONENT     |

---

## 5. Duplicated Code Blocks

| ID    | Description                                  | Locations                                      | Status |
| ----- | -------------------------------------------- | ---------------------------------------------- | ------ |
| DUP-1 | Raw Canvas `getContext('2d')` manipulation   | `canvas.ts` (Centralized)                      | ✅ RESOLVED |
| DUP-2 | Mobile Card vs Desktop Table bifurication    | `data-table.tsx` (Internal logic)              | Open   |

---

## 6. Cross-Module Impact

**⚠️ External modules this module imports from or is imported by:**

| Direction       | External Module            | Files Affected | Impact                                      |
| --------------- | -------------------------- | -------------- | ------------------------------------------- |
| **Imports**     | `@/features/auth`          | `nav-user`     | Trigger logout action                       |
| **Imported By** | `@/features/auth`          | `user-context` | Standard session primitives                 |
| **Imported By** | **ALL Feature Modules**    | `actions.ts`   | Standardizes all server actions via `actionFactory` |
| **Imported By** | **ALL Feature Modules**    | `page.tsx`     | Provides `DataTable` for all CRUD views     |

**Rule:** `M-03` is now a pure infrastructure layer. It provides foundation but does not contain business logic.
