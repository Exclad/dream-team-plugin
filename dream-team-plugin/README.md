# AI Agent Dream Team — Claude Code Plugin

> **27 specialized agents, 6 verification gates, structured memory, self-learning.**  
> Turn Claude Code into a complete AI software company.

## Quick Install

### Option 1: Marketplace (recommended)
```bash
claude plugin marketplace add Exclad/dream-team-plugin
claude plugin install dream-team@dream-team-marketplace
```

### Option 2: One-command npx installer
```bash
npx create-dream-team
```
This installs the plugin AND scaffolds the memory infrastructure in your project.

### Option 3: Manual plugin directory
```bash
git clone https://github.com/Exclad/dream-team-plugin.git
claude --plugin-dir ./dream-team-plugin
```

## What You Get

### 27 Specialized Agents

| Tier | Agents |
|------|--------|
| **Front Door** | concierge, deep-discuss, party-host |
| **Strategy** | product-manager, architect, ux-designer, spec-phase |
| **Execution** | frontend-dev, backend-dev, data-engineer, devops-engineer, executor, refactor-specialist |
| **Verification** | plan-checker, code-reviewer, security-auditor, test-writer, performance-engineer, accessibility-checker, verifier |
| **Meta** | debugger, error-detective, docs-writer, release-manager, research-analyst, scout, tech-lead |

### 10 Slash Commands

| Command | What it does |
|---------|-------------|
| `/dream-team "X"` | Full 6-phase pipeline — Interview → Strategy → Build → Verify → Ship |
| `/interview` | Crystalize your vision with the concierge |
| `/party "topic"` | Multi-agent debate room |
| `/deep-discuss "problem"` | 7-phase structured problem analysis |
| `/plan` | Strategy phase — PM + architect + UX + spec → plan-checker |
| `/build` | Execute from approved plans (parallel worktree lanes) |
| `/review` | All 6 verification gates |
| `/debug "symptom"` | Scientific debugging pipeline |
| `/research "question"` | Evidence-based technology evaluation |
| `/ship` | Docs + release |

### Tiered Verification Gates

Cheap mechanical checks first (tests, lint, build), then parallel review gates: code-reviewer, security-auditor, test-writer, performance-engineer, accessibility-checker (skipped when no UI changed), and verifier. Nothing ships without all gates passing.

### Self-Learning Memory

Errors → patterns → permanent rules. Failed Bash commands are auto-logged to the error ledger by a PostToolUse hook (only in opted-in projects); `/debug` extracts patterns; `/ship` promotes patterns with 5+ occurrences to permanent rules.

## Model Profiles & Token Budget

On first `/dream-team` run you pick a model profile (stored in `.claude/memory/config.md`, editable any time):

| Profile | planning | execution | verification | ship |
|---------|----------|-----------|--------------|------|
| **Economy** (Pro plan) | sonnet | sonnet | haiku | haiku |
| **Balanced** (default) | sonnet | sonnet | sonnet | sonnet |
| **Max** | opus | sonnet | opus | sonnet |
| **Custom** | you choose a model per role — e.g. opus for planning, haiku for execution |

`inherit` is also available per role: the agent uses the session model (pick this if you route Claude Code through another provider, e.g. DeepSeek).

**Plan detail level:** choose `standard` (Claude-class executors) or `ultra` — plans with zero judgment calls (exact file paths, full code snippets, exact commands + expected output, mechanical acceptance checks) so weak executors like Haiku or DeepSeek Flash can execute without mistakes. Ultra is auto-recommended when your execution model is weak.

**Built-in token discipline:** gate agents report a one-line verdict the orchestrator greps (never re-reads full reports); agents return ≤10-line summaries instead of pasting files; strategy artifacts are capped at ~150 lines; lanes read only their own section of ARCHITECTURE.md; features are sized S/M/L at interview time so small features don't pay for the full 15-agent pipeline; cheap checks (tests/lint) run before any review agent spawns.

## Rate-Limit-Proof Checkpointing

Every agent completion updates `.claude/memory/context.md` (including per-lane and per-gate status tables) and commits it: `checkpoint: <phase/step>`. If a rate limit or dead session interrupts mid-phase, `/dream-team resume` re-runs **only** unfinished lanes and non-passed gates — passed work is never repeated. Gate reports start as `GATE RUNNING` and flip to a verdict on completion, so a half-finished gate can never masquerade as passed. Disable the commits with `checkpoint_commits: off` in config.md.

## Requirements

- Claude Code (latest version)
- Git (for worktree isolation)

## After Install

The plugin scaffolds its memory infrastructure (`.claude/memory/`, `.claude/rules/`)
the first time you run `/dream-team` or `/interview` in a project — it never touches
projects that haven't opted in. Just start your first feature:
```
/dream-team "I want to build..."
```

Interrupted mid-pipeline? `/dream-team resume` picks up from the phase recorded in
`.claude/memory/context.md`.

> Prefer a project `CLAUDE.md` identity file and recommended permissions too?
> Run `npx create-dream-team` once — it adds those on top of the plugin.

## License

MIT
