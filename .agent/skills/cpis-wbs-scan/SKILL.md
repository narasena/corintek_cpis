---
name: cpis-wbs-scan
description: Deep-scans a project module and generates WBS entries in PERT format. ACCURACY >>>>> SPEED.
---

# CPIS WBS Module Scanner (Deep Scan Mode)

> **🔴 MOTHER RULE: ACCURACY >>>>> SPEED.**
> Better to take 60 minutes producing accurate output than 5 minutes producing garbage.
> Read every line. Understand every function. Question every estimate.

## When to Use

- User asks to "scan module X for WBS"
- User invokes `/wbs-scan`
- User says "scan next module" or "continue WBS"
- Working through modules in `docs/wbs/SCANNING_CHECKLIST.md`

## Prerequisites (read EVERY time, no shortcuts)

1. `docs/wbs/SCANNING_CHECKLIST.md` — identify which module to scan
2. `docs/wbs/WBS_TEMPLATE.md` (first 70 lines) — output format reference
3. `docs/wbs/SCANNING_PROMPT.md` — estimation guide and Log Sheet split strategy
4. `docs/wbs/WBS_DETAILED_FAST.md` — cross-reference the fast scan output for this module's Epic

## Instructions

### Step 1: Identify the Module

- If user specified a module ID (e.g., "M-04"), use that
- Otherwise, find the next unchecked `[ ]` module in `SCANNING_CHECKLIST.md`
- Note: module ID, Epic ID, file paths, and scope description

### Step 2: Deep-Scan All Source Files

**For EVERY file listed in the checklist for this module:**

1. **Read the FULL file** — use `view_file`, NOT `view_file_outline`
   - Exception: files >500 lines may be read in chunks, but ALL chunks must be read
2. **Record the file manifest** — for each file, note:
   - Filename and full path
   - Line count
   - Function/component count
   - What it does (1-line summary)
3. **Assess real complexity** — look for:
   - **Deceptively simple code** — short files with complex logic (transactions, state machines, multi-step validation, recursive operations)
   - **Integration complexity** — files that orchestrate multiple services or manage cross-cutting concerns
   - **Edge case handling** — error handling, null checks, timezone logic, role-based branching
   - **Business rules** — domain-specific logic that required understanding the business context to implement

> ⚠️ SHORT CODE ≠ SIMPLE WORK. A 30-line range validator that handles 4 roles × 2 value types × raw/treated water is NOT a 1-hour task.

### Step 3: Cross-Reference Fast Scan

Before generating, check `WBS_DETAILED_FAST.md` for this module's Epic:

- What tasks were already identified?
- Were any files skipped?
- Were any estimates suspiciously low for the complexity observed?
- Are there duplicate tasks that overlap with other Epics?

### Step 4: Deduplication Check

Before writing ANY task, ask: **"Is this work already counted in another Epic?"**

Common overlaps to watch for:

- Avatar upload (EP-002 Users vs EP-016 Infrastructure)
- Machine sync (EP-004 Projects vs EP-005 Machines)
- Signature pad (EP-010 Log Sheets vs EP-011 Work Reports)
- R2 integration (multiple Epics vs EP-017 Cloudflare Worker)
- Shared components (per-feature vs EP-016 Infrastructure)

**Rule:** Count shared/reusable work in EP-016 (Infrastructure). Count feature-specific usage/integration work in the feature's Epic. Never double-count.

### Step 5: Generate WBS Table

```markdown
## EP-XXX: [Epic Name]

| ID  | Parent | Type | Item |   O |   L |   P |   E |
| :-- | :----- | :--- | :--- | --: | --: | --: | --: |
```

**Hierarchy:** Epic → User Story → Acceptance Criteria → Work Package → Task

**Work Packages:** Frontend (UI/UX), Backend (Logic & APIs), Database, Testing & QA

**Rules:**

- PERT hours ONLY on Task rows. Formula: `E = (O + 4L + P) / 6`
- Parent rows use **Σ** — do NOT calculate sums
- Sequential IDs within the Epic (TK-XXX-001, TK-XXX-002...)
- **Use the correct Epic ID** — verify against `WBS_SUMMARY.md` mapping
- Estimate as a **mid-level developer** (2-3 years experience, Rp 85,000/hr)

### Step 6: PERT Estimation Reference

| Work Type                        |   O |   L |   P | Notes                                  |
| :------------------------------- | --: | --: | --: | :------------------------------------- |
| Simple CRUD page (list + dialog) |   2 |   4 |   6 | Standard DataTable + form pattern      |
| Complex form with validation     |   3 |   5 |   8 | Multi-section, conditional fields      |
| DataTable with columns + sorting | 1.5 |   3 |   5 | Column defs, formatters, actions       |
| Server action (simple CRUD)      | 0.5 | 1.5 |   3 | Validate → call service → revalidate   |
| Server action (complex logic)    |   2 |   4 |   7 | Multi-step, transactions, side effects |
| Service layer (simple CRUD)      | 0.5 | 1.5 |   3 | Single Prisma query + RBAC check       |
| Service layer (complex)          |   2 |   5 |   9 | Transactions, joins, business rules    |
| Prisma schema (per model)        | 0.5 | 1.5 |   3 | Model + relations + indexes            |
| Unit test file                   |   1 |   3 |   5 | Mocks, assertions, edge cases          |
| Characterization test            |   2 |   4 |   7 | Existing behavior documentation        |
| Responsive/mobile adaptation     | 1.5 |   4 |   7 | Breakpoints, touch, mobile-first       |
| Print layout (CSS @media)        | 1.5 |   3 |   5 | A4 formatting, page breaks             |
| Signature pad integration        |   2 |   4 |   6 | Canvas API, touch+mouse, R2 upload     |
| Photo upload/camera              |   2 |   4 |   6 | Browser camera, compression, R2        |
| Zod schema + types file          | 0.5 |   1 |   2 | Validation rules, type exports         |
| Context/state management         |   1 |   2 |   4 | React context, reducers                |
| Custom hook                      |   1 |   2 |   3 | State + side effects encapsulation     |
| State machine / approval flow    |   2 |   4 |   7 | Status transitions, guard clauses      |
| Range/limit validation logic     |   1 |   2 |   4 | Multi-role, multi-type checking        |
| Timezone/date handling           |   1 |   2 |   4 | Jakarta TZ, date-fns, edge cases       |

### Step 7: Write Output

Save the scan result as a **per-module file** in the modules folder:

```
docs/wbs/modules/M-XX_[MODULE_NAME].md
```

Examples:

- `docs/wbs/modules/M-01_DATABASE_SCHEMA.md`
- `docs/wbs/modules/M-02_AUTH_MIDDLEWARE.md`
- `docs/wbs/modules/M-11_LOG_SHEETS.md`

The file should contain: WBS table + File Manifest + Confidence Assessment.

After saving, mark the module as `[x]` in `SCANNING_CHECKLIST.md`.

> **After ALL modules are scanned:** Merge all files from `docs/wbs/modules/` into `docs/wbs/WBS_DETAILED.md` in Epic order.

### Step 8: File Manifest (REQUIRED)

After the WBS table, output a coverage manifest:

```markdown
### File Manifest — M-XX: [Module Name]

| #   | File                 | Lines | Functions | Covered By | Complexity             |
| :-- | :------------------- | ----: | --------: | :--------- | :--------------------- |
| 1   | `path/to/file.ts`    |    85 |         3 | TK-XXX-001 | Standard               |
| 2   | `path/to/complex.ts` |    32 |         1 | TK-XXX-005 | ⚠️ Deceptively complex |
```

**Complexity flags:**

- `Standard` — effort matches code size
- `⚠️ Deceptively complex` — short code, complex logic
- `🔗 Integration-heavy` — orchestrates multiple services
- `📋 Business rules` — domain-specific knowledge required

### Step 9: Confidence Assessment (REQUIRED)

End every scan with:

```markdown
### Confidence: [XX]%

**Justification:**

- Files scanned: X/Y (100%)
- Functions covered: X/Y
- Gaps: [list any known gaps or uncertainties]
- Cross-ref vs fast scan: [matched / found N additional items]

**Status:** [🔴 Redo Required | 🟡 Acceptable | 🟢 High Confidence]
```

**Thresholds:**

- 🔴 <85% — Must re-scan, files missed or major logic skipped
- 🟡 85-96% — Acceptable for first pass, flag gaps for review
- 🟢 97%+ — Declare module DONE

## Anti-Patterns

- ❌ Do NOT use `view_file_outline` as primary scan method — you MUST read actual code
- ❌ Do NOT hallucinate features — only document what exists in source files
- ❌ Do NOT skip files — every file ≥ 1 Task
- ❌ Do NOT scan multiple modules in one session
- ❌ Do NOT calculate parent Σ sums — leave as Σ
- ❌ Do NOT reuse IDs from other Epics (e.g., TK-011 inside EP-009)
- ❌ Do NOT scan M-11 (Log Sheets) in one pass — split per `SCANNING_PROMPT.md`
- ❌ Do NOT rush — ACCURACY >>>>> SPEED
- ❌ Do NOT estimate based on line count alone — understand the LOGIC, then estimate
