---
type: feature-space
updated: 2026-03-26
status: draft
---

# Feature Space

## Table Stakes

Features every Claude Code plugin in the development-workflow space has. Users expect these — absence is a dealbreaker.

- **Git/GitHub integration**: Every serious plugin (ship, create-pr, commit, GasTown, Superpowers) integrates with git for branching, committing, and PR creation. Debussy has this via workflow-run and product GitHub Issue sync.
- **Multi-file codebase awareness**: Tools are expected to reason across files, not just the current buffer. Cursor, Claude Code core, Cline, and all top plugins index the full repo. Debussy inherits this from Claude Code.
- **Conventional commit & PR automation**: The commit plugin (smart conventional commits) and create-pr plugin are among the most installed. Any workflow tool is expected to produce clean git history.
- **Code review automation**: The official code-review plugin has 129K+ installs. feature-dev (89K installs) includes review as phase 6. PR Review Toolkit adds 6 specialized agents. Code review is table stakes, not novel.
- **Test generation**: test-writer-fixer supports Jest, Vitest, Pytest. Superpowers enforces TDD. feature-dev includes testing as phase 5. Any workflow plugin that doesn't accommodate testing feels incomplete.
- **Security scanning**: security-guidance plugin (OWASP-based) scans edits before they land. Shipyard adds IaC auditing. Users expect at least basic vulnerability flagging.
- **Context management / token optimization**: context-mode claims 98% savings. Claude-Mem (40K stars) persists context across sessions. MCP lazy-loading reduces context by up to 95%. Token efficiency is a first-class concern.
- **Documentation generation**: documentation-generator creates READMEs and API docs. Most coding assistants offer this. Expected.

## Differentiators

Features that set leaders apart. Having these creates competitive advantage.

- **Multi-agent orchestration** (GasTown, 13K stars): Coordinates 20-30 parallel agents with persistent identity, git-worktree isolation, and a federated "Wasteland" network for inter-instance coordination. Now targeting enterprise-scale.
- **Structured development methodology** (Superpowers, 115K stars): v5 adds visual brainstorming (interactive HTML mockups), spec review loops, subagent-driven development as default, and cost optimization via cheapest-capable-model selection. Maintained by Prime Radiant (company, founded Jan 2026).
- **Spec-driven development** (GSD, 42K + 3.3K stars): v2 rebuilt as TypeScript CLI on Pi SDK with single-writer state engine, offline mode, and web UI. Adopted at Amazon, Google, Shopify. The dominant SDD framework.
- **Browser-based review UI** (Debussy): Structured triage in a browser with approve/revise/reject actions, keyboard navigation, and batch operations. Unique approach — Plannotator does annotation, Debussy does structured decision-making.
- **Persistent memory with vector embeddings** (Claude-Mem, 40K stars): v6.5 with Progressive Disclosure, web viewer UI, MCP search tools, Endless Mode (~20x more tool uses before context limit). Mature memory infrastructure.
- **First-party workflow** (feature-dev, 89K installs): Anthropic's own 7-phase workflow plugin. Massive distribution but engineering-only — no strategy, product, or governance layers.
- **Visual plan annotation** (Plannotator, 3.6K stars): Browser-based plan + code review with AES-256 encryption, multi-agent support. Recently expanded from plan annotation to code diff review.
- **Cost & token tracking** (Manifest): Tracks token usage, cost, and model usage across agents. Addresses the #1 developer complaint (cost opacity).

## Gaps

Features users want but nobody provides well. These are opportunities.

- **Strategy-to-code traceability**: No tool connects market research -> product definition -> engineering specs -> implementation. Debussy's strate pipeline is unique here. PM skill collections (phuryn 100+ skills, deanpeters 46 skills) are disconnected, not pipelined.
- **Policy-gated autonomy**: The binary trust/interrupt model is universally hated (3% high trust, 45.7% distrust). Nobody offers configurable approval policies per action type.
- **Cross-session decision audit trails**: GasTown tracks beads, but the ecosystem lacks lightweight logging of what an agent decided and why — reviewable after the fact. Debussy's workflow-run has review gates but no persistent audit log.
- **Feedback loops from human to agent**: No structured way to teach agents about codebase patterns or preferences. Debussy's feedback skill partially addresses this.
- **Cost predictability and budget controls**: Developers want budgets, warnings, and projected costs before starting a task. Manifest tracks post-hoc; nobody provides predictive budgets.
- **Workflow observability**: Claude HUD (March 2026) shows context/agent status. Nobody shows structured workflow progress with step-level monitoring.
- **Non-technical builder support**: A3 (outcome engineers) growing fast (89K r/vibecoding, PM courses). No Claude Code plugin designed for non-technical users.
- **Plugin compatibility management**: Developers report conflicts between plugins. No tool manages interactions or detects conflicts.

## Anti-Patterns

Features that seem good but frustrate users in practice. Avoid these.

- **Autonomous multi-hour sessions without checkpoints**: Long autonomous runs produce messy codebases. Lesson: autonomy needs review gates, not just context resets.
- **Over-generation without quality control**: "What does fast matter if the output is wrong?" Lesson: every generation step should have a verification step.
- **Token-hungry ambient hooks**: Features that burn tokens for marginal gains lose trust. Lesson: explicit invocation over ambient hooks.
- **Magic that varies by run**: Inconsistency frustrates developers who need predictability. Lesson: structured artifacts as stable anchors.
- **Plugin marketplace fragmentation**: Multiple registries create confusion. Lesson: distribution simplicity matters.
- **Hallucinated API references**: AI tools generating code with outdated or fictional APIs — the most common frustration. Lesson: research-grounded outputs beat generation-first.

## Our Position

| Feature | Status | Notes |
|---|---|---|
| Browser-based review UI | **have** | Feedback + strategy skills. Addresses P1, SI-1. |
| Multi-step workflow execution | **have** | workflow-run with YAML definitions and review gates. |
| Product discovery / strategy | **have** | Strategy skill — research-first, three depth levels. |
| Product definition + GitHub sync | **have** | Product skill consumes strategy artifacts. |
| Engineering governance | **have** | Policies, principles, ADRs. Three depth levels. |
| Structured feedback collection | **have** | Feedback skill with browser triage UI. |
| Persistent context architecture | **have** | .debussy/ artifact system. |
| Git/GitHub integration | **have** | Via product GitHub Issue sync. |
| Workflow observability | **planned** | Browser dashboard for workflow progress. Addresses P2, SI-2. |
| Lane management | **planned** | Worktree lifecycle + cross-lane inbox. Addresses P3, SI-3. |
| Strategy-to-issue traceability | **planned** | P{N}/A{N} -> intents -> Issues -> PRs. Addresses SI-4. |
| Policy-gated autonomy | **opportunity** | Configurable approval policies. |
| Cross-session audit trail | **opportunity** | Decision provenance beyond ADRs. |
| Cost visibility per workflow | **opportunity** | Token budget tracking. |
| MCP strate servers | **opportunity** | Domain context as MCP. |
| Multi-agent orchestration | **won't do** | GasTown, Claude Squad own this. |
| TDD / development methodology | **won't do** | Superpowers owns this. |
| Code review automation | **won't do** | Saturated (feature-dev 89K, code-review 129K). |
| IDE integration | **won't do** | Terminal + browser by design. |
