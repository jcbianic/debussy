---
name: Toolchain
icon: i-heroicons-wrench-screwdriver
status: defined
order: 5
---

## Frontend (ui/)

- ESLint with `@nuxt/eslint` — Auto-configured via Nuxt
- TypeScript strict mode — tsconfig.json extends Nuxt defaults
- Tailwind CSS via `@nuxt/ui` — No custom CSS files
- Vitest for composable and component tests

## Plugin / Skills

- Markdown linting via markdownlint — Applied to all `.md` files
- YAML linting for workflow files — `.claude/workflows/*.yml`
- No shell scripts — use Node.js for tooling

## Dependencies

New dependencies require justification. Prefer Nuxt modules and built-in Node.js APIs over third-party packages. License must be MIT, Apache 2.0, or BSD-compatible.
