# CG-05 Conversation Log - Index

**Master Document:** `cg-05-caching-specification.md`

## Document Structure

This conversation log contains complete specifications for CG-05 (Next.js Data Caching) in a single comprehensive markdown file.

### Sections

1. **Executive Summary** — Problem, solution, effort, risk
2. **Phase 1: Architecture Analysis** — Pattern, cache strategy, ReactQuery decision
3. **Phase 2: Interface/Type Design** — `ECacheTag`, `ECacheLifeProfile`, `ICacheConfig`, error types
4. **Phase 3: BDD Scenarios** — 19 scenarios covering happy path, validation, edge cases
5. **Phase 4: Module Stubs** — Code templates for `tags.ts`, `config.ts`, `next.config.ts`
6. **Implementation Checklist** — Step-by-step execution plan
7. **Decisions & Rationale** — Key architectural choices
8. **Gotchas & Mitigations** — Known issues and solutions
9. **Rollback Plan** — Quick recovery steps
10. **Next Steps** — Required user decisions before implementation

## Quick Reference

| Topic                       | Location                            |
| --------------------------- | ----------------------------------- |
| Cache tags list             | `tags.ts` stub in Phase 4           |
| TTL profiles                | `config.ts` stub + `next.config.ts` |
| Service modifications       | Implementation Checklist Phase 2    |
| Action invalidation mapping | Implementation Checklist Phase 3    |
| BDD scenarios complete list | Phase 3 section                     |
| User decisions pending      | End of document                     |

## To Continue Implementation

1. Read this entire document
2. Answer the 4 user decision questions at the end
3. Approve Phase 4-5 execution
4. Agent will implement in order:
   - Create cache infrastructure files
   - Update `next.config.ts`
   - Modify services (add `'use cache'`)
   - Modify actions (replace `revalidatePath`)
   - Test and verify

## Preservation Note

This document is the single source of truth for CG-05. If agent context is lost, reload this file to resume implementation exactly where we left off.

All decisions, specifications, and BDD scenarios are preserved.
