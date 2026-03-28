---
name: Quality Management
icon: i-heroicons-star
status: draft
order: 7
---

# Quality Management

## Acceptance Criteria

- **Tests pass** — 100% test pass rate before merge
- **Lint clean** — No linting errors or warnings
- **Builds** — `npm run build` succeeds with no errors
- **Type safety** — TypeScript strict mode, no `any` types

## Review Gates

- **Code review required** — At least one approval before merge
- **No self-merge** — Agent and author are not the same
- **CI/CD must pass** — All automated checks must succeed

## Release Quality

- **Main is always shippable** — Only merge stable code
- **Semantic versioning** — Follow semver for version bumps
- **Changelog updates** — Document user-visible changes
