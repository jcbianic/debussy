---
name: Audiences
icon: i-heroicons-users
status: draft
---

## A1: Solo Builders

**Size:** 75% Claude Code adoption at startups — the highest segment. r/ClaudeCode: 4,200+ weekly contributors. Claude Code GitHub: 22K+ stars.
**Profile:** Terminal-comfortable developers with deep expertise in 2-3 codebases. Typically 10+ years experience. Not beginners — they use agents for substantive refactoring and system-level work.

### Current Workflow

- Default to Claude first; review code only when approving changes
- Run 2-5 parallel AI agents via worktrees or tmux
- Use layered `.claude/` directories with architecture overviews for context
- 70% use 2-4 AI tools simultaneously — Claude Code as the anchor tool
- Primary use cases: large file refactoring, monorepo management, CI/CD, rapid SaaS prototyping

### Pain Points

- P1: Review friction — AI generates faster than humans review, PRs 18% larger
- P2: Workflow opacity — no visibility into what agents are doing
- P3: Lane management — 3-5 worktrees is practical ceiling before context-switching overhead
- P4: Session amnesia — 10-30 min per session rebuilding context
- P5: Comprehension debt — solo developers have no team to distribute maintenance
- P6: Cost unpredictability — three overlapping rate limit constraints

### Where They Congregate

- r/ClaudeCode (4,200+/week), r/vibecoding (89K members), r/ChatGPTCoding
- Anthropic Discord (75K members)
- GitHub anthropics/claude-code discussions
- Indie Hackers

### Switching Trigger

Cursor token exhaustion or cost opacity is the primary funnel. The 200K context window, dialogue-based debugging quality, and transparent pricing ($40-60/month) drive conversion.

---

## A2: Small Teams (2-3 Devs)

**Size:** Claude Code bundled with Team/Enterprise plans. Bottom-up adoption pattern: one developer proves ROI, then advocates for team-wide use.
**Profile:** Small teams or departments needing centralized billing, consistent configurations, and selective premium seats for Claude Code access.

### Current Workflow

- Shared infrastructure work: CI/CD pipelines, GitHub Actions, multi-agent coordination
- Bottom-up adoption from individual to team
- Governance concerns absent from A1: consistent configs, cost management, security review

### Pain Points

- Same as A1 plus: inconsistent configurations across developers, shared cost visibility, security review of agent outputs
- Skill shift required: agent supervision and prompt engineering over traditional coding

### Where They Congregate

- GitHub Discussions on anthropics/claude-code
- DevOps.com, DEV Community
- Internal Slack/Discord channels
- LinkedIn professional communities

### Switching Trigger

Individual developer proves ROI. Competitive pressure: "companies that integrate now have a 12-18 month advantage." Enterprise plan bundling lowered procurement barrier.

---

## A3: Outcome Engineers (Secondary)

**Size:** r/vibecoding: 89K members. Dedicated courses: Maven "Claude Code for Product Managers", ccforpms.com. Growing content: "13 Claude Code Projects That Changed My PM Role" (Medium, Feb 2026).
**Profile:** PMs, non-technical founders, and designers who use AI to build without writing code. "Outcome engineers" who describe intent; AI handles execution.

### Current Workflow

- Plain-language descriptions drive execution ("vibe coding")
- Build prototypes, automate competitive analysis, generate PRDs from meeting notes
- No prior AI coding tool baseline — not switching from Cursor or Copilot

### Pain Points

- Need more guardrails and structured workflows than developers
- No Claude Code plugin designed for non-technical users
- Product-layer tooling (strategy, roadmap, prioritization) is their primary need

### Where They Congregate

- r/vibecoding (89K members)
- Indie Hackers
- Maven course platform
- YouTube "build with AI" content

### Switching Trigger

Viral success stories (Indie Hackers "$79K from side projects"), Boris Cherny's public statements about "everyone will be a product manager who codes", YouTube demonstrations.
