---
name: review
description: Run all 6 verification gates on the current changes
---

# /review — Full Verification (6 Parallel Gates)

Run all 6 verification gates in parallel. No code ships without this passing.

## Execution

### Step 0: Identify changed files
Run `git diff --name-only HEAD` to identify what changed. If nothing changed, report "Nothing to review."

### Step 1: Launch 6 verification agents IN PARALLEL

Launch all 6 simultaneously using the Agent tool with `run_in_background: true`:

**Gate 1 — code-reviewer:**
Use the Agent tool: run_in_background=true, description="Code review gate"
- subagent_type: "dream-team:code-reviewer"
- prompt: "You are the code-reviewer agent. Review the current git diff. Your adversarial mandate: MUST find at least 3 issues. Look for what's MISSING, not just what's wrong. Use structured severity levels (HIGH/MEDIUM/LOW). Produce `.claude/memory/REVIEW.md` with findings. BLOCK if any HIGH severity issues found."

**Gate 2 — security-auditor:**
Use the Agent tool: run_in_background=true, description="Security audit gate"
- subagent_type: "dream-team:security-auditor"
- prompt: "You are the security-auditor agent. Audit the current git diff. Use full OWASP Top 10 checklist, threat modeling. Produce `.claude/memory/SECURITY.md` with findings. BLOCK if any CRITICAL finding. Include CVE scanning recommendations."

**Gate 3 — test-writer:**
Use the Agent tool: run_in_background=true, description="Test review gate"
- subagent_type: "dream-team:test-writer"
- prompt: "You are the test-writer agent. Review the current git diff for test coverage. Check AAA structure, anti-patterns, edge case coverage. Produce `.claude/memory/TEST-REPORT.md` with findings. BLOCK if coverage decreased from baseline."

**Gate 4 — performance-engineer:**
Use the Agent tool: run_in_background=true, description="Performance review gate"
- subagent_type: "dream-team:performance-engineer"
- prompt: "You are the performance-engineer agent. Review the current git diff for performance regressions. Apply measure-first discipline, full-stack profiling analysis. Produce `.claude/memory/PERF.md` with findings. FLAG any regressions."

**Gate 5 — accessibility-checker:**
Use the Agent tool: run_in_background=true, description="Accessibility audit gate"
- subagent_type: "dream-team:accessibility-checker"
- prompt: "You are the accessibility-checker agent. Audit all UI changes in the current git diff. Check WCAG 2.1 AA: keyboard navigation, screen reader support, color contrast (4.5:1 normal, 3:1 large), focus management, semantic HTML. Produce `.claude/memory/A11Y.md` with violations by severity (🔴 blocking / 🟡 should-fix / 🔵 enhancement). BLOCK if any 🔴 blocking violation."

**Gate 6 — verifier:**
Use the Agent tool: run_in_background=true, description="Adversarial verification gate"
- subagent_type: "dream-team:verifier"
- prompt: "You are the verifier agent. Apply your adversarial mandate: MUST find at least 2 gaps or discrepancies. Check: what was built vs what was planned, what was planned vs what was decided. Three coverage dimensions. S.U.P.E.R scoring. Produce `.claude/memory/VERIFICATION.md` with findings and fix plan generation. BLOCK if gaps found."

### Step 2: Collect all gate results

Wait for all 6 agents to complete. For each gate, verify its output file exists:

| Gate | Expected File |
|------|--------------|
| code-reviewer | `.claude/memory/REVIEW.md` |
| security-auditor | `.claude/memory/SECURITY.md` |
| test-writer | `.claude/memory/TEST-REPORT.md` |
| performance-engineer | `.claude/memory/PERF.md` |
| accessibility-checker | `.claude/memory/A11Y.md` |
| verifier | `.claude/memory/VERIFICATION.md` |

For any gate whose output file is missing: re-invoke that specific gate agent ONCE with: "You returned without writing [FILENAME]. Write it NOW with your verdict." If still missing after 1 retry, the orchestrator writes the gate report. Log any gate that required retry.

### Step 3: Evaluate gates

Check each gate's verdict:

| Gate | Blocks If |
|------|-----------|
| code-reviewer | HIGH severity finding |
| security-auditor | CRITICAL finding |
| test-writer | Coverage decreased |
| performance-engineer | Regression flagged |
| accessibility-checker | 🔴 blocking WCAG violation |
| verifier | Gaps found (2+) |

### Step 4: Handle gate results

**All gates pass:** Report "✅ All 6 gates passed. Ready for `/ship`."

**Some gates block:** 
- List blocking findings clearly
- Return to `/build` (or specific lane) for fixes
- Re-run `/review` after fixes
- **Retry limit: 3 attempts max.** On 3rd fail, escalate to product-manager for re-scoping.

### Step 5: Update context

Update `.claude/memory/context.md`:
- Set "Current Status" → Phase: Verification (attempt N)
- If all pass, mark Phase 4 complete
- If blocked, note which gates blocked and why
- Update "Last Updated" timestamp
