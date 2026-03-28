# Product Definition: Debussy

## One-Liner
A Claude Code meta-plugin that breaks the monster branch loop — from scoping work upstream with full context to making parallel execution visible and manageable.

## Target User
Solo developer who uses Claude Code as primary development environment. Technical enough to install a plugin and write YAML; wants a personal toolchain that eliminates daily friction without heavy configuration. Startups and indie developers — the segment with the highest Claude Code adoption (75%).

## Nature
- **License**: MIT
- **Distribution**: Claude Code plugin marketplace / GitHub
- **Hosting model**: Local-first (runs entirely on the user's machine)
- **Source**: Open source

## Non-Goals
- Not a general-purpose workflow automation tool (not competing with n8n, Make, or Composio)
- Not a multi-user collaboration platform — all state is local
- Not an IDE replacement or full dev environment
- Not a code generation or TDD enforcement tool — that's Superpowers' territory
- Not a plan annotation tool — Plannotator handles that niche

## Key Dependencies
- Claude Code CLI (required runtime)
- GitHub CLI (`gh`) for roadmap issue sync
- Nuxt 4 (UI build-time dependency, not user-facing)
- Git (worktree management for parallel lanes)
