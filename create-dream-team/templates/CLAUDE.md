<!-- dream-team:managed -->
# AI Agent Dream Team — Project Identity

> **This is an AI software company.** 27 specialized agents, 6 verification gates, structured memory, and self-learning. Every session builds on the last.

## How We Work

This project follows a **6-phase pipeline** for every feature:

```
Interview → Strategy → Approve → Build → Verify → Ship
```

**Entry points:**
| Command | When to use |
|---------|-------------|
| `/dream-team "X"` | Full pipeline — new feature, new project |
| `/interview` | Think through an idea with the concierge |
| `/party "topic"` | Debate a decision with multiple agent perspectives |
| `/deep-discuss "problem"` | Structured 7-phase problem analysis |
| `/plan` | Strategy phase — PM + architect + UX + spec |
| `/build` | Execute from approved plans |
| `/review` | All 6 verification gates |
| `/debug "symptom"` | Investigate and fix |
| `/research "question"` | Technology evaluation |
| `/ship` | Docs + release — all gates passed |

**Core discipline:**
0. Read `.claude/memory/config.md` before spawning agents — it sets the model per role (planning/execution/verification/ship), plan detail level, and checkpoint policy
1. Start every session by reading `.claude/memory/context.md` to pick up where we left off
2. Every significant unit of work gets a clean context (fresh agent invocation)
3. Nothing ships without all 6 verification gates passing
4. Every bug becomes a pattern — the system gets smarter every session

## Agent Roster (27 Specialists)

### Tier 0: Front Door
- **concierge** — Depth-first interviewer, one question at a time, crystalizes vision
- **deep-discuss** — 7-phase structured problem analysis
- **party-host** — Multi-agent debate room for hard decisions

### Tier 1: Strategy
- **product-manager** — User stories, acceptance criteria, scope boundaries
- **architect** — System design, trade-off analysis, API contracts
- **ux-designer** — User flows, information architecture, wireframe specs
- **spec-phase** — Formal specification with ambiguity scoring

### Tier 2: Execution
- **frontend-dev** — Anti-slop discipline, accessibility-first, Emil Kowalski animation
- **backend-dev** — API design, idempotency emphasis
- **data-engineer** — Schema design, EXPLAIN analysis
- **devops-engineer** — CI/CD, Docker, K8s
- **executor** — Follow-the-plan-exactly, smallest viable diff
- **refactor-specialist** — Smell → refactoring mapping, characterization tests

### Tier 3: Verification (6 Gates)
- **plan-checker** — DETAIL MANDATE for mid-tier models, 7-point detail check
- **code-reviewer** — Adversarial discipline (evidence-backed findings, no invented issues)
- **security-auditor** — Full OWASP Top 10, threat modeling
- **test-writer** — AAA structure, anti-pattern awareness
- **performance-engineer** — Measure-first discipline, full-stack profiling
- **accessibility-checker** — WCAG 2.1 AA auditing
- **verifier** — Adversarial discipline (built-vs-planned coverage, evidence-backed)

### Tier 4: Meta (On-Demand)
- **debugger** — Scientific method, smallest reproducible case
- **error-detective** — Evidence grading (Confirmed/Deduced/Hypothesized)
- **docs-writer** — README, API docs, ADRs
- **release-manager** — Release readiness checklist, version bump, PR
- **research-analyst** — Evidence-based technology evaluation
- **scout** — Codebase exploration with thoroughness levels
- **tech-lead** — Full routing table, decomposition-first, parallelization planning

## Memory Architecture

All memory is in `.claude/memory/` — human-readable Markdown, git-versioned, no databases.

```
.claude/memory/
├── context.md           # Live session state: current phase, blockers, decisions
├── VISION.md            # concierge output: crystallized project vision
├── PLAN.md              # product-manager output: user stories, tasks
├── ARCHITECTURE.md      # architect output: system design
├── UX-SPEC.md           # ux-designer output: user flows, IA
├── SPEC.md              # spec-phase output: formal spec
├── REVIEW.md            # Latest review findings
├── decisions/           # ADRs in MADR format
├── patterns/            # Auto-learned patterns from error/fix cycles
├── errors/              # Error ledger (JSONL)
└── sessions/            # Session summaries
```

**Session bootstrap:** On every new session, read in order:
1. This file (CLAUDE.md) — project identity
2. `.claude/memory/context.md` — what we're doing, blockers
3. Relevant ADRs from `.claude/memory/decisions/` — why past decisions were made
4. Relevant patterns from `.claude/memory/patterns/` — learned lessons

## Self-Learning Loop

```
Error occurs → error-detective investigates → debugger reproduces → fix applied
    ↓
Pattern extracted: What caused it? How to detect? How to prevent?
    ↓
Stored in .claude/memory/patterns/{name}.md
    ↓
Same pattern 5+ occurrences → promoted to permanent rule
Same pattern 2+ projects → promoted to global rule
```

## Tech Stack Convention

- **Runtime:** Claude Code (primary), with Agent Teams for parallel execution
- **Isolation:** Git worktrees for parallel agent lanes
- **Memory:** Markdown files, no databases, no Docker
- **Config:** `.claude/` directory (agents, commands, memory, settings)
