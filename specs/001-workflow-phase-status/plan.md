# Implementation Plan: Workflow Phase Status

**Branch**: `001-workflow-phase-status` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-workflow-phase-status/spec.md`

## Summary

Add two API endpoints (`GET /api/features`, `GET /api/phases`) that compute IIKit workflow phase status by reading markdown artifacts from the filesystem, and extend the workflow page with a feature selector and visual phase pipeline. The phase computation logic is ported from IIKit's `computePipelineState()` to ensure identical results (SC-004).

## Technical Context

**Language/Version**: TypeScript 5.x (Nuxt 4 / Nitro)
**Primary Dependencies**: Nuxt 4, Vue 3, Nuxt UI 3, Nitro (bundled with Nuxt), Vitest 3.2 (new, for testing)
**Storage**: Filesystem only — reads `specs/`, `CONSTITUTION.md`, `.specify/context.json`
**Testing**: Vitest 3.2 (unit + integration)
**Target Platform**: macOS / Linux, localhost:3333
**Project Type**: Web application (Nuxt 3 SPA + Nitro API)
**Performance Goals**: Page load + phase status display within 2 seconds for up to 10 features (SC-005)
**Constraints**: No persistent cache (FR-003), no network calls, no telemetry (Constitution IV)
**Scale/Scope**: Single developer, ~10 features max, 8 fixed phases per feature

## Constitution Check

*GATE: All 6 principles verified. No violations.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-Driven | PASS | spec.md complete (10/10 quality), plan.md (this file) |
| II. Test-First (NON-NEGOTIABLE) | PASS | Vitest added, TDD enforced — tests written before production code |
| III. Assertion Integrity | PASS | Will use `/iikit-04-testify` for .feature files |
| IV. Local-First Privacy | PASS | Filesystem reads only, no telemetry, localhost only |
| V. Intent Sequencing | PASS | This is Intent 001, first in sequence |
| VI. Architectural Stewardship | PASS | Additive changes — new endpoints and new UI section, no breaking changes |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser SPA (Vue 3)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              workflow.vue                             │   │
│  │  ┌──────────────┐  ┌─────────────────────────────┐   │   │
│  │  │   Feature     │  │    Phase Pipeline            │   │   │
│  │  │   Selector    │  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │   │   │
│  │  │   (dropdown)  │  │  │CON│→│SPE│→│PLN│→│...│   │   │   │
│  │  └──────┬───────┘  │  └───┘ └───┘ └───┘ └───┘   │   │   │
│  │         │          └─────────────────────────────┘   │   │
│  └─────────┼────────────────────────────────────────────┘   │
│            │ useFetch()                                      │
└────────────┼────────────────────────────────────────────────┘
             │ HTTP
┌────────────┼────────────────────────────────────────────────┐
│            ▼        Nitro API Server                        │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │ GET /api/features│  │ GET /api/phases   │                  │
│  │ features.get.ts  │  │ phases.get.ts     │                  │
│  └────────┬────────┘  └────────┬─────────┘                  │
│           │                    │                             │
│           ▼                    ▼                             │
│  ┌─────────────────────────────────────────┐                │
│  │        server/utils/pipeline.ts         │                │
│  │  computePipelineState()                 │                │
│  │  listFeatures()                         │                │
│  │  parseTasks() / parseChecklists()       │                │
│  └────────────────────┬────────────────────┘                │
│                       │ fs.readFileSync / fs.existsSync      │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                       ▼        Filesystem                    │
│  CONSTITUTION.md                                             │
│  .specify/context.json                                       │
│  specs/<feature>/                                            │
│    spec.md  plan.md  tasks.md  analysis.md                   │
│    checklists/*.md   tests/features/*.feature                │
└──────────────────────────────────────────────────────────────┘
```

## Project Structure

### Documentation (this feature)

```text
specs/001-workflow-phase-status/
  spec.md              # Feature specification
  plan.md              # This file
  research.md          # Reference implementation analysis
  data-model.md        # Entity definitions and API shapes
  quickstart.md        # Manual test scenarios
  contracts/
    features.md        # GET /api/features contract
    phases.md          # GET /api/phases contract
  checklists/
    requirements.md    # Spec quality checklist
```

### Source Code

```text
poc/
  server/
    api/
      features.get.ts          # NEW — list features endpoint (FR-001)
      phases.get.ts             # NEW — phase status endpoint (FR-002)
    utils/
      pipeline.ts               # NEW — phase computation logic (FR-003, FR-004, FR-005, FR-006, FR-007)
  pages/
    workflow.vue                 # MODIFIED — add feature selector + phase pipeline (FR-008, FR-009, FR-010)
  tests/
    unit/
      pipeline.test.ts          # NEW — unit tests for phase computation
    integration/
      features-api.test.ts      # NEW — integration tests for /api/features
      phases-api.test.ts         # NEW — integration tests for /api/phases
  vitest.config.ts               # NEW — test configuration
  package.json                   # MODIFIED — add vitest dependency
```

**Structure Decision**: Nuxt 3 convention — API handlers in `server/api/`, shared logic in `server/utils/`, tests in `tests/`. This matches the existing pattern and Nuxt's auto-import for server utils.

## Implementation Strategy

### Layer 1: Phase Computation Engine (`server/utils/pipeline.ts`)

Port IIKit's `computePipelineState()` to TypeScript. This is the core logic with no HTTP concerns.

**Key functions**:
- `listFeatures(projectPath: string): Feature[]` — scan `specs/` for feature directories
- `computePipelineState(projectPath: string, featureId: string): Phase[]` — compute all 8 phases
- `parseTasks(content: string): Task[]` — parse task checkboxes from tasks.md
- `parseChecklists(checklistDir: string, opts: { includeRequirements: boolean }): ChecklistResult` — aggregate checklist progress
- `parseConstitutionTDD(constitutionPath: string): boolean` — detect TDD requirement

**Testing**: Unit tests with temporary directories containing known artifact files. Each phase status rule gets its own test case.

### Layer 2: API Endpoints

**`GET /api/features`** (`features.get.ts`):
- Resolve project root via `process.env.PROJECT_ROOT || resolve(process.cwd(), '..')`
- Call `listFeatures(projectRoot)`
- Return `{ features }`

**`GET /api/phases`** (`phases.get.ts`):
- Read `feature` query parameter
- Validate: 400 if missing, 404 if feature directory doesn't exist
- Call `computePipelineState(projectRoot, feature)`
- Return `{ feature, phases }`

**Testing**: Integration tests using `$fetch()` against the Nitro dev server, or direct handler invocation with mock events.

### Layer 3: Frontend (`workflow.vue`)

Extend the existing workflow page with a new "Phase Status" mode:

1. **Feature selector** (top bar): `USelect` populated from `GET /api/features`. Auto-selects if only one feature exists (FR-008, SC-003, US2-S3).
2. **Phase pipeline** (main area): Horizontal pipeline of phase cards with status indicators (FR-009, SC-001, US4).
3. **Refresh button** (top bar): `UButton` re-fetches phase status on click (FR-010, SC-002, US3).

**Visual design** (Nuxt UI components):
- Phase cards in a horizontal row with arrow connectors using `UCard`
- Status indicators via `UBadge` color variants:
  - `complete`: `success` variant, checkmark icon
  - `in_progress`: `warning` variant, progress percentage displayed
  - `not_started`: `neutral` variant, step number
  - `skipped`: `neutral` variant with dashed border, skip icon
- `UProgress` bar inside card for Checklist and Implement phases

### Dependency Order

```
pipeline.ts (no deps)
  ↓
features.get.ts (imports pipeline.ts)
phases.get.ts   (imports pipeline.ts)
  ↓
workflow.vue (calls /api/features + /api/phases)
```

All layers are independently testable. Pipeline logic can be tested without HTTP. API endpoints can be tested without the browser. Frontend can be tested with mocked API responses.

## Key Design Decisions

### 1. Port vs. Import

**Decision**: Port `computePipelineState()` to TypeScript rather than importing the CJS `pipeline.js`.

**Rationale**: Nitro is ESM-only. The vendored `.tessl/` path may change between IIKit versions. A clean TypeScript port gives us type safety and decouples from the vendored tile structure.

### 2. Separate Endpoints vs. Single Endpoint

**Decision**: Two separate endpoints (`/api/features` and `/api/phases`) rather than one combined endpoint.

**Rationale**: Separation of concerns — feature listing is cheap (directory scan), phase computation is heavier (file reads + parsing). The feature selector can populate without computing all phases.

### 3. Progress as Number vs. String

**Decision**: Return `progress` as a number (0-100) instead of IIKit's string format (`"60%"`).

**Rationale**: Easier for frontend to render progress bars. The `%` suffix is a presentation concern, not a data concern.

### 4. Extend workflow.vue vs. New Page

**Decision**: Extend the existing `workflow.vue` page rather than creating a new page.

**Rationale**: The workflow page already has the pipeline visual pattern. Adding a phase status mode keeps the navigation simple and builds on the existing UI.

### 5. Test Framework Setup

**Decision**: Add Vitest as a devDependency in this feature, even though it's the first feature to need it.

**Rationale**: Constitution II (TDD) is non-negotiable. Tests must exist before production code. Vitest is the declared test framework for the project.

### 6. Nuxt 4 + Nuxt UI as the primary stack

**Decision**: Debussy uses Nuxt 4 / Nitro / Vue 3 + Nuxt UI 3 as its tech stack.

**Rationale**: Nuxt 4 combines SSR and API routes in a single framework, reducing setup overhead. Nitro's `server/api/` convention maps directly to the two-endpoint design (FR-001, FR-002) without boilerplate. Nuxt UI 3 provides production-ready components (`USelect`, `UBadge`, `UCard`, `UProgress`, `UButton`) that directly satisfy the visual pipeline requirements (FR-008, FR-009, FR-010). The unified framework means one process, one port, and simpler distribution via `npx debussy`.
