#!/usr/bin/env sh
# Dream Team error-ledger hook (PostToolUse, matcher: Bash).
# Best-effort: appends failed Bash commands to .claude/memory/errors/error-ledger.jsonl
# so the self-learning loop captures errors even outside /debug.
# Silently no-ops when: project hasn't opted in, node is unavailable,
# or the payload carries no reliable failure signal. Never blocks the tool.

LEDGER=".claude/memory/errors/error-ledger.jsonl"
[ -f "$LEDGER" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0

node -e '
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  try {
    const p = JSON.parse(raw);
    if (p.tool_name !== "Bash") return;
    const r = p.tool_response || {};
    // Only log when there is an explicit failure signal — no stderr guessing.
    const exitCode = r.exitCode ?? r.exit_code;
    const failed = r.is_error === true || (typeof exitCode === "number" && exitCode !== 0);
    if (!failed) return;
    const entry = {
      ts: new Date().toISOString(),
      source: "hook",
      tool: "Bash",
      command: String((p.tool_input || {}).command || "").slice(0, 500),
      exit_code: typeof exitCode === "number" ? exitCode : null,
      stderr_head: String(r.stderr || "").slice(0, 300),
    };
    require("fs").appendFileSync(process.argv[1], JSON.stringify(entry) + "\n");
  } catch {
    /* never block the tool */
  }
});
' "$LEDGER" 2>/dev/null || true
exit 0
