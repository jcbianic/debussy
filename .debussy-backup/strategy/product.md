---
name: Product
icon: i-heroicons-cube
status: draft
---

## Core Capabilities

**Review loop:** Serve review items from any skill session in a browser UI with keyboard navigation, group hierarchy, and approve/reject/discuss actions. Addresses P1 (review friction) and SI-1 (make review the fast path).

**Workflow orchestration:** Multi-step YAML-defined workflows with review gates between steps. Each step produces artifacts reviewable in the browser UI. Addresses P2 (workflow opacity) and SI-2 (make workflows observable).

**Product discovery:** Research-first strategy skill produces structured artifacts (.debussy/strategy/) that feed the product skill, which synthesizes intents and syncs to GitHub Issues. Addresses SI-4 (connect strategy to engineering).

**Engineering governance:** Agent policies, architectural principles, and decision records under .debussy/engineering/. Three depth levels (lite, standard, full). Addresses P5 (comprehension debt).

**Persistent context:** The .debussy/ artifact structure externalizes domain knowledge into structured, selectively-loadable files — reducing token burn and mitigating P4 (session amnesia).

## Planned Capabilities

**Lane management:** Launch, switch, and stage across git worktrees with cross-lane visibility and inbox. Addresses P3 and SI-3.

**Workflow observability dashboard:** Browser-based live progress for workflow-run sessions — current step, elapsed time, what it's waiting on. Addresses P2 and SI-2.

**Strategy-to-issue traceability:** P{N}/A{N} from strategy artifacts traced through product intents to GitHub Issues to merged PRs. Addresses SI-4.

## Open Questions

- What is the right persistence model for review decisions? File-based? Git notes?
- Should lane management require a running server, or can it be purely file-driven?
- How do we surface cost/token information per workflow step without ambient hooks? (See Gap 3 in opportunities.md)
- Should A3 (outcome engineers) influence the UI design of the strategy/product skills?
