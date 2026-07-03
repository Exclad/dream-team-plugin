# AI Agent Dream Team

> **29 specialized agents, 7 verification gates, structured memory, self-learning.**
> Turn Claude Code into a complete AI software company — vision → strategy → build → verify → ship.

## Install

### Option 1 — Marketplace (recommended)
```bash
claude plugin marketplace add Exclad/dream-team-plugin
claude plugin install dream-team@dream-team-marketplace
```

### Option 2 — One-command npx
```bash
npx create-dream-team
```
Installs the plugin, scaffolds a project `CLAUDE.md` + memory infrastructure, and prints recommended permissions (it never edits your settings).

Then restart Claude Code and run:
```
/dream-team "I want to build..."
```

**Update:** `npx create-dream-team update` (or `claude plugin update dream-team@dream-team-marketplace`).
**Uninstall:** `npx create-dream-team uninstall` — keeps your `.claude/memory/`; add `--purge` to remove everything.

## What you get

- **29 agents** — concierge, PM, architect, ux-designer, frontend/backend/data/devops devs, executor, and a full verification tier.
- **10 slash commands** — `/dream-team`, `/interview`, `/party`, `/deep-discuss`, `/plan`, `/build`, `/review`, `/debug`, `/research`, `/ship`.
- **7 verification gates** — code review, security, tests, performance, accessibility, adversarial verification. Run in parallel; nothing ships until they pass.
- **Structured memory** — `.claude/memory/` scaffolded on first `/dream-team` run (vision, plans, ADRs, patterns, error ledger, sessions).
- **Model profiles** — pick sonnet/haiku/opus (or custom per role: planning, execution, verification, ship) to fit your plan's quota; `ultra` plan detail mode makes plans executable by weak models (Haiku, DeepSeek Flash) without mistakes.
- **Rate-limit-proof checkpointing** — per-agent progress committed to git; `/dream-team resume` re-runs only unfinished work.

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
