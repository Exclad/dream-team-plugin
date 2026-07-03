# Changelog

All notable changes to the Dream Team plugin and installer.
Format: [Keep a Changelog](https://keepachangelog.com/). Versions cover the plugin,
marketplace manifest, and `create-dream-team` npm package together (always in lockstep).

## [1.3.0] — 2026-07-03

### Added
- **`npx create-dream-team uninstall`** — removes the plugin and marketplace registration,
  strips the Dream Team section from CLAUDE.md (via new `<!-- dream-team:end -->` marker;
  deletes the file only if it contained nothing else). Keeps `.claude/memory/` and
  `.claude/rules/` by default — they're the project's history; `--purge` deletes them too
- **`npx create-dream-team update`** — updates the plugin via marketplace and merges any
  new memory templates (e.g. new config options) without touching existing files
- CI lifecycle test covering update, uninstall, and `--purge`

## [1.2.0] — 2026-07-03

### Added
- **smoke-tester agent** (28th) — Tier 1.5 gate that actually runs the app and drives the
  primary user flow from VISION.md; catches "compiles but doesn't work" before review gates spend tokens
- **ai-engineer agent** (29th) — LLM feature specialist; writes AI-SPEC.md (model choice + cost,
  prompt architecture, eval plan, guardrails) when the project builds AI functionality
- **Gate hash caching** — passed gates record the commit hash; re-runs skip any gate whose
  pass-hash still matches HEAD, mechanically
- **Interview transcript checkpointing** — every Q&A lands in `.claude/memory/discussions/`
  as it happens; a rate limit mid-interview loses at most one question
- **`/dream-team pause` and `abort`** — clean mid-pipeline stop (handoff note) and cancel
  (state reset, optional branch cleanup)
- **Pacing mode** (`pacing: conservative`) — caps concurrent agents at 2 for Pro-plan users;
  parallel bursts are what trip rate limits
- **Session budget** (`session_budget: N`) — soft spawn cap; orchestrator suggests pausing at
  the nearest phase boundary
- **Agent spawn telemetry** — per-phase spawn/retry counts in context.md, copied into session
  summaries so profiles' real cost is visible
- **Artifact digests** — one-line summary per completed artifact; resume reorients from digests
  instead of re-reading files
- CHANGELOG.md (this file)

### Changed
- VISION.md capped at ~100 lines (transcript holds the detail)
- Error ledger self-rotates past 1000 entries
- Bootstrap seeds `config.md` into projects scaffolded by pre-1.1.0 versions

## [1.1.0] — 2026-07-03

### Fixed
- Interview and final vision check run inline (subagents cannot talk to the user)
- SessionStart hook no longer scaffolds into non-opted-in projects
- Removed nonexistent `run_in_background` Agent parameter from all skills
- Installer no longer writes `.claude/settings.json`; prints recommendations
- Adversarial gates no longer forced to invent findings

### Added
- Model profiles (economy/balanced/max/custom per-role) in `config.md`
- Ultra plan detail mode for weak executors (Haiku, DeepSeek Flash)
- Tiered verification (tests/lint before review agents; a11y skipped when no UI)
- Verdict-first gate reports; ≤10-line agent return summaries; artifact caps
- Rate-limit checkpointing: per-lane/per-gate status tables, git-committed
- PR flow, TDD mode, opus arbitration, targeted gate-fix routing
- ADR auto-capture from interviews; estimation-drift check at ship
- Error-ledger PostToolUse hook; pattern promotion in `/ship`
- CI + tag-driven release workflows; version-bump and template-sync scripts

## [1.0.1] — 2026-06-22

### Fixed
- Removed invalid `github:` prefix from marketplace add command in docs and installer

## [1.0.0] — 2026-06-22

Initial release: 27 agents, 10 slash commands, 6 verification gates, structured memory.
