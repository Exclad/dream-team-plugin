# Session Context

> **Live state for the current session.** Updated at the end of every phase. Read first on every session start.

## Current Status

- **Phase:** Idle (no active pipeline)
- **Active Feature:** None
- **Session Started:** 2026-06-22
- **Last Updated:** 2026-06-22

## Active Pipeline

| Phase | Status | Started | Completed | Attempt |
|-------|--------|---------|-----------|---------|
| 0: Interview | ⬜ pending | — | — | — |
| 1: Strategy | ⬜ pending | — | — | — |
| 2: Approval | ⬜ pending | — | — | — |
| 3: Execution | ⬜ pending | — | — | — |
| 4: Verification | ⬜ pending | — | — | 0/3 |
| 5: Ship | ⬜ pending | — | — | — |

**Pipeline rule:** Phases execute in order. No phase skipped. Phase 2 (approval) is mandatory — never proceed without explicit user approval. Phase 4 has a 3-attempt retry limit; on 3rd fail, escalate to product-manager for re-scoping.

## Blockers

None.

## Active Decisions

None.

## Recent Sessions

| Date | Feature | Outcome |
|------|---------|---------|
| — | — | — |

## Artifacts

| Artifact | Path | Status | Last Updated |
|----------|------|--------|-------------|
| VISION.md | `.claude/memory/VISION.md` | ⬜ not created | — |
| PLAN.md | `.claude/memory/PLAN.md` | ⬜ not created | — |
| ARCHITECTURE.md | `.claude/memory/ARCHITECTURE.md` | ⬜ not created | — |
| UX-SPEC.md | `.claude/memory/UX-SPEC.md` | ⬜ not created | — |
| SPEC.md | `.claude/memory/SPEC.md` | ⬜ not created | — |
| REVIEW.md | `.claude/memory/REVIEW.md` | ✅ exists | 2026-06-22 |

---

## Adaptive Estimation Ledger

Track every task from PLAN.md. Update after Phase 3 (execution) and Phase 4 (verification retries).

### Current Feature Tasks

| Task ID | Description | Est. Effort | Actual Effort | Deviation | Reason |
|---------|-------------|-------------|---------------|-----------|--------|
| — | — | — | — | — | — |

### Drift Detection

Borrowed from spec_driven_develop. Check after each phase:

| Threshold | Meaning | Action |
|-----------|---------|--------|
| ≥20% of phase tasks off estimate | Minor drift | Annotate next task with warning. Log reason. |
| ≥40% of phase tasks off estimate | Significant drift | HALT execution. Re-decompose remaining tasks with architect. |
| ≥60% of phase tasks off estimate | Severe drift | Return to concierge + PM for scope re-evaluation. |

**Drift check protocol:**
1. After each phase completes, count tasks where actual effort deviates from estimate by >50%
2. If ≥20%: add a warning annotation to `.claude/memory/context.md` under Blockers
3. If ≥40%: stop, invoke architect to re-decompose remaining work
4. If ≥60%: stop, invoke concierge + product-manager to re-scope

### Estimation Scale

| Label | Meaning | Expected Duration |
|-------|---------|-------------------|
| S | Trivial — single file, well-understood | <15 min agent time |
| M | Moderate — few files, some decisions | 15-60 min agent time |
| L | Large — multiple files, design needed | 1-4 hrs agent time |
| XL | Epic — requires decomposition into sub-tasks | >4 hrs agent time |

---

## Self-Learning State

### Patterns Discovered This Session

None yet.

### Pattern Promotion Queue

| Pattern | Occurrences | Threshold | Status |
|---------|-------------|-----------|--------|
| — | — | 5 for permanent rule | — |

**Promotion rules:**
- 5+ occurrences in `.claude/memory/patterns/` → promote to `.claude/rules/` (project-level permanent)
- 2+ projects with same pattern → promote to `~/.claude/rules/` (global)

### Error Count This Session

0 errors logged.

---

## Next Steps (auto-populated)

After reading this file on session start:
1. Read `CLAUDE.md` if not already loaded
2. Read relevant ADRs from `.claude/memory/decisions/`
3. Read relevant patterns from `.claude/memory/patterns/`
4. Check `.claude/memory/errors/error-ledger.jsonl` for recent errors
5. Resume from "Current Status" phase above
