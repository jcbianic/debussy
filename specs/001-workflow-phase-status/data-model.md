# Data Model: Workflow Phase Status

**Feature**: 001-workflow-phase-status
**Date**: 2026-03-10

## Entities

### Feature

A directory under `specs/` containing IIKit artifacts.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Directory name (e.g., `001-workflow-phase-status`) |
| `name` | `string` | Display name derived from id (e.g., `Workflow Phase Status`) |

**Discovery rule**: A directory under `specs/` is a valid feature if and only if it contains `spec.md`.

**Name derivation**: Strip leading digits and dashes (`/^\d+-/`), split remaining by `-`, title-case each word.

### Phase

One step in the IIKit workflow pipeline.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `PhaseId` | Phase identifier (enum, see below) |
| `name` | `string` | Display name |
| `status` | `PhaseStatus` | Computed status |
| `progress` | `number \| null` | Completion percentage (0-100), only for Checklist and Implement |
| `optional` | `boolean` | Whether the phase can be skipped |

### PhaseId (enum)

Ordered sequence — the array index defines pipeline order:

```typescript
type PhaseId =
  | 'constitution'
  | 'spec'
  | 'plan'
  | 'checklist'
  | 'testify'
  | 'tasks'
  | 'analyze'
  | 'implement'
```

### PhaseStatus (enum)

```typescript
type PhaseStatus = 'not_started' | 'in_progress' | 'complete' | 'skipped'
```

**State transitions** (per phase):

- Simple phases (Constitution, Specify, Plan, Tasks, Analyze):
  `not_started` → `complete` (artifact created)

- Progress phases (Checklist, Implement):
  `not_started` → `in_progress` (some items checked) → `complete` (all items checked)

- Skippable phase (Testify):
  `not_started` → `complete` (feature files created)
  `not_started` → `skipped` (TDD not required AND plan exists)

## API Response Shapes

### GET /api/features

```typescript
interface FeaturesResponse {
  features: Feature[]
}

interface Feature {
  id: string
  name: string
}
```

### GET /api/phases?feature=<featureId>

```typescript
interface PhasesResponse {
  feature: string
  phases: Phase[]
}

interface Phase {
  id: PhaseId
  name: string
  status: PhaseStatus
  progress: number | null
  optional: boolean
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: string
}
```

Returned with appropriate HTTP status when:
- `feature` query param is missing (400)
- Feature directory not found (404)
- Project path is inaccessible (500)

## No Persistent Storage

All data is derived from filesystem reads on every request (FR-003). No database tables, no cache, no state files. The filesystem IS the database.

## Relationship to IIKit's pipeline.js

The `Phase` type maps directly to the objects in the `phases` array returned by `computePipelineState()`. The only differences:

1. `progress` is a number (0-100) instead of a string (`"60%"`) — cleaner for frontend rendering
2. `clarifications` and `clarificationEntries` are omitted — out of scope for this feature
3. Phase name for Constitution doesn't include the `\n` separator used in the dashboard SVG
