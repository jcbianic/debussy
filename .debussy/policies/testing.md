---
name: Testing
icon: i-heroicons-check-circle
status: draft
order: 3
---

# Testing

## Test Types

- **Unit tests** — Component logic and utilities (Vitest)
- **Integration tests** — Component + composable interaction
- **E2E tests** — Full skill workflows (if applicable)

## Coverage Expectations

- **Composables** — 80%+ coverage (pure logic)
- **Components** — 60%+ coverage (presentation, core interactions)
- **API routes** — 80%+ coverage (file I/O, logic)

## Test Organization

- **Colocate with source** — `.test.ts` files next to implementation
- **Fixtures in tests/** — Shared test data and mocks
- **No snapshot tests** — Avoid brittle snapshots for UI

## When to Test

- Before implementation (TDD)
- Complex logic changes
- Bug fixes (add test that catches the bug first)
