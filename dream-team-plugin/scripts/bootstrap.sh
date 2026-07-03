#!/usr/bin/env sh
# Dream Team bootstrap.
#
# Two modes:
#   bootstrap.sh          (SessionStart hook) — NO-OP unless this project has
#                         already opted in to Dream Team (i.e. .claude/memory/context.md
#                         exists). Never scaffolds into unrelated projects.
#   bootstrap.sh --init   (invoked by the /dream-team and /interview skills on
#                         first run) — scaffolds .claude/memory/ and .claude/rules/
#                         from the plugin templates. Idempotent: only creates what's
#                         missing, never overwrites existing files.

ROOT="${CLAUDE_PLUGIN_ROOT}"
MEM=".claude/memory"
RULES=".claude/rules"
INIT=0
[ "$1" = "--init" ] && INIT=1

# Hook mode: if this project hasn't opted in, exit silently.
# Opt-in marker = .claude/memory/context.md (created by --init or by the installer).
if [ "$INIT" -eq 0 ] && [ ! -f "$MEM/context.md" ]; then
  exit 0
fi

# Seed memory infrastructure if absent.
if [ ! -d "$MEM" ]; then
  mkdir -p "$MEM"
  if [ -d "$ROOT/templates/memory" ]; then
    cp -R "$ROOT/templates/memory/." "$MEM/" 2>/dev/null || true
  fi
fi

# Always make sure the directory skeleton exists (in case of a partial copy).
mkdir -p "$MEM/decisions" "$MEM/patterns" "$MEM/sessions" "$MEM/discussions" "$MEM/errors"
[ -f "$MEM/errors/error-ledger.jsonl" ] || : > "$MEM/errors/error-ledger.jsonl"

# Seed a starter context.md if none exists.
if [ ! -f "$MEM/context.md" ]; then
  if [ -f "$ROOT/templates/memory/context.md" ]; then
    cp "$ROOT/templates/memory/context.md" "$MEM/context.md" 2>/dev/null || true
  fi
fi

# Upgrade path: projects scaffolded by older versions lack config.md — seed it.
if [ ! -f "$MEM/config.md" ] && [ -f "$ROOT/templates/memory/config.md" ]; then
  cp "$ROOT/templates/memory/config.md" "$MEM/config.md" 2>/dev/null || true
fi

# Seed rules dir.
if [ ! -d "$RULES" ] && [ -d "$ROOT/templates/rules" ]; then
  mkdir -p "$RULES"
  cp -R "$ROOT/templates/rules/." "$RULES/" 2>/dev/null || true
fi

if [ "$INIT" -eq 1 ]; then
  echo "🧠 Dream Team memory scaffolded at $MEM/."
fi
exit 0
