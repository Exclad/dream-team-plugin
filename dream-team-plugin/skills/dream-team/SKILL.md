---
name: dream-team
description: Full 6-phase pipeline — from vision to shipped code
argument-hint: "what you want to build"
---

# /dream-team — Full 6-Phase Pipeline

You are the **dream team orchestrator**. Execute the full 6-phase pipeline from vision to shipped code using 27 specialized agents, 6 verification gates, and structured memory. Follow every phase in order. Skip nothing.

## Architecture Overview

```
Phase 0: INTERVIEW → concierge → VISION.md
Phase 1: STRATEGY → 4 agents parallel → PLAN.md, ARCHITECTURE.md, UX-SPEC.md, SPEC.md → plan-checker gate
Phase 2: USER APPROVAL → mandatory checkpoint — user must explicitly approve
FOUNDATION: Scaffold project skeleton in main branch → commit
Phase 3: EXECUTION → up to 5 parallel worktree lanes → working code
Phase 4: VERIFICATION → 6 parallel gates → all must pass (3-attempt retry loop)
Phase 5: SHIP → docs-writer + release-manager + concierge re-check → session summary
```

**Hard rules:**
- NEVER skip a phase. The pipeline exists for quality.
- NEVER skip Phase 2. User approval is mandatory.
- NEVER skip the Foundation step. Lanes need a shared skeleton to build on.
- NEVER proceed past a blocking gate. Blocked means blocked.
- ALWAYS update `.claude/memory/context.md` between phases.
- ADHERE to the 3-attempt retry limit in Phase 4.

### Prompt Length Constraint

Keep per-agent prompts under 2,000 characters. Point agents to memory files (`.claude/memory/*.md`) for detailed specifications rather than embedding them inline. Long prompts cause JSON parsing failures that silently kill agents. If a spec is long, just reference the file path.

### Agent Output Verification (applies to ALL agent invocations)

After EVERY agent invocation, check: did the agent produce its required output file?
- If YES: proceed to next step.
- If NO: Re-invoke the agent ONCE with: "You returned without writing [FILENAME]. Write it NOW. Your ONLY job is producing this file."
- If still NO after retry: log the failure, then the orchestrator writes the file. Maximum 1 retry per agent.

---

## Phase 0: Interview

**Agent:** concierge
**Input:** $ARGUMENTS (user's request)
**Output:** `.claude/memory/VISION.md`

Use the Agent tool:
- description: "Concierge interview — Phase 0"
- subagent_type: "dream-team:concierge"
- prompt: "You are the concierge agent. The user wants to build: $ARGUMENTS. Begin the interview NOW — ONE question at a time. Walk the decision tree depth-first. Provide recommended answers with every question. Explore the codebase before asking questions it can answer. Do NOT stop until the vision is fully crystallized. When complete, output the full VISION.md document."

When the concierge finishes:
1. Write its final VISION.md content to `.claude/memory/VISION.md`
2. Update `.claude/memory/context.md`: mark Phase 0 complete, Phase 1 in progress
3. Confirm with user: "Does this VISION.md capture what you want?"

---

## Phase 1: Strategy (4 Agents Parallel → plan-checker Gate)

**Input:** `.claude/memory/VISION.md`
**Outputs:** PLAN.md, ARCHITECTURE.md, UX-SPEC.md, SPEC.md

### Step 1.1: Launch 4 agents IN PARALLEL

Launch all 4 simultaneously (each with `run_in_background: true`):

**product-manager:**
- description: "PM — Phase 1"
- subagent_type: "dream-team:product-manager"
- prompt: "You are the product-manager agent. Read `.claude/memory/VISION.md`. Write `.claude/memory/PLAN.md` with: user stories, acceptance criteria, scope boundaries (in/out), task breakdown with dependencies, effort estimates (S/M/L/XL) per task."

**architect:**
- description: "Architect — Phase 1"
- subagent_type: "dream-team:architect"
- prompt: "You are the architect agent. Read `.claude/memory/VISION.md`. Write `.claude/memory/ARCHITECTURE.md` with: system design, component architecture, API contracts, data model, technology choices with trade-off rationale, deployment architecture."

**ux-designer:**
- description: "UX — Phase 1"
- subagent_type: "dream-team:ux-designer"
- prompt: "You are the ux-designer agent. Read `.claude/memory/VISION.md` and (if available) `.claude/memory/PLAN.md`. Write `.claude/memory/UX-SPEC.md` with: user flows, IA, wireframe descriptions, component hierarchy, interaction patterns. Define 'what' and 'why' — NOT 'how'. Specify accessibility requirements at UX level."

**spec-phase:**
- description: "Spec — Phase 1"
- subagent_type: "dream-team:spec-phase"
- prompt: "You are the spec-phase agent. Read `.claude/memory/VISION.md`. Write `.claude/memory/SPEC.md` with: formal specification, ambiguity scoring (1-5), 8-category edge completeness probe, MUST-NOT prohibition coverage, tiered verification criteria."

### Step 1.2: Wait for all 4 to complete

Verify each output file was written.

### Step 1.3: Gate — plan-checker

- description: "Plan-checker gate — Phase 1"
- subagent_type: "dream-team:plan-checker"
- prompt: "You are the plan-checker agent. Apply your DETAIL MANDATE. Review: `.claude/memory/PLAN.md`, `.claude/memory/ARCHITECTURE.md`, `.claude/memory/UX-SPEC.md`, `.claude/memory/SPEC.md`. Perform 7-point detail check. Reject vague or incomplete plans. Verdict: APPROVED or REVISION NEEDED (specify which agent(s) and what's missing)."

**If REVISION NEEDED:** Re-invoke failed agents with plan-checker feedback. Re-run plan-checker. Max 2 revision rounds.

### Step 1.4: Update context

Update `.claude/memory/context.md`: mark Phase 1 complete, Phase 2 in progress. Update Artifacts table. Record effort estimates from PLAN.md in the estimation ledger.

---

## Phase 2: User Approval (MANDATORY CHECKPOINT)

**STOP. Do not proceed without explicit user approval.**

Present a structured summary:
- **PLAN.md:** N user stories, M tasks, scope boundaries
- **ARCHITECTURE.md:** System design, API surface, data model, tech choices
- **UX-SPEC.md:** User flows, IA, component hierarchy
- **SPEC.md:** Formal spec, ambiguity scores, edge cases covered

Ask the user explicitly:
- **Approve** → proceed to Phase 3
- **Modify** → describe changes; re-invoke specific agents
- **Reject** → return to Phase 0 or Phase 1

Wait for the user's response. Do NOT assume approval.

Update `.claude/memory/context.md`: mark Phase 2 complete, Foundation in progress.

---

## Foundation Step: Scaffold Project Skeleton

**STOP. Do this BEFORE forking into worktree lanes.** This prevents merge chaos (#9, #10, #11, #26).

Before parallel lanes begin, scaffold the shared project skeleton in the main branch:

1. Read ARCHITECTURE.md to determine the project structure
2. Create the base directory structure (e.g., `src/`, `app/`, `components/`, `lib/`, `api/`)
3. Initialize shared config files: `package.json`, `tsconfig.json`, `.gitignore`, framework config
4. Create shared types and constants files
5. Set up the base dependency list
6. Commit this foundation with message: "Foundation: project skeleton"

**Only THEN** fork into worktree lanes. Each lane only adds its specific code into the already-correct directory structure. Lanes must NOT create their own package.json or config files — those already exist.

Update `.claude/memory/context.md`: mark Foundation complete, Phase 3 in progress.

---

## Phase 3: Execution (Parallel Worktree Lanes)

**Input:** Approved PLAN.md, ARCHITECTURE.md, UX-SPEC.md, SPEC.md  
**Prerequisite:** Foundation step complete (project skeleton exists and is committed)

### Step 3.1: Identify needed lanes

Read PLAN.md. Only launch lanes where there is actual work. Not all 5 lanes are always needed.

### Step 3.2: Launch lanes IN PARALLEL

Launch each needed lane as an Agent with `isolation: "worktree"` and `run_in_background: true`. All lanes start simultaneously:

**Lane A — frontend-dev:** (if UI work exists)
Use the Agent tool: isolation="worktree", run_in_background=true, description="Frontend lane"
- subagent_type: "dream-team:frontend-dev"
- prompt: "You are the frontend-dev agent. Read `.claude/memory/UX-SPEC.md` and `.claude/memory/ARCHITECTURE.md`. Implement all UI components. Follow your anti-slop discipline, Emil Kowalski animation framework, 3-dial system (VARIANCE/MOTION/DENSITY), 7 interaction states, and design system alignment. Produce working code with Before/After/Why format."

**Lane B — backend-dev:** (if API/business logic exists)
Use the Agent tool: isolation="worktree", run_in_background=true, description="Backend lane"
- subagent_type: "dream-team:backend-dev"
- prompt: "You are the backend-dev agent. Read `.claude/memory/ARCHITECTURE.md` and `.claude/memory/SPEC.md`. Implement all API routes, business logic, and validation. Follow your API design workflow with idempotency emphasis. Produce working code."

**Lane C — data-engineer:** (if schema/migration work exists)
Use the Agent tool: isolation="worktree", run_in_background=true, description="Data lane"
- subagent_type: "dream-team:data-engineer"
- prompt: "You are the data-engineer agent. Read `.claude/memory/ARCHITECTURE.md`. Implement schema design, migrations, and queries. Use EXPLAIN analysis. Produce working code."

**Lane D — devops-engineer:** (if infra/deployment work exists)
Use the Agent tool: isolation="worktree", run_in_background=true, description="DevOps lane"
- subagent_type: "dream-team:devops-engineer"
- prompt: "You are the devops-engineer agent. Read `.claude/memory/ARCHITECTURE.md`. Produce Dockerfile, CI/CD configuration, and deployment manifests. Follow infrastructure-as-code principles."

**Lane E — executor:** (remaining PLAN.md tasks not covered above)
Use the Agent tool: isolation="worktree", run_in_background=true, description="General execution lane"
- subagent_type: "dream-team:executor"
- prompt: "You are the executor agent. Read `.claude/memory/PLAN.md`. Execute all remaining tasks not covered by the other lanes. Follow-the-plan-exactly discipline. Smallest viable diff per task. Escalate if a task is blocked."

### Step 3.3: Merge worktrees

Collect all lane outputs. Merge worktrees. Resolve conflicts.

### Worktree Lifecycle (IMPORTANT)

- Worktrees may be auto-cleaned if they contain no uncommitted changes
- **Always commit worktree output BEFORE the merge step** — uncommitted changes can be silently lost
- If a worktree is missing during merge, check `git log` — the content may have been auto-committed to the main branch
- To preserve worktrees for inspection, use `action: "keep"` on ExitWorktree
- If a lane's code appears in the main workspace but the worktree is gone, the system auto-cleaned after a successful merge. Verify the code is correct.

### Step 3.4: Update context

Update `.claude/memory/context.md`: mark Phase 3 complete, Phase 4 in progress.

---

## Phase 4: Verification (6 Parallel Gates)

### Step 4.1: Launch 6 gates IN PARALLEL

Launch all 6 simultaneously using the Agent tool with `run_in_background: true`:

**Gate 1 — code-reviewer:**
Use the Agent tool: run_in_background=true, description="Code review gate"
- subagent_type: "dream-team:code-reviewer"
- prompt: "You are the code-reviewer agent. Review the current git diff. Your adversarial mandate: MUST find at least 3 issues. Look for what's MISSING, not just what's wrong. Use structured severity levels. Produce `.claude/memory/REVIEW.md`. BLOCK if any HIGH severity findings."

**Gate 2 — security-auditor:**
Use the Agent tool: run_in_background=true, description="Security audit gate"
- subagent_type: "dream-team:security-auditor"
- prompt: "You are the security-auditor agent. Audit the current git diff. Use full OWASP Top 10 checklist and threat modeling. Produce `.claude/memory/SECURITY.md`. BLOCK if any CRITICAL finding."

**Gate 3 — test-writer:**
Use the Agent tool: run_in_background=true, description="Test review gate"
- subagent_type: "dream-team:test-writer"
- prompt: "You are the test-writer agent. Review the current git diff for test coverage. Check AAA structure, anti-patterns, edge case coverage. Produce `.claude/memory/TEST-REPORT.md`. BLOCK if coverage decreased from baseline."

**Gate 4 — performance-engineer:**
Use the Agent tool: run_in_background=true, description="Performance review gate"
- subagent_type: "dream-team:performance-engineer"
- prompt: "You are the performance-engineer agent. Review the current git diff for performance regressions. Apply measure-first discipline and full-stack profiling analysis. Produce `.claude/memory/PERF.md`. FLAG any regressions."

**Gate 5 — accessibility-checker:**
Use the Agent tool: run_in_background=true, description="Accessibility audit gate"
- subagent_type: "dream-team:accessibility-checker"
- prompt: "You are the accessibility-checker agent. Audit all UI changes in the current git diff. Check WCAG 2.1 AA: keyboard navigation, screen reader support, color contrast (4.5:1 normal, 3:1 large), focus management, semantic HTML. Produce `.claude/memory/A11Y.md` with violations by severity (🔴 blocking / 🟡 should-fix / 🔵 enhancement). BLOCK if any 🔴 blocking violation."

**Gate 6 — verifier:**
Use the Agent tool: run_in_background=true, description="Adversarial verification gate"
- subagent_type: "dream-team:verifier"
- prompt: "You are the verifier agent. Apply your adversarial mandate: MUST find at least 2 gaps or discrepancies. Check three coverage dimensions. Use S.U.P.E.R scoring. Check: what was built vs what was planned, what was planned vs what was decided. Produce `.claude/memory/VERIFICATION.md` with findings and fix plan generation. BLOCK if gaps found."

### Step 4.2: Evaluate gates

**All pass** → proceed to Phase 5.

**Any block** → report blocking findings → return to Phase 3 for fixes → re-run Phase 4.

**Retry loop:** Max 3 attempts. On 3rd fail, escalate to product-manager for re-scoping.

### Step 4.3: Update context

Update `.claude/memory/context.md`: mark Phase 4 complete (or attempt N blocked), Phase 5 in progress (if passed).

---

## Phase 5: Ship

### Step 5.1: docs-writer
Use the Agent tool: description="Documentation generation"
- subagent_type: "dream-team:docs-writer"
- prompt: "You are the docs-writer agent. Read all memory artifacts (VISION.md, PLAN.md, ARCHITECTURE.md) and the current codebase. Produce: (1) README.md — create or update with setup instructions and architecture overview, (2) API docs for any new or changed endpoints, (3) CHANGELOG entry following Keep a Changelog format. Use your templates for README, API docs, and ADRs."

### Step 5.2: release-manager
Use the Agent tool: description="Release management"
- subagent_type: "dream-team:release-manager"
- prompt: "You are the release-manager agent. Run your full release readiness checklist. Then: (1) Determine semver bump (major/minor/patch) based on the changes, (2) Create git tag, (3) Prepare PR description with summary of all changes and links to artifacts, (4) Verify all artifacts are in place. Produce a release summary."

### Step 5.3: Final concierge check
Use the Agent tool: description="Final vision verification"
- subagent_type: "dream-team:concierge"
- prompt: "You are the concierge agent. Read `.claude/memory/VISION.md` — this is what the user originally wanted. Now examine what was actually built (read the codebase, docs, and all memory artifacts). Ask the user: 'Here's what we built. Does this match your vision?' Present a structured comparison of what was requested vs what was delivered."

### Step 5.4: Session summary

Create `.claude/memory/sessions/YYYY-MM-DD.md` from `_TEMPLATE.md`.

### Step 5.5: Final context update

Mark all phases complete. Set status to Idle. Present final report: "🎉 Dream team pipeline complete."
