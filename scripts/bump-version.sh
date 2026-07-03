#!/usr/bin/env sh
# Bump the version in all three manifests at once:
#   dream-team-plugin/.claude-plugin/plugin.json
#   .claude-plugin/marketplace.json           (plugins[0].version)
#   create-dream-team/package.json
#
# Usage: scripts/bump-version.sh <new-version>          e.g. scripts/bump-version.sh 1.1.0
#        scripts/bump-version.sh --check                verify all three versions match

set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_JSON="$REPO_ROOT/dream-team-plugin/.claude-plugin/plugin.json"
MARKETPLACE_JSON="$REPO_ROOT/.claude-plugin/marketplace.json"
PACKAGE_JSON="$REPO_ROOT/create-dream-team/package.json"

read_versions() {
  node -e '
    const read = (p) => JSON.parse(require("fs").readFileSync(p, "utf-8"));
    console.log(read(process.argv[1]).version);
    console.log(read(process.argv[2]).plugins[0].version);
    console.log(read(process.argv[3]).version);
  ' "$PLUGIN_JSON" "$MARKETPLACE_JSON" "$PACKAGE_JSON"
}

if [ "${1:-}" = "--check" ]; then
  VERSIONS=$(read_versions)
  UNIQUE=$(echo "$VERSIONS" | sort -u | wc -l)
  if [ "$UNIQUE" -ne 1 ]; then
    echo "VERSION MISMATCH across manifests:" >&2
    printf 'plugin.json:      %s\nmarketplace.json: %s\npackage.json:     %s\n' $VERSIONS >&2
    exit 1
  fi
  echo "All manifests at version $(echo "$VERSIONS" | head -1)."
  exit 0
fi

NEW="${1:?usage: bump-version.sh <new-version> | --check}"
case "$NEW" in
  [0-9]*.[0-9]*.[0-9]*) ;;
  *) echo "Not a semver version: $NEW" >&2; exit 1 ;;
esac

node -e '
  const fs = require("fs");
  const v = process.argv[1];
  const bump = (path, mutate) => {
    const j = JSON.parse(fs.readFileSync(path, "utf-8"));
    mutate(j);
    fs.writeFileSync(path, JSON.stringify(j, null, 2) + "\n");
  };
  bump(process.argv[2], (j) => { j.version = v; });
  bump(process.argv[3], (j) => { j.plugins[0].version = v; });
  bump(process.argv[4], (j) => { j.version = v; });
' "$NEW" "$PLUGIN_JSON" "$MARKETPLACE_JSON" "$PACKAGE_JSON"

echo "Bumped all manifests to $NEW."
echo "Next: commit, tag v$NEW, push — the release workflow publishes to npm."
