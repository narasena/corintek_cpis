# {Module Name} — Risk Matrix

> Updated {YYYY-MM-DD}

<!-- PROMPT FOR AI AGENT:
"Based on the dependency map, categorize all files in this module by Risk Level:
- HIGH RISK: Core business logic, heavily coupled, many dependents, god class
- MEDIUM RISK: Shared utilities/types, moderate coupling
- LOW RISK: UI-only, isolated leaf module, few/no dependents
Output a Risk Table."
-->

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god class  |
| 🟡 MEDIUM | Shared utilities/types, moderate coupling, cross-layer dependency |
| 🟢 LOW    | UI-only, isolated leaf module, few/no dependents                  |

---

## Risk Table

| ID   | File        | Lines | Risk | Reason   |
| ---- | ----------- | ----: | :--: | -------- |
| {F1} | {file_path} |     0 |  🔴  | {Reason} |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   0   |       |
| 🟡 MEDIUM  |   0   |       |
|   🟢 LOW   |   0   |       |
