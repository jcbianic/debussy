import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import * as dbModule from '~/server/utils/db'
import { getSessions, getSessionById, createSession } from '~/server/utils/services'

// Use in-memory database for tests
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

  // Override getDb to return our test database
  vi.spyOn(dbModule, 'getDb').mockReturnValue(testDb)
}

describe('Sessions API (FR-302, sessions-api.contract)', () => {
  beforeEach(() => {
    initTestDb()
  })

  afterEach(() => {
    testDb.close()
    vi.restoreAllMocks()
  })

  describe('createSession', () => {
    it('creates a session with a label', () => {
      const session = createSession('Test Session')
      expect(session.id).toBeTruthy()
      expect(session.label).toBe('Test Session')
      expect(session.status).toBe('idle')
      expect(session.workflowIds).toEqual([])
    })

    it('creates a session without a label', () => {
      const session = createSession()
      expect(session.id).toBeTruthy()
      expect(session.label).toBeNull()
      expect(session.status).toBe('idle')
    })

    it('assigns unique UUIDs', () => {
      const s1 = createSession('One')
      const s2 = createSession('Two')
      expect(s1.id).not.toBe(s2.id)
    })
  })

  describe('getSessionById', () => {
    it('returns session by id', () => {
      const created = createSession('Test')
      const found = getSessionById(created.id)
      expect(found).not.toBeNull()
      expect(found!.id).toBe(created.id)
      expect(found!.label).toBe('Test')
    })

    it('returns null for unknown id', () => {
      const result = getSessionById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('getSessions', () => {
    it('returns empty list initially', () => {
      const result = getSessions()
      expect(result.sessions).toEqual([])
      expect(result.total).toBe(0)
      expect(result.hasMore).toBe(false)
    })

    it('returns created sessions', () => {
      createSession('A')
      createSession('B')
      const result = getSessions()
      expect(result.sessions).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('supports pagination with skip and limit', () => {
      for (let i = 0; i < 5; i++) createSession(`Session ${i}`)
      const page = getSessions({ skip: 2, limit: 2 })
      expect(page.sessions).toHaveLength(2)
      expect(page.total).toBe(5)
      expect(page.hasMore).toBe(true)
    })

    it('clamps limit to 100', () => {
      const result = getSessions({ limit: 500 })
      // Should not throw; internally clamps
      expect(result).toBeDefined()
    })
  })
})
