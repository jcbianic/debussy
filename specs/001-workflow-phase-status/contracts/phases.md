# Contract: GET /api/phases

Return the pipeline phase status for a specific feature.

## Request

```
GET /api/phases?feature=001-workflow-phase-status
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `feature` | string | Yes | Feature directory name (e.g., `001-workflow-phase-status`) |

## Response (200)

```json
{
  "feature": "001-workflow-phase-status",
  "phases": [
    { "id": "constitution", "name": "Constitution", "status": "complete", "progress": null, "optional": false },
    { "id": "spec", "name": "Spec", "status": "complete", "progress": null, "optional": false },
    { "id": "plan", "name": "Plan", "status": "complete", "progress": null, "optional": false },
    { "id": "checklist", "name": "Checklist", "status": "in_progress", "progress": 60, "optional": false },
    { "id": "testify", "name": "Testify", "status": "not_started", "progress": null, "optional": false },
    { "id": "tasks", "name": "Tasks", "status": "not_started", "progress": null, "optional": false },
    { "id": "analyze", "name": "Analyze", "status": "not_started", "progress": null, "optional": false },
    { "id": "implement", "name": "Implement", "status": "not_started", "progress": null, "optional": false }
  ]
}
```

## Phase Status Values

| Status | Meaning |
|--------|---------|
| `not_started` | No artifact found for this phase |
| `in_progress` | Artifact exists with partial completion (Checklist, Implement only) |
| `complete` | Artifact exists and fully complete |
| `skipped` | Phase intentionally skipped (Testify only, when TDD not required) |

## Progress Field

- `null` for phases without quantifiable progress
- Integer 0-100 for Checklist and Implement phases
- Only present when status is `in_progress` or `complete` and items exist

## Response — Missing feature parameter (400)

```json
{
  "error": "Missing required query parameter: feature"
}
```

## Response — Feature not found (404)

```json
{
  "error": "Feature not found: 999-nonexistent"
}
```

## Notes

- Phase status is computed fresh from filesystem on every request (FR-003)
- Phase detection logic matches IIKit's `computePipelineState()` exactly (SC-004)
- The 8 phases are always returned in fixed order, regardless of completion
- No authentication (local-first, Constitution IV)
