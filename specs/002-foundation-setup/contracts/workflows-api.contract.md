# API Contract: Workflows

**Feature**: Workflow Execution (FR-302)
**Implements**: User Story 2, 6
**Date**: 2026-03-11

## Overview

Workflows represent IIKit phase executions. This contract defines how phases are created, tracked, and monitored.

## Endpoints

### GET /api/workflows/:sessionId

List all workflows for a session.

**Request**:
```http
GET /api/workflows/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK)**:
```json
{
  "workflows": [
    {
      "id": "uuid1",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-03-11T10:05:00Z",
      "updatedAt": "2026-03-11T10:20:00Z",
      "phase": "specify",
      "status": "complete",
      "output": "[SPEC] Feature X\n...",
      "exitCode": 0,
      "featureId": "002"
    }
  ]
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Session not found"
}
```

**Test Assertions**:
- Valid sessionId returns 200 with workflows array
- Each workflow has: id, sessionId, createdAt, updatedAt, phase, status, output, exitCode
- exitCode is null if status is "running"
- Output is truncated if >10MB
- Invalid sessionId returns 404

---

### POST /api/workflows/:sessionId

Create and start a new workflow.

**Request**:
```http
POST /api/workflows/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "phase": "specify",
  "featureId": "002",
  "args": {
    "prompt": "User input for the phase"
  }
}
```

**Response (201 Created)**:
```json
{
  "workflow": {
    "id": "uuid2",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-03-11T10:25:00Z",
    "updatedAt": "2026-03-11T10:25:00Z",
    "phase": "specify",
    "status": "pending",
    "output": "",
    "exitCode": null,
    "featureId": "002"
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "Invalid phase",
  "details": "phase must be one of: specify, plan, implement, test, review, deploy"
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Session not found"
}
```

**Test Assertions**:
- Valid request returns 201
- New workflow has status "pending"
- output is empty string initially
- exitCode is null
- Invalid phase returns 400 with valid phase list
- Invalid sessionId returns 404

---

### GET /api/workflows/:sessionId/:workflowId

Get a specific workflow (for streaming output).

**Request**:
```http
GET /api/workflows/550e8400-e29b-41d4-a716-446655440000/uuid2
```

**Response (200 OK)**:
```json
{
  "workflow": {
    "id": "uuid2",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-03-11T10:25:00Z",
    "updatedAt": "2026-03-11T10:27:00Z",
    "phase": "specify",
    "status": "running",
    "output": "[spec] Generating...",
    "exitCode": null,
    "featureId": "002"
  }
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Workflow not found"
}
```

**Test Assertions**:
- Valid IDs return 200
- Running workflows have null exitCode
- Complete workflows have exitCode (0 or non-zero)
- Output is aggregated stdout + stderr
- Invalid IDs return 404

---

## Server-Sent Events (SSE) Streaming

Workflows stream output via SSE endpoint for real-time progress.

### GET /api/workflows/:sessionId/:workflowId/stream

**Connection**:
```http
GET /api/workflows/550e8400-e29b-41d4-a716-446655440000/uuid2/stream
Accept: text/event-stream
```

**Event Stream**:
```
event: output
data: [SPEC] Generating specification...

event: output
data: Processing requirements...

event: status
data: {"status": "running", "phase": "specify"}

event: complete
data: {"status": "complete", "exitCode": 0}
```

**Connection close**: Sent when workflow finishes (complete or failed)

**Test Assertions**:
- Connection returns 200 Content-Type: text/event-stream
- Events arrive in order
- Each event has correct type (output, status, complete)
- Stream closes after complete event
- Invalid workflow ID returns 404 before streaming starts

---

## State Invariants

1. Workflow ID is always a valid UUID
2. Status is one of: pending, running, complete, failed
3. Phase is one of: specify, plan, implement, test, review, deploy
4. exitCode is null for non-terminal states, 0-255 for terminal states
5. output is max 10MB (truncated if exceeded)
6. createdAt < updatedAt (always)

## Error Handling

| Status | Scenario | Message |
|--------|----------|---------|
| 400 | Invalid phase | "phase must be one of: ..." |
| 404 | Session or workflow not found | "Session not found" or "Workflow not found" |
| 500 | Database error | "Failed to create workflow" |

## Progress Monitoring

For UI feedback, clients should:
1. Poll GET /api/workflows/:sessionId/:workflowId every 500ms, OR
2. Listen to SSE stream /api/workflows/:sessionId/:workflowId/stream
3. Update UI based on status and exitCode

SSE is preferred for real-time feedback.

## Contract Enforcement

Tests verify:
- All response objects match schema
- Phase validation (enum)
- Output truncation at 10MB
- Stream events arrive in order
- Proper cleanup on disconnect
