# Product Definition: Debussy

## One-Liner
A Claude Code plugin that removes friction from structured reviews, workflow
orchestration, and product planning — one command at a time.

## Target User
Solo developer who uses Claude Code as a primary development environment and
wants a personal toolchain that eliminates daily friction. Dogfoods the plugin
on their own workflows before sharing it. Technical enough to install a plugin
and write YAML; not interested in heavy configuration.

## Nature
- **License**: MIT
- **Distribution**: Claude Code plugin marketplace
  (`npx claude code --install-plugin jcbianic/debussy`); also installable via
  git clone + link
- **Hosting model**: Local-first (runs entirely on the user's machine)
- **Source**: Open source

## Non-Goals
- Not a general-purpose workflow automation tool (not competing with n8n or Make)
- Not a multi-user collaboration platform — all state is local
- Not an IDE replacement or full dev environment
- Not a heavy framework requiring configuration — skills must be installable in
  minutes

## Key Dependencies
- Claude Code CLI (required runtime)
- GitHub CLI (`gh`) for roadmap issue sync
- Python 3 (feedback review server)
- Git (worktree management, planned)
