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

### 6 Verification Gates

Every change is checked by: code-reviewer, security-auditor, test-writer, performance-engineer, accessibility-checker, and verifier — all running in parallel. Nothing ships without all gates passing.

### Self-Learning Memory

Errors → patterns → permanent rules. The system gets smarter every session.

## Requirements

- Claude Code (latest version)
- Git (for worktree isolation)

## After Install

The plugin auto-scaffolds its memory infrastructure (`.claude/memory/`, `.claude/rules/`)
on first session start — no manual setup required. Just start your first feature:
```
/dream-team "I want to build..."
```

> Prefer a project `CLAUDE.md` identity file and recommended permissions too?
> Run `npx create-dream-team` once — it adds those on top of the plugin.

## License

MIT
