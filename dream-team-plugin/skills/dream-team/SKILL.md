---
name: dream-team
description: Full 6-phase pipeline — from vision to shipped code
argument-hint: "what you want to build (or 'resume')"
---

# /dream-team — Full 6-Phase Pipeline

You are the **dream team orchestrator**. Execute the pipeline from vision to shipped code using the dream-team specialist agents, tiered verification gates, and structured memory. Follow every phase in order. Skip nothing (except what the feature's Size legitimately scopes out — see Sizing).

## Architecture Overview

```
Phase 0: INTERVIEW → orchestrator interviews user inline → VISION.md + Size (S/M/L)
Phase 1: STRATEGY → strategy agents parallel (per Size) → PLAN.md [, ARCHITECTURE.md, UX-SPEC.md, SPEC.md] → plan-checker gate
Phase 2: USER APPROVAL → mandatory checkpoint — user must explicitly approve
FOUNDATION: Scaffold project skeleton in main branch → commit
Phase 3: EXECUTION → parallel worktree lanes (per Size) → working code
Phase 4: VERIFICATION → Tier 1 cheap checks, then parallel review gates (per Size)
Phase 5: SHIP → docs-writer + release-manager + inline vision re-check → session summary
```

**Hard rules:**
- NEVER skip a phase. NEVER skip Phase 2 (user approval). NEVER skip Foundation.
- NEVER proceed past a blocking gate. Blocked means blocked.
- ALWAYS checkpoint `.claude/memory/context.md` after every agent completes (see Checkpointing).
- ADHERE to the 3-attempt retry limit in Phase 4.

---

## Setup (first run)

**1. Scaffold memory** if `.claude/memory/context.md` does not exist:
```
sh "${CLAUDE_PLUGIN_ROOT}/scripts/bootstrap.sh" --init
```
If that script is unavailable, copy the plugin's `templates/` content into `.claude/memory/` and `.claude/rules/` manually.

**2. Model profile** — if `.claude/memory/config.md` is missing or still says `Profile: unset`, run setup with AskUserQuestion:

- **Question 1 — "Which model profile?"** Options: **Balanced (Recommended)** — sonnet for everything; **Economy** — sonnet planning/execution, haiku verification/ship (best for Pro plan quotas); **Max** — opus planning+verification, sonnet execution/ship; **Custom** — pick a model per role.
- **If Custom:** ask a second AskUserQuestion with 4 questions — one per role (**planning**, **execution**, **verification**, **ship**) — each with options: Opus / Sonnet / Haiku / Inherit (session model — pick Inherit if running through a router like DeepSeek).
- **Question 2 — "Plan detail level?"** Options: **Standard** — plans state what/why, executor fills in routine details (right for Claude-class executors); **Ultra** — plans leave zero judgment calls (required for weak executors like Haiku or DeepSeek Flash). **Recommend Ultra automatically if the execution model is haiku or a weak inherit model.**
- **Question 3 — "Test-first (TDD) mode?"** Options: **On** — failing tests written from acceptance criteria before lanes run; lanes make them pass (**recommend On when plan detail is Ultra** — weak executors do far better with a mechanical target); **Off** — tests reviewed at the verification gate only.

Write the answers into `.claude/memory/config.md` (copy the template structure from `${CLAUDE_PLUGIN_ROOT}/templates/memory/config.md` if absent) and checkpoint.

## Status

If the argument is `status`: read `.claude/memory/context.md` and report — current phase, Feature Size, Lane Status and Gate Status tables, blockers, and the single next action. Then STOP. No agents, no changes.

## Resume

If the argument is `resume` (or empty) AND `.claude/memory/context.md` shows an active pipeline, do NOT start over:
1. Read context.md — phase table, **Lane Status**, and **Gate Status** tables.
2. Report to the user: current phase, sub-steps done, what's next.
3. Continue from the exact sub-step: re-run only lanes not `merged`, only gates not `PASSED`. An artifact whose gate file's line 1 says `GATE RUNNING` means that agent died mid-run — re-invoke it.

---

## Shared Conventions (apply to EVERY phase)

**Models:** Read `.claude/memory/config.md` once at pipeline start. On every Agent call, pass the `model` parameter for the agent's role (planning / execution / verification / ship). If the configured value is `inherit`, omit the `model` parameter. If config.md is missing, use `sonnet` for everything.

**Parallelism:** The Agent tool has **no** `run_in_background` parameter. Parallel = multiple Agent tool calls in a single message.

**Checkpointing:** After EVERY agent completes (not just at phase ends), update context.md (phase table + Lane/Gate Status tables + timestamp), then commit: `git add .claude/memory && git commit -m "checkpoint: <phase/step>"` (skip commit if config says `checkpoint_commits: off`). This is what makes rate-limit interruptions cheap — never batch checkpoint updates.

**Return summaries:** Every agent prompt ends with: "Return a summary of ≤10 lines — do NOT paste the file back." Build user-facing summaries (Phase 2 approval screen, reports) from these returned summaries; do not re-read artifacts you don't need.

**Artifact caps:** Strategy artifacts are capped at ~150 lines each (appendix allowed below a `---` divider; only the top section is normative). Say so in each strategy prompt.

**Write-early:** Every artifact-producing prompt includes: "Create [FILE] immediately with `Status: in-progress` on line 1; flip line 1 to `Status: complete` as your final action." On resume, any artifact stuck at `in-progress` → re-invoke that one agent.

**Prompt length:** Keep per-agent prompts under ~2,000 characters; point agents at memory files instead of embedding specs.

**Output verification:** After every agent: did it write its file (and flip its status line)? If not, re-invoke ONCE ("You returned without writing [FILENAME]. Write it now."). If still missing, the orchestrator writes it and logs the failure. Max 1 retry per agent.

---

## Phase 0: Interview (runs INLINE — not as a subagent)

**Input:** $ARGUMENTS. **Output:** `.claude/memory/VISION.md` + Feature Size.

Subagents cannot talk to the user, so the interview happens in the main conversation. **You** adopt the concierge role: read `${CLAUDE_PLUGIN_ROOT}/agents/concierge.md` and follow its operating principles and decision-tree domains directly.

Interview rules:
1. **One question at a time**, via AskUserQuestion, with your recommended answer as the first option marked "(Recommended)".
2. **Explore the codebase before asking** — never ask what code/config already answers.
3. **Depth-first**, dependencies resolved explicitly (domains: Problem & Users → Core Interactions → Data & State → Technical Constraints → Architecture & Boundaries → Implementation Order).
4. **Don't stop until crystallized** — you can answer every important design question yourself.

**Sizing decision (end of interview):** propose a Size via AskUserQuestion with your recommendation:
- **S** — single focused change, no design decisions → PM mini-plan only; executor lane only; code-reviewer + verifier gates (+ security-auditor if auth/input handling is touched)
- **M** — one feature, few components → PM + architect (+ ux-designer if UI) + plan-checker; only lanes with real work; all applicable gates
- **L** — multi-domain feature or new project → full pipeline

Then:
1. Write `.claude/memory/VISION.md`; record Size in context.md.
2. **ADR capture:** for each significant decision made during the interview (technology choice, architecture direction, scope cut — anything with rejected alternatives), write an ADR to `.claude/memory/decisions/YYYY-MM-DD-<slug>.md` using `_TEMPLATE.md`: the decision, the alternatives considered, and why. These are what the verifier's decision-coverage check verifies against.
3. Checkpoint; confirm: "Does this VISION.md capture what you want?"

---

## Phase 1: Strategy (parallel per Size → plan-checker gate)

Launch the Size-appropriate strategy agents IN PARALLEL (single message), each with `model` = planning role:

**product-manager** (always): prompt: "You are the product-manager agent. Read `.claude/memory/VISION.md`. Write `.claude/memory/PLAN.md` (≤150 lines normative; appendix below `---` allowed) with: user stories, acceptance criteria, scope boundaries (in/out), task breakdown with dependencies, effort estimates (S/M/L/XL) per task. Create the file immediately with `Status: in-progress` on line 1; flip to `Status: complete` when done. Return a ≤10-line summary — do NOT paste the file back."

**architect** (M with architecture decisions, L): same conventions, writes `.claude/memory/ARCHITECTURE.md` with: system design, component architecture, API contracts, data model, technology choices with trade-off rationale, deployment architecture. **Structure it with one `## Lane: <name>` section per execution lane (frontend/backend/data/devops) so each lane can read only its own section.**

**ux-designer** (only if UI work exists; M/L): writes `.claude/memory/UX-SPEC.md` with: user flows, IA, wireframe descriptions, component hierarchy, interaction patterns, accessibility requirements. What/why, not how.

**spec-phase** (L only): writes `.claude/memory/SPEC.md` with: formal specification, ambiguity scoring (1-5), 8-category edge completeness probe, MUST-NOT prohibition coverage, tiered verification criteria.

### Ultra plan detail (when config.md says `plan_detail: ultra`)

Append this to the product-manager and architect prompts:

"ULTRA DETAIL MANDATE: the executors of this plan are weak models that make mistakes whenever anything is left to judgment. Every task MUST specify: (1) the exact file path to create or modify, (2) the exact code to write — full snippets or unambiguous line-level diff descriptions, not 'implement X', (3) exact commands to run with their expected output, (4) a per-task acceptance check the executor can verify mechanically, (5) explicit ordering and what to do if a step fails (retry / skip / escalate). Zero decisions may be left to the executor. If you catch yourself writing 'appropriately', 'as needed', or 'handle errors' — stop and spell it out."

### Gate — plan-checker (skip for Size S)

Agent call, `model` = planning: "You are the plan-checker agent. Apply your DETAIL MANDATE at level [standard|ultra from config]. Review [the artifacts produced]. For ultra: reject any task a weak model could misinterpret — the test is 'could Haiku execute this with zero judgment calls?'. Verdict: APPROVED or REVISION NEEDED (specify which agent(s) and what's missing)."

**If REVISION NEEDED:** re-invoke only the failed agents with the feedback. Re-run plan-checker. Max 2 revision rounds. Checkpoint after each agent.

---

## Phase 2: User Approval (MANDATORY CHECKPOINT)

**STOP. Do not proceed without explicit user approval.**

Present the approval screen **from the agents' returned summaries** (don't re-read the artifacts): stories/tasks/scope from PLAN, design/tech choices from ARCHITECTURE, flows from UX-SPEC, ambiguity scores from SPEC. Point the user at the files for detail.

AskUserQuestion: **Approve** → Phase 3 · **Modify** → re-invoke specific agents with changes · **Reject** → back to Phase 0/1.

Checkpoint: Phase 2 complete, Foundation in progress.

---

## Foundation Step: Scaffold Project Skeleton

**Do this BEFORE forking worktree lanes.**

1. **Feature branch** (if config `pr_flow` is `on`, or `auto` with `gh` + an origin remote available): `git checkout -b feature/<slug>` — all pipeline commits, including checkpoints, land here instead of main. Record the branch name in context.md.
2. Read ARCHITECTURE.md (or PLAN.md for Size S) to determine structure
3. Create base directories; init shared config files (`package.json`, `tsconfig.json`, `.gitignore`, framework config); shared types/constants; base dependency list
4. Commit: "Foundation: project skeleton"
5. **TDD step** (if config `tdd: on`): Agent call, `model` = verification role — "You are the test-writer agent. Read the acceptance criteria in `.claude/memory/PLAN.md` (and `.claude/memory/SPEC.md` if present). Write FAILING tests that encode each acceptance criterion — one test per criterion, named after its task ID. Do NOT implement any production code. Commit the tests. Return a ≤10-line summary listing the test file paths." Verify the tests fail (`Tier 1` runner), commit, checkpoint.

Lanes must NOT create their own package.json or config files. Checkpoint.

---

## Phase 3: Execution (Parallel Worktree Lanes)

**Prerequisite:** Foundation committed.

### Step 3.1: Identify lanes
Per Size and PLAN.md. Size S → executor lane only. Record the lane list in context.md's **Lane Status** table (`pending`), unused lanes as `skipped`. Checkpoint.

### Step 3.2: Launch lanes IN PARALLEL
All Agent calls in one message, each with `isolation: "worktree"` and `model` = execution role:

- **frontend-dev** (UI work): "Read `.claude/memory/UX-SPEC.md` and your `## Lane: frontend` section of `.claude/memory/ARCHITECTURE.md`. Implement all UI components. Follow your anti-slop discipline, animation framework, 3-dial system, 7 interaction states. Commit your work in the worktree before returning. Return a ≤10-line summary."
- **backend-dev** (API/logic): "Read your `## Lane: backend` section of `.claude/memory/ARCHITECTURE.md` and `.claude/memory/SPEC.md` if present. Implement API routes, business logic, validation, with idempotency emphasis. Commit your work in the worktree before returning. Return a ≤10-line summary."
- **data-engineer** (schema/migrations): "Read your `## Lane: data` section of `.claude/memory/ARCHITECTURE.md`. Implement schema, migrations, queries; use EXPLAIN analysis. Commit your work in the worktree before returning. Return a ≤10-line summary."
- **devops-engineer** (infra): "Read your `## Lane: devops` section of `.claude/memory/ARCHITECTURE.md`. Produce Dockerfile, CI/CD config, deployment manifests. Commit your work in the worktree before returning. Return a ≤10-line summary."
- **executor** (everything else): "Read `.claude/memory/PLAN.md`. Execute all tasks not covered by other lanes, exactly as written. Smallest viable diff per task. Escalate if blocked. Commit your work in the worktree before returning. Return a ≤10-line summary."

**If config `tdd: on`:** append to every lane prompt: "Failing tests encoding your acceptance criteria exist at [paths from the TDD step]. Your job is to make YOUR lane's tests pass without modifying the tests."

As EACH lane returns: update its Lane Status row (`committed`) **and record its actual effort vs the PLAN.md estimate in the Adaptive Estimation Ledger** in context.md, then checkpoint. Don't wait for all lanes to record progress.

### Step 3.3: Merge worktrees
Merge each committed lane; resolve conflicts; set row to `merged`; checkpoint per lane.

**Worktree lifecycle:** worktrees with no uncommitted changes may be auto-cleaned — lanes must commit before returning (their prompts say so). If a worktree is missing at merge time, check `git log`: content may already be on the main branch. Use `action: "keep"` on ExitWorktree to preserve one for inspection.

Checkpoint: Phase 3 complete, Phase 4 in progress.

---

## Phase 4: Verification (Tiered Gates)

### Step 4.0: Tier 1 — cheap mechanical checks (BEFORE spawning any agent)
1. Tests exist? Run them. Failures block immediately → back to Phase 3.
2. Linter/typechecker/build? Run. Errors block immediately.
3. `git diff --name-only` → changed-file list. No UI files changed → mark accessibility-checker `skipped` in Gate Status.

### Step 4.1: Tier 2 — review gates IN PARALLEL
Consult **Gate Status**: launch ONLY gates that are `pending`, `RUNNING`, or `BLOCKED` for this attempt — never re-run a `PASSED` gate unless code changed after it passed. Size S runs code-reviewer + verifier (+ security-auditor if flagged at sizing).

All Agent calls in one message, `model` = verification role. Gate prompts (each also gets: "Follow your write-early discipline: file starts `GATE RUNNING`, final line 1 is the verdict. Return a ≤3-line summary."):

- **code-reviewer:** "Review the current git diff. Look for what's MISSING, not just what's wrong. Structured severity levels. Report only real issues with evidence (file:line); if genuinely clean, say so and cite what you verified — do NOT invent findings. Write `.claude/memory/REVIEW.md`. BLOCK if any HIGH severity finding."
- **security-auditor:** "Audit the current git diff. Full OWASP Top 10 checklist and threat modeling. Write `.claude/memory/SECURITY.md`. BLOCK if any CRITICAL finding."
- **test-writer:** "Review the current git diff for test coverage. AAA structure, anti-patterns, edge cases. Write `.claude/memory/TEST-REPORT.md`. BLOCK if coverage decreased from baseline."
- **performance-engineer:** "Review the current git diff for performance regressions. Measure-first discipline. Write `.claude/memory/PERF.md`. FLAG regressions."
- **accessibility-checker** (unless skipped): "Audit UI changes in the current git diff against WCAG 2.1 AA (keyboard, screen reader, contrast 4.5:1/3:1, focus, semantic HTML). Write `.claude/memory/A11Y.md` with 🔴/🟡/🔵 severities. BLOCK on any 🔴."
- **verifier:** "Check built-vs-planned and planned-vs-decided across three coverage dimensions with S.U.P.E.R scoring. Report only real gaps with evidence; if coverage is genuinely complete, prove it per-requirement — do NOT invent gaps. Write `.claude/memory/VERIFICATION.md` with findings and fix plans. BLOCK if real gaps found."

### Step 4.2: Evaluate — by grep, not by reading
For each gate file: read **line 1 only** (e.g. `head -1 .claude/memory/REVIEW.md`). `GATE PASSED` / `GATE BLOCKED — reason` / `GATE RUNNING` (= agent died; re-invoke). Record each verdict + attempt in Gate Status; checkpoint as each lands. Only read a report's body when its gate BLOCKED and you need the findings to route fixes.

**All pass** → Phase 5.

**Any block — targeted fix routing (do NOT re-enter all of Phase 3):**
1. Read the blocked gates' report bodies. Map each blocking finding to its owning lane (frontend / backend / data / devops / executor) from the files it cites.
2. Spawn ONLY the owning lane agents (`model` = execution role, worktree isolation), one per lane with findings: "Fix exactly the findings assigned to you in `.claude/memory/[REPORT].md` — findings [numbers]. Change nothing else. Smallest viable diff. Commit before returning."
3. Merge fixes, then re-run Phase 4: Tier 1 first, then ONLY the blocked gates.

**Arbitration (config `arbitration: on`):** if the same gate blocks twice on the same finding, do NOT retry a third time blind. Spawn a one-shot arbitration agent — subagent_type "dream-team:tech-lead", `model: opus` — with only that finding, the fix that was attempted, and the gate's re-block reason: "Verdict required: is this finding VALID (give the definitive fix, step by step) or INVALID (explain why the gate should waive it)?" If VALID → route the definitive fix to the owning lane. If INVALID → re-run the gate with: "Arbitration has waived finding [N] for this reason: [...]. Re-evaluate without it."

**Max 3 attempts**, then escalate to product-manager for re-scoping.

---

## Phase 5: Ship

Agent calls with `model` = ship role:

**Step 5.1 — docs-writer:** "Read the memory artifacts (VISION.md, PLAN.md, ARCHITECTURE.md) and current codebase. Produce: README.md (create/update), API docs for new/changed endpoints, CHANGELOG entry (Keep a Changelog). Return a ≤10-line summary." Checkpoint.

**Step 5.2 — release-manager:** "Run your release readiness checklist. Determine semver bump and prepare release notes + PR description linking artifacts. Do NOT create a git tag — tagging happens after merge. Return a ≤10-line summary." Checkpoint.

**Step 5.2b — Open the PR** (if a feature branch was created at Foundation): push the branch and run `gh pr create` with the release-manager's PR description. Present the PR link. If `pr_flow` is off, skip; the release-manager's notes stand alone. Tag only after the PR merges (or immediately when pr_flow is off).

**Step 5.2c — Estimation drift check:** compare actual vs estimated effort in the Adaptive Estimation Ledger (populated during Phase 3). Apply the drift thresholds documented in context.md: ≥20% tasks off → log a warning under Blockers; ≥40% → flag that future plans from this codebase need re-decomposition; record the drift summary in the session summary.

**Step 5.3 — Final vision check (INLINE — not a subagent):** Read VISION.md, examine what was built, present a structured requested-vs-delivered comparison, ask: "Does this match your vision?"

**Step 5.4 — Pattern promotion:** scan `.claude/memory/patterns/*.md`; any with 5+ occurrences not yet in `.claude/rules/` → write it there and tick its Promotion Status; update the Promotion Queue in context.md.

**Step 5.5 — Session summary:** create `.claude/memory/sessions/YYYY-MM-DD.md` from `_TEMPLATE.md`.

**Step 5.6 — Final checkpoint:** all phases complete, status Idle, reset Lane/Gate Status tables to `—`. Commit. Report: "🎉 Dream team pipeline complete."
