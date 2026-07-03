# Dream Team Config

> **Read by every skill before spawning agents.** Created by the model-profile setup
> on first `/dream-team` run. Edit by hand any time, or re-run setup by deleting this file.

## Model Profile

**Profile:** unset
<!-- "unset" makes the first /dream-team run ask you to pick a profile.
     To skip the question, change it to: economy | balanced | max | custom
     and edit the table below to match. -->

Until a profile is chosen, skills use the table below (balanced defaults):

| Role | Agents | Model |
|------|--------|-------|
| planning | product-manager, architect, ux-designer, spec-phase, plan-checker | sonnet |
| execution | frontend-dev, backend-dev, data-engineer, devops-engineer, executor, refactor-specialist | sonnet |
| verification | code-reviewer, security-auditor, test-writer, performance-engineer, accessibility-checker, verifier | sonnet |
| ship | docs-writer, release-manager, research-analyst | sonnet |

Skills pass the role's model as the `model` parameter on every Agent call.
`inherit` means: omit the `model` parameter so the agent uses the session model
(pick this if you run Claude Code through a router, e.g. DeepSeek).

The inline roles (concierge interview, orchestration itself) always run on the
session model — they happen in the main conversation and cannot be overridden here.

### Presets

| Preset | planning | execution | verification | ship | For |
|--------|----------|-----------|--------------|------|-----|
| economy | sonnet | sonnet | haiku | haiku | Pro plan, quota-conscious |
| balanced | sonnet | sonnet | sonnet | sonnet | Default |
| max | opus | sonnet | opus | sonnet | Max plan, quality-first |
| custom | your pick | your pick | your pick | your pick | e.g. opus planning + haiku execution |

## Plan Detail

**plan_detail:** standard

| Level | Meaning |
|-------|---------|
| standard | Plans state WHAT and WHY; executor makes routine implementation decisions. Right for Claude-class executors. |
| ultra | Plans leave ZERO judgment calls: exact file paths, full code snippets or unambiguous diffs, exact commands with expected output, per-task acceptance checks. Required for weak/cheap executors (haiku, DeepSeek Flash, etc.). |

Rule of thumb: execution model `haiku` or a weak `inherit` model → set `ultra`.

## Workflow Toggles

**pr_flow:** auto
- `auto` — use a feature branch + PR when `gh` is available and an origin remote exists; otherwise work on the current branch
- `on` — always feature branch + PR (fail loudly if `gh` missing)
- `off` — commit to the current branch, no PR

**tdd:** off
- `on` — after Foundation, test-writer converts the plan's acceptance criteria into FAILING tests before any lane runs; lanes are told "make these tests pass". Strongly recommended with `plan_detail: ultra` — weak executors do far better with a mechanical target.
- `off` — tests reviewed at the verification gate only

**arbitration:** on
- `on` — when the same gate blocks twice on the same finding, escalate that single finding to a one-shot opus arbitration call (verdict: finding VALID + definitive fix, or INVALID + why) instead of a third blind retry
- `off` — plain 3-attempt retry loop

## Pipeline Sizing

Sizing is decided per feature at the end of Phase 0 and recorded in context.md — not here.

| Size | Strategy agents | Lanes | Gates |
|------|-----------------|-------|-------|
| S | product-manager only (mini-plan) | executor only | code-reviewer + verifier (+ security-auditor if auth/input handling touched) |
| M | PM + architect (+ ux-designer if UI) + plan-checker | only lanes with real work | all applicable gates (a11y only if UI) |
| L | all 4 + plan-checker | all applicable lanes | all applicable gates |

## Checkpointing

**checkpoint_commits:** on

When on, every context.md update is committed: `git add .claude/memory && git commit -m "checkpoint: <phase/step>"`.
Survives rate limits, session death, and context compaction; `/dream-team resume` reads the latest checkpoint.
Set to `off` if you don't want memory checkpoints in your git history.
