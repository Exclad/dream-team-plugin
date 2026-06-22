# create-dream-team

> One command to install the AI Agent Dream Team into your Claude Code project.

## Usage

```bash
npx create-dream-team
```

## What it does

1. **Installs the dream-team Claude Code plugin** — 27 agents + 10 slash commands
2. **Scaffolds memory infrastructure** — `.claude/memory/` with templates for VISION.md, PLAN.md, ARCHITECTURE.md, patterns, ADRs, error ledger, sessions
3. **Creates CLAUDE.md** — session bootstrap that loads context, ADRs, and patterns
4. **Sets up `.claude/rules/`** — for permanent pattern promotion
5. **Configures permissions** — recommended settings for agent tools

## After install

```bash
# Start a new Claude Code session
claude

# Begin your first feature
/dream-team "I want to build..."
```

The concierge will interview you, the strategy team will plan, dev agents will build in parallel worktrees, 6 verification gates will check everything, and the release manager will ship it.

## Requirements

- [Claude Code](https://claude.ai/code) installed
- Git (for worktree isolation during builds)
- Node.js >= 16 (to run this installer)

## License

MIT
