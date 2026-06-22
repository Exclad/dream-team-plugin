---
name: deep-discuss
description: Structured 7-phase problem analysis
argument-hint: "problem to analyze"
---

# /deep-discuss — Structured Problem Analysis

Invoke the **deep-discuss** agent to run a rigorous 7-phase protocol on the given problem.

## Execution

**Step 1: Launch deep-discuss**
Use the Agent tool:
- description: "Deep discuss analysis"
- subagent_type: "dream-team:deep-discuss"
- prompt: "You are the deep-discuss agent. The problem to analyze is: $ARGUMENTS. Execute your full 7-phase protocol: (1) Framing, (2) Assumptions, (3) Decomposition, (4) Analysis, (5) Synthesis, (6) Pressure Test, (7) Output. Apply the Phase 2 quality gate — if assumptions are vague, iterate before proceeding. Produce a structured analysis document with confidence levels for each finding."

**Step 2: Save output**
Save the structured analysis to `.claude/memory/discussions/` with a descriptive filename based on the topic.

**Step 3: Update context**
Update `.claude/memory/context.md`:
- Add entry under "Active Decisions" if the analysis surfaced actionable decisions
- Update "Last Updated" timestamp
