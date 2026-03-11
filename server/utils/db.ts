import Database from 'better-sqlite3'
import { join } from 'path'
import { mkdirSync } from 'fs'

const DB_DIR = join(process.cwd(), '.debussy')
const DB_PATH = join(DB_DIR, 'debussy.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    mkdirSync(DB_DIR, { recursive: true })
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      label TEXT,
      status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'running', 'complete')),
      workflow_ids TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS workflows (
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

    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_workflows_session_id ON workflows(session_id);
    CREATE INDEX IF NOT EXISTS idx_workflows_phase ON workflows(phase);
    CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
  `)
}

export function closeDb(): void {
  if (_db) {
    _db.close()
    _db = null
  }
}
