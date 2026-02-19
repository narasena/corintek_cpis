# Log Sheets (MVP)

## Scope (Current)
- Database schema: `LogSheet` + `LogSheetEntry`
- Domain types: Zod schemas + DTO interfaces

## Next Domain to Implement
- Server Actions + Service for Log Sheets CRUD:
  - Create log sheet header
  - Upsert entries (by logSheetId + parameterId + machineId)
  - List log sheets per project
  - Fetch log sheet detail

## Deferred (Not MVP)
- Client personnel and signatures (implement after CRUD stabilizes)
- Chemical usage (needs clear machine linkage + dosage rules)
