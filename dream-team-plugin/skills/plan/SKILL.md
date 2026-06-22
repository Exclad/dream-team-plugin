---
name: plan
description: Strategy phase — PM + architect + UX designer + spec, gated by plan-checker
---

# /plan — Strategy Phase

Execute the full strategy tier: 4 agents in parallel → plan-checker gate.

**Prerequisite:** `.claude/memory/VISION.md` must exist. If it doesn't, tell the user to run `/interview` first.

## Execution

### Step 1: Launch 4 strategy agents IN PARALLEL

All four agents read VISION.md. Launch them simultaneously using the Agent tool with `run_in_background: true`:

**Agent 1 — product-manager:**
Use the Agent tool: run_in_background=true, description="Product manager planning"
- subagent_type: "dream-team:product-manager"
- prompt: "You are the product-manager agent. Read `.claude/memory/VISION.md`. Produce `.claude/memory/PLAN.md` with: user stories, acceptance criteria, scope boundaries (what's in and out), task breakdown with dependencies, and effort estimates (S/M/L/XL) for each task."

**Agent 2 — architect:**
Use the Agent tool: run_in_background=true, description="Architect system design"
- subagent_type: "dream-team:architect"
- prompt: "You are the architect agent. Read `.claude/memory/VISION.md`. Produce `.claude/memory/ARCHITECTURE.md` with: system design, component architecture, API contracts, data model, technology choices with trade-off rationale, and deployment architecture."

**Agent 3 — ux-designer:**
Use the Agent tool: run_in_background=true, description="UX design"
- subagent_type: "dream-team:ux-designer"
- prompt: "You are the ux-designer agent. Read `.claude/memory/VISION.md` and (if it exists) `.claude/memory/PLAN.md`. Produce `.claude/memory/UX-SPEC.md` with: user flows, information architecture, wireframe descriptions, component hierarchy, interaction patterns, and accessibility requirements specified at the UX level. Define the 'what' and 'why' — NOT the 'how'."

**Agent 4 — spec-phase:**
Use the Agent tool: run_in_background=true, description="Formal specification"
- subagent_type: "dream-team:spec-phase"
- prompt: "You are the spec-phase agent. Read `.claude/memory/VISION.md`. Produce `.claude/memory/SPEC.md` with: formal specification, ambiguity scoring (1-5), 8-category edge completeness probe, MUST-NOT prohibition coverage, and tiered verification criteria."

### Step 2: Wait for ALL 4 agents to complete

Collect outputs. Verify each file was written successfully:

| Agent | Expected File |
|-------|--------------|
| product-manager | `.claude/memory/PLAN.md` |
| architect | `.claude/memory/ARCHITECTURE.md` |
| ux-designer | `.claude/memory/UX-SPEC.md` |
| spec-phase | `.claude/memory/SPEC.md` |

For each file that does NOT exist: re-invoke the specific agent ONCE with: "You returned without writing [FILENAME]. Write it NOW." If still missing after 1 retry, the orchestrator writes it. Log any agent that required retry.

### Step 3: Gate — plan-checker

Use the Agent tool:
- description: "Plan check gate"
- subagent_type: "dream-team:plan-checker"
- prompt: "You are the plan-checker agent. Apply your DETAIL MANDATE. Review all 4 strategy outputs:
  - `.claude/memory/PLAN.md`
  - `.claude/memory/ARCHITECTURE.md`
  - `.claude/memory/UX-SPEC.md`
  - `.claude/memory/SPEC.md`
  Perform your 7-point detail check. Reject vague or incomplete plans. Produce a gate verdict: APPROVED (proceed) or REVISION NEEDED (specify which agent(s) must revise and what's missing)."

### Step 4: Handle gate result

**If APPROVED:** Proceed to Step 5.

**If REVISION NEEDED:** Re-invoke the specific agent(s) that failed with the plan-checker's feedback. Then re-run plan-checker. Max 2 revision rounds before escalating to user.

### Step 5: Update context

Update `.claude/memory/context.md`:
- Set "Current Status" → Phase: Strategy complete
- Mark Phase 0 and Phase 1 complete in the pipeline table
- Update Artifacts table: PLAN.md, ARCHITECTURE.md, UX-SPEC.md, SPEC.md → ✅ created
- Update "Last Updated" timestamp

### Step 6: Present to user

Summarize what was produced and ask: "Ready to proceed to `/build`? Review the plans and approve, modify, or reject."
