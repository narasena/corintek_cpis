---
description: Workflow for scanning project modules and generating WBS with PERT estimation. ACCURACY >>>>> SPEED.
---

# Workflow: WBS Deep Scan

> **🔴 ACCURACY >>>>> SPEED.** This is a deep scan workflow. Every file is read in full.
> Invoke with `/wbs-scan` or `/wbs-scan M-04`

## 1. Initialize

// turbo
1a. Read the checklist: `cat docs/wbs/SCANNING_CHECKLIST.md`

1b. Load the skill: read `.agent/skills/cpis-wbs-scan/SKILL.md` **in full — do not skip any section**

// turbo
1c. Read the template header: `head -70 docs/wbs/WBS_TEMPLATE.md`

1d. Check fast scan reference for this module: `grep -A 50 "EP-XXX" docs/wbs/WBS_DETAILED_FAST.md`

## 2. Pick Module

- If user provided a module ID (e.g., `/wbs-scan M-04`), use that
- Otherwise, find the **next unchecked `[ ]`** module from the checklist
- Print: "🔍 Scanning: M-XX — [Module Name] → EP-XXX"

## 3. Deep Scan (follow ALL skill steps — no shortcuts)

3a. **Read ALL source files using `view_file`** — NOT `view_file_outline`
3b. For each file, record: path, line count, function count, purpose
3c. Assess real complexity — flag deceptively complex code
3d. Cross-reference fast scan output for this Epic
3e. Run dedup check against other Epics
3f. Generate the WBS table per the skill format

## 4. Validate (MANDATORY before saving)

4a. Run the skill's validation checklist:

- [ ] Every file from the checklist has ≥ 1 Task
- [ ] All Task rows have O, L, P, E values
- [ ] E = (O + 4L + P) / 6 for each Task
- [ ] IDs are sequential, no gaps, no cross-epic leaks
- [ ] No fabricated features
- [ ] No duplicate work with other Epics

4b. Generate the File Manifest table
4c. Generate the Confidence Assessment

## 5. Save Output

5a. Save as per-module file: `docs/wbs/modules/M-XX_[MODULE_NAME].md` - Example: `M-01_DATABASE_SCHEMA.md`, `M-02_AUTH_MIDDLEWARE.md`, `M-11_LOG_SHEETS.md`
5b. File contains: WBS table + File Manifest + Confidence Assessment
5c. Mark the module as `[x]` in `docs/wbs/SCANNING_CHECKLIST.md`

## 6. Report

Print summary:

```
✅ Module M-XX scanned → EP-XXX: [name]
   Expected hours: ~XX hrs
   Files covered: X/Y (100%)
   Confidence: XX% [🟢/🟡/🔴]
   Cross-ref fast scan: matched N tasks, found M additional
   Next unchecked: M-YY
```

## After ALL Modules Done

7. Merge all files from `docs/wbs/modules/` into `docs/wbs/WBS_DETAILED.md` in Epic order

8. Calculate totals for `docs/wbs/WBS_SUMMARY.md`:
   - Sum Expected hours per Epic
   - Cost = hours × Rp 85,000
   - Fill summary table and contract comparison

9. Final reconciliation:
   - Compare deep scan total vs fast scan total (Rp 42.2M)
   - Document the delta and what was missed/found

## Rules

- **🔴 ACCURACY >>>>> SPEED** — take as long as needed
- **One module per invocation** — run `/wbs-scan` again for the next
- **If chat truncates:** New session → `/wbs-scan` → auto-resumes from next `[ ]`
- **M-11 (Log Sheets):** Split into sub-scans M-11a through M-11g (see `docs/wbs/SCANNING_PROMPT.md`)
- **Large modules (>20 files):** Split into 2 scans
- **Confidence gate:** Only mark `[x]` if confidence ≥ 85%. Below that → re-scan
