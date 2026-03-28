---
name: Code Style
icon: i-heroicons-code-bracket
status: draft
order: 4
---

# Code Style

## Formatting

- **Prettier** — Enforce via pre-commit hooks
- **Line length** — 100 characters (Prettier default)
- **Tabs** — 2 spaces

## Naming Conventions

- **Files** — kebab-case (e.g., agent-behavior.md, user-profile.vue)
- **Vue components** — PascalCase (e.g., UserProfile.vue, FeedbackCard.vue)
- **Functions/vars** — camelCase
- **Constants** — UPPER_SNAKE_CASE
- **CSS classes** — kebab-case

## File Organization

- **Components** — `ui/components/` (organized by domain)
- **Composables** — `ui/composables/` (logic reuse)
- **Server routes** — `ui/server/api/` (skill-namespaced paths)
- **Types** — Inline in `.ts`/`.vue` files, not separate `types.ts`

## Code Quality

- **No unused variables** — Delete, don't rename to _var
- **No dead code** — Remove, don't comment out
- **Minimal abstractions** — Solve the task at hand, not hypothetical futures
- **No early error handling** — Trust framework/internal guarantees; validate at boundaries only
