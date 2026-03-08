# M-03: Shared Components & Infrastructure — Dependency Map

> Generated: 2026-03-08

---

## 1. File Inventory

### UI Layer (Components)

| #   | File                                          | Lines | Role                                       |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/data-table.tsx                 |   269 | Main DataTable Orchestrator (Refactored)   |
| 2   | src/components/crud-dialog.tsx                |    45 | Reusable Dialog wrapper for forms          |
| 3   | src/components/camera-input.tsx               |   300 | Image capture and processing UI            |
| 4   | src/components/action-cell.tsx                |   119 | DataTable row actions                      |
| 5   | src/components/virtual-list.tsx               |   141 | Large dataset virtualization               |
| 6   | src/components/multi-select.tsx               |   163 | Multi-select input with badges             |
| 7   | src/components/error-boundary.tsx             |    95 | Client-side error catching UI              |
| 8   | src/components/app-sidebar.tsx                |    51 | Main application sidebar                   |

### Infrastructure Layer (Lib)

| #   | File                                          | Lines | Role                                       |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/lib/rbac.ts                               |   128 | Role-Based Access Control logic            |
| 2   | src/lib/action-factory.ts                     |   116 | Server Action Dependency Injection factory |
| 3   | src/lib/error-handler-service.ts              |   180 | Global error processing and localization   |
| 4   | src/lib/prisma.ts                             |    30 | Prisma Client Singleton                    |
| 5   | src/lib/jwt.ts                                |    88 | Session token management                   |
| 6   | src/lib/search-filter-service.ts              |   360 | Fuzzy search and dataset filtering         |
| 7   | src/lib/di/container.ts                       |    80 | IoC Container implementation               |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Group A: Foundation (M-03)"
        C[src/components/*] --> L[src/lib/*]
        C --> H[src/hooks/*]
        L --> DI[src/lib/di/*]
        L --> RBAC[src/lib/rbac.ts]
    end

    subgraph "External Dependencies"
        C --> LU[lucide-react]
        C --> RX[@radix-ui/*]
        L --> PR[prisma]
        
        %% Composition Root Direction
        CR[lib/di/composition-root.ts] -.-> F_DI[@/features/*/di.ts]
        NS[components/nav-user.tsx] --> AU[@/features/auth]
    end
```

---

## 3. Circular Dependency Analysis

**Result: Structural inversion resolved.**

| ID   | Cycle Path                                | Severity | Resolution                                 |
| ---- | ----------------------------------------- | -------- | ------------------------------------------ |
| CIR-1| `lib/di/factories.ts` -> `features/*`     | Resolved | Factories moved to feature DI files        |
| CIR-2| `components/nav-user.tsx` -> `auth/actions`| Low      | Standard practice for logout logic         |

---

## 4. God Classes / Oversized Files

| File                            | Lines | Exports | Verdict                               |
| ------------------------------- | ----: | :-----: | ------------------------------------- |
| src/components/ui/sidebar.tsx   |   726 |   15+   | SHADCN GOD FILE (Generated)           |
| src/lib/search-filter-service.ts|   360 |    1    | COMPLEX SERVICE (Fuzzy Logic)         |
| src/components/data-table.tsx   |   306 |    2    | ORCHESTRATOR (High coupling to hooks) |

---

## 5. Duplicated Code Blocks

| ID    | Description                                | Locations                      | Status |
| ----- | ------------------------------------------ | ------------------------------ | ------ |
| DUP-1 | `actionFactory.protected` boilerplate      | All `features/*/actions.ts`    | Intended|
| DUP-2 | `ensureAccess` checks in services          | All `features/*/service.ts`    | Open   |
| DUP-3 | Direct `new PrismaClient()` instantiation  | `seed.ts`, `notifications.spec`| Minor  |

---

## 6. Cross-Module Impact

**⚠️ Foundation module: Impact is SYSTEM-WIDE.**

| Direction       | External Module            | Files Affected         | Impact                    |
| --------------- | -------------------------- | ---------------------- | ------------------------- |
| **Imports**     | `@/features/auth`          | `nav-user.tsx`         | Logout functionality      |
| **Imports**     | `@/features/*`             | `composition-root.ts`  | Global DI wiring          |
| **Imported By** | **ALL MODULES (M-04 to M-20)**| All feature components | Foundation for CRUD/Logic |

**Rule:** Any change to `DataTable`, `rbac.ts`, or `actionFactory` requires regression testing across the entire application.
