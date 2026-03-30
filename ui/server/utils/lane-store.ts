import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  rename,
  rm,
} from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from './debussy'
import type { LaneRecord } from '~/shared/types/lanes'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function lanesDir(): Promise<string> {
  return resolveDebussyPath('.debussy', 'lanes')
}

function laneDir(base: string, id: string): string {
  return path.join(base, id)
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function listLaneRecords(): Promise<LaneRecord[]> {
  const dir = await lanesDir()
  let entries: string[]
  try {
    const dirents = await readdir(dir, { withFileTypes: true })
    entries = dirents.filter((d) => d.isDirectory()).map((d) => d.name)
  } catch {
    return []
  }

  const records: LaneRecord[] = []
  for (const entry of entries) {
    const record = await readLaneRecord(entry)
    if (record) records.push(record)
  }
  return records
}

export async function readLaneRecord(id: string): Promise<LaneRecord | null> {
  const dir = await lanesDir()
  const filePath = path.join(laneDir(dir, id), 'lane.json')
  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw) as LaneRecord
  } catch {
    return null
  }
}

export async function writeLaneRecord(record: LaneRecord): Promise<void> {
  const dir = await lanesDir()
  const targetDir = laneDir(dir, record.id)
  await mkdir(targetDir, { recursive: true })

  const filePath = path.join(targetDir, 'lane.json')
  const tmpPath = filePath + '.tmp'
  await writeFile(tmpPath, JSON.stringify(record, null, 2) + '\n', 'utf8')
  await rename(tmpPath, filePath)
}

export async function deleteLaneRecord(id: string): Promise<void> {
  const dir = await lanesDir()
  const targetDir = laneDir(dir, id)
  await rm(targetDir, { recursive: true, force: true })
}

// ─── Resolve ─────────────────────────────────────────────────────────────────

/**
 * When a feature branch is checked out at root the UI sends
 * id="root". Resolve to the real lane record ID by matching
 * the current branch against known records.
 */
export async function resolveRecordId(
  id: string,
  currentBranch?: string
): Promise<string> {
  if (id !== 'root') return id
  if (!currentBranch) return id

  const records = await listLaneRecords()
  const match = records.find((r) => r.branch === currentBranch)
  return match ? match.id : id
}

// ─── Scope ───────────────────────────────────────────────────────────────────

export async function readScopeMd(id: string): Promise<string | null> {
  const dir = await lanesDir()
  try {
    return await readFile(path.join(laneDir(dir, id), 'scope.md'), 'utf8')
  } catch {
    return null
  }
}

export async function writeScopeMd(id: string, content: string): Promise<void> {
  const dir = await lanesDir()
  const targetDir = laneDir(dir, id)
  await mkdir(targetDir, { recursive: true })
  await writeFile(path.join(targetDir, 'scope.md'), content, 'utf8')
}

// ─── Work requests ──────────────────────────────────────────────────────────

export async function writeWorkRequest(
  id: string,
  workflow: string
): Promise<{ file: string }> {
  const dir = await lanesDir()
  const targetDir = laneDir(dir, id)
  await mkdir(targetDir, { recursive: true })
  const filePath = path.join(targetDir, 'work-request.json')
  const request = {
    lane: id,
    workflow,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  }
  await writeFile(filePath, JSON.stringify(request, null, 2) + '\n', 'utf8')
  return { file: filePath }
}
