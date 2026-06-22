---
name: ship
description: Ship it — docs, release notes, version bump, PR, final approval
---

# /ship — Documentation + Release + Final Approval

**Prerequisite:** All 6 verification gates must pass (Phase 4 complete in context.md). If gates haven't passed, refuse and say: "Verification gates haven't passed yet. Run `/review` first."

## Gap-Filling Rule

Wait for ALL agents to complete before writing any file yourself. If an agent takes longer than expected, wait — do not preemptively write what you think it will produce. Two versions of the same file wastes work. If an agent fails to produce output after 1 retry, the orchestrator takes over.

## Execution

### Step 1: docs-writer
Use the Agent tool: description="Generate documentation"
- subagent_type: "dream-team:docs-writer"
- prompt: "You are the docs-writer agent. Read `.claude/memory/VISION.md`, `.claude/memory/PLAN.md`, `.claude/memory/ARCHITECTURE.md`, and the current codebase. Produce: (1) README.md, (2) API docs for new/changed endpoints, (3) CHANGELOG.md entry. You are NOT done until these files exist on disk. Write them NOW."

**Verify:** After agent returns, check that CHANGELOG.md was created. If NO, re-invoke ONCE. If still NO, orchestrator writes it.

### Step 2: release-manager
Use the Agent tool: description="Create release"
- subagent_type: "dream-team:release-manager"
- prompt: "You are the release-manager agent. Run your release readiness checklist. Then: (1) Determine semver bump, (2) Create git tag, (3) Prepare PR description. You are NOT done until you have determined the version and created the tag. Do it NOW."

**Verify:** After agent returns, check that a version was determined. If NO, re-invoke ONCE.

### Step 3: Final concierge check
Use the Agent tool: description="Final vision check"
- subagent_type: "dream-team:concierge"
- prompt: "You are the concierge agent. Read `.claude/memory/VISION.md`. Examine what was built. Ask: 'Here's what we built. Does this match your vision?' Present structured comparison of requested vs delivered."

### Step 4: Create session summary
Create `.claude/memory/sessions/YYYY-MM-DD.md` using the session summary template from `.claude/memory/sessions/_TEMPLATE.md`. Include:
- Date and feature name
- Pipeline phases completed
- Agents invoked
- Key decisions made
- Patterns discovered
- Artifacts produced

### Step 5: Update context
Update `.claude/memory/context.md`:
- Mark Phase 5 complete
- Set "Current Status" → Phase: Idle (pipeline complete)
- Update all pipeline phases to ✅ complete
- Add session to "Recent Sessions" table
- Update "Last Updated" timestamp

### Step 6: Final report
Present to the user:
- Summary of everything built
- Link to PR (if created)
- List of all artifacts
- "The dream team pipeline is complete. 🎉"
