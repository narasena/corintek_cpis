# NT-02 – Log Sheet Limit Notifications Plan

## 1. Scope

- Trigger notifications when log sheet numeric entries breach parameter limits.
- Reuse shared notification module (`src/features/notifications`).
- Keep existing log sheet behavior stable (no changes to validation semantics).

## 2. Tasks Overview

- [x] Design notification contracts and service interfaces.
- [x] Implement notification persistence and service layer.
- [x] Add unit tests for notification limit evaluation and mutations.
- [x] Integrate notifications into log sheet flows (NT-02).
- [x] Expose notifications in UI (NT-03).

## 3. NT-02 Technical Tasks

### 3.1 Data Adapters

- [x] Implement `buildLimitEvaluationInput(detail)` in a new adapter file:
  - Input: `ILogSheetDetailView` from `log-sheets/service.ts`.
  - Output: `TLimitEvaluationEntrySnapshot[]` for notifications module.
- [x] Add tests to ensure correct mapping of:
  - Cooling water vs raw water limits.
  - Boundary values at min/max.
  - Null and non-numeric values.

### 3.2 Submission Limit Evaluation Helper

- [x] Implement helper to evaluate submission limits without changing existing methods:
  - Accepts `ILogSheetDetailView`.
  - Returns structured limit breaches and error messages.
- [x] Later, refactor `validateLogSheetForSubmission` to call the helper instead of inlining the range loop.

### 3.3 Log Sheet Notifications Orchestrator

- [x] Implement feature-local orchestrator for NT-02:
  - Bridges log sheet detail and notification service.
  - Uses adapter from 3.1 and notifies technicians.
- [x] Wire orchestrator into the appropriate server action(s) after submission succeeds.
- [x] Add unit tests to cover:
  - No breaches → no notifications.
  - Single/multiple breaches → notifications per technician.
  - Error paths from notification service.

## 4. Integration Plan (Future Steps)

1. Identify the main submission action entry point in `log-sheets/actions.ts`. **(Done)**
2. After `validateLogSheetForSubmission` passes, call the orchestrator with: **(Done)**
   - Actor user ID.
   - Technician recipients from project assignments or detail view.
3. Log failures with `[CPIS-ERROR] LogSheets.Notifications` and do not block submission on notification errors. **(Done)**
4. Extend tests:
   - Service-level: orchestrator behavior with mocked notification service. **(Done)**
   - E2E: ensure submissions with breaches produce notifications. **(Done)**

## 5. Out of Scope

- Changing existing validation rules or error messages.
