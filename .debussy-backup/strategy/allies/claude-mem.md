---
type: ally
subject: claude-mem
updated: 2026-03-19
status: draft
---

# Claude-Mem

**URL:** https://github.com/thedotmack/claude-mem
**Category:** Persistent memory plugin

## What It Does

Persistent memory plugin that captures everything Claude does during sessions
and reinjects relevant context into future sessions via a three-tier memory
system (SQLite + vector embeddings).

## Relationship

Infrastructure complement. Memory persistence solves the context loss problem
(P4: context amnesia after compaction) that affects all skills including
Debussy's. Claude-Mem addresses the persistence layer; Debussy addresses the
workflow and review layer.

## Integration Opportunity

- Claude-Mem could persist Debussy workflow state and review decisions across
  sessions, enabling multi-day workflow runs without context loss
- Strategy artifact decisions could be indexed by Claude-Mem for automatic
  recall in future roadmap sessions
- Feedback patterns (what the user approves/rejects) could train Claude-Mem's
  preference model

## Synergies

- 37.2K GitHub stars — massive adoption suggests this is a broadly felt need
- Debussy + Claude-Mem would enable persistent workflow orchestration across
  sessions
- Both are local-first (SQLite storage, no cloud dependency)
- Claude-Mem's vector embeddings could make strategy artifact cross-references
  (P{N}, A{N}) automatically discoverable
