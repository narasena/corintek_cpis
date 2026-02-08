## Goal (MVP)
- Add a new “Hasil Analisa Lab (LB-01)” feature: list per Project, create/edit manual entry form, and print-friendly preview.
- Reuse existing “Parameter” catalog + limit logic (especially raw-water limits) to stay consistent with Log Sheets.

## Recommended Data Model (Scalable + Maintainable)
- **Do NOT create a per-parameter enum** (too rigid, hard to extend). Instead keep parameters as DB rows (already how CPIS works).
- Create a new vertical slice with 3 tables:
  - `LabAnalysis` (header): `projectId`, `date`, `attention`, `cc`, `customer`, `address`, optional `reportNumber`, optional `faxNumber`, optional `remarks`, optional `recommendations`.
  - `LabAnalysisColumn` (dynamic “sample points” / table columns): `labAnalysisId`, `name` (e.g., `Raw`, `CTW1-4`, `CTW5-6`, `CHW`), `displayOrder`.
  - `LabAnalysisEntry` (cell values): `labAnalysisId`, `parameterId`, `columnId`, `valueType`, and one of `numericValue|boolValue|textValue`.
- Constraints:
  - Unique `(labAnalysisId, parameterId, columnId)` so each table “cell” is deterministic.
- Why this fits your sample PDFs:
  - Your reports are effectively a **matrix** (rows=parameters, columns=sample points). Dynamic columns lets you support both examples without schema changes.

## Parameter Strategy (MVP)
- Reuse existing `ParameterCategory.COOLING_WATER_QUALITY` parameters.
  - Benefit: you already store `rawWaterMinValue/rawWaterMaxValue` + `minValue/maxValue`, and per-project overrides already exist.
- Optional (P1, but easy): add `methodStandard: String?` to `Parameter` so the printed report can show “SNI/APHA …”.

## Service Layer (Reuse existing patterns)
- Add `src/features/lab-analyses/service.ts` with:
  - `getLabAnalysesByProject(projectId)`
  - `getLabAnalysisDetail(labAnalysisId)` (include columns + entries + parameter metadata + project/client)
  - `createLabAnalysis(input)` and `updateLabAnalysis(input)`
  - `upsertLabAnalysisEntries(labAnalysisId, entries[])` (same style as `upsertLogSheetEntries` but keyed by column)
- Apply role/permission checks in service (same as other domains).

## Server Actions (Standard CPIS pattern)
- Add `src/features/lab-analyses/actions.ts`:
  - Validate with Zod
  - `try/catch` with `[CPIS-ERROR] LabAnalyses.<Action>` logging
  - Revalidate both list and detail routes after create/update

## UI Routes (App Router)
- Add pages under `src/app/(main)/lab-analyses/[projectId]/`:
  - `page.tsx`: list view per project (Create button)
  - `new/page.tsx`: create form
  - `[labAnalysisId]/edit/page.tsx`: edit form
  - `[labAnalysisId]/print/page.tsx`: print preview (browser-native print; use `print:` Tailwind to hide buttons/nav)

## Form UX (MVP)
- Header section: Attention, Cc, Customer, Address, Date, optional Report No/Fax No.
- Table section:
  - Columns default to: `Raw`, `CTW`, `CHW` (user can add/remove/rename columns for cases like `CTW1-4`, `CTW5-6`).
  - Rows are all `COOLING_WATER_QUALITY` parameters.
  - Each cell is a numeric/text input based on `parameter.valueType`.

## Print Preview Mapping
- Render exactly as your PDF examples:
  - Header block (Attn/Cc/Customer/Alamat + No/Fax/Date)
  - Matrix table with:
    - Row: Parameter
    - Columns: dynamic sample points
    - Limit columns (MVP): show derived limits from Parameter (raw vs non-raw). If you want separate CTW/CHW limit columns later, we can extend.
  - Remarks + Comment & Recommendations section.

## Migration + Seed
- Add new Prisma schema file (e.g., `prisma/schema/lab-analyses.prisma`) and run a migration.
- Ensure the standard cooling-water-quality parameters exist (seed script already used by the project).

## Verification
- Manual smoke test:
  - Create lab analysis with default columns, fill a few parameters, save.
  - Edit, ensure values persist.
  - Print page renders a single clean A4 layout.
  - Confirm list + detail pages update via revalidation.

## Why this is the best MVP
- Scalable: supports any number of sample columns (your two PDF formats) without schema churn.
- Maintainable: reuses the project’s proven patterns (typed value union, parameter catalog, service/actions layering).
- Minimal risk: isolates LB-01 into its own feature while leveraging existing Parameter/limit logic.