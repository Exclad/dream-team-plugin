# Session Context

> **Live state for the current session.** Updated after EVERY agent completion — not just at phase
> boundaries — so a rate limit or dead session can resume mid-phase without redoing finished work.
> Read first on every session start.
>
> **Checkpoint protocol:** after every update to this file, run
> `git add .claude/memory && git commit -m "checkpoint: <phase/step>"` (unless
> `checkpoint_commits: off` in `config.md`).

## Current Status

- **Phase:** Idle (no active pipeline)
- **Active Feature:** None
- **Feature Size:** — (S / M / L — decided at end of Phase 0, controls which agents/lanes/gates run)
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

### Lane Status (Phase 3 sub-steps)

Update as each lane launches / commits / merges. On resume, re-run only lanes not yet `merged`.

| Lane | Agent | Status (pending / launched / committed / merged / skipped) | Notes |
|------|-------|--------|-------|
| — | — | — | — |

### Gate Status (Phase 4 sub-steps)

Update each gate's verdict as it lands (verdict = line 1 of its report file). On resume or retry,
re-run ONLY gates that are `pending`, `RUNNING`, or `BLOCKED` — never re-run a `PASSED` gate
unless the code changed after it passed.

A gate's **Pass hash** is `git rev-parse HEAD` at the moment it passed. On re-run: if HEAD still
equals the pass hash, the pass is still valid — skip the gate mechanically, no judgment needed.

| Gate | Report | Verdict (pending / RUNNING / PASSED / BLOCKED / skipped) | Attempt | Pass hash |
|------|--------|---------|---------|-----------|
| smoke-tester | SMOKE.md | — | — | — |
| code-reviewer | REVIEW.md | — | — | — |
| security-auditor | SECURITY.md | — | — | — |
| test-writer | TEST-REPORT.md | — | — | — |
| performance-engineer | PERF.md | — | — | — |
| accessibility-checker | A11Y.md | — | — | — |
| verifier | VERIFICATION.md | — | — | — |

### Agent Spawn Telemetry

Increment as agents are spawned. Feeds the `session_budget` check (config.md) and the session summary —
after two features you can SEE what your model profile actually costs.

| Phase | Spawns | Retries |
|-------|--------|---------|
| 1: Strategy | 0 | 0 |
| 3: Execution | 0 | 0 |
| 4: Verification | 0 | 0 |
| 5: Ship | 0 | 0 |

## Blockers

None.

## Active Decisions

None.

## Recent Sessions

| Date | Feature | Outcome |
|------|---------|---------|
| — | — | — |

## Artifacts

The **Digest** column holds a one-line summary written when the artifact completes — on resume,
read the digests to reorient instead of re-reading the artifacts themselves.

| Artifact | Path | Status | Digest |
|----------|------|--------|--------|
| VISION.md | `.claude/memory/VISION.md` | ⬜ not created | — |
| PLAN.md | `.claude/memory/PLAN.md` | ⬜ not created | — |
| ARCHITECTURE.md | `.claude/memory/ARCHITECTURE.md` | ⬜ not created | — |
| UX-SPEC.md | `.claude/memory/UX-SPEC.md` | ⬜ not created | — |
| SPEC.md | `.claude/memory/SPEC.md` | ⬜ not created | — |
| AI-SPEC.md | `.claude/memory/AI-SPEC.md` | ⬜ n/a unless LLM feature | — |

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
