import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import * as dbModule from '~~/server/utils/db'
import { createSession } from '~~/server/utils/services'
import { getWorkflows, createWorkflow } from '~~/server/utils/services'

let testDb: Database.Database

function initTestDb() {
  testDb = new Database(':memory:')
  testDb.pragma('foreign_keys = ON')
  testDb.exec(`
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      label TEXT,
      status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'running', 'complete')),
      workflow_ids TEXT DEFAULT '[]'
    );
    CREATE TABLE workflows (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      phase TEXT NOT NULL CHECK(phase IN ('specify', 'plan', 'implement', 'test', 'review', 'deploy')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'complete', 'failed')),
      output TEXT DEFAULT '',
      exit_code INTEGER,
      feature_id TEXT,
      args TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
    CREATE INDEX idx_sessions_status ON sessions(status);
    CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
    CREATE INDEX idx_workflows_session_id ON workflows(session_id);
    CREATE INDEX idx_workflows_phase ON workflows(phase);
    CREATE INDEX idx_workflows_status ON workflows(status);
  `)
  vi.spyOn(dbModule, 'getDb').mockReturnValue(testDb)
}

describe('Workflows API (FR-302, workflows-api.contract)', () => {
  beforeEach(() => {
    initTestDb()
  })

  afterEach(() => {
    testDb.close()
    vi.restoreAllMocks()
  })

  describe('createWorkflow', () => {
    it('creates a workflow with valid phase', () => {
      const session = createSession('Test')
      const workflow = createWorkflow(session.id, 'specify')
      expect(workflow).not.toBeNull()
      expect(workflow!.phase).toBe('specify')
      expect(workflow!.status).toBe('pending')
      expect(workflow!.exitCode).toBeNull()
      expect(workflow!.output).toBe('')
    })

    it('rejects invalid phase', () => {
      const session = createSession('Test')
      expect(() => createWorkflow(session.id, 'invalid')).toThrow('phase must be one of')
    })

    it('returns null for nonexistent session', () => {
      const result = createWorkflow('nonexistent', 'specify')
      expect(result).toBeNull()
    })
  })

  describe('getWorkflows', () => {
    it('returns workflows for a session', () => {
      const session = createSession('Test')
      createWorkflow(session.id, 'specify')
      createWorkflow(session.id, 'plan')

      const workflows = getWorkflows(session.id)
      expect(workflows).not.toBeNull()
      expect(workflows).toHaveLength(2)
      expect(workflows![0].phase).toBe('specify')
      expect(workflows![1].phase).toBe('plan')
    })

    it('returns null for nonexistent session', () => {
      const result = getWorkflows('nonexistent')
      expect(result).toBeNull()
    })

    it('returns empty array for session with no workflows', () => {
      const session = createSession('Empty')
      const workflows = getWorkflows(session.id)
      expect(workflows).toEqual([])
    })
  })
})
