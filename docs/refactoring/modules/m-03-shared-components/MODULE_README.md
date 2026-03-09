# M-03: Shared Components & Infrastructure

This module provides the foundational infrastructure and shared UI primitives for the CPIS application. It is designed to be **pure**, meaning it contains no business logic or feature-specific dependencies.

## 🏗️ Architecture

Following the refactoring in Group A, M-03 is strictly separated and **decoupled from feature-layer logic**:

1.  **Infrastructure (`src/lib/`)**: Pure utilities for JWT, Prisma, RBAC, and Action logic. All structural layer inversions (where lib depended on features) have been resolved by moving composition roots to feature domains.
2.  **Shared Hooks (`src/hooks/`)**: Lifecycle management hooks (e.g., `useObjectURL`, `useDataTableOrchestrator`).
3.  **Shared Components (`src/components/`)**: Domain-agnostic UI patterns (DataTable, MultiSelect).
4.  **UI Primitives (`src/components/ui/`)**: Specialized shadcn/ui components.

## 🔒 Security & RBAC

The RBAC system is modularized into role-based policies:
-   `src/lib/rbac/policies/`: Individual files for Admin, Staff, and Clients.
-   `src/lib/rbac.ts`: Pure logic coordinator for permission checking.

## 🚀 Key Exports

### Server Action Factory
All server actions should be wrapped using the `actionFactory` to ensure standardized authentication, authorization, and validation.
```typescript
import { actionFactory } from '@/features/auth/di';
export const myAction = actionFactory.protected(async ({ input, actor }) => { ... });
```

### Data Table
The `DataTable` automatically handles responsive switching between Desktop (Table) and Mobile (Cards).
```typescript
import { DataTable } from '@/components/data-table';
<DataTable columns={cols} data={data} tabs={tabs} />
```

### Image Pipeline
Foundational Canvas logic is centralized in `src/lib/utils/canvas.ts`. The high-level `processImagePipeline` handles the standard 1:1 WebP compression used for camera and file uploads.

## 📏 Rules
- **No Downward Dependencies**: Files in `src/lib` or `src/components` must never import from `src/features/*` (excluding types).
- **Naming**: All interfaces must start with `I` and types with `T`.
- **Side Effects**: Foundational utilities (like `prisma.ts`) must use lazy initialization to prevent environment variable errors during build/test.
