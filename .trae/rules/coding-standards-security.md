---
alwaysApply: true
description: Security and Tech Stack standards.
---
# Coding Standards: Stack & Security

## 1. Tech Stack
*   **Core:** Next.js 15 (App Router), Prisma 7, Tailwind 4.
*   **Architecture:** Server Actions -> Service Layer -> Prisma.
*   **Monorepo:** Check directory (App vs Worker).

## 2. Security
*   **Secrets:** NEVER print/read `.env` directly in components.
*   **Validation:** All inputs must have Zod schemas.
*   **Lockfiles:** Never edit `package-lock.json` manually.
