---
name: interview
description: Interview with the concierge to crystalize your vision
---

# /interview — Crystalize Your Vision

Invoke the **concierge** agent to conduct a depth-first, one-question-at-a-time interview.

## Execution

**Step 1: Launch concierge**
Use the Agent tool:
- description: "Concierge interview"
- subagent_type: "dream-team:concierge"
- prompt: "You are the concierge agent. The user wants to discuss: $ARGUMENTS. Begin the interview now — one question at a time, depth-first, with recommended answers. Do not stop until the vision is fully crystallized. When complete, produce a final VISION.md document."

**Step 2: Save output**
When the concierge finishes, save its final synthesized output to `.claude/memory/VISION.md`. If the concierge produced the VISION.md content inline, write it to that file.

**Step 2b: Output verification**
After the agent returns, check: does `.claude/memory/VISION.md` exist?
- If YES: proceed to Step 3.
- If NO: Re-invoke concierge ONCE with: "You returned without writing VISION.md. Write it NOW."
- If still NO: orchestrator writes VISION.md from the interview transcript.

**Step 3: Update context**
Update `.claude/memory/context.md`:
- Set "Current Status" → Phase: Interview complete
- Set "Last Updated" to today's date
- Add entry to "Artifacts" table: VISION.md → ✅ created
- Add session entry to "Recent Sessions" table

## Gates
- Concierge's internal gate: refuses to end until vision is crystallized
- After concierge finishes, confirm with user: "Does this VISION.md capture what you want?" If not, re-invoke concierge with clarifications.
