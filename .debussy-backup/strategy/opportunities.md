---
name: Opportunities
icon: i-heroicons-light-bulb
status: draft
---

## Table Stakes

Features every Claude Code workflow plugin must have. Absence is a dealbreaker.

| Capability | Us | GSD | Superpowers | GasTown |
|---|---|---|---|---|
| Git/GitHub integration | Have (issue sync) | Have | Have | Have |
| Structured workflow phases | Have (workflow-run) | Have (discuss-plan-execute-verify) | Have (7-phase) | Have (Mayor/Convoy) |
| Review/validation gates | Have (browser UI) | Partial (UAT only) | Have (two-stage) | No |
| Context management | Have (.debussy/) | Have (STATE.md) | Partial (CLAUDE.md) | Have (Dolt DB) |

## Differentiators

### D1: Strategy-to-Code Lifecycle (Unique)

No competitor bridges product discovery -> product definition -> engineering governance -> implementation. All SDD tools start at the spec layer. PM skill collections (phuryn 100+ skills, deanpeters 46 skills) exist as disconnected sets, not integrated pipelines.
Addresses: SI-4

### D2: Browser-Based Review UI (Rare)

Only Debussy and Plannotator offer browser-based review. Plannotator does annotation; Debussy does structured triage (approve/revise/reject) with keyboard navigation and batch actions.
Addresses: P1, SI-1

### D3: Persistent Context Architecture (Emerging)

`.debussy/` as selectively-loadable context that reduces token burn. Claude-Mem (40K stars) handles memory; Debussy handles structured domain context.
Addresses: P4

### D4: Progressive Depth Levels (Unique)

Each strate offers progressive depth (pitch -> foundation -> full for strategy; lite -> standard -> full for engineering). No competitor scales from "quick feature" to "full product" without changing tools. BMAD/Ralph described as "sledgehammer to crack a nut" for small tasks.

## Gaps

### Gap 1: Policy-Gated Autonomy

Nobody has configurable approval policies. The binary trust/interrupt model is universally hated. A config that says "approve file edits, require review for git push" doesn't exist yet.
Affects: A1, A2

### Gap 2: Cross-Session Decision Audit Trail

Nothing captures the why behind agent-made choices across sessions. ADRs cover architecture; day-to-day decision provenance is untracked.
Affects: A1

### Gap 3: Workflow Cost Visibility

No tool shows predicted or actual token cost per workflow step. Developers want budgets and warnings before starting a task.
Affects: A1, A3

### Gap 4: MCP-Native Domain Context Servers

No MCP servers for product strategy or engineering governance context. Open standard (Linux Foundation), adopted by OpenAI and Google. 101 marketplace plugins but none for product-level context.
Affects: A1, A2

### Gap 5: Non-Technical Builder Support

A3 (outcome engineers) is growing with dedicated courses and 89K r/vibecoding members. No Claude Code plugin is designed for this segment.
Affects: A3

## Anti-Patterns

| Anti-Pattern | Lesson for Debussy |
|---|---|
| Autonomous sessions without checkpoints | Break into reviewed steps, never remove gates |
| Over-generation without quality control | Every generation step needs a verification step |
| Token-hungry ambient hooks | Explicit invocation (slash commands) over ambient hooks |
| Making the UI required | Full CLI workflow complete; UI is a power feature |
| Positioning as a team tool | Built for one disciplined developer |
| Magic that varies by run | Structured artifacts as stable anchors |

## Our Position

| Feature | Status | Notes |
|---|---|---|
| Browser-based review UI | **have** | P1, SI-1 |
| Multi-step workflow execution | **have** | workflow-run with review gates |
| Product discovery | **have** | Strategy skill, three depth levels |
| Product definition + GitHub sync | **have** | Product skill |
| Engineering governance | **have** | Policies, principles, ADRs |
| Persistent context architecture | **have** | .debussy/ artifacts |
| Workflow observability | **planned** | SI-2 |
| Lane management | **planned** | SI-3 |
| Strategy-to-issue traceability | **planned** | SI-4 |
| Policy-gated autonomy | **opportunity** | Gap 1 |
| Cross-session audit trail | **opportunity** | Gap 2 |
| Cost visibility | **opportunity** | Gap 3 |
| MCP strate servers | **opportunity** | Gap 4 |
| Multi-agent orchestration | **won't do** | GasTown, Claude Squad own this |
| TDD enforcement | **won't do** | Superpowers owns this |
| Code review automation | **won't do** | Saturated (feature-dev 89K installs) |
| IDE integration | **won't do** | Terminal + browser by design |
