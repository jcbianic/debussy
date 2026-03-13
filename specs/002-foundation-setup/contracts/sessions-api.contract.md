# API Contract: Sessions

**Feature**: Session Management (FR-302)
**Implements**: User Story 1, 2, 3, 6
**Date**: 2026-03-11

## Overview

Sessions represent a developer's current activity with Debussy. This contract defines the API for listing, creating, and managing sessions.

## Endpoints

### GET /api/sessions

List all sessions.

**Query Parameters**:
- `skip` (optional, default 0): Number of results to skip
- `limit` (optional, default 20, max 100): Number of results to return
- `status` (optional): Filter by status (idle|running|complete)

**Request**:
```http
GET /api/sessions?skip=0&limit=20&status=idle
```

**Response (200 OK)**:
```json
{
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-03-11T10:00:00Z",
      "updatedAt": "2026-03-11T10:30:00Z",
      "label": "Testing auth flow",
      "status": "idle",
      "workflowIds": []
    }
  ],
  "total": 1,
  "hasMore": false
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Failed to query sessions",
  "message": "SQLite error details"
}
```

**Test Assertions**:
- Response status is 200
- `sessions` is an array
- Each session has `id`, `createdAt`, `updatedAt`, `label`, `status`, `workflowIds`
- `total` equals array length
- `hasMore` is boolean

---

### GET /api/sessions/:id

Retrieve a specific session.

**Request**:
```http
GET /api/sessions/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK)**:
```json
{
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-03-11T10:00:00Z",
    "updatedAt": "2026-03-11T10:30:00Z",
    "label": "Testing auth flow",
    "status": "idle",
    "workflowIds": ["uuid1", "uuid2"]
  }
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Session not found",
  "id": "invalid-id"
}
```

**Test Assertions**:
- Valid ID returns 200 with session object
- Invalid ID returns 404
- Session object matches schema
- workflowIds array is present (may be empty)

---

### POST /api/sessions

Create a new session.

**Request**:
```http
POST /api/sessions
Content-Type: application/json

{
  "label": "Debugging feature X"
}
```

**Response (201 Created)**:
```json
{
  "session": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-03-11T11:00:00Z",
    "updatedAt": "2026-03-11T11:00:00Z",
    "label": "Debugging feature X",
    "status": "idle",
    "workflowIds": []
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "Invalid request",
  "details": "label must be a string, max 256 characters"
}
```

**Test Assertions**:
- Valid request returns 201
- New session has unique UUID
- `status` is "idle"
- `workflowIds` is empty array
- `createdAt` == `updatedAt`
- Invalid label (>256 chars) returns 400
- Empty label defaults to timestamp

---

## State Invariants

1. Session ID is always a valid UUID v4
2. Status is one of: idle, running, complete
3. workflowIds is a JSON array of UUIDs (may be empty)
4. createdAt < updatedAt (always)
5. label is max 256 characters (trimmed)

## Error Handling

| Status | Scenario | Message |
|--------|----------|---------|
| 400 | Invalid input (label too long) | "label must be max 256 characters" |
| 404 | Session ID not found | "Session not found" |
| 500 | Database error | "Failed to query sessions" |

## Migration Notes (Future Intents)

- Intent 003 adds artifact references to sessions
- Intent 005 adds cost tracking fields
- All changes must remain backward-compatible

## Contract Enforcement

Tests verify:
- All response objects match schema
- Status codes are correct for each scenario
- Error messages are clear and actionable
- Pagination logic (skip/limit) works correctly
- UUID generation is unique (no collisions)
