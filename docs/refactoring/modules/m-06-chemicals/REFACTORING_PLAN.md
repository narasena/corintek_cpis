# {Module Name} — Refactoring Plan

{Brief description of the module's current state and goals.}

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area | Pain Level | Risk Level | Business Value | Priority | Evidence |
| ---- | ---------- | ---------- | -------------- | :------: | -------- |
| {e.g. Service Layer} | {High} | {High} | {Critical} | P2 | {e.g. God module, 1000+ LOC} |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. {Step 1: Isolated leaf modules}
2. {Step 2: Utility consolidation}
3. {Step 3: Core logic extraction}

---

## 3. Testing Strategy

> **"Lock current behavior, not test results."**

### What to test first

| Priority | What | Why | Type |
| :------: | ---- | --- | ---- |
| 1 | {e.g. Utils} | {High fan-out, pure functions} | Unit |

---

## 4. Phased Execution

### Phase 1: Foundation — Tests + Quick Wins
- [ ] {Task 1.1}
- [ ] {Task 1.2}

### Phase 2: Deduplication & Clean-up
- [ ] {Task 2.1}

### Phase 3: Structural Refactoring
- [ ] {Task 3.1}

---

## 5. Verification Plan
- [ ] {Checklist item 1}
- [ ] {Checklist item 2}
