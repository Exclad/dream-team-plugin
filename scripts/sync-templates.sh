#!/usr/bin/env sh
# Sync the single source of truth for templates (dream-team-plugin/templates/)
# into the npx installer (create-dream-team/templates/).
#
# The plugin's templates are canonical. The installer's memory/ and rules/
# templates are copies. CLAUDE.md is installer-only (the plugin bootstraps
# memory via hook/skill, not CLAUDE.md) and is NOT touched here.
#
# Usage: scripts/sync-templates.sh [--check]
#   --check   exit 1 if the copies are out of sync (for CI), change nothing

set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/dream-team-plugin/templates"
DEST="$REPO_ROOT/create-dream-team/templates"

if [ "${1:-}" = "--check" ]; then
  FAIL=0
  for dir in memory rules; do
    if ! diff -r "$SRC/$dir" "$DEST/$dir" >/dev/null 2>&1; then
      echo "OUT OF SYNC: templates/$dir differs between plugin and installer." >&2
      diff -rq "$SRC/$dir" "$DEST/$dir" >&2 || true
      FAIL=1
    fi
  done
  [ "$FAIL" -eq 0 ] && echo "Templates in sync."
  exit "$FAIL"
fi

for dir in memory rules; do
  rm -rf "${DEST:?}/${dir:?}"
  mkdir -p "$DEST/$dir"
  cp -R "$SRC/$dir/." "$DEST/$dir/"
done
echo "Synced plugin templates → installer templates."
