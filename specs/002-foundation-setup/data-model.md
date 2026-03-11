# Data Model: Foundation Setup

**Date**: 2026-03-11 | **Storage**: SQLite (better-sqlite3) + localStorage

## Core Entities

### Session

Represents a single developer session with Debussy.

```typescript
interface Session {
  // Metadata
  id: string                    // UUID v4, primary key
  createdAt: Date              // Session start timestamp (ISO 8601)
  updatedAt: Date              // Last activity timestamp
  label?: string               // User-given name (e.g., "Debugging auth flow")

  // Status
  status: "idle" | "running" | "complete"  // Lifecycle state

  // Relationships
  workflowIds: string[]        // Child workflows (denormalized for perf)
}

// Database Schema (SQLite)
// CREATE TABLE sessions (
//   id TEXT PRIMARY KEY,
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//   label TEXT,
//   status TEXT DEFAULT 'idle',
//   workflow_ids TEXT  -- JSON array of IDs
// );
```

**Lifecycle**:
1. **idle**: Session created, no workflows running
2. **running**: At least one workflow is executing
3. **complete**: All workflows finished; session archived

**Validation**:
- `id`: Must be valid UUID v4
- `label`: Max 256 characters; trimmed whitespace
- `status`: Enum of three values only

**Relationships**:
- One session has many workflows (1:N)

---

### Workflow

Represents a single IIKit phase execution within a session.

```typescript
interface Workflow {
  // Metadata
  id: string                    // UUID v4, primary key
  sessionId: string            // FK → Session.id
  createdAt: Date              // Workflow start
  updatedAt: Date              // Last activity

  // Phase tracking
  phase: "specify" | "plan" | "implement" | "test" | "review" | "deploy"
  status: "pending" | "running" | "complete" | "failed"

  // Output
  output: string               // Aggregated stdout + stderr (max 10MB)
  exitCode?: number            // Process exit code (null if running)

  // Configuration
  featureId?: string           // Reference to spec (e.g., "002")
  args?: Record<string, string> // Phase arguments (user input, prompts)
}

// Database Schema (SQLite)
// CREATE TABLE workflows (
//   id TEXT PRIMARY KEY,
//   session_id TEXT NOT NULL,
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//   phase TEXT NOT NULL,
//   status TEXT DEFAULT 'pending',
//   output TEXT DEFAULT '',
//   exit_code INTEGER,
//   feature_id TEXT,
//   args TEXT,  -- JSON object
//   FOREIGN KEY (session_id) REFERENCES sessions(id)
// );
```

**Lifecycle**:
1. **pending**: Workflow created, waiting to run
2. **running**: Phase is executing; output streaming
3. **complete**: Phase finished successfully (exitCode == 0)
4. **failed**: Phase exited with non-zero code

**Validation**:
- `sessionId`: Must exist in sessions table
- `phase`: Enum of six IIKit phases only
- `output`: Max 10MB; truncate oldest if exceeded
- `exitCode`: Must be 0-255 if set

**Relationships**:
- Many workflows belong to one session (N:1)
- Workflows within a session are ordered by createdAt (FIFO)

---

### ThemePreference

User's visual customization settings (stored in localStorage).

```typescript
interface ThemePreference {
  // System preference
  mode: "light" | "dark" | "system"  // "system" = respect OS preference

  // Custom overrides (optional)
  customColors?: {
    primary?: string           // Hex color (e.g., "#3b82f6")
    secondary?: string
    background?: string
    text?: string
  }

  // Font preference (optional)
  fontFamily?: "system" | "serif" | "mono"  // Defaults to system

  // Accessibility
  reduceMotion?: boolean        // Respects prefers-reduced-motion
}

// Storage Location: localStorage["debussy:theme"]
// Persisted as JSON, hydrated on app mount
```

**Lifecycle**:
1. Load from localStorage on app boot
2. Hydrate into reactive Vue state (`useTheme()` composable)
3. Apply CSS variables to document.documentElement
4. Listen to OS theme changes if mode === "system"
5. Save to localStorage on user change

**Validation**:
- `mode`: Enum only
- `customColors.*`: Valid hex colors only (regex: `#[0-9a-fA-F]{6}`)
- `fontFamily`: Enum only
- `reduceMotion`: Boolean only

**Defaults**:
```json
{
  "mode": "system",
  "fontFamily": "system",
  "reduceMotion": false
}
```

---

## State Transitions

### Session Lifecycle

```
[NEW SESSION]
      ↓
    idle
      ↓ (workflow starts)
   running ←→ running  (multiple workflows can be concurrent)
      ↓ (all workflows complete)
   complete
      ↓ (optional: archive/delete)
   [DELETED]
```

### Workflow Lifecycle

```
pending
   ↓ (user triggers)
running
   ↓
complete  or  failed
   (terminal states)
```

---

## API Contracts (Read-Only in Foundation)

These contracts define how other intents will interact with data:

### GET /api/sessions

**Query**:
- `skip`: Number of sessions to skip (pagination)
- `limit`: Max sessions to return (default 20, max 100)
- `status`: Filter by status (idle|running|complete|all)

**Response**:
```json
{
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-03-11T10:00:00Z",
      "updatedAt": "2026-03-11T10:30:00Z",
      "label": "Testing auth flow",
      "status": "complete",
      "workflowIds": ["uuid1", "uuid2"]
    }
  ],
  "total": 42,
  "hasMore": true
}
```

**Status**: 200 (always succeeds for READ)

### GET /api/sessions/:id

**Response**:
```json
{
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-03-11T10:00:00Z",
    "updatedAt": "2026-03-11T10:30:00Z",
    "label": "Testing auth flow",
    "status": "complete",
    "workflowIds": ["uuid1", "uuid2"]
  }
}
```

**Status**: 200 if found, 404 if not found

### GET /api/workflows/:sessionId

**Response**:
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
      "output": "[spec generated successfully]\n...",
      "exitCode": 0,
      "featureId": "002"
    }
  ]
}
```

**Status**: 200

### GET /api/theme

**Response**:
```json
{
  "mode": "dark",
  "tokens": {
    "color.primary": "#3b82f6",
    "color.secondary": "#8b5cf6",
    "color.background": "#1f2937",
    "color.text": "#f3f4f6",
    "font.family.system": "system-ui, -apple-system, sans-serif",
    "spacing.unit": "0.25rem"
  }
}
```

**Status**: 200

---

## Index Strategy (SQLite Performance)

```sql
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_workflows_session_id ON workflows(session_id);
CREATE INDEX idx_workflows_phase ON workflows(phase);
CREATE INDEX idx_workflows_status ON workflows(status);
```

**Rationale**:
- Fast filtering by session status (FR-302)
- Chronological ordering (list views)
- Foreign key lookups (session → workflows)
- Filtering/monitoring by phase (FR-101)

---

## Migration Strategy

Foundation phase establishes the initial schema. No migrations needed yet.

**Future intents** (when they arrive) may:
- Add Artifact entity (Intent 003)
- Add CostLog entity (Intent 005)
- Extend Workflow with cost tracking

Migration mechanism: Date-stamped SQL files in `db/migrations/`, executed on app boot if not already applied.

---

## Summary

| Entity | Storage | Lifecycle | Count Estimate |
|--------|---------|-----------|-----------------|
| Session | SQLite | Long-lived (permanent) | 10–1000/dev |
| Workflow | SQLite | Long-lived (per session) | 100–10k total |
| ThemePreference | localStorage | Single record | 1 |

All data remains on the local machine (Constitution IV). No cloud sync, no analytics, no telemetry.
