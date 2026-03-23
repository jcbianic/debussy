---
id: "003"
shortTitle: SSE for File-Change Events
status: Accepted
date: 2026-03-20
affectedPrinciples: ["1", "2", "4"]
---

# 003 — Server-Sent Events for Live File-Change Streaming

**Status:** Accepted
**Date:** 2026-03-20

---

## Context

The UI must react when Claude writes a markdown file — e.g., a new intent
appears in `intents.md`, or a feedback decision is written back to
`decisions.md`. Without live updates, the user must manually refresh to see
changes.

The solution must not require a second server or process (P2: one process,
one port) and must not persist state externally (P1: local first).

---

## Decision

Use Nitro's server-sent events (h3 `eventStream`) to stream file-change
notifications from a `server/api/watch.get.ts` endpoint. The browser
subscribes via `EventSource`. The server uses chokidar to detect changes and
pushes the file path and event type to the client.

---

## Alternatives Considered

| Option | Rejected because |
| ------ | ---------------- |
| Polling (setInterval + fetch) | Wastes CPU and network; adds latency proportional to poll interval |
| WebSocket | Bidirectional protocol; heavier setup; no benefit for read-only notifications |
| Manual refresh | Poor UX; breaks the live review workflow |

---

## Consequences

- SSE connections are long-lived HTTP connections. The Nitro server must
  handle concurrent open connections without leaking file watchers.
- chokidar behavior differs across platforms (macOS FSEvents vs Linux
  inotify). The implementation must handle both.
