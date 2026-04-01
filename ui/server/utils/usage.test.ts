import { describe, it, expect } from 'vitest'
import { readUsageData, countBySkill, countByAgent } from './usage'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

async function makeTmpDir(): Promise<string> {
  const dir = path.join(os.tmpdir(), `debussy-usage-test-${Date.now()}`)
  await mkdir(dir, { recursive: true })
  return dir
}

// ─── readUsageData ──────────────────────────────────────────────────────────

describe('readUsageData', () => {
  it('returns empty array when directory is missing', async () => {
    const result = await readUsageData('/nonexistent')
    expect(result).toEqual([])
  })

  it('returns empty array for empty directory', async () => {
    const dir = await makeTmpDir()
    try {
      const result = await readUsageData(dir)
      expect(result).toEqual([])
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  it('parses valid JSONL lines', async () => {
    const dir = await makeTmpDir()
    const lines = [
      '{"ts":"2026-03-31T10:00:00Z","event":"skill","session":"s1","name":"debussy:strategy"}',
      '{"ts":"2026-03-31T10:01:00Z","event":"agent","session":"s1","name":"Explore"}',
    ].join('\n')
    try {
      await writeFile(path.join(dir, '2026-03-31.jsonl'), lines)
      const result = await readUsageData(dir)
      expect(result).toHaveLength(2)
      expect(result[0]!.event).toBe('skill')
      expect(result[0]!.name).toBe('debussy:strategy')
      expect(result[1]!.event).toBe('agent')
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  it('skips malformed lines', async () => {
    const dir = await makeTmpDir()
    const lines = [
      '{"ts":"2026-03-31T10:00:00Z","event":"skill","session":"s1","name":"x"}',
      'not json at all',
      '',
      '{"ts":"2026-03-31T10:02:00Z","event":"agent","session":"s1","name":"y"}',
    ].join('\n')
    try {
      await writeFile(path.join(dir, '2026-03-31.jsonl'), lines)
      const result = await readUsageData(dir)
      expect(result).toHaveLength(2)
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  it('reads multiple JSONL files sorted by name', async () => {
    const dir = await makeTmpDir()
    try {
      await writeFile(
        path.join(dir, '2026-03-30.jsonl'),
        '{"ts":"2026-03-30T10:00:00Z","event":"skill","session":"s1","name":"a"}\n'
      )
      await writeFile(
        path.join(dir, '2026-03-31.jsonl'),
        '{"ts":"2026-03-31T10:00:00Z","event":"skill","session":"s2","name":"b"}\n'
      )
      const result = await readUsageData(dir)
      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('a')
      expect(result[1]!.name).toBe('b')
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  it('ignores non-jsonl files', async () => {
    const dir = await makeTmpDir()
    try {
      await writeFile(path.join(dir, 'readme.txt'), 'hello')
      await writeFile(
        path.join(dir, '2026-03-31.jsonl'),
        '{"ts":"2026-03-31T10:00:00Z","event":"skill","session":"s1","name":"x"}\n'
      )
      const result = await readUsageData(dir)
      expect(result).toHaveLength(1)
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  it('skips lines missing required fields', async () => {
    const dir = await makeTmpDir()
    const lines = [
      '{"ts":"2026-03-31T10:00:00Z","name":"x"}',
      '{"event":"skill","session":"s1","name":"y"}',
      '{"ts":"2026-03-31T10:00:00Z","event":"skill","session":"s1","name":"z"}',
    ].join('\n')
    try {
      await writeFile(path.join(dir, '2026-03-31.jsonl'), lines)
      const result = await readUsageData(dir)
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('z')
    } finally {
      await rm(dir, { recursive: true })
    }
  })
})

// ─── countBySkill ───────────────────────────────────────────────────────────

describe('countBySkill', () => {
  it('counts skill events by name', () => {
    const events = [
      {
        ts: '',
        event: 'skill' as const,
        session: 's1',
        name: 'debussy:strategy',
      },
      {
        ts: '',
        event: 'skill' as const,
        session: 's1',
        name: 'debussy:product',
      },
      {
        ts: '',
        event: 'skill' as const,
        session: 's2',
        name: 'debussy:strategy',
      },
      { ts: '', event: 'agent' as const, session: 's1', name: 'Explore' },
    ]
    const result = countBySkill(events)
    expect(result).toEqual({
      'debussy:strategy': 2,
      'debussy:product': 1,
    })
  })

  it('returns empty object for no skill events', () => {
    const events = [
      { ts: '', event: 'agent' as const, session: 's1', name: 'Explore' },
      { ts: '', event: 'session_start' as const, session: 's1' },
    ]
    expect(countBySkill(events)).toEqual({})
  })

  it('returns empty object for empty array', () => {
    expect(countBySkill([])).toEqual({})
  })
})

// ─── countByAgent ───────────────────────────────────────────────────────────

describe('countByAgent', () => {
  it('counts agent events by type', () => {
    const events = [
      { ts: '', event: 'agent' as const, session: 's1', name: 'Explore' },
      { ts: '', event: 'agent' as const, session: 's1', name: 'Plan' },
      { ts: '', event: 'agent' as const, session: 's2', name: 'Explore' },
      {
        ts: '',
        event: 'skill' as const,
        session: 's1',
        name: 'debussy:strategy',
      },
    ]
    const result = countByAgent(events)
    expect(result).toEqual({
      Explore: 2,
      Plan: 1,
    })
  })

  it('returns empty object for no agent events', () => {
    const events = [
      { ts: '', event: 'skill' as const, session: 's1', name: 'x' },
    ]
    expect(countByAgent(events)).toEqual({})
  })

  it('returns empty object for empty array', () => {
    expect(countByAgent([])).toEqual({})
  })
})
