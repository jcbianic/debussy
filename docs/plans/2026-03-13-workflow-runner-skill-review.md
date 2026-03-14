# Review: Workflow Runner Skill Redesign vs. Gastown Lessons (2026-03-13)

## Context

This document evaluates the `workflow-run` skill redesign
(`2026-03-13-workflow-runner-skill-redesign.md`) against the orchestration
patterns learned from researching gastown. The skill runs inside a Claude Code
conversation — not in debussy. The constraints differ from a web server: no
async I/O, no SSE, but the ability to run blocking Bash tools at zero token
cost while waiting.

**Correction from earlier review:** a previous draft said "there is no LLM
reasoning in the coordination layer" and called the maestro equivalent to code.
That is wrong. The maestro IS Claude — an LLM consuming tokens on every loop
iteration. The constraint that it behaves like a thin coordinator is an
*instruction*, not a structural property. The design doc itself names this
risk: "one hallucination away from silently failing." This correction changes
the analysis below.

---

## Mapping: Gastown Roles → Skill Roles

| Gastown | Skill redesign | Match |
| --- | --- | --- |
| Polecat | Principal | ✅ Near-identical |
| Witness (AI) | Maestro (AI) | ✅ Correct comparison |
| `gt done` signal | Principal status report | ✅ Equivalent |
| Dolt DB / mailbox | `state.json` | ✅ Simpler, correct |
| Daemon orphan check | Interrupted step handler | ✅ Simpler, correct |
| Human gate (none) | Review server + trigger file | ✅ Better than gastown |
| Mayor AI | You (the human) | ✅ Correct |
| Deacon escalation | Not present | ✅ Correctly omitted |

---

## What the Redesign Gets Right

### Persistent/Ephemeral Split — Nailed

`state.json` persists for the entire workflow run. The principal is spawned
once per step and dies. The maestro session may die (conversation ends) and
resume via `/workflow-run --resume`. This is the gastown insight applied
correctly: identity (the run, the step state) must outlive the agents executing
it.

### Thin Maestro Constraint — Correct Goal, Fragile Mechanism

The instruction "maestro never reads artifact file contents" is the Witness
principle applied correctly. In gastown the Witness never reads the code the
polecat wrote — only bead status. Here the maestro only reads `state.json` and
status reports.

The fragility: this is enforced by prompt instruction, not structure. The
maestro is Claude — it can drift. See Strengthening section below.

### Human Gate as First-Class State — Nailed

`pending_review` is a proper state in `state.json`, not a special case.
The maestro blocks cleanly, waiting for `.resume-trigger`. On resume it reads
the decision and routes accordingly. This is better than gastown, which has no
formal human gate.

### Zero Token Cost at Review Gates — Correct

```bash
while [ ! -f {workspace}/.resume-trigger ]; do sleep 2; done
```

While this Bash tool blocks, the LLM is not running. No tokens consumed.
Gastown evaluated the same tradeoff and chose `fsnotify` only for ACP mode.
For an agent explicitly waiting for human input, polling is correct and simpler.

### Atomic State Write Before Advancing — Correct

Principal writes `state.json` once at the end of its work. Maestro advances
`current_step` after reading the principal's report. If anything crashes
between steps, the state captures exactly where execution was. Resume reads
it and continues from the right position. This is gastown's "claim then
execute" and durable mailbox combined.

---

## What Needs Strengthening

### 1. Maestro Token Cost Is Real — State.json Must Be the Memory

The maestro IS an LLM. Every loop iteration costs tokens: read state.json,
make a routing decision, construct the principal dispatch prompt. Over 7 IIKit
steps this is bounded and acceptable. Over 20+ steps it becomes a concern.

More importantly: if the maestro derives routing decisions from its conversation
history rather than from re-reading `state.json`, it becomes fragile. Past
context can mislead. An earlier tool result stays in the context window and
may influence a later decision incorrectly.

**Recommendation:** Add an explicit instruction to the maestro prompt:

> "At the start of each loop iteration, re-read `state.json` to determine
> current state. Do not rely on what you remember from earlier in the
> conversation. `state.json` is the only source of truth."

This makes the maestro stateless between iterations in the meaningful sense —
even if the conversation history grows, routing decisions come from the file,
not from memory.

**Escape hatch for long workflows:** spawn a fresh maestro sub-agent given
only `state.json` + `workflow.yaml`. The conversation history becomes
irrelevant because all decisions flow from the file. Gastown does this by
killing and restarting the Witness with a fresh context. Not needed for 7
steps; worth knowing for longer workflows.

### 2. Haiku Summary Failure Should Not Fail the Step

Per step the principal spawns: the actual worker agent + up to two Haiku
agents (summary + cards). If a Haiku call fails (model unavailable, timeout),
the current design returns `STATUS: failed` — which marks the step failed even
though the worker succeeded and the artifacts exist.

**Recommendation:** Make summary/card generation degraded-not-failed.

```text
SUMMARIES: done | skipped | failed (non-blocking)
CARDS: done | skipped | failed (non-blocking)
```

The principal writes `state.json` with `summaries: failed` but still returns
`STATUS: completed`. The maestro routes to the review gate as normal. The
review UI shows a warning: "Summaries could not be generated for this step."
The human can still review the raw artifact.

### 3. The Interrupted Step Handler Is a Context Leak

When a step is in `running` state on resume, the maestro asks the user
interactively: "retry / skip?" This conversational exchange stays in the
context window unstructured, alongside all future routing decisions.

**Recommendation:** Apply the same file-based decision pattern used for
review gates.

On encountering an interrupted step:

1. Print the notice (which step, when it started)
2. Write an empty `.interrupted-{step-id}` file as a signal
3. Block on a second trigger:
   `while [ ! -f .interrupted-decision ]; do sleep 2; done`
4. The review server (already running) exposes a recovery UI for interrupted
   steps: "Retry / Skip"
5. User clicks → server writes `.interrupted-decision` with the choice
6. Maestro reads the file, routes accordingly, deletes both files

This keeps all human decisions in the review UI and out of the conversation,
and makes the decision durable (survives maestro restart).

### 4. The Principal Has No Timeout — Use a Hook, Not a Prompt

What if the principal starts but never writes to `state.json`? The maestro
sees the step stuck in `running`. Gastown detects this via GUPP violations
(agent has work but no heartbeat for >N minutes). The skill has no equivalent.

The interrupted step handler catches this on resume — but only after the user
manually interrupts and re-runs. Silent hangs are invisible until then.

A prompt instruction ("write state.json before returning") would work but is
fragile: it depends on the LLM following instructions under failure conditions,
which is exactly when LLMs are least reliable.

**Recommendation:** Use a PostToolUse hook on the Agent tool instead.

When the Agent tool returns (normally or with an error), the hook fires
synchronously. At that point, the hook checks `state.json`: if any step is
still in `running` state, the principal exited without completing its write.
The hook writes the failure itself — no LLM required.

```bash
#!/usr/bin/env bash
# .claude/hooks/post-agent-cleanup.sh
# Fires after every Agent tool call.
# If a step is still "running" after the agent returned, it crashed.

STATE_FILE="${WORKFLOW_STATE_FILE:-}"
[ -z "$STATE_FILE" ] || [ ! -f "$STATE_FILE" ] && exit 0

RUNNING_STEP=$(jq -r '
  .steps | to_entries[]
  | select(.value.status == "running")
  | .key
' "$STATE_FILE" 2>/dev/null | head -1)

[ -z "$RUNNING_STEP" ] && exit 0

# Principal exited without writing — mark it failed
TMP=$(mktemp)
jq --arg step "$RUNNING_STEP" \
   --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '.steps[$step].status = "failed"
  | .steps[$step].completed_at = $ts
  | .steps[$step].notes = "principal exited without completing"' \
  "$STATE_FILE" > "$TMP" && mv "$TMP" "$STATE_FILE"
```

The hook needs one thing from the maestro: the path to `state.json`. Set
`WORKFLOW_STATE_FILE` as an environment variable at workflow initialization.
The maestro already knows this path — it just needs to export it into the
shell environment before the workflow loop starts.

This turns the timeout obligation from a prompt instruction (fragile) into
a structural guarantee (reliable). The principal can crash, hang, or
hallucinate — the hook catches it and the maestro's `failed` routing handles
recovery.

This is the agent-side equivalent of gastown's `gt done` obligation: the
polecat is required to signal completion (or failure), not just disappear.

### 5. Principal Status Report Should Have a Hard Character Limit on NOTES

The five-line structured report is already tight. The only free-text field
is `NOTES`. If the principal writes a verbose NOTES line, it accumulates in
the maestro's context across steps.

**Recommendation:** Add to the principal instructions:

> "NOTES must be ≤ 80 characters. One phrase only. No sentences."

This makes maestro context growth O(n × 80 chars) — fully bounded.

---

## The Trigger File Pattern: Correct and Generalizable

The `.resume-trigger` file is gastown's `gt done` signal adapted for a
filesystem context. It is correct. The review server writes it; the maestro
wakes up; it reads `state.json` for the actual decision.

The trigger file is ephemeral (signal only). `state.json` is durable (truth).
This separation is right: if the maestro crashes while waiting, the next resume
reads `state.json` directly — the trigger file is irrelevant.

This pattern should be applied consistently to all human-decision points
(interrupted steps, as noted above).

---

## Summary

| Area | Verdict |
| --- | --- |
| Persistent/ephemeral split | Sound |
| Thin maestro constraint | Sound goal, fragile mechanism |
| Human gate as first-class state | Sound |
| Zero token cost at gates | Sound |
| Atomic state write before advance | Sound |
| Maestro context accumulation | Needs explicit state.json-as-memory rule |
| Haiku summary failure | Needs degraded-not-failed routing |
| Interrupted step interactivity | Needs file-based decision pattern |
| Principal timeout | Needs agent-side timeout obligation |
| Notes field in status report | Needs hard character limit |

No structural changes needed. The foundation is correct. The strengthening
items are all prompt/contract changes, not architectural changes.
