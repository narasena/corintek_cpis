## Findings

* `COOLING_WATER_QUALITY` currently renders as a single “Nilai” column because the UI only assigns machine columns to `UNIT_*`, `GENERAL_CONDITION`, and `JOB_DESCRIPTION` ([page.tsx](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/log-sheets/%5BprojectId%5D/%5BlogSheetId%5D/page.tsx#L208-L221)) and the print preview has the same limitation ([log-sheet-preview.tsx](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/log-sheets/%5BprojectId%5D/%5BlogSheetId%5D/components/log-sheet-preview.tsx#L107-L118)).

* Machines for the project are already fetched correctly (including all Cooling Towers) inside the log-sheets service ([service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/service.ts#L165-L224)).

## DB Changes (Needed)

1. **Add raw-water limits to parameters**

   * Update [parameters.prisma](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/prisma/schema/parameters.prisma) to add:

     * `rawWaterMinValue Float?`

     * `rawWaterMaxValue Float?`

   * Keep nullable so existing parameters don’t break.
2. **Add role/context to log sheet entries** (to support “raw water” and “notes” without breaking value types)

   * Update [log-sheets.prisma](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/prisma/schema/log-sheets.prisma) to add:

     * `enum LogSheetEntryRole { VALUE RAW_WATER NOTE }`

     * `role LogSheetEntryRole @default(VALUE)` in `LogSheetEntry`

   * This avoids overloading `machineId = null` for multiple meanings and lets “NOTE” always be stored as TEXT even if the main parameter is BOOLEAN/NUMBER.

## Backend Updates (Service/Types)

1. **Extend parameter types to include raw limits**

   * Update [features/parameters/types.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/parameters/types.ts) schemas and `IParameter` to include `rawMinValue/rawMaxValue` (optional).

   * Update [features/parameters/service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/parameters/service.ts) create/update to pass these fields.
2. **Extend log-sheet entry types to include** **`role`**

   * Update [features/log-sheets/types.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/types.ts) `CreateLogSheetEntrySchema` and interfaces to include `role` with default `VALUE`.
3. **Update log-sheets service to support role-aware upsert and new parameter fields**

   * In [features/log-sheets/service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/service.ts):

     * Include `rawMinValue/rawMaxValue` in the parameters `select`.

     * Change `makeEntryKey()` to include role (e.g. `parameterId:machineId:role`).

     * Update `upsertLogSheetEntries()` to key and upsert by `(parameterId, machineId, role)`.

     * Ensure NOTE entries treat emptiness as “empty text => delete”.

## Frontend Updates (Input + Preview)

1. **Cooling Water Quality table layout**

   * In [detail page](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/log-sheets/%5BprojectId%5D/%5BlogSheetId%5D/page.tsx):

     * Make `COOLING_WATER_QUALITY` use Cooling Tower machines.

     * Only one data of raw water for every logsheet regardless of how many cooling towers are there

     * Special-case its header/rows to render:

       * `[Parameter Name][Limit][CT #1..#n][Raw Water][Limit (Raw Water)]`

     * Raw Water cell uses entry role `RAW_WATER` (machineId null), value type follows the parameter.

     * Limit (Raw Water) is rendered from `rawMinValue/rawMaxValue`.
2. **Add Notes column for General Condition + Job Description**

   * In the same detail page:

     * For `GENERAL_CONDITION` and `JOB_DESCRIPTION`, add a far-right “Catatan” column.

     * This column is stored as entry role `NOTE` (machineId null) and always uses a text input.
3. **Update print preview to match**

   * In [log-sheet-preview.tsx](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/log-sheets/%5BprojectId%5D/%5BlogSheetId%5D/components/log-sheet-preview.tsx):

     * Render the same columns as input for those categories.

     * Stop assuming a single global `unitColumnCount`; compute per-category column counts and a `maxColumns` for the final Note/Status rows.

     * Read values using role-aware keys.

## Verification

* Run typecheck/build to confirm Next.js + TS compiles.

* Manually verify the log sheet detail page:

  * `COOLING_WATER_QUALITY` shows CT columns + Raw Water + Raw Limit.

  * `GENERAL_CONDITION` and `JOB_DESCRIPTION` show CT columns + Catatan.

  * Saving works and reloading restores all values.

  * Preview/Print matches the input layout.

## NoSQL Question (Recommendation)

* Even if log sheet filling is “sparse”, PostgreSQL + Prisma is still a good fit because your current design is already an **EAV-like row model** (`log_sheet_entries`) that naturally supports “only some machines filled” without schema changes.

* NoSQL would trade away relational constraints/reporting simplicity (joins to projects/machines/parameters, auditing, filtering by date/status, etc.) for flexibility you don’t actually need here. If you ever need more flexibility, a middle-ground is adding a JSONB column for *extra* per-entry metadata, but I would keep the core data relational.

