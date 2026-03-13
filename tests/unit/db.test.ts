import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  db.exec(`
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
  return db
}

describe('SQLite Schema', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDb()
  })

  afterEach(() => {
    db.close()
  })

  it('creates sessions table with correct columns', () => {
    const columns = db.pragma('table_info(sessions)') as Array<{ name: string }>
    const names = columns.map((c) => c.name)
    expect(names).toContain('id')
    expect(names).toContain('created_at')
    expect(names).toContain('updated_at')
    expect(names).toContain('label')
    expect(names).toContain('status')
    expect(names).toContain('workflow_ids')
  })

  it('creates workflows table with correct columns', () => {
    const columns = db.pragma('table_info(workflows)') as Array<{ name: string }>
    const names = columns.map((c) => c.name)
    expect(names).toContain('id')
    expect(names).toContain('session_id')
    expect(names).toContain('phase')
    expect(names).toContain('status')
    expect(names).toContain('output')
    expect(names).toContain('exit_code')
    expect(names).toContain('feature_id')
  })

  it('enforces session status constraint', () => {
    db.prepare('INSERT INTO sessions (id, status) VALUES (?, ?)').run('s1', 'idle')
    expect(() => {
      db.prepare('INSERT INTO sessions (id, status) VALUES (?, ?)').run('s2', 'invalid')
    }).toThrow()
  })

  it('enforces workflow phase constraint', () => {
    db.prepare('INSERT INTO sessions (id) VALUES (?)').run('s1')
    db.prepare('INSERT INTO workflows (id, session_id, phase) VALUES (?, ?, ?)').run('w1', 's1', 'specify')
    expect(() => {
      db.prepare('INSERT INTO workflows (id, session_id, phase) VALUES (?, ?, ?)').run('w2', 's1', 'invalid')
    }).toThrow()
  })

  it('enforces foreign key on workflows.session_id', () => {
    expect(() => {
      db.prepare('INSERT INTO workflows (id, session_id, phase) VALUES (?, ?, ?)').run('w1', 'nonexistent', 'specify')
    }).toThrow()
  })

  it('creates required indices', () => {
    const indices = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all() as Array<{ name: string }>
    const names = indices.map((i) => i.name)
    expect(names).toContain('idx_sessions_status')
    expect(names).toContain('idx_sessions_created_at')
    expect(names).toContain('idx_workflows_session_id')
    expect(names).toContain('idx_workflows_phase')
    expect(names).toContain('idx_workflows_status')
  })

  it('defaults session status to idle', () => {
    db.prepare('INSERT INTO sessions (id) VALUES (?)').run('s1')
    const session = db.prepare('SELECT status FROM sessions WHERE id = ?').get('s1') as { status: string }
    expect(session.status).toBe('idle')
  })

  it('defaults workflow status to pending', () => {
    db.prepare('INSERT INTO sessions (id) VALUES (?)').run('s1')
    db.prepare('INSERT INTO workflows (id, session_id, phase) VALUES (?, ?, ?)').run('w1', 's1', 'plan')
    const workflow = db.prepare('SELECT status FROM workflows WHERE id = ?').get('w1') as { status: string }
    expect(workflow.status).toBe('pending')
  })
})
