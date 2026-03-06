# Dependency Injection Configuration - CG-02

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COMPOSITION ROOT                              │
│                    lib/di/composition-root.ts                        │
├─────────────────────────────────────────────────────────────────────┤
│  Wires all concrete implementations here ONLY                        │
│  - Prisma (Singleton)                                                │
│  - AttendanceService (Singleton)                                     │
│  - LogSheetService (Singleton)                                       │
│  - WorkReportService (Singleton)                                     │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   │ registers
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DI CONTAINER                                    │
│                      lib/di/container.ts                             │
├─────────────────────────────────────────────────────────────────────┤
│  Service Registry:                                                   │
│  - Token → Factory mapping                                           │
│  - Singleton/Transient lifecycle management                          │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   │ resolves via
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   SERVICE PROVIDER                                   │
│                    lib/di/service-provider.ts                        │
├─────────────────────────────────────────────────────────────────────┤
│  Clean interface for high-level modules:                             │
│  - getAttendanceService() → IAttendanceService                       │
│  - getLogSheetService() → ILogSheetService                           │
│  - getWorkReportService() → IWorkReportService                       │
└──────────┬──────────────────────────┬───────────────────────────────┘
           │                          │
           │                          │
           ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│     ACTIONS      │      │   COMPONENTS     │
│  (High-level)    │      │  (High-level)    │
├──────────────────┤      ├──────────────────┤
│ actions-paginated│      │      Hooks       │
│     - get*       │      │  - usePaginated  │
│   (use provider) │      │     Data         │
└──────────┬───────┘      └──────────────────┘
           │
           │ calls methods on
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE INTERFACES                                │
│                     lib/di/interfaces.ts                             │
├─────────────────────────────────────────────────────────────────────┤
│  IAttendanceService                                                  │
│  ILogSheetService                                                    │
│  IWorkReportService                                                  │
└──────────┬──────────────────────────────────────────────────────────┘
           │ implemented by
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CONCRETE SERVICES                                   │
│                    (Low-level)                                       │
├─────────────────────────────────────────────────────────────────────┤
│  AttendanceService  →  prisma dependency injected                    │
│  LogSheetService    →  prisma dependency injected                    │
│  WorkReportService  →  prisma dependency injected                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Dependency Direction

```
High-level modules ──────► Abstractions (Interfaces)
    │                            ▲
    │                            │
    │ implements                 │ depends on
    ▼                            │
Low-level modules ───────────────┘
    │
    │ injected by
    ▼
Composition Root (factories)
```

## Wiring Configuration

### Singleton Services (Shared)

| Service           | Token                           | Factory                   | Dependencies |
| ----------------- | ------------------------------- | ------------------------- | ------------ |
| Prisma            | `DI_TOKENS.PRISMA`              | -                         | (external)   |
| AttendanceService | `DI_TOKENS.ATTENDANCE_SERVICE`  | `createAttendanceService` | prisma       |
| LogSheetService   | `DI_TOKENS.LOG_SHEET_SERVICE`   | `createLogSheetService`   | prisma       |
| WorkReportService | `DI_TOKENS.WORK_REPORT_SERVICE` | `createWorkReportService` | prisma       |

### Usage in Actions

```typescript
// Before (concrete dependency - BAD)
import { AttendanceService } from './attendance-service';
const service = new AttendanceService({ prisma });

// After (abstract dependency - GOOD)
import { getAttendanceService } from '@/lib/di';
const service = getAttendanceService(); // Returns IAttendanceService
```

## Benefits

1. **No concrete dependencies in high-level modules**
   - Actions depend only on `IAttendanceService`, not `AttendanceService`
   - Easy to mock for testing

2. **Single point of configuration**
   - All wiring in `composition-root.ts`
   - Change implementation without touching business logic

3. **Lifecycle management**
   - Singleton services shared across requests
   - Prisma connection pool managed centrally

4. **Testability**
   - Inject mock services via container
   - No hardcoded dependencies

## Files Added

```
src/lib/di/
├── index.ts              # Public API exports
├── tokens.ts             # Service identifiers
├── interfaces.ts         # Service contracts
├── container.ts          # DI container implementation
├── composition-root.ts   # Wiring configuration
├── service-provider.ts   # Resolution helpers
└── factories.ts          # Service instantiation
```
