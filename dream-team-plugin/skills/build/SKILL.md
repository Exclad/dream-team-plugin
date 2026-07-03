---
name: build
description: Execute from approved plans with parallel worktree lanes
---

# /build — Execute From Approved Plans

Execute implementation across parallel worktree lanes using the strategy artifacts.

**Prerequisites:**
- `.claude/memory/PLAN.md` must exist
- `.claude/memory/ARCHITECTURE.md` must exist
- User must have approved the plans (Phase 2 complete in context.md)

## Prompt Length Constraint

Keep per-agent prompts focused and under ~2,000 characters. Point agents to memory files (`.claude/memory/*.md`) for detailed specifications rather than embedding them inline — agents can read files themselves, and short prompts keep the orchestrator's context lean.

## How to run lanes in parallel

The Agent tool has no `run_in_background` parameter. To run lanes in parallel, issue all the Agent tool calls in a single message.

## Conventions (apply to every lane)

- **Model:** read `.claude/memory/config.md`; pass the **execution** role's model as the `model` parameter on each Agent call (`inherit` → omit; config missing → `sonnet`).
- **Lane-scoped reads:** if ARCHITECTURE.md has `## Lane: <name>` sections, tell each lane to read only its own section (plus UX-SPEC/SPEC where relevant) — not the whole file.
- **Append to every prompt:** "Return a ≤10-line summary — do NOT paste code back."
- **Pacing:** if config says `pacing: conservative`, max 2 concurrent lanes — sequential pairs, checkpoint between pairs.
- **Telemetry:** increment the Agent Spawn Telemetry table (Phase 3 row) with every spawn and retry.
- **Checkpoint:** track lanes in the **Lane Status** table in `.claude/memory/context.md` (pending / launched / committed / merged / skipped). Update the table as EACH lane returns and again when merged, committing each time: `git add .claude/memory && git commit -m "checkpoint: lane <name> <status>"` (unless `checkpoint_commits: off`). On resume, re-run only lanes not yet `merged`.

## Execution

### Step 0: Verify prerequisites
Read `.claude/memory/context.md`. If Phase 2 (User Approval) is not marked complete, STOP and tell the user: "Plans haven't been approved yet. Run `/plan` first and review the outputs."

### Step 1: Foundation — Scaffold Project Skeleton

**Do this BEFORE forking worktree lanes.** This prevents merge chaos.

0. **Feature branch** (if config `pr_flow` is `on`, or `auto` with `gh` + origin remote available): `git checkout -b feature/<slug>`; record the branch in context.md
1. Read ARCHITECTURE.md to determine the project structure
2. Create base directory structure (e.g., `src/`, `app/`, `components/`, `lib/`, `api/`)
3. Initialize shared config files: `package.json`, `tsconfig.json`, `.gitignore`, framework config
4. Create shared types and constants files
5. Commit this foundation: `git commit -m "Foundation: project skeleton"`

**Only THEN** proceed to Step 2. Lanes must NOT create their own package.json or config files — those already exist from Foundation.

### Step 1b: TDD step (if config `tdd: on`)

Agent call, `model` = verification role: "You are the test-writer agent. Read the acceptance criteria in `.claude/memory/PLAN.md` (and SPEC.md if present). Write FAILING tests encoding each criterion — one test per criterion, named after its task ID. No production code. Commit the tests. Return a ≤10-line summary listing test file paths." Verify they fail, commit, checkpoint. Then append to every lane prompt: "Failing tests encoding your acceptance criteria exist at [paths]. Make YOUR lane's tests pass without modifying the tests."

### Step 2: Identify work streams

Read `.claude/memory/PLAN.md` and `.claude/memory/ARCHITECTURE.md`. Identify independent work streams. Not all 5 lanes are always needed — only launch lanes where there is actual work to do.

### Step 3: Launch execution lanes IN PARALLEL

Each lane gets git worktree isolation (`isolation: "worktree"`). Launch all needed lanes simultaneously:

**Lane A: Frontend** (if UI work exists)
Use the Agent tool:
- isolation: "worktree"
- description: "Frontend implementation"
- subagent_type: "dream-team:frontend-dev"
- prompt: "You are the frontend-dev agent. Read `.claude/memory/UX-SPEC.md` and `.claude/memory/ARCHITECTURE.md`. Implement all UI components. Follow your anti-slop discipline, Emil Kowalski animation framework, 3-dial system (VARIANCE/MOTION/DENSITY), 7 interaction states, and design system alignment. Produce working code with Before/After/Why review format. Commit your work in the worktree before returning."

**Lane B: Backend** (if API/business logic work exists)
Use the Agent tool:
- isolation: "worktree"
- description: "Backend implementation"
- subagent_type: "dream-team:backend-dev"
- prompt: "You are the backend-dev agent. Read `.claude/memory/ARCHITECTURE.md` and `.claude/memory/SPEC.md`. Implement API routes, business logic, and validation. Follow API design workflow with idempotency emphasis. Produce working code. Commit your work in the worktree before returning."

**Lane C: Data** (if schema/migration work exists)
Use the Agent tool:
- isolation: "worktree"
- description: "Data layer implementation"
- subagent_type: "dream-team:data-engineer"
- prompt: "You are the data-engineer agent. Read `.claude/memory/ARCHITECTURE.md`. Implement schema design, migrations, queries. Use EXPLAIN analysis. Produce working code. Commit your work in the worktree before returning."

**Lane D: DevOps** (if infra/deployment work exists)
Use the Agent tool:
- isolation: "worktree"
- description: "DevOps implementation"
- subagent_type: "dream-team:devops-engineer"
- prompt: "You are the devops-engineer agent. Read `.claude/memory/ARCHITECTURE.md`. Produce Dockerfile, CI/CD config, deployment manifests. Follow infrastructure-as-code principles. Commit your work in the worktree before returning."

**Lane E: General** (remaining PLAN.md tasks)
Use the Agent tool:
- isolation: "worktree"
- description: "General execution"
- subagent_type: "dream-team:executor"
- prompt: "You are the executor agent. Read `.claude/memory/PLAN.md`. Execute remaining tasks not covered by other lanes. Follow-the-plan-exactly. Smallest viable diff per task. Escalate if a task is blocked. Commit your work in the worktree before returning."

### Step 4: Collect and merge

Wait for all lanes to complete. For each lane:
1. Check: did the lane produce code changes? (verify `git diff` in the worktree)
2. If a lane produced NO changes: re-invoke that lane ONCE with: "You returned without producing code. Implement your assigned tasks NOW."
3. If still no changes after retry: log the failure, orchestrator implements that lane's work
4. Verify the worktree has been committed, then merge it
5. Check for merge conflicts — resolve if any
6. Confirm the lane output matches what PLAN.md specified

### Step 5: Update context

Update `.claude/memory/context.md`:
- Set "Current Status" → Phase: Execution complete
- Mark Phase 3 complete in pipeline table; all Lane Status rows `merged` or `skipped`
- Record each lane's actual effort vs its PLAN.md estimate in the Adaptive Estimation Ledger
- Note any deviations from PLAN.md
- Update "Last Updated" timestamp
- Commit the checkpoint

### Step 6: Proceed to verification

Tell the user: "Execution complete. Run `/review` to verify all changes."
