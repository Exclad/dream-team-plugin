# create-dream-team

> One command to install the AI Agent Dream Team into your Claude Code project.

## Usage

```bash
npx create-dream-team              # install
npx create-dream-team update       # update plugin + merge new templates
npx create-dream-team uninstall    # remove (keeps .claude/memory/ — your project's history)
npx create-dream-team uninstall --purge   # remove everything, including memory
```

## What it does

1. **Installs the dream-team Claude Code plugin** — 29 agents + 10 slash commands
2. **Scaffolds memory infrastructure** — `.claude/memory/` with templates for VISION.md, PLAN.md, ARCHITECTURE.md, patterns, ADRs, error ledger, sessions
3. **Creates CLAUDE.md** — session bootstrap that loads context, ADRs, and patterns
4. **Sets up `.claude/rules/`** — for permanent pattern promotion
5. **Prints recommended permissions** — it never writes to `.claude/settings.json`; granting tool permissions stays your decision

## After install

```bash
# Start a new Claude Code session
claude

# Begin your first feature
/dream-team "I want to build..."
```

The concierge will interview you, the strategy team will plan, dev agents will build in parallel worktrees, 7 verification gates will check everything, and the release manager will ship it.

## Update

`npx create-dream-team update` pulls the latest plugin version (`claude plugin update dream-team@dream-team-marketplace`) and merges any new template files into `.claude/memory/` — your existing files are never overwritten. Restart Claude Code to apply.

## Uninstall

`npx create-dream-team uninstall`:
1. Uninstalls the plugin and removes the marketplace registration
2. Strips the Dream Team section from your `CLAUDE.md` (deletes the file only if it contained nothing else)
3. **Keeps `.claude/memory/` and `.claude/rules/` by default** — they hold your project's decisions, patterns, and history, which stay useful without the plugin. Add `--purge` to delete those too.

Manual equivalent, no npx needed:
```bash
claude plugin uninstall dream-team@dream-team-marketplace
claude plugin marketplace remove dream-team-marketplace
```

## Requirements

- [Claude Code](https://claude.ai/code) installed
- Git (for worktree isolation during builds)
- Node.js >= 16 (to run this installer)

## License

MIT
