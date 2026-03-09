# {Module Name} — Dependency Map

> Generated: {YYYY-MM-DD}

<!-- PROMPT FOR AI AGENT:
"Analyze this module and create a dependency map:
1. List all files and their roles
2. Identify dependencies between sub-layers
3. Find circular dependencies
4. Identify god classes (>300 lines or >10 methods)
5. Find duplicated code blocks
6. List ALL imports from other modules (cross-module dependencies)
Do NOT suggest fixes yet. Just map the current state."
-->

---

## 1. File Inventory

### {Sub-layer, e.g. App Layer}

| #   | File        | Lines | Role   |
| --- | ----------- | ----: | ------ |
| 1   | {file_path} |     0 | {Role} |

---

## 2. Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Internal"
        A[File A] --> B[File B]
    end

    subgraph "External"
        A --> E1[@/features/...]
    end
```

---

## 3. Circular Dependency Analysis

**Result: {Count} module-level circular dependencies.**

| ID   | Cycle Path    | Severity | Resolution |
| ---- | ------------- | -------- | ---------- |
| {ID} | {A -> B -> A} | {High}   | {Plan}     |

---

## 4. God Classes / Oversized Files

| File   | Lines | Exports | Verdict           |
| ------ | ----: | :-----: | ----------------- |
| {file} |     0 |    0    | {e.g. GOD MODULE} |

---

## 5. Duplicated Code Blocks

| ID    | Description         | Locations        | Status |
| ----- | ------------------- | ---------------- | ------ |
| DUP-1 | {Logic description} | {File A, File B} | {Open} |

---

## 6. Cross-Module Impact

**⚠️ External modules this module imports from or is imported by:**

| Direction       | External Module            | Files Affected | Impact                    |
| --------------- | -------------------------- | -------------- | ------------------------- |
| **Imports**     | {e.g. @/features/users}    | {service.ts}   | {Fetches technician list} |
| **Imported By** | {e.g. @/features/projects} | {types.ts}     | {Uses shared types}       |

**Rule:** If refactoring changes any file listed here, flag the cross-module impact to the user before proceeding.
