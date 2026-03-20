---
type: ally
subject: iikit
updated: 2026-03-19
status: draft
---

# IIKit (Intent Integrity Kit)

**URL:** https://github.com/intent-integrity-chain/kit
**Category:** Artifact-driven development workflow framework

## What It Does

Framework ensuring AI-generated code preserves original intent through
cryptographic verification across specification, testing, and implementation
phases.

## Relationship

IIKit's workflow artifact framework is the foundation Debussy's workflow-run
skill orchestrates on. IIKit provides the integrity chain (hash-locked tests,
BDD verification, cross-artifact traceability); Debussy provides the
orchestration layer, review UX, and monitoring dashboard.

## Integration Opportunity

Deep integration already exists — Debussy's workflow-run skill is the runtime
layer for IIKit workflows. Future opportunities:
- Strategy artifacts could feed IIKit's specify phase (P{N} -> user stories)
- IIKit's assertion hashes could be verified in Debussy review gates
- Debussy's feedback skill could replace IIKit's text-based review step

## Synergies

- IIKit prevents test tampering and intent drift; Debussy provides the human
  judgment layer that IIKit's automated checks cannot
- IIKit's 8-phase workflow (specify -> plan -> checklist -> testify -> tasks ->
  analyze -> implement -> deploy) maps naturally to workflow-run steps
- Both are local-first and artifact-driven
