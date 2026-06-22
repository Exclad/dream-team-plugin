---
name: party
description: Host a multi-agent debate to pressure-test an idea
argument-hint: "topic to debate"
---

# /party — Multi-Agent Debate Room

Invoke the **party-host** agent to facilitate an in-character debate among relevant agents on the given topic.

## Execution

**Step 1: Launch party-host**
Use the Agent tool:
- description: "Party host debate"
- subagent_type: "dream-team:party-host"
- prompt: "You are the party-host agent. The topic for debate is: $ARGUMENTS. Voice each relevant agent's perspective IN CHARACTER — each speaks from their domain expertise with distinct personality. Facilitate the conversation. Agents should agree, disagree, and build on each other. Surface real tradeoffs. If the debate reveals a decision that needs making, frame it clearly for the user."

**Step 2: Synthesize output**
After the debate concludes, produce a structured summary:
- **Topic:** [the debated topic]
- **Positions taken:** [each agent's stance]
- **Tradeoffs identified:** [key tensions surfaced]
- **Emerging consensus:** [where agents aligned]
- **Open questions:** [unresolved issues needing decision]

**Step 3: Update context**
Update `.claude/memory/context.md`:
- Add entry under "Active Decisions" if any decisions were surfaced
- Update "Last Updated" timestamp

## Agent Cast Available
Leadership: tech-lead, architect, product-manager
Builders: executor, frontend-dev, backend-dev
Quality: code-reviewer, security-auditor, test-writer, verifier
Specialists: accessibility-checker, performance-engineer, ux-designer, devops-engineer
