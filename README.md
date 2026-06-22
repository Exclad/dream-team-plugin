# AI Agent Dream Team

> **27 specialized agents, 6 verification gates, structured memory, self-learning.**
> Turn Claude Code into a complete AI software company — vision → strategy → build → verify → ship.

## Install

### Option 1 — Marketplace (recommended)
```bash
claude plugin marketplace add github:Exclad/dream-team-plugin
claude plugin install dream-team@dream-team-marketplace
```

### Option 2 — One-command npx
```bash
npx create-dream-team
```
Installs the plugin **and** scaffolds a project `CLAUDE.md` + recommended permissions.

Then restart Claude Code and run:
```
/dream-team "I want to build..."
```

## What you get

- **27 agents** — concierge, PM, architect, ux-designer, frontend/backend/data/devops devs, executor, and a full verification tier.
- **10 slash commands** — `/dream-team`, `/interview`, `/party`, `/deep-discuss`, `/plan`, `/build`, `/review`, `/debug`, `/research`, `/ship`.
- **6 verification gates** — code review, security, tests, performance, accessibility, adversarial verification. Run in parallel; nothing ships until they pass.
- **Structured memory** — auto-bootstrapped `.claude/memory/` (vision, plans, ADRs, patterns, error ledger, sessions).

## Repo layout

```
.claude-plugin/marketplace.json   marketplace manifest (source: ./dream-team-plugin)
dream-team-plugin/                the plugin — agents, skills, hooks, scripts, templates
create-dream-team/                the npx installer (published to npm)
```

## Requirements

- Claude Code (latest)
- Git (for worktree-isolated execution lanes)

## License

MIT © Exclad
