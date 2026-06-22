---
name: debug
description: Investigate and fix a bug with scientific debugging
argument-hint: "symptom or error message"
---

# /debug — Investigate, Diagnose, Fix, and Learn

Execute the full debug pipeline using file-based handoffs: error-detective → debugger → executor → pattern extraction.

## Prompt Length Constraint

Keep per-agent prompts under 2,000 characters. Reference memory files rather than embedding full specs inline.

## Execution

### Step 1: error-detective (investigation)
Use the Agent tool: description="Error detective investigation"
- subagent_type: "dream-team:error-detective"
- prompt: "You are the error-detective agent. The reported symptom is: $ARGUMENTS. Investigate using your evidence grading system (Confirmed/Deduced/Hypothesized), challenge premises, use binary search methodology to narrow the cause. Write your findings to `.claude/memory/rca.md` with: (1) What happened, (2) Evidence grade for each finding, (3) Confidence level. You are NOT done until `.claude/memory/rca.md` exists on disk. Write it NOW."

### Agent Output Verification
After Step 1: does `.claude/memory/rca.md` exist? If NO, re-invoke ONCE with: "Write `.claude/memory/rca.md` NOW." If still NO, the orchestrator writes the file.

### Step 2: debugger (reproduction + isolation)
Use the Agent tool: description="Debugger reproduction"
- subagent_type: "dream-team:debugger"
- prompt: "You are the debugger agent. Read `.claude/memory/rca.md` for the error-detective's findings. Your job: (1) Create the smallest possible reproduction case, (2) Use scientific method — hypothesis → test → confirm, (3) Use git bisect if the regression window is unknown, (4) Isolate the exact root cause. Write your results to `.claude/memory/fix-plan.md` with: confirmed root cause + proposed fix plan. You are NOT done until `.claude/memory/fix-plan.md` exists on disk. Write it NOW."

### Agent Output Verification
After Step 2: does `.claude/memory/fix-plan.md` exist? If NO, re-invoke ONCE. If still NO, orchestrator writes it.

### Step 3: executor (apply fix)
Use the Agent tool: description="Apply fix"
- subagent_type: "dream-team:executor"
- prompt: "You are the executor agent. Read `.claude/memory/fix-plan.md` for the debugger's root cause and fix plan. Apply the fix: (1) Smallest viable diff — change only what's necessary, (2) Follow the fix plan exactly, (3) Verify the fix works. If the fix doesn't resolve the issue, escalate back. You are NOT done until the fix is applied and verified."

### Agent Output Verification
Verify the fix was applied (check git diff). If no changes, re-invoke executor ONCE. If still no changes, escalate.

### Step 4: Pattern extraction (self-learning)
Read `.claude/memory/rca.md` and `.claude/memory/fix-plan.md`. Extract a pattern:
1. Create `.claude/memory/patterns/{descriptive-slug}.md` using `.claude/memory/patterns/_TEMPLATE.md`
2. Log to `.claude/memory/errors/error-ledger.jsonl` with: timestamp, severity, category, agent, symptom, root_cause, fix, pattern_ref, session
3. Check for existing occurrences — if 5+, promote to `.claude/rules/`

### Step 5: Update context
Update `.claude/memory/context.md`: add entry, update timestamp.
