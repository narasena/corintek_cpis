# M-03: Shared Components & Infrastructure — Dependency Map

> Generated: 2026-03-06

---

## 1. File Inventory

### Infrastructure Layer (src/lib)

| #   | File                               | Lines | Role                                      |
| --- | ---------------------------------- | ----: | ----------------------------------------- |
| 1   | `src/lib/rbac.ts`                  |   303 | SSOT for permissions and route matching   |
| 2   | `src/lib/auth-helpers.ts`          |   118 | Server-side actor extraction and session  |
| 3   | `src/lib/action-factory.ts`        |   107 | Standard wrapper for Server Actions       |
| 4   | `src/lib/jwt.ts`                   |    96 | **Decoupled**: Jose-based token primitives|
| 5   | `src/lib/prisma.ts`                |    41 | Database client singleton                 |
| 6   | `src/lib/r2-upload.ts`             |    31 | Cloudflare R2 storage integration         |
| 7   | `src/lib/utils/image-compression.ts`|    92 | **Refactored**: Uses canvas utility        |
| 8   | `src/lib/utils/canvas.ts`           |    85 | **New**: Foundational Canvas logic        |
| 9   | `src/lib/constants/auth.ts`        |    23 | **New**: Foundational security constants  |

### UI Component Layer (src/components)

| #   | File                                    | Lines | Role                                      |
| --- | --------------------------------------- | ----: | ----------------------------------------- |
| 1   | `src/components/data-table.tsx`         |   316 | Complex table/card display logic          |
| 2   | `src/components/camera-input.tsx`       |   276 | Browser Camera API + Processing UI        |
| 3   | `src/components/app-sidebar.tsx`        |   132 | Main navigation layout component          |
| 4   | `src/components/multi-select.tsx`       |   163 | **Refactored**: Reusable form primitive   |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Infrastructure (Lib)"
        AF[action-factory.ts] --> AH[auth-helpers.ts]
        AF --> RB[rbac.ts]
        AH --> JW[jwt.ts]
        AH --> AC[constants/auth.ts]
        JW --> AC
        AH --> AS[@/features/auth/service]
        IC[image-compression.ts] --> CV[canvas.ts]
    end

    subgraph "Components"
        DT[data-table.tsx] --> UI[src/components/ui/*]
        CI[camera-input.tsx] --> IC
        CI --> CV
        SB[app-sidebar.tsx] --> RB
        SB --> NM[nav-main.tsx]
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

**Result: 1 module-level circular dependency identified.**

| ID   | Cycle Path                                      | Severity | Resolution                                  |
| ---- | ----------------------------------------------- | -------- | ------------------------------------------- |
| CIR-1| `lib/auth-helpers` -> `auth/service` -> `lib/auth-helpers` | High     | Move session validation logic to a lower layer |

---

## 4. God Classes / Oversized Files

| File                                    | Lines | Exports | Verdict           |
| --------------------------------------- | ----: | :-----: | ----------------- |
| `src/components/ui/sidebar.tsx`         |   726 |   ~15   | SHADCN GENERATED  |
| `src/components/camera-input.tsx`       |   356 |    1    | LOGIC HEAVY       |
| `src/components/data-table.tsx`         |   316 |    2    | GOD COMPONENT     |
| `src/lib/rbac.ts`                       |   303 |    8    | CONFIG HEAVY      |

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
| **Imports**     | `@/features/auth`          | `auth-helpers` | Circular dependency on session validation    |
| **Imports**     | `@/features/auth`          | `nav-user`     | Trigger logout action                       |
| **Imported By** | **ALL Feature Modules**    | `actions.ts`   | Standardizes all server actions via `actionFactory` |
| **Imported By** | **ALL Feature Modules**    | `page.tsx`     | Provides `DataTable` for all CRUD views     |

**Rule:** `M-03` is the foundation. Any breaking change to `actionFactory`, `rbac`, or `DataTable` will require updates across the entire codebase.
