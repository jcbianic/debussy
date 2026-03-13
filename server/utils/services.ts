import { randomUUID } from 'crypto'
import type Database from 'better-sqlite3'
import { getDb } from './db'

export interface SessionRow {
  id: string
  created_at: string
  updated_at: string
  label: string | null
  status: string
  workflow_ids: string
}

export interface WorkflowRow {
  id: string
  session_id: string
  created_at: string
  updated_at: string
  phase: string
  status: string
  output: string
  exit_code: number | null
  feature_id: string | null
  args: string | null
}

// Sessions

type SqliteParam = string | number | bigint | Buffer | null

export function getSessions(opts: { skip?: number; limit?: number; status?: string } = {}) {
  const db = getDb()
  const { skip = 0, limit = 20, status } = opts
  const clampedLimit = Math.min(limit, 100)

  const whereClause = status && status !== 'all' ? ' WHERE status = ?' : ''
  const whereParams: SqliteParam[] = status && status !== 'all' ? [status] : []

  const totalResult = db.prepare(`SELECT COUNT(*) as total FROM sessions${whereClause}`).get(...whereParams) as { total: number }

  const sessions = db.prepare(`SELECT * FROM sessions${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...whereParams, clampedLimit, skip) as SessionRow[]

  return {
    sessions: sessions.map(formatSession),
    total: totalResult.total,
    hasMore: skip + clampedLimit < totalResult.total,
  }
}

export function getSessionById(id: string) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined
  return row ? formatSession(row) : null
}

export function createSession(label?: string) {
  const db = getDb()
  const id = randomUUID()
  const now = new Date().toISOString()

  db.prepare(
    'INSERT INTO sessions (id, created_at, updated_at, label, status, workflow_ids) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, now, now, label || null, 'idle', '[]')

  return getSessionById(id)!
}

// Workflows

export function getWorkflows(sessionId: string) {
  const db = getDb()

  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
  if (!session) return null

  const rows = db.prepare(
    'SELECT * FROM workflows WHERE session_id = ? ORDER BY created_at ASC'
  ).all(sessionId) as WorkflowRow[]

  return rows.map(formatWorkflow)
}

export function createWorkflow(sessionId: string, phase: string, featureId?: string) {
  const db = getDb()
  const validPhases = ['specify', 'plan', 'implement', 'test', 'review', 'deploy']

  if (!validPhases.includes(phase)) {
    throw new Error(`phase must be one of: ${validPhases.join(', ')}`)
  }

  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
  if (!session) return null

  const id = randomUUID()
  const now = new Date().toISOString()

  db.prepare(
    'INSERT INTO workflows (id, session_id, created_at, updated_at, phase, status, output, feature_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, sessionId, now, now, phase, 'pending', '', featureId || null)

  return formatWorkflow(
    db.prepare('SELECT * FROM workflows WHERE id = ?').get(id) as WorkflowRow
  )
}

// Formatters

function formatSession(row: SessionRow) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    label: row.label,
    status: row.status,
    workflowIds: JSON.parse(row.workflow_ids || '[]'),
  }
}

function formatWorkflow(row: WorkflowRow) {
  return {
    id: row.id,
    sessionId: row.session_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    phase: row.phase,
    status: row.status,
    output: row.output,
    exitCode: row.exit_code,
    featureId: row.feature_id,
  }
}
