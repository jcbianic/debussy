# Research: Gastown Abstractions (2026-03-13)

## Problem Statement

Evaluate <https://github.com/steveyegge/gastown> to understand its
orchestration abstractions, specifically how loops/agents trigger themselves
reactively when another agent or a human has done something. Determine what
debussy should adopt, get inspired by, or skip entirely.

## Requirements

- Focus on session/workflow orchestration (not UI, not terminal)
- Answer the specific question: how do loops trigger themselves on completion
  or human action?
- Honest complexity assessment — debussy is a single-developer, local-first
  tool; gastown targets 20–30 concurrent agents in production

---

## Findings

### Relevant Files

| File | Purpose |
| --- | --- |
| `internal/polecat/types.go` | Polecat state machine |
| `internal/witness/protocol.go` | All message types the Witness handles |
| `internal/witness/handlers.go` | `POLECAT_DONE`, `MERGED`, `HELP` logic |
| `internal/daemon/lifecycle.go` | `LIFECYCLE:` processing + restart |
| `internal/mail/types.go` | Message struct, delivery modes |
| `internal/nudge/poller.go` | Background nudge delivery |
| `internal/convoy/operations.go` | Dependency resolution + dispatch |
| `internal/session/lifecycle.go` | Unified session start factory |
| `.claude/commands/patrol.md` | Witness patrol slash command |

### Entity Hierarchy

```text
Town
├── Mayor       (1 per town — AI coordinator, breaks work into beads)
├── Deacon      (1 per town — town-level monitor, escalation handler)
├── Rig         (N per town — project container wrapping a git repo)
│   ├── Witness     (1 per rig — AI supervisor, primary reactive node)
│   ├── Refinery    (1 per rig — merge queue processor)
│   └── Polecat     (N per rig — worker agents with persistent identity)
│       └── State: Working | Idle | Done | Stuck | Zombie
└── Beads DB    (Dolt — SQL-over-git, stores work items + messages)
```

### Key Abstractions

#### 1. The Persistent/Ephemeral Split (Essential)

The central insight of gastown: **agent identity persists, sessions do not.**

A Polecat is a permanent name (`Toast`), a permanent worktree, and a permanent
mailbox. But its tmux session is created when work starts and destroyed when
work ends. On the next assignment it gets a fresh session — fresh context,
no accumulation.

The key quote from the codebase:

> "The IDENTITY (CV chain, mailbox, work history) and SANDBOX (worktree)
> persist across sessions. An idle polecat keeps its worktree so it can be
> quickly reassigned without creating a new one."

**Relevance to debussy:** this maps directly to the WorkflowRun (persistent
SQLite record) vs Claude Code subprocess (ephemeral, per-phase). The subprocess
dies; the run state survives.

#### 2. The Completion Signal Chain (Essential)

This is the core reactive pattern. When work finishes, a **mail message** is
sent to the coordinator. The coordinator reacts on its next iteration.

```text
Polecat calls `gt done`
  └── sends mail: POLECAT_DONE Toast → Witness mailbox

Witness (next patrol cycle):
  └── reads inbox → POLECAT_DONE Toast
  └── unhooks bead, updates polecat state to Idle
  └── checks if merge needed → MERGE_READY to Refinery
  └── feedNextReadyIssue() → sling next bead → new session starts
```

No event bus. No pub/sub. **One message. One recipient. One reaction.**

#### 3. Mail + Nudge: Two Delivery Modes (Interesting)

Messages can be delivered two ways:

- **Queue** (`DeliveryQueue`): stored in the Dolt DB, agent polls on next loop.
  Survives agent death. Used for POLECAT_DONE, HELP, etc.
- **Interrupt** (`DeliveryInterrupt`): injected directly into the tmux pane via
  `send-keys`. Immediate but lost if agent is dead.

The **Nudge system** is for getting an idle agent's attention — it waits for
the agent to reach its idle prompt before injecting. There is also an
`fsnotify`-based Watcher for ACP mode (filesystem events as triggers).

**Relevance to debussy:** the distinction matters. Phase completion signals
should be durable (like Queue). UI "nudges" (e.g., "the user just approved
your spec") could be direct SSE pushes to an active session.

#### 4. The Witness: Thin Coordinator, Not Actor (Essential)

The Witness does **not** do the work. It:

1. Reads its inbox
2. Looks at polecat states
3. Makes dispatch decisions
4. Fires off `gt sling` calls

It is the smallest possible coordinator — just enough intelligence to react
to events and keep work flowing. The AI in the Witness does not need to
understand the work content, only its state.

Full message protocol the Witness handles:

```text
POLECAT_DONE <name>         work finished normally
HELP: <topic>               agent needs human/Mayor help
MERGED <name>               merge completed
MERGE_FAILED <name>         merge failed
MERGE_READY <polecat>       request merge
GUPP_VIOLATION <name>       agent has work but no heartbeat
ORPHANED_WORK <name>        hook_bead set but session dead
SWARM_START                 Mayor launching a batch
DISPATCH_ATTEMPT/OK/FAIL    dispatch lifecycle events
IDLE_PASSIVATED <name>      polecat going idle
```

**Relevance to debussy:** the Workflow Runner is debussy's Witness. It should
be a thin coordinator — watch for phase completion, check human gate state,
start next phase.

#### 5. The Daemon: Infrastructure Supervisor (Interesting but Over-Engineered)

A Go background process (not AI) that:

- Polls heartbeat files for stale agents
- Checks for GUPP violations (work hooked but no progress)
- Checks for orphaned work (hook_bead set but session dead)
- Processes `LIFECYCLE:` messages (AI agents requesting their own restarts)

Uses "claim then execute" pattern: delete message first, then act. Prevents
reprocessing on crash recovery.

**Relevance to debussy:** debussy needs a simpler version of this — a
background check that notices when a Claude subprocess died unexpectedly and
marks the workflow phase as failed. No AI needed for this layer.

#### 6. The Heartbeat (Simple, Useful)

Every `gt` command writes a JSON file to `~/.runtime/heartbeats/<session>.json`.
Stale threshold: 3 minutes. The daemon/Witness check this to detect dead agents
without relying on OS process inspection.

```json
{
  "timestamp": "...",
  "state": "working|idle|exiting|stuck",
  "context": "what the agent is doing",
  "bead": "gt-abc12"
}
```

Principle: "Discover, don't track" — don't record agent liveness in the DB,
derive it from observable state (tmux pane existence + heartbeat file freshness).

**Relevance to debussy:** the `@anthropic-ai/claude-code` SDK streams events.
The last event timestamp IS the heartbeat. No separate file needed — but the
concept of "last seen" + stale threshold applies.

#### 7. The Convoy (Over-Engineered for Debussy)

A Convoy groups multiple beads with dependency tracking. When one bead
completes, `CheckConvoysForIssue()` finds its convoy and dispatches the next
unblocked ready bead.

The dependency model is a DAG — beads can block other beads. The convoy
resolves ordering and parallelism automatically.

**Relevance to debussy:** IIKit phases are strictly sequential (no DAG). The
phase sequence IS the convoy, and it's hardcoded. The convoy abstraction adds
no value for debussy's use case.

---

## How Reactive/Event-Driven Triggering Works

### The Full Trigger Table

| Trigger Event | Detection | Response |
| --- | --- | --- |
| Agent finishes | `gt done` sends `POLECAT_DONE` | Witness dispatches next |
| Agent dies | Daemon: heartbeat stale | Witness gets `ORPHANED_WORK` |
| Agent stuck | Agent sends `HELP:` mail | Witness escalates to Mayor |
| Work abandoned | hook_bead set but tmux dead | Witness reassigns bead |
| Repeated failures | Deacon counter ≥ 3 | Deacon escalates to Mayor |
| Merge complete | Refinery sends `MERGED` | Witness dispatches next |
| Human adds work | Mayor creates + slings bead | Polecat session created |

### The Key Design Insight

Gastown does not use a reactive event bus. It uses **polling with durable
queues**. The reason is simple: LLM agents are slow (seconds per operation)
and lossy (they die and restart). A polling interval of a few seconds is fast
enough. Durability (messages survive agent death) is more important than
latency.

The "loop" is not a programming loop. It is an LLM session that:

1. Starts with `gt prime --hook` (loads context, discovers assigned work)
2. Does the work
3. Calls `gt done` (sends completion signal)
4. Session is killed
5. Witness starts a new session for the next work item

---

## Debussy Equivalent: The Reactive Phase Runner

Gastown's chain translated to debussy:

```text
Claude Code subprocess (Phase N)
  → stream-json stdout
  → Nitro processStream()
  → detects phase completion (final assistant message + exit code 0)
  → writes WorkflowRun.phaseState[N] = "completed" to SQLite
  → emits SSE "phase:completed" event to browser

If auto-advance:
  → Nitro starts Phase N+1 subprocess immediately

If human gate:
  → Browser shows "Review & Advance" button
  → Human clicks → POST /api/workflows/:id/advance
  → Nitro starts Phase N+1 subprocess
```

This is gastown's `gt done` → Witness → `feedNextReadyIssue` chain, but
without the mail system, without Dolt, and without the AI Witness. The
coordinator logic is simple enough to live in a Nitro route handler.

### The Human Gate Pattern

Gastown has no formal human gate — the Mayor is always an AI. But debussy
needs human approval gates (e.g., after the spec phase, a human should review
before the plan phase starts).

The pattern to use:

```text
phaseState:
  "completed" | "waiting_for_human" | "approved" | "running" | "failed"

Phase N completes → state = "waiting_for_human"
Human reviews artifacts → clicks "Approve" → state = "approved"
Workflow Runner sees "approved" → starts Phase N+1
```

This mirrors gastown's `MERGED` → Witness chain, where an external event
(merge) unblocks the next step.

---

## Complexity Assessment

### Gastown's Complexity vs Debussy's Needs

| Gastown Layer | Complexity | Debussy Equivalent | Debussy |
| --- | --- | --- | --- |
| tmux session management | High | node-pty subprocess | Medium |
| Dolt (SQL-over-git) message DB | Very High | SQLite phase state | Low |
| Mail system (queue + interrupt) | High | SSE stream + SQLite | Low |
| Mayor AI coordinator | High | Human (the developer) | Zero |
| Witness AI supervisor | High | Nitro route handler | Low |
| Deacon + redispatch escalation | Medium | Not needed | Zero |
| Polecat state machine | Medium | WorkflowPhase state | Low |
| Convoy DAG dispatch | Medium | Sequential phase array | Low |
| Heartbeat files | Low | Stream last-event time | Low |
| fsnotify nudge watcher | Medium | SSE push to browser | Low |

Gastown serves 20–30 agents with failure recovery and escalation chains.
Debussy serves 1–5 workflows on one developer's machine. The complexity ratio
is roughly 10:1.

### Essential vs Accidental Complexity in Gastown

**Essential (gastown had to build this):**

- Persistent/ephemeral split — LLM sessions die; identity must outlive them
- Completion signal + coordinator reaction — the one true chain
- Liveness checking — OS process state is not sufficient; heartbeats/stream
  events are necessary
- "Claim then execute" for message processing — prevents duplicate reactions

**Accidental (product of scale/multi-runtime requirements):**

- Mail system built on an issue tracker — clever but brittle (regex on subject
  lines as protocol)
- Multi-runtime startup sequence (400+ lines) — Claude/Gemini/Codex behave
  differently
- The full Mayor/Deacon/Witness hierarchy — needed at scale, overkill for one
  user
- Convoy DAG — needed for parallel multi-agent work, not for sequential phases

---

## Recommendations

### Adopt (as concepts, not code)

1. **Persistent/ephemeral split** — WorkflowRun is the persistent entity (SQLite
   row). The Claude Code subprocess is ephemeral. Never conflate them. The run
   survives subprocess crashes; the subprocess is restarted clean.

2. **Thin coordinator** — The Nitro workflow handler should be as thin as
   gastown's Witness: read state, check conditions, dispatch or wait. It should
   not understand the content of what Claude produces, only phase lifecycle
   state.

3. **Completion signal → coordinator reaction** — when the subprocess stream
   closes, that IS the `gt done` signal. The Nitro server's stream handler is
   the Witness. Keep the chain short: stream ends → update SQLite → check gate
   → start next phase or set `waiting_for_human`.

4. **Human gate as explicit phase state** — `waiting_for_human` is a
   first-class state, not a special case. The Workflow Runner pauses at this
   state until the UI sends an advance signal.

5. **"Discover, don't track"** — derive phase liveness from stream events (last
   event timestamp + stream open/closed), not from a separate tracking field.
   Trust the SSE stream as the source of truth.

### Get Inspired By (adapt)

1. **Durable completion signals** — gastown uses a mailbox so completion signals
   survive agent death. In debussy: write phase completion to SQLite immediately
   on stream close, before starting the next phase. If the server crashes
   between phases, the SQLite state lets it recover to the right position on
   restart.

2. **The nudge distinction** — gastown separates "persistent mail" from "live
   injection". Debussy could do the same: durable events go to SQLite (survive
   refresh); live events go to SSE (immediate browser update). Both channels,
   different purposes.

3. **Heartbeat + stale detection** — implement a "last active" timestamp on
   WorkflowPhaseRun, updated on each stream event. If a subprocess has been
   running for >N minutes with no stream events, flag it as stuck.

### Skip Entirely

1. **The mail/mailbox system** — don't build a message broker. SSE + SQLite
   covers debussy's needs. The mail system's value is durability at scale and
   cross-process routing; debussy is single-process.

2. **The Mayor/Deacon hierarchy** — the developer IS the Mayor. No AI
   coordinator needed above the Witness layer.

3. **Convoy DAG dispatch** — IIKit phases are sequential. A simple ordered
   array of phase definitions suffices.

4. **tmux abstraction** — node-pty is the right choice for debussy. The entire
   tmux layer is irrelevant.

5. **Multi-runtime support** — debussy is Claude Code only. The 400-line
   multi-runtime startup sequence has no equivalent requirement.

6. **Escalation chains (redispatch, Deacon)** — at debussy's scale, a failed
   phase means: mark it failed, surface it in the UI, let the developer decide
   what to do. No automated escalation needed.

---

## Open Questions

1. **Phase completion detection** — how reliably can we detect that a Claude
   Code phase completed successfully vs. failed vs. got stuck, purely from the
   `stream-json` output? Is there a canonical "I'm done" signal, or do we need
   to pattern-match on the final assistant message?

2. **Human gate UX** — what should the "waiting for human" state look like in
   the UI? Read-only artifact review? Inline approval with comments? This is
   debussy's differentiator from gastown.

3. **Cross-phase context** — gastown's polecats keep their worktree between
   assignments (context accumulation). For IIKit, each phase builds on the
   previous phase's artifacts. Does debussy need to inject previous-phase
   artifact summaries into each new phase's startup prompt?
