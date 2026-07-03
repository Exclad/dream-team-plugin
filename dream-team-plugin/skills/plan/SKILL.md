---
name: plan
description: Strategy phase — PM + architect + UX designer + spec, gated by plan-checker
---

# /plan — Strategy Phase

Execute the full strategy tier: 4 agents in parallel → plan-checker gate.

**Prerequisite:** `.claude/memory/VISION.md` must exist. If it doesn't, tell the user to run `/interview` first.

## Conventions (apply to every agent below)

- **Model:** read `.claude/memory/config.md`; pass the **planning** role's model as the `model` parameter on each Agent call (`inherit` → omit the parameter; config missing → `sonnet`).
- **Append to every prompt:** "Cap the file at ~150 normative lines (appendix below a `---` divider allowed). Create the file immediately with `Status: in-progress` on line 1; flip to `Status: complete` when done. Return a ≤10-line summary — do NOT paste the file back."
- **Ultra plan detail:** if config.md says `plan_detail: ultra`, ALSO append to the product-manager and architect prompts: "ULTRA DETAIL MANDATE: the executors are weak models. Every task MUST specify: exact file path, exact code (full snippets or line-level diff descriptions), exact commands with expected output, a mechanical per-task acceptance check, explicit ordering and failure handling. Zero decisions left to the executor. Never write 'appropriately', 'as needed', or 'handle errors' without spelling it out."
- **Checkpoint:** after EACH agent completes, update `.claude/memory/context.md` (including its one-line digest in the Artifacts table and the Phase 1 Telemetry row) and run `git add .claude/memory && git commit -m "checkpoint: strategy <agent>"` (unless `checkpoint_commits: off`).
- **Pacing:** if config says `pacing: conservative`, max 2 concurrent agents — sequential pairs.
- **AI features:** if VISION.md includes LLM/AI functionality, also launch **ai-engineer** to write `.claude/memory/AI-SPEC.md` (same conventions).

## Execution

### Step 1: Launch 4 strategy agents IN PARALLEL

All four agents read VISION.md. The Agent tool has no `run_in_background` parameter — to run agents in parallel, issue all 4 Agent tool calls in a single message:

**Agent 1 — product-manager:**
Use the Agent tool: description="Product manager planning"
- subagent_type: "dream-team:product-manager"
- prompt: "You are the product-manager agent. Read `.claude/memory/VISION.md`. Produce `.claude/memory/PLAN.md` with: user stories, acceptance criteria, scope boundaries (what's in and out), task breakdown with dependencies, and effort estimates (S/M/L/XL) for each task."

**Agent 2 — architect:**
Use the Agent tool: description="Architect system design"
- subagent_type: "dream-team:architect"
- prompt: "You are the architect agent. Read `.claude/memory/VISION.md`. Produce `.claude/memory/ARCHITECTURE.md` with: system design, component architecture, API contracts, data model, technology choices with trade-off rationale, and deployment architecture."

**Agent 3 — ux-designer:**
Use the Agent tool: description="UX design"
- subagent_type: "dream-team:ux-designer"
- prompt: "You are the ux-designer agent. Read `.claude/memory/VISION.md` and (if it exists) `.claude/memory/PLAN.md`. Produce `.claude/memory/UX-SPEC.md` with: user flows, information architecture, wireframe descriptions, component hierarchy, interaction patterns, and accessibility requirements specified at the UX level. Define the 'what' and 'why' — NOT the 'how'."

**Agent 4 — spec-phase:**
Use the Agent tool: description="Formal specification"
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
- prompt: "You are the plan-checker agent. Apply your DETAIL MANDATE at level [standard|ultra — read from `.claude/memory/config.md`]. Review all 4 strategy outputs:
  - `.claude/memory/PLAN.md`
  - `.claude/memory/ARCHITECTURE.md`
  - `.claude/memory/UX-SPEC.md`
  - `.claude/memory/SPEC.md`
  Perform your 7-point detail check. Reject vague or incomplete plans. For ultra level: reject any task a weak model could misinterpret — the test is 'could Haiku execute this with zero judgment calls?'. Produce a gate verdict: APPROVED (proceed) or REVISION NEEDED (specify which agent(s) must revise and what's missing)."

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

Summarize what was produced **from the agents' returned summaries** (don't re-read the artifacts) and ask: "Ready to proceed to `/build`? Review the plans and approve, modify, or reject."
