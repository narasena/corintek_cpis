---
name: "cpis-arch-check"
description: "Enforces CPIS architectural constraints (Server Actions Only). Invoke when creating/modifying API routes, data fetching, or backend logic."
---

# CPIS Architecture Enforcer

This skill enforces the "Server Actions Only" architecture for the CPIS project.

## 🏗️ Architectural Rules

**1. No REST API Layer**
-   ❌ **FORBIDDEN:** Creating routes in `src/app/api/...` for internal data fetching.
-   ✅ **ALLOWED:** `src/app/api/webhooks/...` (External integrations ONLY).

**2. Data Flow Protocol**
-   **UI Component** → Calls `Server Action` (in `actions.ts`)
-   **Server Action** → Validates Input (Zod) → Calls `Service`
-   **Service** (`service.ts`) → Business Logic → Prisma Client

**3. Forbidden Libraries**
-   ❌ `axios` / `fetch` (for internal communication)
-   ❌ New npm packages (without explicit permission)

## 🔍 Validation Checklist

Before writing backend logic:
1.  Are you editing `src/features/<domain>/actions.ts`? (Correct)
2.  Are you putting business logic in `src/features/<domain>/service.ts`? (Correct)
3.  Are you trying to create a new `route.ts`? (**STOP** unless it's a webhook)

## 🚨 Action

If the user asks for an API endpoint:
-   **Reject** the request.
-   **Explain** the Server Action architecture.
-   **Propose** a Server Action implementation instead.
