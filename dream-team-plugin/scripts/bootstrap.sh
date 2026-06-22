#!/usr/bin/env sh
# Dream Team session bootstrap.
# Ensures the memory + rules infrastructure exists in the user's project so the
# skills work even when the plugin is installed alone (without `npx create-dream-team`).
# Idempotent: only creates what's missing, never overwrites existing files.

ROOT="${CLAUDE_PLUGIN_ROOT}"
MEM=".claude/memory"
RULES=".claude/rules"

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

# Seed rules dir.
if [ ! -d "$RULES" ] && [ -d "$ROOT/templates/rules" ]; then
  mkdir -p "$RULES"
  cp -R "$ROOT/templates/rules/." "$RULES/" 2>/dev/null || true
fi

echo "🧠 Dream Team loaded. 27 agents ready. Run /dream-team to start a new feature."
exit 0
