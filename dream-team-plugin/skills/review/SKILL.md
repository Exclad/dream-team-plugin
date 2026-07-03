---
name: review
description: Run all 6 verification gates on the current changes
---

# /review — Tiered Verification (cheap checks, then parallel gates)

Run the verification gates. No code ships without this passing.

## Execution

### Step 0: Tier 1 — cheap mechanical checks (BEFORE spawning any agent)

1. Run `git diff --name-only HEAD` to identify what changed. If nothing changed, report "Nothing to review." and stop.
2. If the project has tests: run the test suite. **Failing tests block immediately** — report failures and stop; don't spend review agents on broken code.
3. If the project has a linter/typechecker/build step: run it. Errors block immediately.
4. From the changed-file list, decide whether UI files changed (components, templates, styles, markup). If NO UI files changed, **skip Gate 5 (accessibility)** below.

Only when Tier 1 passes, proceed to Tier 2.

### Step 1: Tier 2 — launch review gates IN PARALLEL

**Conventions:**
- **Model:** read `.claude/memory/config.md`; pass the **verification** role's model as the `model` parameter on each Agent call (`inherit` → omit; config missing → `sonnet`).
- **Only launch gates not already passed:** consult the **Gate Status** table in `.claude/memory/context.md` — launch only gates that are `pending`, `RUNNING`, or `BLOCKED` for this attempt. Never re-run a `PASSED` gate unless code changed after it passed.
- **Append to every gate prompt:** "Follow your write-early discipline: create the file with `GATE RUNNING` as line 1 first; your final action rewrites line 1 to the verdict (`GATE PASSED` or `GATE BLOCKED — [reason]`). Return a ≤3-line summary."
- **Checkpoint:** as each gate's verdict lands, record it (+ attempt number) in the Gate Status table and run `git add .claude/memory && git commit -m "checkpoint: gate <name> <verdict>"` (unless `checkpoint_commits: off`).

The Agent tool has no `run_in_background` parameter — to run gates in parallel, issue all applicable Agent tool calls in a single message:

**Gate 1 — code-reviewer:**
Use the Agent tool: description="Code review gate"
- subagent_type: "dream-team:code-reviewer"
- prompt: "You are the code-reviewer agent. Review the current git diff. Look for what's MISSING, not just what's wrong. Use structured severity levels (HIGH/MEDIUM/LOW). Report only real issues with evidence (file:line); if the diff is genuinely clean, say so and cite what you verified — do NOT invent findings. Produce `.claude/memory/REVIEW.md` with findings. BLOCK if any HIGH severity issues found."

**Gate 2 — security-auditor:**
Use the Agent tool: description="Security audit gate"
- subagent_type: "dream-team:security-auditor"
- prompt: "You are the security-auditor agent. Audit the current git diff. Use full OWASP Top 10 checklist, threat modeling. Produce `.claude/memory/SECURITY.md` with findings. BLOCK if any CRITICAL finding. Include CVE scanning recommendations."

**Gate 3 — test-writer:**
Use the Agent tool: description="Test review gate"
- subagent_type: "dream-team:test-writer"
- prompt: "You are the test-writer agent. Review the current git diff for test coverage. Check AAA structure, anti-patterns, edge case coverage. Produce `.claude/memory/TEST-REPORT.md` with findings. BLOCK if coverage decreased from baseline."

**Gate 4 — performance-engineer:**
Use the Agent tool: description="Performance review gate"
- subagent_type: "dream-team:performance-engineer"
- prompt: "You are the performance-engineer agent. Review the current git diff for performance regressions. Apply measure-first discipline, full-stack profiling analysis. Produce `.claude/memory/PERF.md` with findings. FLAG any regressions."

**Gate 5 — accessibility-checker:** (SKIP if Tier 1 found no UI changes — record "SKIPPED: no UI changes" for this gate)
Use the Agent tool: description="Accessibility audit gate"
- subagent_type: "dream-team:accessibility-checker"
- prompt: "You are the accessibility-checker agent. Audit all UI changes in the current git diff. Check WCAG 2.1 AA: keyboard navigation, screen reader support, color contrast (4.5:1 normal, 3:1 large), focus management, semantic HTML. Produce `.claude/memory/A11Y.md` with violations by severity (🔴 blocking / 🟡 should-fix / 🔵 enhancement). BLOCK if any 🔴 blocking violation."

**Gate 6 — verifier:**
Use the Agent tool: description="Verification gate"
- subagent_type: "dream-team:verifier"
- prompt: "You are the verifier agent. Check: what was built vs what was planned, what was planned vs what was decided. Three coverage dimensions. S.U.P.E.R scoring. Report only real gaps with evidence (file:line or missing-requirement ID); if coverage is genuinely complete, prove it with per-requirement evidence — do NOT invent gaps. Produce `.claude/memory/VERIFICATION.md` with findings and fix plan generation. BLOCK if real gaps found."

### Step 2: Collect all gate results

Wait for all launched agents to complete. For each gate, verify its output file exists:

| Gate | Expected File |
|------|--------------|
| code-reviewer | `.claude/memory/REVIEW.md` |
| security-auditor | `.claude/memory/SECURITY.md` |
| test-writer | `.claude/memory/TEST-REPORT.md` |
| performance-engineer | `.claude/memory/PERF.md` |
| accessibility-checker | `.claude/memory/A11Y.md` (unless skipped) |
| verifier | `.claude/memory/VERIFICATION.md` |

For any gate whose output file is missing: re-invoke that specific gate agent ONCE with: "You returned without writing [FILENAME]. Write it NOW with your verdict." If still missing after 1 retry, the orchestrator writes the gate report. Log any gate that required retry.

### Step 3: Evaluate gates — by grep, not by reading

For each gate file, read **line 1 only** (e.g. `head -1 .claude/memory/REVIEW.md`):
- `GATE PASSED` → record pass
- `GATE BLOCKED — [reason]` → record block; only NOW read the report body to route fixes
- `GATE RUNNING` → the agent died mid-run; re-invoke that one gate

Blocking criteria per gate:

| Gate | Blocks If |
|------|-----------|
| code-reviewer | HIGH severity finding |
| security-auditor | CRITICAL finding |
| test-writer | Coverage decreased |
| performance-engineer | Regression flagged |
| accessibility-checker | 🔴 blocking WCAG violation |
| verifier | Real gap with evidence |

### Step 4: Handle gate results

**All gates pass:** Report "✅ All gates passed. Ready for `/ship`."

**Some gates block:** 
- List blocking findings clearly
- Return to `/build` (or specific lane) for fixes
- Re-run `/review` after fixes (Tier 1 first, always)
- **Retry limit: 3 attempts max.** On 3rd fail, escalate to product-manager for re-scoping.

### Step 5: Update context

Update `.claude/memory/context.md`:
- Set "Current Status" → Phase: Verification (attempt N)
- If all pass, mark Phase 4 complete
- If blocked, note which gates blocked and why
- Update "Last Updated" timestamp
