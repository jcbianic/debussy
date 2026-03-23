---
title: Architecture Principles
---

## 1 — Local first, no cloud

**num:** 1
**relatedAdrs:** adr-001, adr-003

Debussy has no database, no login, no external service. Everything runs in
the user's machine. Skills launch processes that terminate when done. No
persistent daemon.

---

## 2 — One process, one port

**num:** 2
**relatedAdrs:** adr-001, adr-003, adr-004

The unified UI runs as a single Nitro SSR server. No Python API server
alongside a static frontend. No CORS. No port management by the user.

---

## 3 — Zero build step at install

**num:** 3
**relatedAdrs:** adr-001, adr-002

The built .output/ directory is committed to the repository. Plugin users
run node ui/.output/server/index.mjs — no npm install, no build, no Node
version conflicts.

---

## 4 — File I/O as the protocol

**num:** 4
**relatedAdrs:** adr-003

Claude reads and writes files. The UI reads and writes files. The protocol
between the agent and the UI is the filesystem, not a message bus or a
socket. This keeps both sides independently simple.

---

## 5 — Skills disappear when not needed

**num:** 5

No background process, no watching, no polling unless a skill is actively
running. The footprint is zero when idle.

---

## 6 — Markdown is the truth store

**num:** 6

All persistent state — workflow runs, feedback decisions, strategy
artifacts, ADRs — lives in human-readable markdown files. No JSON
databases, no SQLite, no binary formats. State can be read with cat and
edited with any text editor.

---

## 7 — Composable, not coupled

**num:** 7
**relatedAdrs:** adr-004

Skills share infrastructure (the UI server, the file protocol) but not
code. Strategy does not import roadmap internals. Adding a skill means
adding a page and a server/api/ directory — not modifying existing skills.
Removal is symmetric.

---

## 8 — Human in the loop, always

**num:** 8

No skill silently modifies a file the user has not seen. The agent
proposes; the review UI surfaces the proposal; the human accepts or
rejects. Automated writes happen only to designated scratch directories
(e.g., .workflow-runs/) and are explicitly scoped.
