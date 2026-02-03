## Scope
- Implement Log Sheets MVP as **DB schema + TypeScript DTO/types only**.
- No UI, no server actions/services, no route handlers.

## Decisions (MVP)
- No dynamic parameter groups (use existing `Parameter` + `ParameterCategory`).
- No signatures/approvals, no chemical usage.
- Machine linkage is optional per entry (`machineId` nullable).

## Prisma Schema Work
- Add new Prisma schema file `prisma/schema/log-sheets.prisma` defining:
  - `LogSheetStatus` enum (DRAFT, SUBMITTED, APPROVED)
  - `LogSheet` model
  - `LogSheetEntry` model
- Update existing domain schemas to add relations:
  - `Project.logSheets: LogSheet[]`
  - `Machine.logSheetEntries: LogSheetEntry[]`
  - `Parameter.logSheetEntries: LogSheetEntry[]`
- Add indexes:
  - `LogSheet`: `@@index([projectId, date])`
  - `LogSheetEntry`: `@@index([logSheetId])`, `@@index([parameterId])`, `@@index([machineId])`
- Keep soft-delete pattern consistent (`deletedAt` nullable) to match existing domains.

## Prisma Schema Location Fix (Required)
- Ensure Prisma CLI uses the **multi-file schema folder** currently at `prisma/schema/`.
- Add/adjust Prisma configuration so `prisma generate/migrate` read from that directory (instead of expecting `prisma/schema.prisma`).

## TypeScript DTO/Types
- Create `src/features/log-sheets/types.ts` matching existing conventions:
  - Zod enums: `LogSheetStatusEnum`
  - Zod schemas:
    - `CreateLogSheetSchema` (projectId, date, notes?)
    - `CreateLogSheetEntrySchema` (logSheetId, parameterId, machineId?, valueType, numeric/bool/text)
    - `UpdateLogSheetSchema`, `UpdateLogSheetEntrySchema` (partial + id)
  - Interfaces:
    - `ILogSheet`, `ILogSheetEntry`
- Reuse existing enums/types:
  - `ValueTypeEnum`/`TValueType` from `src/features/parameters/types.ts`.

## Verification
- Run:
  - Prisma validate/format/generate to ensure schema composes correctly.
  - Next.js build to confirm typecheck passes.

## Next Domain Recommendation (After This Phase)
- Implement log sheet CRUD (server action + service) next, using existing `Project`, `Machine`, `Parameter`.
- Skip client personnel/signatures until log sheets are stable; handle signatures as a later add-on.
