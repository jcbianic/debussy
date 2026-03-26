---
name: Quality
icon: i-heroicons-shield-check
status: draft
order: 4
---

## Work Categories

Work falls into three categories that must be explicitly balanced:

- **Features** — New functionality driven by intents/issues. Always prioritized from the roadmap.
- **Refactoring** — Structural improvements with no behavior change. Triggered when code becomes hard to extend or understand. Scoped to the area being worked on — no drive-by refactors outside the current task.
- **Tech Debt** — Known shortcuts, workarounds, or missing infrastructure. Tracked as issues with a `debt` label. Addressed opportunistically when touching related code, or deliberately when debt blocks a feature.

## Balance Rules

- A feature PR may include targeted refactoring of the code it touches, but refactoring should not dominate the diff.
- Pure refactoring PRs are encouraged between feature cycles, not during active feature work.
- Tech debt is never ignored but also never addressed at the expense of a committed intent.
- When debt is discovered during feature work, create an issue and move on — don't derail the current task.

## Quality Gates

- TypeScript compilation must pass (`nuxi typecheck`)
- No ESLint errors (enforced in CI)
- Skill dogfood must run without manual workarounds (done-when criterion for each skill intent)

## Testing Strategy

Skills are tested end-to-end by running them on the debussy project itself (dogfooding). Unit tests are not required for skill YAML/markdown files. The UI is tested via composable unit tests and visual verification. API routes require integration tests when implemented.
