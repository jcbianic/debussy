# Design: Workflow Runner Skill Redesign (2026-03-13)

## Problem Statement

The current `workflow-run` skill puts too much responsibility in the main
conversation (maestro). It accumulates context across every step, manages
state.json manually at each stage, and relies on fragile resume mechanisms
(subprocess auto-resume or manual `/workflow-run --resume`). At review gates
it exits entirely, breaking conversational continuity. The "orchestrator
discipline" rule (don't read artifacts, don't accumulate output) is just an
instruction — one hallucination away from silently failing.

## Chosen Approach

**Thin maestro + fat principal + fswatch wake-up.**

The maestro becomes a pure coordinator: it loops over steps, dispatches a
principal agent per step, and blocks at review gates waiting for a trigger
file. The principal owns the full step lifecycle. The review server starts at
workflow initialization and acts as a live dashboard throughout, not just a
gate UI.

## Roles & Boundaries

### Maestro (main SKILL.md)

The maestro is a coordinator only. Its responsibilities:

- Parse arguments and detect mode (new / resume / status / list)
- Load workflow YAML and validate required inputs
- Initialize or load `state.json`
- Start the review server immediately at workflow start
- Run the execution loop:
  - Skip completed/approved/skipped steps
  - Handle interrupted steps (ask retry/skip)
  - Handle pending_review steps (open review gate)
  - Dispatch a principal agent for all other steps
  - Read principal's status report and route accordingly
- At review gates: print notice, block on trigger file, read decision, route
- At workflow complete/abort: stop review server, print summary

The maestro **never reads artifact file contents**, never runs verify commands,
never generates summaries. It only reads state.json and principal status reports.

### Principal (per-step agent)

Replaces the former "handler agent" concept. Named after the orchestral section
principal — the direct link between conductor and execution. Dispatched once per
step, owns everything inside that step's lifecycle:

1. **Spawn worker** — dispatch `step.agent` with the fully-built prompt
   (step instructions + context files + artifact requirements + revision context
   if this is a retry after revision_requested)
2. **Check artifacts** — verify each declared artifact exists on disk; if any
   missing, return `STATUS: failed` immediately
3. **Run verify** — if step has a `verify` field, run the command and check
   exit code against `verify.expect`; if mismatch, return `STATUS: failed`
4. **Generate summaries + cards** — only if `review: true`; for each artifact
   with `review_summary_prompt`: spawn two parallel Haiku agents producing
   `{artifact}.summary.md` and `{artifact}.cards.json`
5. **Write state.json** — one atomic write at the end; update `steps[id]` with
   status, timestamps, artifact metadata, verify result
6. **Return report** — structured one-liner back to maestro

The principal writes state.json **only at the end**. No partial updates. If it
crashes mid-execution, the step stays `running` and maestro's interrupted-step
handler manages recovery on resume.

### Review Server

Unchanged Python HTTP server + HTML UI, with one addition: on human decision,
after writing `state.json`, it writes `{workspace}/.resume-trigger` (empty
file) to wake the maestro.

## Interface Contracts

### Maestro → Principal (agent prompt)

```text
STEP DEFINITION:
  id: {step.id}
  name: {step.name}
  agent: {step.agent}
  model: {step.model}
  prompt: {step.prompt — all variables already substituted by maestro}
  artifacts: [{path, description, review_summary_prompt}]
  verify: {command, expect}
  review: true/false

WORKSPACE: {workspace}
RUN_ID: {run_id}

CONTEXT FILES:
{contents of step.context files, pre-loaded by maestro}

REVISION CONTEXT: (only if re-dispatched after revision_requested)
  Previous attempt: revision_requested
  Reviewer comments: "{review.comments}"
  Address all reviewer concerns in this revision.
```

### Principal → Maestro (return report)

```text
STATUS: completed | failed
ARTIFACTS: ok | missing=[list of missing paths]
VERIFY: passed | failed | skipped
SUMMARIES: done | skipped
CARDS: done | skipped
NOTES: {one-line summary of what happened}
```

## Execution Flow

### New Run Mode

```text
1. Load YAML, validate inputs
2. Generate run_id, create workspace directory
3. Initialize state.json
4. Start review server (stays alive for entire workflow)
   - Copy review-server.py + review.html to {workspace}/
   - Launch in background, read port from {workspace}/review-server.port
   - Open browser: http://127.0.0.1:{port}/review
5. Print: "Starting workflow '{name}' — run {run_id}"
          "Dashboard: http://127.0.0.1:{port}/review"
6. Run execution loop
```

### Execution Loop

```text
A. Find step matching current_step id
   If none / all terminal → Workflow Complete

B. Skip terminal steps (completed, approved, skipped)
   Advance current_step → loop

C. Check condition (if present)
   Non-zero exit → mark skipped, advance → loop

D. Handle interrupted step (status == running)
   Ask: retry / skip

E. Open pending review (status == pending_review)
   → Review Gate Handler, EXIT loop

F. Handle rejection / revision (status == rejected | revision_requested)
   → Execute step (G) with revision context appended

G. Dispatch principal
   Mark step status: running in state.json
   Spawn principal agent with step definition + context + workspace
   Wait for principal's status report

H. Route on principal report
   failed       → mark step failed, ask: retry / skip / abort, EXIT
   completed
     review: false → mark completed, advance current_step → loop
     review: true  → Review Gate Handler, EXIT loop
```

### Review Gate Handler

```text
1. State.json already written by principal (status: completed, artifacts present)
   Update step status to pending_review

2. Print gate notice:
   ╔══════════════════════════════════════════╗
   ║  REVIEW GATE: {step.name}               ║
   ╚══════════════════════════════════════════╝
   Dashboard: http://127.0.0.1:{port}/review
   Waiting for your decision...

3. Block (zero token cost):
   Bash tool, timeout: 600000ms (10 min)
     while [ ! -f {workspace}/.resume-trigger ]; do sleep 2; done
     rm -f {workspace}/.resume-trigger
   If Bash times out → loop back to step 3 (keep waiting, no new tokens)

4. Read state.json → steps[id].review.decision

5. Route:
   approved           → advance current_step, continue execution loop
   revision_requested → re-dispatch principal with review.comments
   rejected           → mark workflow aborted, stop server, print summary, EXIT
```

### Workflow Complete

```text
1. Update state.json: status: completed
2. Stop review server:
     kill $(cat {workspace}/review-server.pid) 2>/dev/null
     rm -f {workspace}/review-server.pid {workspace}/review-server.port
3. Print:
   ╔══════════════════════════════════════════╗
   ║  WORKFLOW COMPLETE: {workflow.name}     ║
   ╚══════════════════════════════════════════╝
   Run ID: {run_id}
   Steps:  {n completed} / {n total}
   Artifacts in: {workspace}/
```

## State.json Write Ownership

| Field | Written by |
| --- | --- |
| `workflow`, `run_id`, `status`, `created_at` | Maestro (init) |
| `current_step`, `updated_at` | Maestro (each advance) |
| `inputs` | Maestro (init) |
| `steps[id].status` | Maestro → Principal |
| `steps[id].started_at` | Maestro (before dispatch) |
| `steps[id].completed_at`, `artifacts`, `verify` | Principal |
| `steps[id].review.decision`, `comments`, `decided_at` | Review server |
| `steps[id].review.status: pending` | Maestro (after principal) |

Trigger file `.resume-trigger` is written by review server on decision,
deleted by maestro after wake-up.

## Review Server Change (minimal)

One addition to the existing `review-server.py`: after writing the decision
to `state.json`, write an empty trigger file:

```python
# After persisting decision to state.json:
trigger_path = workspace_dir / ".resume-trigger"
trigger_path.touch()
```

No other changes to the review server or review.html required.

## Trade-offs Accepted

**Principal is a fat agent** — it does more work per dispatch (summaries, cards,
verify, state write). This costs more tokens per step but keeps the maestro
clean and prevents context accumulation across steps. Acceptable because steps
are the unit of parallelism anyway.

**Blocking Bash loop instead of fswatch** —
`while [ ! -f trigger ]; do sleep 2; done`
is technically polling at the OS level, but zero Claude tokens are consumed
while the Bash tool blocks. No `fswatch` dependency (not available on all
platforms). The 2-second sleep is imperceptible for human review workflows.

**auto_resume subprocess removed** — the same conversation stays alive
throughout, which is strictly better UX. The subprocess approach (spawning
`claude --print`) was fragile and created orphaned processes. No loss.

**One atomic state write per step** — if the principal crashes mid-execution,
the step is stuck in `running`. Maestro's interrupted-step handler recovers
this on resume. Acceptable trade-off for simplicity over partial-progress
tracking.

## Open Questions

- Should the review server port be configurable per workflow (to allow parallel
  workflow runs)? Currently hardcoded to 8901 with fallback to ephemeral.
- Should the principal be a separate installable skill eventually, or stay as
  inline instructions in SKILL.md? Keep inline for now (YAGNI).
- Should `rejected` permanently abort, or allow re-running from a specific step?
  Current design: abort. Can be revisited.

## Next Steps

- [ ] Rewrite `SKILL.md` with maestro-only logic (thin execution loop + gate handler)
- [ ] Write principal instructions block (embedded in SKILL.md
  as the dispatched prompt template)
- [ ] Update `review-server.py` to write `.resume-trigger` on decision
- [ ] Update `rpikit-complete.yml` if any step structure changes
- [ ] Smoke test with a simple 2-step workflow (one review gate)
