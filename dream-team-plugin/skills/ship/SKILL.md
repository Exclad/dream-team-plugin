---
name: ship
description: Ship it — docs, release notes, version bump, PR, final approval
---

# /ship — Documentation + Release + Final Approval

**Prerequisite:** All verification gates must pass (Phase 4 complete in context.md). If gates haven't passed, refuse and say: "Verification gates haven't passed yet. Run `/review` first."

## Conventions

- **Model:** read `.claude/memory/config.md`; pass the **ship** role's model as the `model` parameter on each Agent call (`inherit` → omit; config missing → `sonnet`).
- **Append to every prompt:** "Return a ≤10-line summary — do NOT paste files back."
- **Checkpoint:** after each step, update `.claude/memory/context.md` and run `git add .claude/memory && git commit -m "checkpoint: ship <step>"` (unless `checkpoint_commits: off`).

## Gap-Filling Rule

Wait for ALL agents to complete before writing any file yourself. If an agent takes longer than expected, wait — do not preemptively write what you think it will produce. Two versions of the same file wastes work. If an agent fails to produce output after 1 retry, the orchestrator takes over.

## Execution

### Step 1: docs-writer
Use the Agent tool: description="Generate documentation"
- subagent_type: "dream-team:docs-writer"
- prompt: "You are the docs-writer agent. Read `.claude/memory/VISION.md`, `.claude/memory/PLAN.md`, `.claude/memory/ARCHITECTURE.md`, and the current codebase. Produce: (1) README.md, (2) API docs for new/changed endpoints, (3) CHANGELOG.md entry. You are NOT done until these files exist on disk. Write them NOW."

**Verify:** After agent returns, check that CHANGELOG.md was created. If NO, re-invoke ONCE. If still NO, orchestrator writes it.

### Step 2: release-manager
Use the Agent tool: description="Create release"
- subagent_type: "dream-team:release-manager"
- prompt: "You are the release-manager agent. Run your release readiness checklist. Then: (1) Determine semver bump, (2) Prepare release notes and a PR description linking the memory artifacts. Do NOT create a git tag — tagging happens after merge. You are NOT done until the version is determined and the notes are written."

**Verify:** After agent returns, check that a version was determined. If NO, re-invoke ONCE.

### Step 2b: Open the PR
If a feature branch was created at Foundation (config `pr_flow`): push the branch and run `gh pr create` with the release-manager's PR description; present the link. Tag only after the PR merges. If `pr_flow` is off: no PR; create the tag now on the current branch.

### Step 2c: Estimation drift check
Compare actual vs estimated effort in context.md's Adaptive Estimation Ledger. Apply the documented thresholds (≥20% off → warning under Blockers; ≥40% → flag re-decomposition need). Record the drift summary for the session summary.

### Step 3: Final vision check (runs INLINE — not as a subagent)
Subagents cannot talk to the user, so you do this yourself:
1. Read `.claude/memory/VISION.md` — what the user originally wanted.
2. Examine what was actually built (codebase, docs, memory artifacts).
3. Present a structured requested-vs-delivered comparison to the user and ask: "Here's what we built. Does this match your vision?"

### Step 3b: Pattern promotion (self-learning)
1. Scan `.claude/memory/patterns/*.md` and read each pattern's `Occurrences` count.
2. Any pattern with 5+ occurrences not yet in `.claude/rules/`: write it there as a permanent rule and tick the pattern's Promotion Status.
3. Update the Pattern Promotion Queue table in `.claude/memory/context.md`.

### Step 4: Create session summary
Create `.claude/memory/sessions/YYYY-MM-DD.md` using the session summary template from `.claude/memory/sessions/_TEMPLATE.md`. Include:
- Date and feature name
- Pipeline phases completed
- Agents invoked + the Agent Spawn Telemetry table from context.md (spawns/retries per phase — this is how you learn what your model profile actually costs)
- Key decisions made
- Patterns discovered
- Artifacts produced

### Step 5: Update context
Update `.claude/memory/context.md`:
- Mark Phase 5 complete
- Set "Current Status" → Phase: Idle (pipeline complete)
- Update all pipeline phases to ✅ complete
- Add session to "Recent Sessions" table
- Update "Last Updated" timestamp

### Step 6: Final report
Present to the user:
- Summary of everything built
- Link to PR (if created)
- List of all artifacts
- "The dream team pipeline is complete. 🎉"
