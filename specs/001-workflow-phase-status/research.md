# Research: Workflow Phase Status

**Feature**: 001-workflow-phase-status
**Date**: 2026-03-10

## Reference Implementation Analysis

### IIKit Dashboard Pipeline (`pipeline.js`)

The authoritative phase computation lives in `.tessl/tiles/tessl-labs/intent-integrity-kit/skills/iikit-clarify/scripts/dashboard/src/pipeline.js`. The function `computePipelineState(projectPath, featureId)` produces an array of 8 phase objects.

**Decision**: Port the exact logic to TypeScript as a Nitro server utility. The reference implementation is ~200 lines of CommonJS; a clean TypeScript port will be straightforward.

**Rationale**: SC-004 requires identical results. Porting (not wrapping) avoids a Node.js CJS/ESM interop issue with Nitro's ESM-only module system, and lets us add TypeScript types.

**Alternatives considered**:
- **Import pipeline.js directly**: Rejected — CJS module in ESM-only Nitro context requires workarounds; the `.tessl/` path is vendored and may change.
- **Shell out to generate-dashboard-safe.sh**: Rejected — returns full HTML, not structured data; parsing HTML is fragile.
- **Use context.json only**: Rejected — context.json only holds `tdd_determination`, not per-phase status.

### Phase Detection Rules (from pipeline.js)

| Phase | Artifact Check | Status Logic |
|-------|---------------|--------------|
| Constitution | `CONSTITUTION.md` at root | exists → complete, else not_started |
| Specify | `specs/<fid>/spec.md` | exists → complete, else not_started |
| Plan | `specs/<fid>/plan.md` | exists → complete, else not_started |
| Checklist | `specs/<fid>/checklists/*.md` | 0 items → not_started, all checked → complete, else in_progress |
| Testify | `specs/<fid>/tests/features/*.feature` | files exist → complete, !tdd && plan → skipped, else not_started |
| Tasks | `specs/<fid>/tasks.md` | exists → complete, else not_started |
| Analyze | `specs/<fid>/analysis.md` | exists → complete, else not_started |
| Implement | `specs/<fid>/tasks.md` (parsed) | 0 tasks or 0 checked → not_started, all checked → complete, else in_progress |

### Checklist Parsing Nuance

`requirements.md` (created by `/iikit-01-specify`) is excluded from checklist progress unless `checklist_reviewed_at` is set in `.specify/context.json`. This prevents the checklist phase from appearing complete before `/iikit-03-checklist` has run.

### TDD Determination

1. Check `.specify/context.json` for `tdd_determination` field
2. If `"mandatory"` → TDD required
3. If not set, parse `CONSTITUTION.md` for TDD/BDD terms + mandatory keywords
4. If neither → defaults to `false`

### Task Parsing Regex

```
- \[([ x])\] (T(?:-B)?\d+)\s+(?:\[P\]\s*)?(?:\[(US\d+|BUG-\d+)\]\s*)?(.*)/
```

Extracts: checkbox state, task ID (T001 or T-B001), optional priority marker, optional story/bug tag, description.

### Feature Discovery

Features are directories under `specs/` that contain a `spec.md` file. Display name is derived by stripping the leading numeric prefix and title-casing.

## Existing Codebase Patterns

### Nitro API Handler Pattern

All existing endpoints (`sessions.get.ts`, `workflow.get.ts`, etc.) follow a consistent pattern:
- Export `defineEventHandler(async () => { ... })`
- Use `fs` sync methods for filesystem reads
- Return plain objects (auto-serialized to JSON by Nitro)
- No dependency injection — direct function calls

**Decision**: Follow the same pattern for new endpoints.

### Frontend State Pattern (workflow.vue)

The workflow page uses:
- `useFetch()` for data loading (Nuxt composable)
- `ref()` / `computed()` for reactive state
- Inline TypeScript types (no separate types file)
- Tailwind utility classes for styling

**Decision**: Extend `workflow.vue` rather than creating a new page. The phase pipeline replaces the YAML-driven step list when viewing phase status.

### Project Root Resolution

`sessions.get.ts` uses `process.env.PROJECT_ROOT || resolve(process.cwd(), '..')` to find the project root. The POC runs inside `poc/`, so `..` points to the repo root.

**Decision**: Use the same pattern for resolving the project root when looking for `specs/`, `CONSTITUTION.md`, etc.

## Technology Decisions

### No New Dependencies

The feature requires only filesystem reads and markdown parsing. The existing Node.js `fs` module and simple regex parsing (ported from pipeline.js) are sufficient. No new npm packages needed.

### Vitest for Testing

CONSTITUTION.md mandates TDD. The project lists Vitest 3.2 as its test framework. Vitest must be added to `devDependencies` and configured for this feature.

**Decision**: Add `vitest` to devDependencies with a minimal config. Tests will cover the phase computation logic (unit) and API endpoints (integration).

### No Caching

FR-003 explicitly states: "Phase status MUST be derived by reading artifacts from the filesystem on each request (no persistent cache)." All reads are fresh per request.
