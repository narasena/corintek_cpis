# Gemini-CLI Deep Scan Prompt Template

> **🔴 MOTHER RULE: ACCURACY >>>>> SPEED.**
> **Usage:** Copy the prompt below, replace `[MODULE_ID]` and `[FILE_PATHS]` with values from `SCANNING_CHECKLIST.md`, then paste into gemini-cli.
> **One module per session** to prevent hallucination and context overflow.
> **Reference:** Cross-check results against `docs/wbs/WBS_DETAILED_FAST.md` for the same Epic.

---

## Base Prompt (Copy & Customize)

```
[ROLE] You are an Expert Technical Project Manager generating a Work Breakdown Structure.
You are performing a DEEP SCAN — accuracy is paramount. Take your time. Read every line.

[MOTHER RULE] ACCURACY >>>>> SPEED. Better to take 60 minutes producing accurate, defensible output than 5 minutes producing estimates with gaps.

[CONTEXT] I need you to DEEP SCAN the following module files and produce a detailed WBS table.
- Module: [MODULE_ID] - [MODULE_NAME]
- Epic: [EP-XXX]
- This is for a Next.js 16 + Prisma 7 + TypeScript project (Server Actions architecture)
- Architecture: UI Component → Server Action (actions.ts) → Service (service.ts) → Prisma → PostgreSQL
- A fast scan was previously done and is available in `docs/wbs/WBS_DETAILED_FAST.md` — use it for cross-reference only, do NOT copy it blindly

[TASK — DEEP SCAN PROTOCOL]

Step 1: Read EVERY file listed below IN FULL. Do NOT skim. Do NOT use outlines only.
- For files >500 lines, read in chunks but cover ALL chunks
- For each file, note: filename, line count, function count, 1-line purpose summary

Step 2: Assess REAL complexity for each file:
- SHORT CODE ≠ SIMPLE WORK. A 30-line range validator handling 4 roles × 2 value types is NOT a 1-hour task.
- Flag "deceptively complex" code: transactions, state machines, multi-step validation, recursive operations
- Flag "integration-heavy" code: orchestrates multiple services
- Flag "business rules" code: domain-specific logic requiring business context

Step 3: Check for DUPLICATION with other Epics:
- Shared/reusable work → count in EP-016 (Infrastructure)
- Feature-specific integration of shared work → count in the feature's Epic
- Never double-count the same work

Step 4: Generate the WBS table
Step 5: Generate the File Manifest (REQUIRED)
Step 6: Generate the Confidence Assessment (REQUIRED)

[FILES TO SCAN]
<paste file paths from SCANNING_CHECKLIST.md>

[OUTPUT FORMAT] Produce THREE outputs:

### Output 1: WBS Table
Markdown table with these EXACT columns:

| ID | Parent | Type | Item | O | L | P | E |
|:---|:---|:---|:---|---:|---:|---:|---:|

Where:
- ID format: EP-XXX, US-XXX, AC-XXX, WP-XXX, TK-XXX (use sequential numbers WITHIN THIS EPIC ONLY)
- Type: Epic / User Story / Acceptance Criteria / Work Package / Task
- O = Optimistic hours, L = Likely hours, P = Pessimistic hours
- E = Expected hours using PERT formula: (O + 4L + P) / 6
- Estimate as a MID-LEVEL developer (2-3 years experience, Rp 85,000/hr)
- Work Packages: Frontend (UI/UX), Backend (Logic & APIs), Database, Testing & QA
- PERT hours ONLY on Task rows. Parent rows use Σ — do NOT calculate sums.

### Output 2: File Manifest
For each file scanned, produce:

| # | File | Lines | Functions | Covered By | Complexity |
|:--|:---|---:|---:|:---|:---|

Complexity flags: Standard | ⚠️ Deceptively complex | 🔗 Integration-heavy | 📋 Business rules

### Output 3: Confidence Assessment

Confidence: [XX]%
- Files scanned: X/Y
- Functions covered: X/Y
- Gaps: [list any]
- Cross-ref vs fast scan: [matched / found N additional items]
- Status: 🔴 (<85% redo) | 🟡 (85-96% acceptable) | 🟢 (97%+ done)

[HIERARCHY RULES]
- Epic contains User Stories
- User Story contains Acceptance Criteria
- Acceptance Criteria contains Work Packages
- Work Package contains Tasks
- PERT hours only on Tasks (leaf nodes)
- Parent rows show Σ (sums) — DO NOT calculate sums, just write Σ

[ESTIMATION GUIDE for mid-level developer]
- Simple CRUD page (list + dialog): O=2, L=4, P=6
- Complex form with validation: O=3, L=5, P=8
- DataTable with columns + sorting: O=1.5, L=3, P=5
- Server action (simple CRUD): O=0.5, L=1.5, P=3
- Server action (complex logic): O=2, L=4, P=7
- Service layer (simple): O=0.5, L=1.5, P=3
- Service layer (complex queries/transactions): O=2, L=5, P=9
- Prisma schema (per model): O=0.5, L=1.5, P=3
- Unit test file: O=1, L=3, P=5
- Characterization test: O=2, L=4, P=7
- Responsive/mobile: O=1.5, L=4, P=7
- Print layout (CSS @media): O=1.5, L=3, P=5
- Signature pad: O=2, L=4, P=6
- Photo upload/camera: O=2, L=4, P=6
- Zod schema + types: O=0.5, L=1, P=2
- State machine / approval flow: O=2, L=4, P=7
- Range/limit validation: O=1, L=2, P=4
- Timezone/date handling: O=1, L=2, P=4

[CONSTRAINTS]
- 🔴 ACCURACY >>>>> SPEED — take as long as needed
- Do NOT hallucinate features — only document what exists in the files
- Do NOT skip any file — every file must map to at least one Task
- Do NOT reuse Task IDs from other Epics (e.g., TK-011-xxx inside EP-009)
- Do NOT estimate based on line count alone — understand the LOGIC, then estimate
- If unsure about complexity, err on the HIGHER estimate
- If a file seems "simple" but handles edge cases, timezone logic, or multi-role branching — flag it and estimate higher
```

---

## Example: How to customize for M-02 (Auth)

```
[MODULE_ID] M-02 - Auth & Middleware
[EP-XXX] EP-001
[FILES TO SCAN]
src/features/auth/actions.ts
src/features/auth/service.ts
src/lib/auth-helpers.ts
src/lib/auth-helpers.test.ts
src/lib/jwt.ts
src/lib/rbac.ts
src/lib/rbac.test.ts
src/middleware.ts
src/app/login/page.tsx
src/app/login/components/login-form.tsx
```

---

## For Large Modules (M-11: Log Sheets)

Split into sub-scans:

### M-11a: Log Sheet Core

```
src/features/log-sheets/actions.ts
src/features/log-sheets/service.ts
src/features/log-sheets/service-extended.ts
src/features/log-sheets/types.ts
src/features/log-sheets/dto.ts
src/features/log-sheets/validation.ts
src/features/log-sheets/utils.ts
src/features/log-sheets/utils/value-type.ts
src/features/log-sheets/range-validation.ts
```

### M-11b: Log Sheet Status & Locking

```
src/features/log-sheets/log-sheet-status.ts
src/features/log-sheets/log-sheet-status.service.ts
src/features/log-sheets/log-sheet-locking.ts
src/features/log-sheets/approval-validation.ts
src/features/log-sheets/internal/edit-permission.ts
src/features/log-sheets/log-sheet-notifications.ts
src/features/log-sheets/status-with-notifications.ts
src/features/log-sheets/limit-breach-adapter.ts
src/features/log-sheets/log-sheet-chemicals.service.ts
src/features/log-sheets/log-sheet-entries.service.ts
src/features/log-sheets/log-sheet-photos.service.ts
```

### M-11c: Log Sheet Components (Desktop)

```
src/features/log-sheets/components/log-sheet-form.tsx
src/features/log-sheets/components/log-sheet-dialog.tsx
src/features/log-sheets/components/log-sheet-header.tsx
src/features/log-sheets/components/log-sheet-toolbar.tsx
src/features/log-sheets/components/log-sheet-category-section.tsx
src/features/log-sheets/components/category-config.ts
src/features/log-sheets/components/category-sections/*.tsx
src/features/log-sheets/components/inputs/*.tsx
src/features/log-sheets/components/chemical-usage-section.tsx
src/features/log-sheets/components/signature-pad.tsx
src/features/log-sheets/components/signature-section.tsx
src/features/log-sheets/components/machine-selection-panel.tsx
```

### M-11d: Log Sheet Print Preview

```
src/features/log-sheets/components/log-sheet-preview/*.tsx
src/features/log-sheets/components/log-sheet-preview/*.ts
```

### M-11e: Log Sheet Option A (Mobile)

```
src/features/log-sheets/option-a/*.ts
src/features/log-sheets/option-a/components/*.tsx
src/features/log-sheets/context/*.tsx
src/features/log-sheets/hooks/*.ts
```

### M-11f: Log Sheet Pages & Route Components

```
src/app/(main)/log-sheets/page.tsx
src/app/(main)/log-sheets/components/*.tsx
src/app/(main)/log-sheets/[projectId]/page.tsx
src/app/(main)/log-sheets/[projectId]/components/*.tsx
src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx
src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/*.tsx
src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/*.ts
src/app/(main)/log-sheets/[projectId]/[logSheetId]/types.ts
src/app/(main)/log-sheets/[projectId]/[logSheetId]/utils.ts
src/app/(main)/log-sheets/[projectId]/[logSheetId]/entry-state-helpers.ts
```

### M-11g: Log Sheet Tests

```
All *.test.ts and *.characterization.test.* files in log-sheets
```

---

## After Each Scan

1. Save the output as `docs/wbs/modules/M-XX_[MODULE_NAME].md` (e.g., `M-01_DATABASE_SCHEMA.md`, `M-02_AUTH_MIDDLEWARE.md`)
2. Mark the module as `[x]` in `SCANNING_CHECKLIST.md`
3. If chat truncates → open new session → resume from next unchecked `[ ]` module
4. After ALL modules done → merge all files from `docs/wbs/modules/` into `WBS_DETAILED.md` in Epic order
