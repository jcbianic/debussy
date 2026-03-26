---
name: Strategy
icon: i-heroicons-adjustments-horizontal
status: draft
---

## Where We Play

### 1. The Oversight Gap in Agentic Coding

Only 3% of developers highly trust AI output; 45.7% actively distrust it. Current tooling forces a binary: interrupt constantly (unusable) or trust fully (dangerous). Debussy's review gates sit in this gap — structured checkpoints that give developers control without eliminating speed.

### 2. Strategy-to-Code Traceability

The spec-driven development movement (GSD, BMAD, Kiro) starts at the spec layer. Debussy starts earlier — at market research and product discovery — and chains through to engineering specs. This upstream position is defensible because it requires domain knowledge that pure engineering tools lack.

### 3. Solo Builder Workflow Management

75% Claude Code adoption at startups. Solo builders are PM + engineer + QA + reviewer simultaneously. Debussy's strate architecture maps to these four cognitive modes without adding process overhead.

### 4. Persistent Context as Infrastructure

Context fragmentation is the #1 cause of agentic workflow failure. MCPs consume up to 41% of a 200K token budget. The `.debussy/` artifact structure externalizes context into persistent, selectively-loadable files — reducing token burn and preventing context rot across sessions.

## How We Win

**Full lifecycle span.** No competitor goes from strategy research to engineering governance. GSD starts at spec. Superpowers starts at brainstorming. Debussy starts at market analysis.

**Browser-based review UI.** Absent from the competitive landscape. All agentic coding tools are terminal-native. Demand validated by Plannotator (3.6K stars) and Claude HUD.

**Artifact-first architecture.** Structured external artifacts as canonical source of truth — simultaneously outputs, AI context, and human documentation.

**Zero-infrastructure local-first design.** No database, no login, no cloud, no running server. Starts on demand, disappears when done.

## Strategic Intents

### SI-1: Make Review the Fast Path

A 20-item review session in under 2 minutes. Keyboard-driven, batch-action capable, with structured outcomes that feed back into the workflow.

### SI-2: Make Workflows Observable

Every step has visible progress, elapsed time, and clear indication of what it's waiting on. No log tailing, no guessing.

### SI-3: Make Parallel Work Manageable

Launch, switch, and stage across worktrees as single-command operations with cross-lane visibility.

### SI-4: Connect Strategy to Engineering

Market insight (P{N}, A{N}) traceable through product intents to GitHub Issues to merged PRs.

## Key Bets

1. **Review gates convert skeptical developers better than autonomy does.** The 45.7% who distrust AI output are underserved by tools promising full autonomy.
2. **Strategy-to-spec traceability is a 10x feature for solo builders.** If solo developers can't connect market research to engineering decisions without Debussy, the tool earns its place.
3. **The `.debussy/` artifact directory measurably reduces token costs.** Externalizing context into persistent files reduces context overhead — testable and quantifiable.
4. **Browser UI retains users; discipline acquires them.** Developers adopt for the structured workflow but stay because the review UX reduces cognitive load.

## What We're NOT Doing

- **Multi-agent orchestration.** GasTown, Claude Squad, and Anthropic Cowork own this space.
- **IDE integration.** Cursor, Windsurf, Copilot own IDE mindshare. We are terminal + browser by design.
- **Full autonomy.** Ralph's autonomous-first model is a bet we explicitly reject. Trust is declining, not increasing.
- **Generic project management.** 75.8% of developers won't use AI for project planning. Lanes are workflow isolation, not task boards.
- **Documentation generation as primary value.** Artifacts are structured context, not auto-generated docs.
- **Team collaboration features.** Built for one disciplined developer, not a committee.
