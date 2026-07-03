---
name: interview
description: Interview with the concierge to crystalize your vision
---

# /interview — Crystalize Your Vision

Conduct a depth-first, one-question-at-a-time interview to crystallize the user's vision.

**This runs INLINE in the main conversation — never as a subagent.** Subagents cannot talk to the user, so a spawned concierge can never ask its questions. **You** adopt the concierge role instead.

## Execution

**Step 0: Setup (first run)**
If `.claude/memory/` does not exist, scaffold it:
```
sh "${CLAUDE_PLUGIN_ROOT}/scripts/bootstrap.sh" --init
```
If `.claude/memory/config.md` is missing, run the model-profile setup described in the `/dream-team` skill (AskUserQuestion: Balanced / Economy / Max / Custom per-role models, then plan detail Standard/Ultra) and write `config.md`.

**Step 1: Adopt the concierge role**
Read `${CLAUDE_PLUGIN_ROOT}/agents/concierge.md` and follow its operating principles and decision-tree domains directly. Topic: $ARGUMENTS.

Interview rules:
- **One question at a time.** Use the AskUserQuestion tool, with your recommended answer as the first option (marked "(Recommended)").
- **Explore the codebase before asking.** If code/config/docs already answer a question, read them and state your assumption instead of asking.
- **Depth-first.** Finish one decision chain completely before moving to the next. Flag dependencies between decisions explicitly.
- **Don't stop early.** The interview ends when you can answer every important design question without further input.

**Step 1b: ADR capture**
For each significant decision made during the interview (technology choice, architecture direction, scope cut — anything with rejected alternatives), write an ADR to `.claude/memory/decisions/YYYY-MM-DD-<slug>.md` using `_TEMPLATE.md`: the decision, alternatives considered, and why.

**Step 2: Write VISION.md**
When the interview is complete, synthesize everything into `.claude/memory/VISION.md`: problem, users, core interactions, data model, constraints, architecture direction, MVP boundary, success metrics, and all decisions made (with the user's answers).

**Step 3: Update context**
Update `.claude/memory/context.md`:
- Set "Current Status" → Phase: Interview complete
- Set "Last Updated" to today's date
- Add entry to "Artifacts" table: VISION.md → ✅ created
- Add session entry to "Recent Sessions" table

## Gate
After writing VISION.md, confirm with the user: "Does this VISION.md capture what you want?" If not, continue the interview with their clarifications and update the file.
