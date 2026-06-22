---
name: research
description: Technology evaluation with evidence-based comparison
argument-hint: "technology question to research"
---

# /research — Evidence-Based Technology Evaluation

Invoke the **research-analyst** agent to evaluate technologies with structured comparison and evidence grading.

## Execution

**Step 1: Launch research-analyst**
Use the Agent tool:
- description: "Research analysis"
- subagent_type: "dream-team:research-analyst"
- prompt: "You are the research-analyst agent. The research question is: $ARGUMENTS. Follow your operating principles: (1) Evaluate 3+ candidates, never binary comparison. (2) Every recommendation includes: what it is, why it fits, what you give up, confidence level. (3) Evidence-grade all claims: Confirmed (benchmarked), Reported (documented), Claimed (vendor stated). (4) 'Insufficient evidence to decide' is a valid output. Produce a RESEARCH.md with structured comparison matrix."

**Step 2: Output verification**
After the agent returns, check: does `.claude/memory/RESEARCH.md` (or topic-specific file) exist?
- If YES: proceed.
- If NO: Re-invoke research-analyst ONCE with: "You returned without writing the research file. Write it NOW."
- If still NO: orchestrator writes the research file.

**Step 3: Save output**
If not already done, save the research output to `.claude/memory/RESEARCH.md` (or a topic-specific filename like `.claude/memory/RESEARCH-<topic>.md`).

**Step 3: Create ADR if decision made**
If the research leads to a technology decision, create an Architecture Decision Record in `.claude/memory/decisions/` using the MADR template:
- Title: "Use X over Y for Z"
- Status: Proposed (if user hasn't confirmed) or Accepted (if user confirms)
- Context, Decision, Consequences sections

**Step 4: Update context**
Update `.claude/memory/context.md`:
- Add entry under "Active Decisions" referencing the ADR
- Update "Last Updated" timestamp
