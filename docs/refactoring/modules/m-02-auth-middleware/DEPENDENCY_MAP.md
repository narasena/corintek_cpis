# M-02: Auth & Middleware — Dependency Map

> Generated: 2026-03-04

---

## 1. File Inventory

### Auth Feature (Feature Layer)

| #   | File                         | Lines | Role                                  |
| --- | ---------------------------- | ----: | ------------------------------------- |
| 1   | src/features/auth/actions.ts |    84 | Server Actions for Login/Logout       |
| 2   | src/features/auth/service.ts |    67 | Core Auth business logic (Prisma)     |

### Auth Utilities (Library Layer)

| #   | File                        | Lines | Role                                  |
| --- | --------------------------- | ----: | ------------------------------------- |
| 3   | src/middleware.ts           |    76 | Global Next.js Middleware             |
| 4   | src/lib/jwt.ts              |    51 | JWT signing and verification (jose)   |
| 5   | src/lib/rbac.ts             |   232 | RBAC Matrix and Permission Checking   |
| 6   | src/lib/auth-helpers.ts     |   125 | Session retrieval & password hashing  |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Auth Feature"
        Actions[actions.ts] --> Service[service.ts]
        Actions --> JWT[lib/jwt.ts]
        Actions --> Helpers[lib/auth-helpers.ts]
    end

    subgraph "Middleware & Guard"
        MW[middleware.ts] --> JWT
        MW --> RBAC[lib/rbac.ts]
    end

    subgraph "Libraries"
        Helpers --> JWT
        Service --> Helpers
    end

    subgraph "External"
        Service --> Prisma[@/lib/prisma]
        RBAC --> ExternalFeatures[@/features/*]
    end
```

---

## 3. Circular Dependency Analysis

**Result: 1 module-level circular dependency identified.**

| ID   | Cycle Path    | Severity | Resolution |
| ---- | ------------- | -------- | ---------- |
| CD-1 | `service.ts` -> `auth-helpers.ts` -> `jwt.ts` -> `service.ts` | Medium | `service.ts` uses `comparePassword` from `auth-helpers`, while `auth-helpers` uses `prisma` from `lib`. This is a tight coupling between the feature and the library helper. |

---

## 4. God Classes / Oversized Files

| File | Lines | Exports | Verdict |
| ---- | ----: | :-----: | ------- |
| src/lib/rbac.ts | 232 | 10 | **COMPLEX LOGIC**: Contains a large static matrix and prefix-based matching. |
| src/middleware.ts | 76 | 2 | **GOD MIDDLEWARE**: Handles auth, redirects, and RBAC in a single sequential function. |

---

## 5. Duplicated Code Blocks

| ID    | Description | Locations | Status |
| ----- | ----------- | --------- | ------ |
| DUP-1 | Token verification logic (try-catch block) | `middleware.ts`, `auth-helpers.ts` | OPEN |
| DUP-2 | User status check (active/blocked) | `service.ts`, `auth-helpers.ts` | OPEN |

---

## 6. Cross-Module Impact

**⚠️ External modules this module imports from or is imported by:**

| Direction       | External Module         | Files Affected | Impact                                      |
| --------------- | ----------------------- | -------------- | ------------------------------------------- |
| **Imports**     | `@/lib/prisma`          | `service.ts`, `auth-helpers.ts` | Direct DB access for session/auth validation |
| **Imported By** | `@/features/clients`    | `service.ts`, `actions.ts` | Uses `ensureAccess` and `getCurrentUser`    |
| **Imported By** | `@/features/log-sheets` | `service.ts`, `actions.ts` | Uses `ensureAccess` and `getCurrentUserDetails` |
| **Imported By** | `@/features/projects`   | `actions.ts`   | Uses `getCurrentUser`                       |
| **Imported By** | `@/features/attendance` | `actions.ts`   | Uses `getCurrentUser`                       |

**Rule:** `rbac.ts` and `auth-helpers.ts` are high-fan-out modules. Any change to their exported signatures will break almost every feature in the application.
