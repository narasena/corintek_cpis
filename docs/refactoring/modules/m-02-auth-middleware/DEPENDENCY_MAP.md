# M-02: Auth & Middleware — Dependency Map

> Updated: 2026-03-05 (Post-Refactor Update)

---

## 1. File Inventory

### Auth Feature (Feature Layer)

| #   | File                         | Lines | Role                                  |
| --- | ---------------------------- | ----: | ------------------------------------- |
| 1   | src/features/auth/actions.ts |    71 | Server Actions for Login/Logout       |
| 2   | src/features/auth/service.ts |    82 | Auth business flow (Prisma)           |
| 3   | src/features/auth/crypto.ts  |    46 | Crypto primitives (bcrypt)            |
| 4   | src/features/auth/constants.ts |   39 | Auth configuration & messages         |

### Auth Utilities (Library Layer)

| #   | File                        | Lines | Role                                  |
| --- | --------------------------- | ----: | ------------------------------------- |
| 5   | src/middleware.ts           |    67 | Global Next.js Middleware             |
| 6   | src/lib/action-factory.ts    |    82 | Type-safe Server Action Factory       |
| 7   | src/lib/jwt.ts              |    80 | JWT signing & verification (jose)     |
| 8   | src/lib/rbac.ts             |   294 | RBAC Matrix and Permission Checking   |
| 9   | src/lib/auth-helpers.ts     |   118 | Session retrieval & auth re-exports   |
| 10  | src/features/users/utils.ts |    59 | User status validation & mapping      |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Auth Feature Domain"
        Actions[actions.ts] --> Service[service.ts]
        Service --> Crypto[crypto.ts]
        Service --> Constants[constants.ts]
        Service --> UserUtils[users/utils.ts]
        Crypto --> Constants
    end

    subgraph "Middleware & Guard"
        MW[middleware.ts] --> JWT[lib/jwt.ts]
        MW --> RBAC[lib/rbac.ts]
        MW --> AuthConstants[features/auth/constants.ts]
    end

    subgraph "Libraries & Helpers"
        Helpers[lib/auth-helpers.ts] --> Service
        Helpers --> Crypto
        Factory[lib/action-factory.ts] --> Helpers
        Factory --> RBAC
        JWT --> Constants
    end

    subgraph "External"
        Service --> Prisma[@/lib/prisma]
        RBAC --> ExternalFeatures[@/features/*]
        ExternalActions[*.actions.ts] --> Factory
    end
```

---

## 3. Circular Dependency Analysis

**Result: 0 module-level circular dependencies identified.**

| ID   | Cycle Path    | Severity | Resolution |
| ---- | ------------- | -------- | ---------- |
| CD-1 | `service.ts` -> `auth-helpers.ts` -> `service.ts` | **RESOLVED** | Removed dependency of `service.ts` on `auth-helpers.ts`. Primitives moved to `crypto.ts`. Helpers now re-export from domain. |

---

## 4. God Classes / Oversized Files

| File | Lines | Exports | Verdict |
| ---- | ----: | :-----: | ------- |
| src/lib/rbac.ts | 294 | 10 | **COMPLEX LOGIC**: Contains a large static matrix. Centralizes all policy definitions. |
| src/middleware.ts | 67 | 2 | **REFACTORED**: Clean, declarative, and focused on security orchestration. |

---

## 5. Duplicated Code Blocks

| ID    | Description | Locations | Status |
| ----- | ----------- | --------- | ------ |
| DUP-1 | Token verification logic (try-catch block) | `middleware.ts`, `auth-helpers.ts` | **RESOLVED** (Centralized via getIdentity helper and jwt.ts) |
| DUP-2 | User status check (active/blocked) | `service.ts`, `auth-helpers.ts` | **RESOLVED** (isUserAuthValid) |

---

## 6. Cross-Module Impact

**⚠️ External modules this module imports from or is imported by:**

| Direction       | External Module         | Files Affected | Impact                                      |
| --------------- | ----------------------- | -------------- | ------------------------------------------- |
| **Imports**     | `@/lib/prisma`          | `service.ts`   | Direct DB access for authentication          |
| **Imported By** | ALL FEATURE MODULES     | `*.actions.ts` | All actions use `requireActor()` from helpers |
| **Imported By** | `@/features/users`      | `service.ts`   | Uses `hashPassword` from `auth/crypto`       |

**Rule:** `rbac.ts` and `auth-helpers.ts` remain high-fan-out. Signature changes must be carefully coordinated.
