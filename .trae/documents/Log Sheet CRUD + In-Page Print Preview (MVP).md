## What I Found (v1 → now)

* v1 log sheets live in `_archives/v1` and were built around Next.js route handlers (`src/app/api/...`), a controller/service layer, runtime-built Zod schemas from “parameter groups”, plus a PDF renderer (`@react-pdf/renderer`).

* Current repo already has the *new* MVP DB model and types:

  * Prisma: `LogSheet` + `LogSheetEntry` in `prisma/schema/log-sheets.prisma`

  * Zod + DTO types in `src/features/log-sheets/types.ts`

* There is no current UI / server actions / service implementation for log sheets yet.

## MVP Scope (Simplified)

* **CRUD LogSheet (header):** create per project + date + notes, list per project, update notes/status, soft delete.

* **Entries editing:** save values for parameters across machines (Chiller + Cooling Tower) using `LogSheetEntry`.

* **Preview + Print:** render an on-page preview that matches the table style in your screenshot, then browser print.

* **Deferred (explicitly not MVP):** signatures, chemical usage rules, and any external API routes.

## Data Mapping to Match the Screenshot

* Use existing enums already in the app:

  * Machines: `CHILLER` and `COOLING_TOWER` (`src/features/machines/types.ts`)

  * Parameter categories: `UNIT_CONDENSOR`, `UNIT_EVAPORATOR`, `GENERAL_CONDITION`, `JOB_DESCRIPTION`, etc. (`src/features/parameters/types.ts`)

* Column rules:

  * `UNIT_CONDENSOR` + `UNIT_EVAPORATOR` render per **Chiller unitNumber** columns. For each unit, create a header name for the unit in chiller #1; #2; #3.

  * `GENERAL_CONDITION` + `JOB_DESCRIPTION` render per **Cooling Tower unitNumber** columns. For each unit, create a header name for the unit in cooling tower e.g. CT-1, CT-2.

  * Parameter limit/target column derives from `Parameter.minValue/maxValue/unit`:

    * min+max → `min ~ max`

    * only max → `≤ max`

    * only min → `≥ min`

## Backend (Server Actions + Service)

1. Create `src/features/log-sheets/service.ts`

   * `getLogSheetsByProject(projectId)`

   * `createLogSheet(data)`

   * `updateLogSheet(data)`

   * `deleteLogSheet(id)` (soft delete)

   * `getLogSheetDetail(id)` returning:

     * log sheet header + project + machines

     * active parameters (grouped by category)

     * existing entries mapped by `(parameterId, machineId)`

   * `upsertLogSheetEntries(logSheetId, entries[])` (transactional; upsert by lookup on `(logSheetId, parameterId, machineId)` since there’s no DB unique constraint yet)

2. Create `src/features/log-sheets/actions.ts`

   * Validate input with existing Zod schemas (`CreateLogSheetSchema`, `UpdateLogSheetSchema`, `Create/UpdateLogSheetEntrySchema`).

   * Call service functions.

   * `revalidatePath()` for the relevant log sheet routes.

## UI Routes (Shadcn styling + existing CRUD patterns)

1. Add `src/app/log-sheets/page.tsx`

   * Simple project picker/list (reuse `getProjectsAction()`), with a button linking to `/log-sheets/[projectId]`.

2. Add `src/app/log-sheets/[projectId]/page.tsx`

   * DataTable listing log sheets (date, status, notes).

   * “Tambah Log Sheet” using `CrudDialog` (date + notes).

   * Row actions using `ActionCell`: Ubah (go to detail page), Hapus.

3. Add `src/app/log-sheets/[projectId]/[logSheetId]/page.tsx`

   * Tabs: `Input` and `Preview`.

   * Input tab: editable grid per category (rows = parameters, cols = machines). Use shadcn `Input`/`Switch` based on `valueType`.

   * Save button calls a server action to persist entries.

   * Preview tab: renders the printable table (matches screenshot) and a “Print” button (`window.print()`), with `print:hidden` on controls.

## Preview Component (Print-friendly)

* Create a reusable `LogSheetPreview` component (route-local or feature-local) that:

  * Renders a bordered table with section headers similar to the screenshot.

  * Formats values:

    * boolean → Yes/No

    * empty → “-”

  * Uses Tailwind + shadcn primitives; add a tiny inline `@media print` style block only for `@page` sizing/margins (not a `.css` file).

## Verification

* Build sanity:

  * Lint and build

  * Manually: create log sheet → input values → refresh → values persist → print preview renders correctly.

## Files Expected to Change / Add

* Add: `src/features/log-sheets/service.ts`

* Add: `src/features/log-sheets/actions.ts`

* Add: `src/app/log-sheets/page.tsx`

* Add: `src/app/log-sheets/[projectId]/page.tsx`

* Add: `src/app/log-sheets/[projectId]/[logSheetId]/page.tsx`

* Add: route-local components for columns/dialog/preview (under `src/app/log-sheets/.../components/*`)

If you confirm, I’ll implement the above in the current codebase using Server Actions + Services (no API routes, no PDF engine) and the shadcn UI components you already use.
