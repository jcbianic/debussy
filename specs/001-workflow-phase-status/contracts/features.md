# Contract: GET /api/features

List all valid features (directories with `spec.md`) under `specs/`.

## Request

```
GET /api/features
```

No query parameters required.

## Response (200)

```json
{
  "features": [
    { "id": "001-workflow-phase-status", "name": "Workflow Phase Status" },
    { "id": "002-session-management", "name": "Session Management" }
  ]
}
```

**Ordering**: Alphabetical by `id` (natural order since IDs are zero-padded).

## Response — No specs directory (200)

```json
{
  "features": []
}
```

Returns empty array, not an error. The project may not have any features yet.

## Response — Project path inaccessible (500)

```json
{
  "error": "Cannot access project root: <path>"
}
```

## Notes

- Features are discovered by scanning `specs/` for subdirectories containing `spec.md`
- Display name: strip leading `\d+-`, split by `-`, title-case each word
- No authentication (local-first, Constitution IV)
